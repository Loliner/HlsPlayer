var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var parser = new xml2js.Parser(); //xml -> json
var arguments = process.argv.splice(2);

var mpd = arguments[0];
var mp4 = arguments[1];
var mp4Filename = /(\w+)\.mp4/gi.exec(mp4)[1];
var resourceDir = __dirname + '/' + mp4Filename + '_fragment'
var mediaRangeList = [];
var mediaFileList = [];

if (!mpd || !mp4) {
    console.warn('arguments illegal');
}

console.warn('reading mpd file...');
/* 读取 mpd 文件 */
fs.readFile(mpd, function (err, bytesRead) {
    var buffer = new Buffer(bytesRead);
    console.warn('parseing mpd file...')
    parser.parseString(buffer.toString(), function (err, json) {
        if (!err) {
            var period = json.MPD.Period;
            var adaptationSet = period[0].AdaptationSet;
            var representation = adaptationSet[0].Representation;
            var segmentList = representation[0].SegmentList[0];
            mediaRangeList.duration = segmentList.$.duration;

            var match = [];
            var mediaRange = '';
            var indexRange = '';
            for (var i in segmentList) {
                // 解析头文件
                if (i === 'Initialization') {
                    mediaRange = segmentList[i][0].$.range;
                    mediaRangeList.push(mediaRange);
                } else if (i === 'SegmentURL') {
                    segmentURLList = segmentList[i];
                    for (var j = 0; j < segmentURLList.length; j++) {
                        mediaRange = segmentURLList[j].$.mediaRange;
                        mediaRangeList.push(mediaRange);
                    }
                }
            }
            spliceFileInit();
        }
    });
});

/* 切割文件 */
function spliceFileInit() {

    var spliceFile = function (bytesRead) {
        var count = mediaRangeList.length;
        for (var i = 0; i < mediaRangeList.length; i++) {
            var rangeItem = mediaRangeList[i];
            match = /^(\d+)\-(\d+)$/gi.exec(rangeItem);
            var start = match[1];
            var end = match[2];
            var length = end - start + 1;
            var subBuffer = new Buffer(length);
            bytesRead.copy(subBuffer, 0, start, start + length);
            var fileName = mp4Filename + '_fragment_' + i + '.mp4';

            (function (fileName) {
                fs.writeFile(path.join(resourceDir, fileName), subBuffer, function (err) {
                    if (!err) {
                        console.warn('fragment file ' + fileName + ' write finished!')
                        count--;
                        mediaFileList.push(fileName);
                        if (!count) {
                            concatM3U8File();
                        }
                    }
                })
            })(fileName);
        }
    }

    console.warn('reading mp4 file...');
    // 创建文件夹
    fs.readFile(mp4, function (err, bytesRead) {
        if (!err) {
            if (fs.existsSync(path.join(resourceDir))) {
                spliceFile(bytesRead);
            } else {
                fs.mkdir(path.join(resourceDir), function (err) {
                    if (!err) {
                        spliceFile(bytesRead);
                    } else {
                        console.log(err);
                    }
                });
            }
        }
    });
}

/* 生成m3u8文件 */
function concatM3U8File() {
    var fileNameReg = new RegExp(mp4Filename + '_fragment_(\\d+).mp4', 'i');
    // 排序
    mediaFileList.sort(function (a, b) {
        var matcha = fileNameReg.exec(a);
        var matchb = fileNameReg.exec(b);
        return parseInt(matcha[1], 10) - parseInt(matchb[1], 10);
    });

    var m3u8Str = '#EXTM3U\n';
    m3u8Str += '#EXT-X-TARGETDURATION:15\n';
    m3u8Str += '#EXT-X-DISCONTINUITY\n';

    for (var i = 0; i < mediaFileList.length; i++) {
        m3u8Str += '#EXTINF:' + mediaRangeList.duration / 1000 + ',\n';
        m3u8Str += mediaFileList[i] + '\n';
    }

    m3u8Str += '#EXT-X-ENDLIST\n';
    fs.writeFile(path.join(resourceDir, mp4Filename + '_fragment.m3u8'), m3u8Str, function (err) {
        console.log('m3u8 file finished!');
    });
}

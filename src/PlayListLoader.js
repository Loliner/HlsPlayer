/*
 * @Author: zhengjiu
 * @Date:   2017-04-11 10:02:01
 */

var xhr = require('xhr');
var Event = require('./Event');
var m3u8Parser = require('./m3u8Parser');
var SegmentLoader = require('./SegmentLoader');

class PlayListLoader {
    constructor(mediaSource, src) {
        this.mediaSource = mediaSource;
        this.src = src;
    }

    load() {
        let self = this;
        xhr({
            url: self.src
        }, function (err, resp, body) {
            if (!err) {
                let parser = new m3u8Parser();
                self.playList = parser.parse(body);
                let path = self.src.substring(0, /[^/]*$/i.exec(self.src).index);

                // 默认分片文件与m3u8同目录
                self.playList.forEach(function (item, index) {
                    if (!/[a-zA-z]+:\/\/[^\s]+/.test(item.uri)) {
                        item.uri = path + item.uri;
                    }
                    item.index = index;
                    item.loaded = false;
                    item.appended = false;
                });

                self.mediaSource.event.trigger('playListLoaded', self.playList);
            }
        });
    }

};

module.exports = PlayListLoader;

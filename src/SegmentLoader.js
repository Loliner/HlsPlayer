/*
 * @Author: zhengjiu
 * @Date:   2017-04-11 10:02:01
 */

var xhr = require('xhr');
var Event = require('./Event');

class SegmentLoader {
    constructor(mediaSource) {
        this.mediaSource = mediaSource;
        this.loadIndex = 0;
        this.loadEnded = false;
    }

    segmentList(segmentList) {
        this.segmentList = segmentList;
    }

    load(index) {
        if (!this.segmentList) {
            console.warn('[SegmentLoader] segmentList must be init before load!');
            return;
        }

        let self = this;
        if (index == undefined) {
            index = self.loadIndex++;
        } else {
            self.loadIndex = index;
        }

        if (!this.loading) {
            let segment = self.segmentList[index];
            if (segment) {
                this.loading = true;
                xhr({
                    url: segment.uri,
                    responseType: 'arraybuffer',
                }, function (err, resp, body) {
                    if (!err) {
                        segment.loaded = true;
                        segment.buffer = body;
                        self.loading = false;

                        // 标识已加载到
                        if (index === self.segmentList.length - 1) {
                            self.loadEnded = true;
                        }

                        /* 解包 flv / ts， 打包成 fragmented mp4 */

                        self.mediaSource.event.trigger('segmentLoaded', segment, index);
                    }
                });
            }
        }
    }
};

module.exports = SegmentLoader;

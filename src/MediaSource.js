/*
 * @Author: zhengjiu
 * @Date:   2017-04-11 10:02:01
 */

var Event = require('./Event');
var GlobalEvent = Event.instanceForGlobal;
var PlayListLoader = require('./PlayListLoader');
var SegmentLoader = require('./SegmentLoader');

class MediaSource {
    constructor(src, mimeCodec) {
        if ('MediaSource' in window && window.MediaSource.isTypeSupported(mimeCodec)) {

            this.event = new Event();
            this.loaded = false;

            this.nativeMediaSource = new window.MediaSource();
            this.src = URL.createObjectURL(this.nativeMediaSource);

            // 初始化 m3u8 加载器
            this.playListLoader = new PlayListLoader(this, src);
            // 初始化分片加载器
            this.segmentLoader = new SegmentLoader(this);
            this.currentAppendingIndex = 0;

            this.nativeMediaSource.addEventListener('sourceopen', (_) => {
                this.sourceopened = true;

                this.sourceBuffer = this.nativeMediaSource.addSourceBuffer(mimeCodec);

                this.sourceBuffer.addEventListener('updateend', (_) => {

                    // 设置标志位，表明该 segment 已 appended
                    this.currentAppendingSegment.appended = true;
                    this.currentAppendingSegment = false;

                    if (this.segmentLoader.loadEnded) {
                        this.nativeMediaSource.endOfStream();
                    }

                    this.currentAppendingIndex++;
                    if (this.currentAppendingIndex < 3) {
                        this.append();
                    }


                });
            });

            this.bindGlobalEvent();
        } else {
            console.error('[Hls] Unsupported MIME type or codec: ', mimeCodec);
        }
    }

    load() {
        this.loaded = true;
        this.playListLoader.load();
    }

    append() {
        if (!this.sourceBuffer.updating) {
            var segment = this.playList[this.currentAppendingIndex];
            if (segment) {
                if (segment.loaded && segment.appended) {
                    this.currentAppendingIndex++;
                    this.append();
                    return;
                } else if (segment.loaded && !segment.appended) {
                    this.currentAppendingSegment = segment;
                    this.sourceBuffer.appendBuffer(segment.buffer);
                } else {
                    this.segmentLoader.load(this.currentAppendingIndex);
                }
            }
        } else {
            setTimeout(() => {
                this.append();
            }, 0);
        }
    }

    bindGlobalEvent() {
        let self = this;

        this.event.on('playListLoaded', (playList) => {
            this.playList = playList;
            this.segmentLoader.segmentList(playList);
            this.segmentLoader.load();
        });

        this.event.on('segmentLoaded', (segment, index) => {
            if (this.sourceopened && !this.sourceBuffer.updating) {
                this.currentAppendingIndex = index;
                this.append();
            } else {
                setTimeout(function () {
                    self.event.trigger('segmentLoaded', segment, index);
                }, 0);
            }
        });
    }

    seekTo(currentTime) {
        let loadIndex = this.checkSegmentLoad(currentTime);
        if (!isNaN(loadIndex)) {
            this.segmentLoader.load(loadIndex);
        }
    }

    /* 检测当前是否应该加载分片，及加载哪一个分片 */
    checkSegmentLoad(currentTime) {

        // 获取当前所 seek 到的分片索引
        let seekedSegmentIndex = Math.ceil(currentTime / 5);
        // 检测当前分片及向后3个分片是否已loaded
        for (let i = seekedSegmentIndex; i < seekedSegmentIndex + 3 && i < this.segmentLoader.segmentList.length; i++) {
            if (!this.segmentLoader.segmentList[i].loaded) {
                return i;
            }
        }
    }
}

module.exports = MediaSource;

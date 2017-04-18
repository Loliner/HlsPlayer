/*
 * @Author: zhengjiu
 * @Date:   2017-04-11 10:02:01
 */

var Event = require('./Event');
var GlobalEvent = Event.instanceForGlobal;
var MediaSource = require('./MediaSource');
var PlayListLoader = require('./PlayListLoader');
var SegmentLoader = require('./SegmentLoader');

class Hls {
    constructor(id, sources) {
        this.video;
        this.sources;
        this.index = 0;
        this.mediaSourceArr = [];
        this.paramCheck(id, sources);

        this.sources.forEach((item) => {
            item.mediaSource = new MediaSource(item.src, item.mimeCodec);
        });
        this.currentSource = this.sources[this.index].mediaSource;
        this.video.src = this.currentSource.src;
        this.currentSource.load();

        this.bindGlobalEvent();
        this.bindVideoNativeEvent();
        this.bindDomEvent();
    }

    /* 绑定全局 message 事件 */
    bindGlobalEvent() {

    }

    /* 绑定video原生事件 */
    bindVideoNativeEvent() {
        let self = this;
        this.video.addEventListener('timeupdate', (e) => {
            this.sources[this.index].mediaSource.seekTo(this.video.currentTime);
            if (this.video.currentTime > this.video.duration - 10 && !this.sources[this.index + 1].mediaSource.loaded) {
                this.sources[this.index + 1].mediaSource.load();
            }
        });

        this.video.addEventListener('seeking', () => {
            this.currentSource.seekTo(this.video.currentTime);
        });

        this.video.addEventListener('play', () => {
            // this.sources[index].mediaSource.load();
        });

        this.video.addEventListener('ended', () => {
            this.index++;
            this.currentSource = this.sources[this.index].mediaSource;
            this.video.src = this.currentSource.src;
        });
    }

    /* 绑定其他dom交互事件 */
    bindDomEvent() {
        let self = this;
        document.addEventListener('click', (e) => {
            // console.log(e);
        });
    }

    paramCheck(id, sources) {
        // id 参数校验
        if (Object.prototype.toString.call(id) === '[object String]') {
            this.video = document.getElementById(id);
        } else if (id.tagName.toLowerCase() === 'video') {
            this.video = id;
        } else {
            console.warn('[Hls] illegal argument of id');
        }

        // sources 参数校验
        if (Object.prototype.toString.call(sources) === '[object Object]') {
            this.sources = [sources];
        } else if (Object.prototype.toString.call(sources) === '[object Array]') {
            this.sources = sources;
        } else {
            console.warn('[Hls] illegal argument of sources');
        }
    }
}

window.Hls = Hls;

module.exports = Hls;

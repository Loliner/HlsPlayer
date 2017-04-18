/*
 * @Author: zhengjiu
 * @Date:   2017-04-11 10:02:01
 */

class m3u8Parser {
    constructor() {

    }

    parse(data) {
        let buffer = data;
        let nextNewline = buffer.indexOf('\n');
        let playList = [];

        for (; nextNewline > -1; nextNewline = buffer.indexOf('\n')) {
            this.parseLine(buffer.substring(0, nextNewline), playList);
            buffer = buffer.substring(nextNewline + 1);
        }

        return playList;
    }

    parseLine(line, playList) {
        line = line.replace('\r', '');

        // 头标签
        let match = (/^#EXTM3U/).exec(line);
        if (match) {
            return;
        }

        // 分组标签
        match = (/^#EXT-X-TARGETDURATION:?([0-9.]*)?/).exec(line);
        if (match) {
            return;
        }

        // 分片信息（目前只包含时长）
        match = (/^#EXTINF:?([0-9\.]*)?,?(.*)?$/).exec(line);
        if (match) {
            let item = {};
            if (match[1]) {
                item.duration = parseFloat(match[1]);
            }
            playList.push(item);
            return;
        }

        match = (/^[\w\s+/?%#&=.:\\\-]+$/g).exec(line);
        if (match && line[0] !== '#') {
            playList[playList.length - 1].uri = match[0];
            return;
        }
    }
};

module.exports = m3u8Parser;

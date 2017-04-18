
const checkParam = function (name, fn) {
    if (Object.prototype.toString.call(name) !== '[object String]') {
        console.warn('[Event] The name must be a string');
        return false;
    } else if (fn && Object.prototype.toString.call(fn) !== '[object Function]') {
        console.warn('[Event] The fn must be a string');
        return false;
    } else {
        return true;
    }
}

class Event {
    constructor() {
        this.events = {};
    }

    on(name, fn) {
        // 校验参数
        if (!checkParam(name, fn)) {
            return;
        }

        if (!this.events[name]) {
            this.events[name] = [];
        }

        this.events[name].push(fn);
    }

    off(name, fn) {
        // 校验参数
        if (!checkParam(name, fn)) {
            return;
        }

        if (this.events[name]) {
            let handlers = this.events[name];
            for (let i = 0; i < handlers.length; i++) {
                if (handlers[i] === fn) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        }
    }

    once(name, fn) {
        // 校验参数
        if (!checkParam(name, fn)) {
            return;
        }

        this.on(name, function (args) {
            fn.apply(undefined, args);
            this.off(name, fn);
        });
    }

    trigger(name) {
        // 校验参数
        if (!checkParam(name)) {
            return;
        }

        let args = [].slice.call(arguments, 1);
        if (this.events[name]) {
            let handlers = this.events[name];
            for (let i = 0; i < handlers.length; i++) {
                handlers[i].apply(undefined, args);
            }
        }
    }
}

Event.instanceForGlobal = new Event();

module.exports = Event;

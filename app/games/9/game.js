/*! Built with IMPACT - impactjs.com */
(function (window) {
    "use strict";
    
    Number.prototype.map = function (istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
    };
    Number.prototype.limit = function (min, max) {
        return Math.min(max, Math.max(min, this));
    };
    Number.prototype.round = function (precision) {
        precision = Math.pow(10, precision || 0);
        return Math.round(this * precision) / precision;
    };
    Number.prototype.floor = function () {
        return Math.floor(this);
    };
    Number.prototype.ceil = function () {
        return Math.ceil(this);
    };
    Number.prototype.toInt = function () {
        return (this | 0);
    };
    Number.prototype.toRad = function () {
        return (this / 180) * Math.PI;
    };
    Number.prototype.toDeg = function () {
        return (this * 180) / Math.PI;
    };
    Array.prototype.erase = function (item) {
        for (var i = this.length; i--;) {
            if (this[i] === item) {
                this.splice(i, 1);
            }
        }
        return this;
    };
    Array.prototype.random = function () {
        return this[Math.floor(Math.random() * this.length)];
    };
    Function.prototype.bind = Function.prototype.bind || function (oThis) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {}, fBound = function () {
                return fToBind.apply((this instanceof fNOP && oThis ? this : oThis), aArgs.concat(Array.prototype.slice.call(arguments)));
            };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
    window.ig = {
        game: null,
        debug: null,
        version: '1.21',
        global: window,
        modules: {},
        resources: [],
        ready: false,
        baked: false,
        nocache: '',
        ua: {},
        prefix: (window.ImpactPrefix || ''),
        lib: 'lib/',
        _current: null,
        _loadQueue: [],
        _waitForOnload: 0,
        $: function (selector) {
            return selector.charAt(0) == '#' ? document.getElementById(selector.substr(1)) : document.getElementsByTagName(selector);
        },
        $new: function (name) {
            return document.createElement(name);
        },
        copy: function (object) {
            if (!object || typeof (object) != 'object' || object instanceof HTMLElement || object instanceof ig.Class) {
                return object;
            } else if (object instanceof Array) {
                var c = [];
                for (var i = 0, l = object.length; i < l; i++) {
                    c[i] = ig.copy(object[i]);
                }
                return c;
            } else {
                var c = {};
                for (var i in object) {
                    c[i] = ig.copy(object[i]);
                }
                return c;
            }
        },
        merge: function (original, extended) {
            for (var key in extended) {
                var ext = extended[key];
                if (typeof (ext) != 'object' || ext instanceof HTMLElement || ext instanceof ig.Class) {
                    original[key] = ext;
                } else {
                    if (!original[key] || typeof (original[key]) != 'object') {
                        original[key] = (ext instanceof Array) ? [] : {};
                    }
                    ig.merge(original[key], ext);
                }
            }
            return original;
        },
        ksort: function (obj) {
            if (!obj || typeof (obj) != 'object') {
                return [];
            }
            var keys = [],
                values = [];
            for (var i in obj) {
                keys.push(i);
            }
            keys.sort();
            for (var i = 0; i < keys.length; i++) {
                values.push(obj[keys[i]]);
            }
            return values;
        },
        setVendorAttribute: function (el, attr, val) {
            var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
            el[attr] = el['ms' + uc] = el['moz' + uc] = el['webkit' + uc] = el['o' + uc] = val;
        },
        getVendorAttribute: function (el, attr) {
            var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
            return el[attr] || el['ms' + uc] || el['moz' + uc] || el['webkit' + uc] || el['o' + uc];
        },
        normalizeVendorAttribute: function (el, attr) {
            var prefixedVal = ig.getVendorAttribute(el, attr);
            if (!el[attr] && prefixedVal) {
                el[attr] = prefixedVal;
            }
        },
        getImagePixels: function (image, x, y, width, height) {
            var canvas = ig.$new('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var ctx = canvas.getContext('2d');
            var ratio = ig.getVendorAttribute(ctx, 'backingStorePixelRatio') || 1;
            ig.normalizeVendorAttribute(ctx, 'getImageDataHD');
            var realWidth = image.width / ratio,
                realHeight = image.height / ratio;
            canvas.width = Math.ceil(realWidth);
            canvas.height = Math.ceil(realHeight);
            ctx.drawImage(image, 0, 0, realWidth, realHeight);
            return (ratio === 1) ? ctx.getImageData(x, y, width, height) : ctx.getImageDataHD(x, y, width, height);
        },
        module: function (name) {
            if (ig._current) {
                throw ("Module '" + ig._current.name + "' defines nothing");
            }
            if (ig.modules[name] && ig.modules[name].body) {
                throw ("Module '" + name + "' is already defined");
            }
            ig._current = {
                name: name,
                requires: [],
                loaded: false,
                body: null
            };
            ig.modules[name] = ig._current;
            ig._loadQueue.push(ig._current);
            return ig;
        },
        requires: function () {
            ig._current.requires = Array.prototype.slice.call(arguments);
            return ig;
        },
        defines: function (body) {
            ig._current.body = body;
            ig._current = null;
            ig._initDOMReady();
        },
        addResource: function (resource) {
            ig.resources.push(resource);
        },
        setNocache: function (set) {
            ig.nocache = set ? '?' + Date.now() : '';
        },
        log: function () {},
        assert: function (condition, msg) {},
        show: function (name, number) {},
        mark: function (msg, color) {},
        _loadScript: function (name, requiredFrom) {
            ig.modules[name] = {
                name: name,
                requires: [],
                loaded: false,
                body: null
            };
            ig._waitForOnload++;
            var path = ig.prefix + ig.lib + name.replace(/\./g, '/') + '.js' + ig.nocache;
            var script = ig.$new('script');
            script.type = 'text/javascript';
            script.src = path;
            script.onload = function () {
                ig._waitForOnload--;
                ig._execModules();
            };
            script.onerror = function () {
                throw ('Failed to load module ' + name + ' at ' + path + ' ' + 'required from ' + requiredFrom);
            };
            ig.$('head')[0].appendChild(script);
        },
        _execModules: function () {
            var modulesLoaded = false;
            for (var i = 0; i < ig._loadQueue.length; i++) {
                var m = ig._loadQueue[i];
                var dependenciesLoaded = true;
                for (var j = 0; j < m.requires.length; j++) {
                    var name = m.requires[j];
                    if (!ig.modules[name]) {
                        dependenciesLoaded = false;
                        ig._loadScript(name, m.name);
                    } else if (!ig.modules[name].loaded) {
                        dependenciesLoaded = false;
                    }
                }
                if (dependenciesLoaded && m.body) {
                    ig._loadQueue.splice(i, 1);
                    m.loaded = true;
                    m.body();
                    modulesLoaded = true;
                    i--;
                }
            }
            if (modulesLoaded) {
                ig._execModules();
            } else if (!ig.baked && ig._waitForOnload == 0 && ig._loadQueue.length != 0) {
                var unresolved = [];
                for (var i = 0; i < ig._loadQueue.length; i++) {
                    var unloaded = [];
                    var requires = ig._loadQueue[i].requires;
                    for (var j = 0; j < requires.length; j++) {
                        var m = ig.modules[requires[j]];
                        if (!m || !m.loaded) {
                            unloaded.push(requires[j]);
                        }
                    }
                    unresolved.push(ig._loadQueue[i].name + ' (requires: ' + unloaded.join(', ') + ')');
                }
                throw ('Unresolved (circular?) dependencies. ' + "Most likely there's a name/path mismatch for one of the listed modules:\n" +
                    unresolved.join('\n'));
            }
        },
        _DOMReady: function () {
            if (!ig.modules['dom.ready'].loaded) {
                if (!document.body) {
                    return setTimeout(ig._DOMReady, 13);
                }
                ig.modules['dom.ready'].loaded = true;
                ig._waitForOnload--;
                ig._execModules();
            }
            return 0;
        },
        _boot: function () {
            if (document.location.href.match(/\?nocache/)) {
                ig.setNocache(true);
            }
            ig.ua.pixelRatio = window.devicePixelRatio || 1;
            ig.ua.viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            ig.ua.screen = {
                width: window.screen.availWidth * ig.ua.pixelRatio,
                height: window.screen.availHeight * ig.ua.pixelRatio
            };
            ig.ua.iPhone = /iPhone/i.test(navigator.userAgent);
            ig.ua.iPhone4 = (ig.ua.iPhone && ig.ua.pixelRatio == 2);
            ig.ua.iPad = /iPad/i.test(navigator.userAgent);
            ig.ua.android = /android/i.test(navigator.userAgent);
            ig.ua.iOS = ig.ua.iPhone || ig.ua.iPad;
            ig.ua.mobile = ig.ua.iOS || ig.ua.android;
        },
        _initDOMReady: function () {
            if (ig.modules['dom.ready']) {
                ig._execModules();
                return;
            }
            ig._boot();
            ig.modules['dom.ready'] = {
                requires: [],
                loaded: false,
                body: null
            };
            ig._waitForOnload++;
            if (document.readyState === 'complete') {
                ig._DOMReady();
            } else {
                document.addEventListener('DOMContentLoaded', ig._DOMReady, false);
                window.addEventListener('load', ig._DOMReady, false);
            }
        }
    };
    ig.normalizeVendorAttribute(window, 'requestAnimationFrame');
    if (window.requestAnimationFrame) {
        var next = 1,
            anims = {};
        window.ig.setAnimation = function (callback, element) {
            var current = next++;
            anims[current] = true;
            var animate = function () {
                if (!anims[current]) {
                    return;
                }
                window.requestAnimationFrame(animate, element);
                callback();
            };
            window.requestAnimationFrame(animate, element);
            return current;
        };
        window.ig.clearAnimation = function (id) {
            delete anims[id];
        };
    } else {
        window.ig.setAnimation = function (callback, element) {
            return window.setInterval(callback, 1000 / 60);
        };
        window.ig.clearAnimation = function (id) {
            window.clearInterval(id);
        };
    }
    var initializing = false,
        fnTest = /xyz/.test(function () {
            xyz;
        }) ? /\bparent\b/ : /.*/;
    window.ig.Class = function () {};
    var inject = function (prop) {
        var proto = this.prototype;
        var parent = {};
        for (var name in prop) {
            if (typeof (prop[name]) == "function" && typeof (proto[name]) == "function" && fnTest.test(prop[name])) {
                parent[name] = proto[name];
                proto[name] = (function (name, fn) {
                    return function () {
                        var tmp = this.parent;
                        this.parent = parent[name];
                        var ret = fn.apply(this, arguments);
                        this.parent = tmp;
                        return ret;
                    };
                })(name, prop[name]);
            } else {
                proto[name] = prop[name];
            }
        }
    };
    window.ig.Class.extend = function (prop) {
        var parent = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            if (typeof (prop[name]) == "function" && typeof (parent[name]) == "function" && fnTest.test(prop[name])) {
                prototype[name] = (function (name, fn) {
                    return function () {
                        var tmp = this.parent;
                        this.parent = parent[name];
                        var ret = fn.apply(this, arguments);
                        this.parent = tmp;
                        return ret;
                    };
                })(name, prop[name]);
            } else {
                prototype[name] = prop[name];
            }
        }

        function Class() {
            if (!initializing) {
                if (this.staticInstantiate) {
                    var obj = this.staticInstantiate.apply(this, arguments);
                    if (obj) {
                        return obj;
                    }
                }
                for (var p in this) {
                    if (typeof (this[p]) == 'object') {
                        this[p] = ig.copy(this[p]);
                    }
                }
                if (this.init) {
                    this.init.apply(this, arguments);
                }
            }
            return this;
        }
        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = window.ig.Class.extend;
        Class.inject = inject;
        return Class;
    };
})(window);

var gameToken = "X9X9X9X";
var cummilativeCoinGrabs = 0;
var gameOverOccured = false;
// lib/impact/image.js
ig.baked = true;
ig.module('impact.image').defines(function () {
    "use strict";
    ig.Image = ig.Class.extend({
        data: null,
        width: 0,
        height: 0,
        loaded: false,
        failed: false,
        loadCallback: null,
        path: '',
        staticInstantiate: function (path) {
            return ig.Image.cache[path] || null;
        },
        init: function (path) {
            this.path = path;
            this.load();
        },
        load: function (loadCallback) {
            if (this.loaded) {
                if (loadCallback) {
                    loadCallback(this.path, true);
                }
                return;
            } else if (!this.loaded && ig.ready) {
                this.loadCallback = loadCallback || null;
                this.data = new Image();
                this.data.onload = this.onload.bind(this);
                this.data.onerror = this.onerror.bind(this);
                this.data.src = ig.prefix + this.path + ig.nocache;
            } else {
                ig.addResource(this);
            }
            ig.Image.cache[this.path] = this;
        },
        reload: function () {
            this.loaded = false;
            this.data = new Image();
            this.data.onload = this.onload.bind(this);
            this.data.src = this.path + '?' + Date.now();
        },
        onload: function (event) {
            this.width = this.data.width;
            this.height = this.data.height;
            this.loaded = true;
            if (ig.system.scale != 1) {
                this.resize(ig.system.scale);
            }
            if (this.loadCallback) {
                this.loadCallback(this.path, true);
            }
        },
        onerror: function (event) {
            this.failed = true;
            if (this.loadCallback) {
                this.loadCallback(this.path, false);
            }
        },
        resize: function (scale) {
            var origPixels = ig.getImagePixels(this.data, 0, 0, this.width, this.height);
            var widthScaled = this.width * scale;
            var heightScaled = this.height * scale;
            var scaled = ig.$new('canvas');
            scaled.width = widthScaled;
            scaled.height = heightScaled;
            var scaledCtx = scaled.getContext('2d');
            var scaledPixels = scaledCtx.getImageData(0, 0, widthScaled, heightScaled);
            for (var y = 0; y < heightScaled; y++) {
                for (var x = 0; x < widthScaled; x++) {
                    var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
                    var indexScaled = (y * widthScaled + x) * 4;
                    scaledPixels.data[indexScaled] = origPixels.data[index];
                    scaledPixels.data[indexScaled + 1] = origPixels.data[index + 1];
                    scaledPixels.data[indexScaled + 2] = origPixels.data[index + 2];
                    scaledPixels.data[indexScaled + 3] = origPixels.data[index + 3];
                }
            }
            scaledCtx.putImageData(scaledPixels, 0, 0);
            this.data = scaled;
        },
        draw: function (targetX, targetY, sourceX, sourceY, width, height) {
            if (!this.loaded) {
                return;
            }
            var scale = ig.system.scale;
            sourceX = sourceX ? sourceX * scale : 0;
            sourceY = sourceY ? sourceY * scale : 0;
            width = (width ? width : this.width) * scale;
            height = (height ? height : this.height) * scale;
            ig.system.context.drawImage(this.data, sourceX, sourceY, width, height, ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY), width, height);
            ig.Image.drawCount++;
        },
        drawTile: function (targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY) {
            tileHeight = tileHeight ? tileHeight : tileWidth;
            if (!this.loaded || tileWidth > this.width || tileHeight > this.height) {
                return;
            }
            var scale = ig.system.scale;
            var tileWidthScaled = Math.floor(tileWidth * scale);
            var tileHeightScaled = Math.floor(tileHeight * scale);
            var scaleX = flipX ? -1 : 1;
            var scaleY = flipY ? -1 : 1;
            if (flipX || flipY) {
                ig.system.context.save();
                ig.system.context.scale(scaleX, scaleY);
            }
            ig.system.context.drawImage(this.data, (Math.floor(tile * tileWidth) % this.width) * scale, (Math.floor(tile * tileWidth / this.width) * tileHeight) * scale, tileWidthScaled, tileHeightScaled, ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0), ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0), tileWidthScaled, tileHeightScaled);
            if (flipX || flipY) {
                ig.system.context.restore();
            }
            ig.Image.drawCount++;
        }
    });
    ig.Image.drawCount = 0;
    ig.Image.cache = {};
    ig.Image.reloadCache = function () {
        for (var path in ig.Image.cache) {
            ig.Image.cache[path].reload();
        }
    };
});

// lib/impact/font.js
ig.baked = true;
ig.module('impact.font').requires('impact.image').defines(function () {
    "use strict";
    ig.Font = ig.Image.extend({
        widthMap: [],
        indices: [],
        firstChar: 32,
        alpha: 1,
        letterSpacing: 1,
        lineSpacing: 0,
        onload: function (ev) {
            this._loadMetrics(this.data);
            this.parent(ev);
        },
        widthForString: function (text) {
            if (text.indexOf('\n') !== -1) {
                var lines = text.split('\n');
                var width = 0;
                for (var i = 0; i < lines.length; i++) {
                    width = Math.max(width, this._widthForLine(lines[i]));
                }
                return width;
            } else {
                return this._widthForLine(text);
            }
        },
        _widthForLine: function (text) {
            var width = 0;
            for (var i = 0; i < text.length; i++) {
                width += this.widthMap[text.charCodeAt(i) - this.firstChar] + this.letterSpacing;
            }
            return width;
        },
        heightForString: function (text) {
            return text.split('\n').length * (this.height + this.lineSpacing);
        },
        draw: function (text, x, y, align) {
            if (typeof (text) != 'string') {
                text = text.toString();
            }
            if (text.indexOf('\n') !== -1) {
                var lines = text.split('\n');
                var lineHeight = this.height + this.lineSpacing;
                for (var i = 0; i < lines.length; i++) {
                    this.draw(lines[i], x, y + i * lineHeight, align);
                }
                return;
            }
            if (align == ig.Font.ALIGN.RIGHT || align == ig.Font.ALIGN.CENTER) {
                var width = this._widthForLine(text);
                x -= align == ig.Font.ALIGN.CENTER ? width / 2 : width;
            }
            if (this.alpha !== 1) {
                ig.system.context.globalAlpha = this.alpha;
            }
            for (var i = 0; i < text.length; i++) {
                var c = text.charCodeAt(i);
                x += this._drawChar(c - this.firstChar, x, y);
            }
            if (this.alpha !== 1) {
                ig.system.context.globalAlpha = 1;
            }
            ig.Image.drawCount += text.length;
        },
        _drawChar: function (c, targetX, targetY) {
            if (!this.loaded || c < 0 || c >= this.indices.length) {
                return 0;
            }
            var scale = ig.system.scale;
            var charX = this.indices[c] * scale;
            var charY = 0;
            var charWidth = this.widthMap[c] * scale;
            var charHeight = (this.height - 2) * scale;
            ig.system.context.drawImage(this.data, charX, charY, charWidth, charHeight, ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY), charWidth, charHeight);
            return this.widthMap[c] + this.letterSpacing;
        },
        _loadMetrics: function (image) {
            this.height = image.height - 1;
            this.widthMap = [];
            this.indices = [];
            var px = ig.getImagePixels(image, 0, image.height - 1, image.width, 1);
            var currentChar = 0;
            var currentWidth = 0;
            for (var x = 0; x < image.width; x++) {
                var index = x * 4 + 3;
                if (px.data[index] > 127) {
                    currentWidth++;
                } else if (px.data[index] == 0 && currentWidth) {
                    this.widthMap.push(currentWidth);
                    this.indices.push(x - currentWidth);
                    currentChar++;
                    currentWidth = 0;
                }
            }
            this.widthMap.push(currentWidth);
            this.indices.push(x - currentWidth);
        }
    });
    ig.Font.ALIGN = {
        LEFT: 0,
        RIGHT: 1,
        CENTER: 2
    };
});

// lib/impact/sound.js
ig.baked = true;
ig.module('impact.sound').defines(function () {
    "use strict";
    ig.SoundManager = ig.Class.extend({
        clips: {},
        volume: 1,
        format: null,
        init: function () {
            if (!ig.Sound.enabled || !window.Audio) {
                ig.Sound.enabled = false;
                return;
            }
            var probe = new Audio();
            for (var i = 0; i < ig.Sound.use.length; i++) {
                var format = ig.Sound.use[i];
                if (probe.canPlayType(format.mime)) {
                    this.format = format;
                    break;
                }
            }
            if (!this.format) {
                ig.Sound.enabled = false;
            }
        },
        load: function (path, multiChannel, loadCallback) {
            var realPath = ig.prefix + path.replace(/[^\.]+$/, this.format.ext) + ig.nocache;
            if (this.clips[path]) {
                if (multiChannel && this.clips[path].length < ig.Sound.channels) {
                    for (var i = this.clips[path].length; i < ig.Sound.channels; i++) {
                        var a = new Audio(realPath);
                        a.load();
                        this.clips[path].push(a);
                    }
                }
                return this.clips[path][0];
            }
            var clip = new Audio(realPath);
            if (loadCallback) {
                clip.addEventListener('canplaythrough', function cb(ev) {
                    clip.removeEventListener('canplaythrough', cb, false);
                    loadCallback(path, true, ev);
                }, false);
                clip.addEventListener('error', function (ev) {
                    loadCallback(path, false, ev);
                }, false);
            }
            clip.preload = 'auto';
            clip.load();
            this.clips[path] = [clip];
            if (multiChannel) {
                for (var i = 1; i < ig.Sound.channels; i++) {
                    var a = new Audio(realPath);
                    a.load();
                    this.clips[path].push(a);
                }
            }
            return clip;
        },
        get: function (path) {
            var channels = this.clips[path];
            for (var i = 0, clip; clip = channels[i++];) {
                if (clip.paused || clip.ended) {
                    if (clip.ended) {
                        clip.currentTime = 0;
                    }
                    return clip;
                }
            }
            channels[0].pause();
            channels[0].currentTime = 0;
            return channels[0];
        }
    });
    ig.Music = ig.Class.extend({
        tracks: [],
        namedTracks: {},
        currentTrack: null,
        currentIndex: 0,
        random: false,
        _volume: 1,
        _loop: false,
        _fadeInterval: 0,
        _fadeTimer: null,
        _endedCallbackBound: null,
        init: function () {
            this._endedCallbackBound = this._endedCallback.bind(this);
            if (Object.defineProperty) {
                Object.defineProperty(this, "volume", {
                    get: this.getVolume.bind(this),
                    set: this.setVolume.bind(this)
                });
                Object.defineProperty(this, "loop", {
                    get: this.getLooping.bind(this),
                    set: this.setLooping.bind(this)
                });
            } else if (this.__defineGetter__) {
                this.__defineGetter__('volume', this.getVolume.bind(this));
                this.__defineSetter__('volume', this.setVolume.bind(this));
                this.__defineGetter__('loop', this.getLooping.bind(this));
                this.__defineSetter__('loop', this.setLooping.bind(this));
            }
        },
        add: function (music, name) {
            if (!ig.Sound.enabled) {
                return;
            }
            var path = music instanceof ig.Sound ? music.path : music;
            var track = ig.soundManager.load(path, false);
            track.loop = this._loop;
            track.volume = this._volume;
            track.addEventListener('ended', this._endedCallbackBound, false);
            this.tracks.push(track);
            if (name) {
                this.namedTracks[name] = track;
            }
            if (!this.currentTrack) {
                this.currentTrack = track;
            }
        },
        next: function () {
            if (!this.tracks.length) {
                return;
            }
            this.stop();
            this.currentIndex = this.random ? Math.floor(Math.random() * this.tracks.length) : (this.currentIndex + 1) % this.tracks.length;
            this.currentTrack = this.tracks[this.currentIndex];
            this.play();
        },
        pause: function () {
            if (!this.currentTrack) {
                return;
            }
            this.currentTrack.pause();
        },
        stop: function () {
            if (!this.currentTrack) {
                return;
            }
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        },
        play: function (name) {
            if (name && this.namedTracks[name]) {
                var newTrack = this.namedTracks[name];
                if (newTrack != this.currentTrack) {
                    this.stop();
                    this.currentTrack = newTrack;
                }
            } else if (!this.currentTrack) {
                return;
            }
            this.currentTrack.play();
        },
        getLooping: function () {
            return this._loop;
        },
        setLooping: function (l) {
            this._loop = l;
            for (var i in this.tracks) {
                this.tracks[i].loop = l;
            }
        },
        getVolume: function () {
            return this._volume;
        },
        setVolume: function (v) {
            this._volume = v.limit(0, 1);
            for (var i in this.tracks) {
                this.tracks[i].volume = this._volume;
            }
        },
        fadeOut: function (time) {
            if (!this.currentTrack) {
                return;
            }
            clearInterval(this._fadeInterval);
            this.fadeTimer = new ig.Timer(time);
            this._fadeInterval = setInterval(this._fadeStep.bind(this), 50);
        },
        _fadeStep: function () {
            var v = this.fadeTimer.delta().map(-this.fadeTimer.target, 0, 1, 0).limit(0, 1) * this._volume;
            if (v <= 0.01) {
                this.stop();
                this.currentTrack.volume = this._volume;
                clearInterval(this._fadeInterval);
            } else {
                this.currentTrack.volume = v;
            }
        },
        _endedCallback: function () {
            if (this._loop) {
                this.play();
            } else {
                this.next();
            }
        }
    });
    ig.Sound = ig.Class.extend({
        path: '',
        volume: 1,
        currentClip: null,
        multiChannel: true,
        init: function (path, multiChannel) {
            this.path = path;
            this.multiChannel = (multiChannel !== false);
            this.load();
        },
        load: function (loadCallback) {
            if (!ig.Sound.enabled) {
                if (loadCallback) {
                    loadCallback(this.path, true);
                }
                return;
            }
            if (ig.ready) {
                ig.soundManager.load(this.path, this.multiChannel, loadCallback);
            } else {
                ig.addResource(this);
            }
        },
        play: function () {
            if (!ig.Sound.enabled) {
                return;
            }
            this.currentClip = ig.soundManager.get(this.path);
            this.currentClip.volume = ig.soundManager.volume * this.volume;
            this.currentClip.play();
        },
        stop: function () {
            if (this.currentClip) {
                this.currentClip.pause();
                this.currentClip.currentTime = 0;
            }
        }
    });
    ig.Sound.FORMAT = {
        MP3: {
            ext: 'mp3',
            mime: 'audio/mpeg'
        },
        M4A: {
            ext: 'm4a',
            mime: 'audio/mp4; codecs=mp4a'
        },
        OGG: {
            ext: 'ogg',
            mime: 'audio/ogg; codecs=vorbis'
        },
        WEBM: {
            ext: 'webm',
            mime: 'audio/webm; codecs=vorbis'
        },
        CAF: {
            ext: 'caf',
            mime: 'audio/x-caf'
        }
    };
    ig.Sound.use = [ig.Sound.FORMAT.OGG, ig.Sound.FORMAT.MP3];
    ig.Sound.channels = 4;
    ig.Sound.enabled = true;
});

// lib/impact/loader.js
ig.baked = true;
ig.module('impact.loader').requires('impact.image', 'impact.font', 'impact.sound').defines(function () {
    "use strict";
    ig.Loader = ig.Class.extend({
        resources: [],
        gameClass: null,
        status: 0,
        done: false,
        _unloaded: [],
        _drawStatus: 0,
        _intervalId: 0,
        _loadCallbackBound: null,
        init: function (gameClass, resources) {
            this.gameClass = gameClass;
            this.resources = resources;
            this._loadCallbackBound = this._loadCallback.bind(this);
            for (var i = 0; i < this.resources.length; i++) {
                this._unloaded.push(this.resources[i].path);
            }
        },
        load: function () {
            ig.system.clear('#000');
            if (!this.resources.length) {
                this.end();
                return;
            }
            for (var i = 0; i < this.resources.length; i++) {
                this.loadResource(this.resources[i]);
            }
            this._intervalId = setInterval(this.draw.bind(this), 16);
        },
        loadResource: function (res) {
            res.load(this._loadCallbackBound);
        },
        end: function () {
            if (this.done) {
                return;
            }
            this.done = true;
            clearInterval(this._intervalId);
            ig.system.setGame(this.gameClass);
        },
        draw: function () {
            this._drawStatus += (this.status - this._drawStatus) / 5;
            var s = ig.system.scale;
            var w = ig.system.width * 0.6;
            var h = ig.system.height * 0.1;
            var x = ig.system.width * 0.5 - w / 2;
            var y = ig.system.height * 0.5 - h / 2;
            ig.system.context.fillStyle = '#000';
            ig.system.context.fillRect(0, 0, 480, 320);
            ig.system.context.fillStyle = '#fff';
            ig.system.context.fillRect(x * s, y * s, w * s, h * s);
            ig.system.context.fillStyle = '#000';
            ig.system.context.fillRect(x * s + s, y * s + s, w * s - s - s, h * s - s - s);
            ig.system.context.fillStyle = '#fff';
            ig.system.context.fillRect(x * s, y * s, w * s * this._drawStatus, h * s);
        },
        _loadCallback: function (path, status) {
            if (status) {
                this._unloaded.erase(path);
            } else {
                throw ('Failed to load resource: ' + path);
            }
            this.status = 1 - (this._unloaded.length / this.resources.length);
            if (this._unloaded.length == 0) {
                setTimeout(this.end.bind(this), 250);
            }
        }
    });
});

// lib/impact/timer.js
ig.baked = true;
ig.module('impact.timer').defines(function () {
    "use strict";
    ig.Timer = ig.Class.extend({
        target: 0,
        base: 0,
        last: 0,
        pausedAt: 0,
        init: function (seconds) {
            this.base = ig.Timer.time;
            this.last = ig.Timer.time;
            this.target = seconds || 0;
        },
        set: function (seconds) {
            this.target = seconds || 0;
            this.base = ig.Timer.time;
            this.pausedAt = 0;
        },
        reset: function () {
            this.base = ig.Timer.time;
            this.pausedAt = 0;
        },
        tick: function () {
            var delta = ig.Timer.time - this.last;
            this.last = ig.Timer.time;
            return (this.pausedAt ? 0 : delta);
        },
        delta: function () {
            return (this.pausedAt || ig.Timer.time) - this.base - this.target;
        },
        pause: function () {
            if (!this.pausedAt) {
                this.pausedAt = ig.Timer.time;
            }
        },
        unpause: function () {
            if (this.pausedAt) {
                this.base += ig.Timer.time - this.pausedAt;
                this.pausedAt = 0;
            }
        }
    });
    ig.Timer._last = 0;
    ig.Timer.time = Number.MIN_VALUE;
    ig.Timer.timeScale = 1;
    ig.Timer.maxStep = 0.05;
    ig.Timer.step = function () {
        var current = Date.now();
        var delta = (current - ig.Timer._last) / 1000;
        ig.Timer.time += Math.min(delta, ig.Timer.maxStep) * ig.Timer.timeScale;
        ig.Timer._last = current;
    };
});

// lib/impact/system.js
ig.baked = true;
ig.module('impact.system').requires('impact.timer', 'impact.image').defines(function () {
    "use strict";
    ig.System = ig.Class.extend({
        fps: 30,
        width: 320,
        height: 240,
        realWidth: 320,
        realHeight: 240,
        scale: 1,
        tick: 0,
        animationId: 0,
        newGameClass: null,
        running: false,
        delegate: null,
        clock: null,
        canvas: null,
        context: null,
        init: function (canvasId, fps, width, height, scale) {
            this.fps = fps;
            this.clock = new ig.Timer();
            this.canvas = ig.$(canvasId);
            this.resize(width, height, scale);
            this.context = this.canvas.getContext('2d');
            this.getDrawPos = ig.System.drawMode;
            if (this.scale != 1) {
                ig.System.scaleMode = ig.System.SCALE.CRISP;
            }
            ig.System.scaleMode(this.canvas, this.context);
        },
        resize: function (width, height, scale) {
            this.width = width;
            this.height = height;
            this.scale = scale || this.scale;
            this.realWidth = this.width * this.scale;
            this.realHeight = this.height * this.scale;
            this.canvas.width = this.realWidth;
            this.canvas.height = this.realHeight;
        },
        setGame: function (gameClass) {
            if (this.running) {
                this.newGameClass = gameClass;
            } else {
                this.setGameNow(gameClass);
            }
        },
        setGameNow: function (gameClass) {
            ig.game = new(gameClass)();
            ig.system.setDelegate(ig.game);
        },
        setDelegate: function (object) {
            if (typeof (object.run) == 'function') {
                this.delegate = object;
                this.startRunLoop();
            } else {
                throw ('System.setDelegate: No run() function in object');
            }
        },
        stopRunLoop: function () {
            ig.clearAnimation(this.animationId);
            this.running = false;
        },
        startRunLoop: function () {
            this.stopRunLoop();
            this.animationId = ig.setAnimation(this.run.bind(this), this.canvas);
            this.running = true;
        },
        clear: function (color) {
            this.context.fillStyle = color;
            this.context.fillRect(0, 0, this.realWidth, this.realHeight);
        },
        run: function () {
            ig.Timer.step();
            this.tick = this.clock.tick();
            this.delegate.run();
            ig.input.clearPressed();
            if (this.newGameClass) {
                this.setGameNow(this.newGameClass);
                this.newGameClass = null;
            }
        },
        getDrawPos: null
    });
    ig.System.DRAW = {
        AUTHENTIC: function (p) {
            return Math.round(p) * this.scale;
        },
        SMOOTH: function (p) {
            return Math.round(p * this.scale);
        },
        SUBPIXEL: function (p) {
            return p * this.scale;
        }
    };
    ig.System.drawMode = ig.System.DRAW.SMOOTH;
    ig.System.SCALE = {
        CRISP: function (canvas, context) {
            ig.setVendorAttribute(context, 'imageSmoothingEnabled', false);
            canvas.style.imageRendering = '-moz-crisp-edges';
            canvas.style.imageRendering = '-o-crisp-edges';
            canvas.style.imageRendering = '-webkit-optimize-contrast';
            canvas.style.imageRendering = 'crisp-edges';
            canvas.style.msInterpolationMode = 'nearest-neighbor';
        },
        SMOOTH: function (canvas, context) {
            ig.setVendorAttribute(context, 'imageSmoothingEnabled', true);
            canvas.style.imageRendering = '';
            canvas.style.msInterpolationMode = '';
        }
    };
    ig.System.scaleMode = ig.System.SCALE.SMOOTH;
});

// lib/impact/input.js
ig.baked = true;
ig.module('impact.input').defines(function () {
    "use strict";
    ig.KEY = {
        'MOUSE1': -1,
        'MOUSE2': -3,
        'MWHEEL_UP': -4,
        'MWHEEL_DOWN': -5,
        'BACKSPACE': 8,
        'TAB': 9,
        'ENTER': 13,
        'PAUSE': 19,
        'CAPS': 20,
        'ESC': 27,
        'SPACE': 32,
        'PAGE_UP': 33,
        'PAGE_DOWN': 34,
        'END': 35,
        'HOME': 36,
        'LEFT_ARROW': 37,
        'UP_ARROW': 38,
        'RIGHT_ARROW': 39,
        'DOWN_ARROW': 40,
        'INSERT': 45,
        'DELETE': 46,
        '_0': 48,
        '_1': 49,
        '_2': 50,
        '_3': 51,
        '_4': 52,
        '_5': 53,
        '_6': 54,
        '_7': 55,
        '_8': 56,
        '_9': 57,
        'A': 65,
        'B': 66,
        'C': 67,
        'D': 68,
        'E': 69,
        'F': 70,
        'G': 71,
        'H': 72,
        'I': 73,
        'J': 74,
        'K': 75,
        'L': 76,
        'M': 77,
        'N': 78,
        'O': 79,
        'P': 80,
        'Q': 81,
        'R': 82,
        'S': 83,
        'T': 84,
        'U': 85,
        'V': 86,
        'W': 87,
        'X': 88,
        'Y': 89,
        'Z': 90,
        'NUMPAD_0': 96,
        'NUMPAD_1': 97,
        'NUMPAD_2': 98,
        'NUMPAD_3': 99,
        'NUMPAD_4': 100,
        'NUMPAD_5': 101,
        'NUMPAD_6': 102,
        'NUMPAD_7': 103,
        'NUMPAD_8': 104,
        'NUMPAD_9': 105,
        'MULTIPLY': 106,
        'ADD': 107,
        'SUBSTRACT': 109,
        'DECIMAL': 110,
        'DIVIDE': 111,
        'F1': 112,
        'F2': 113,
        'F3': 114,
        'F4': 115,
        'F5': 116,
        'F6': 117,
        'F7': 118,
        'F8': 119,
        'F9': 120,
        'F10': 121,
        'F11': 122,
        'F12': 123,
        'SHIFT': 16,
        'CTRL': 17,
        'ALT': 18,
        'PLUS': 187,
        'COMMA': 188,
        'MINUS': 189,
        'PERIOD': 190
    };
    ig.Input = ig.Class.extend({
        bindings: {},
        actions: {},
        presses: {},
        locks: {},
        delayedKeyup: {},
        isUsingMouse: false,
        isUsingKeyboard: false,
        isUsingAccelerometer: false,
        mouse: {
            x: 0,
            y: 0
        },
        accel: {
            x: 0,
            y: 0,
            z: 0
        },
        initMouse: function () {
            if (this.isUsingMouse) {
                return;
            }
            this.isUsingMouse = true;
            var mouseWheelBound = this.mousewheel.bind(this);
            ig.system.canvas.addEventListener('mousewheel', mouseWheelBound, false);
            ig.system.canvas.addEventListener('DOMMouseScroll', mouseWheelBound, false);
            ig.system.canvas.addEventListener('contextmenu', this.contextmenu.bind(this), false);
            ig.system.canvas.addEventListener('mousedown', this.keydown.bind(this), false);
            ig.system.canvas.addEventListener('mouseup', this.keyup.bind(this), false);
            ig.system.canvas.addEventListener('mousemove', this.mousemove.bind(this), false);
            ig.system.canvas.addEventListener('touchstart', this.keydown.bind(this), false);
            ig.system.canvas.addEventListener('touchend', this.keyup.bind(this), false);
            ig.system.canvas.addEventListener('touchmove', this.mousemove.bind(this), false);
        },
        initKeyboard: function () {
            if (this.isUsingKeyboard) {
                return;
            }
            this.isUsingKeyboard = true;
            window.addEventListener('keydown', this.keydown.bind(this), false);
            window.addEventListener('keyup', this.keyup.bind(this), false);
        },
        initAccelerometer: function () {
            if (this.isUsingAccelerometer) {
                return;
            }
            window.addEventListener('devicemotion', this.devicemotion.bind(this), false);
        },
        mousewheel: function (event) {
            var delta = event.wheelDelta ? event.wheelDelta : (event.detail * -1);
            var code = delta > 0 ? ig.KEY.MWHEEL_UP : ig.KEY.MWHEEL_DOWN;
            var action = this.bindings[code];
            if (action) {
                this.actions[action] = true;
                this.presses[action] = true;
                this.delayedKeyup[action] = true;
                event.stopPropagation();
                event.preventDefault();
            }
        },
        mousemove: function (event) {
            var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
            var scale = ig.system.scale * (internalWidth / ig.system.realWidth);
            var pos = {
                left: 0,
                top: 0
            };
            if (ig.system.canvas.getBoundingClientRect) {
                pos = ig.system.canvas.getBoundingClientRect();
            }
            var ev = event.touches ? event.touches[0] : event;
            this.mouse.x = (ev.clientX - pos.left) / scale;
            this.mouse.y = (ev.clientY - pos.top) / scale;
        },
        contextmenu: function (event) {
            if (this.bindings[ig.KEY.MOUSE2]) {
                event.stopPropagation();
                event.preventDefault();
            }
        },
        keydown: function (event) {
            var tag = event.target.tagName;
            if (tag == 'INPUT' || tag == 'TEXTAREA') {
                return;
            }
            var code = event.type == 'keydown' ? event.keyCode : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
            if (event.type == 'touchstart' || event.type == 'mousedown') {
                this.mousemove(event);
            }
            var action = this.bindings[code];
            if (action) {
                this.actions[action] = true;
                if (!this.locks[action]) {
                    this.presses[action] = true;
                    this.locks[action] = true;
                }
                event.stopPropagation();
                event.preventDefault();
            }
        },
        keyup: function (event) {
            var tag = event.target.tagName;
            if (tag == 'INPUT' || tag == 'TEXTAREA') {
                return;
            }
            var code = event.type == 'keyup' ? event.keyCode : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
            var action = this.bindings[code];
            if (action) {
                this.delayedKeyup[action] = true;
                event.stopPropagation();
                event.preventDefault();
            }
        },
        devicemotion: function (event) {
            this.accel = event.accelerationIncludingGravity;
        },
        bind: function (key, action) {
            if (key < 0) {
                this.initMouse();
            } else if (key > 0) {
                this.initKeyboard();
            }
            this.bindings[key] = action;
        },
        bindTouch: function (selector, action) {
            var element = ig.$(selector);
            var that = this;
            element.addEventListener('touchstart', function (ev) {
                that.touchStart(ev, action);
            }, false);
            element.addEventListener('touchend', function (ev) {
                that.touchEnd(ev, action);
            }, false);
        },
        unbind: function (key) {
            var action = this.bindings[key];
            this.delayedKeyup[action] = true;
            this.bindings[key] = null;
        },
        unbindAll: function () {
            this.bindings = {};
            this.actions = {};
            this.presses = {};
            this.locks = {};
            this.delayedKeyup = {};
        },
        state: function (action) {
            return this.actions[action];
        },
        pressed: function (action) {
            return this.presses[action];
        },
        released: function (action) {
            return this.delayedKeyup[action];
        },
        clearPressed: function () {
            for (var action in this.delayedKeyup) {
                this.actions[action] = false;
                this.locks[action] = false;
            }
            this.delayedKeyup = {};
            this.presses = {};
        },
        touchStart: function (event, action) {
            this.actions[action] = true;
            this.presses[action] = true;
            event.stopPropagation();
            event.preventDefault();
            return false;
        },
        touchEnd: function (event, action) {
            this.delayedKeyup[action] = true;
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
    });
});

// lib/impact/impact.js
ig.baked = true;
ig.module('impact.impact').requires('dom.ready', 'impact.loader', 'impact.system', 'impact.input', 'impact.sound').defines(function () {
    "use strict";
    ig.main = function (canvasId, gameClass, fps, width, height, scale, loaderClass) {
        ig.system = new ig.System(canvasId, fps, width, height, scale || 1);
        ig.input = new ig.Input();
        ig.soundManager = new ig.SoundManager();
        ig.music = new ig.Music();
        ig.ready = true;
        var loader = new(loaderClass || ig.Loader)(gameClass, ig.resources);
        loader.load();
    };
});

// lib/impact/animation.js
ig.baked = true;
ig.module('impact.animation').requires('impact.timer', 'impact.image').defines(function () {
    "use strict";
    ig.AnimationSheet = ig.Class.extend({
        width: 8,
        height: 8,
        image: null,
        init: function (path, width, height) {
            this.width = width;
            this.height = height;
            this.image = new ig.Image(path);
        }
    });
    ig.Animation = ig.Class.extend({
        sheet: null,
        timer: null,
        sequence: [],
        flip: {
            x: false,
            y: false
        },
        pivot: {
            x: 0,
            y: 0
        },
        frame: 0,
        tile: 0,
        loopCount: 0,
        alpha: 1,
        angle: 0,
        init: function (sheet, frameTime, sequence, stop) {
            this.sheet = sheet;
            this.pivot = {
                x: sheet.width / 2,
                y: sheet.height / 2
            };
            this.timer = new ig.Timer();
            this.frameTime = frameTime;
            this.sequence = sequence;
            this.stop = !! stop;
            this.tile = this.sequence[0];
        },
        rewind: function () {
            this.timer.set();
            this.loopCount = 0;
            this.tile = this.sequence[0];
            return this;
        },
        gotoFrame: function (f) {
            this.timer.set(this.frameTime * -f);
            this.update();
        },
        gotoRandomFrame: function () {
            this.gotoFrame(Math.floor(Math.random() * this.sequence.length))
        },
        update: function () {
            var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
            this.loopCount = Math.floor(frameTotal / this.sequence.length);
            if (this.stop && this.loopCount > 0) {
                this.frame = this.sequence.length - 1;
            } else {
                this.frame = frameTotal % this.sequence.length;
            }
            this.tile = this.sequence[this.frame];
        },
        draw: function (targetX, targetY) {
            var bbsize = Math.max(this.sheet.width, this.sheet.height);
            if (targetX > ig.system.width || targetY > ig.system.height || targetX + bbsize < 0 || targetY + bbsize < 0) {
                return;
            }
            if (this.alpha != 1) {
                ig.system.context.globalAlpha = this.alpha;
            }
            if (this.angle == 0) {
                this.sheet.image.drawTile(targetX, targetY, this.tile, this.sheet.width, this.sheet.height, this.flip.x, this.flip.y);
            } else {
                ig.system.context.save();
                ig.system.context.translate(ig.system.getDrawPos(targetX + this.pivot.x), ig.system.getDrawPos(targetY + this.pivot.y));
                ig.system.context.rotate(this.angle);
                this.sheet.image.drawTile(-this.pivot.x, -this.pivot.y, this.tile, this.sheet.width, this.sheet.height, this.flip.x, this.flip.y);
                ig.system.context.restore();
            }
            if (this.alpha != 1) {
                ig.system.context.globalAlpha = 1;
            }
        }
    });
});

// lib/impact/entity.js
ig.baked = true;
ig.module('impact.entity').requires('impact.animation', 'impact.impact').defines(function () {
    "use strict";
    ig.Entity = ig.Class.extend({
        id: 0,
        settings: {},
        size: {
            x: 16,
            y: 16
        },
        offset: {
            x: 0,
            y: 0
        },
        pos: {
            x: 0,
            y: 0
        },
        last: {
            x: 0,
            y: 0
        },
        vel: {
            x: 0,
            y: 0
        },
        accel: {
            x: 0,
            y: 0
        },
        friction: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 100,
            y: 100
        },
        zIndex: 0,
        gravityFactor: 1,
        standing: false,
        bounciness: 0,
        minBounceVelocity: 40,
        anims: {},
        animSheet: null,
        currentAnim: null,
        health: 10,
        type: 0,
        checkAgainst: 0,
        collides: 0,
        _killed: false,
        slopeStanding: {
            min: (44).toRad(),
            max: (136).toRad()
        },
        init: function (x, y, settings) {
            this.id = ++ig.Entity._lastId;
            this.pos.x = x;
            this.pos.y = y;
            ig.merge(this, settings);
        },
        addAnim: function (name, frameTime, sequence, stop) {
            if (!this.animSheet) {
                throw ('No animSheet to add the animation ' + name + ' to.');
            }
            var a = new ig.Animation(this.animSheet, frameTime, sequence, stop);
            this.anims[name] = a;
            if (!this.currentAnim) {
                this.currentAnim = a;
            }
            return a;
        },
        update: function () {
            this.last.x = this.pos.x;
            this.last.y = this.pos.y;
            this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
            this.vel.x = this.getNewVelocity(this.vel.x, this.accel.x, this.friction.x, this.maxVel.x);
            this.vel.y = this.getNewVelocity(this.vel.y, this.accel.y, this.friction.y, this.maxVel.y);
            var mx = this.vel.x * ig.system.tick;
            var my = this.vel.y * ig.system.tick;
            var res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y);
            this.handleMovementTrace(res);
            if (this.currentAnim) {
                this.currentAnim.update();
            }
        },
        getNewVelocity: function (vel, accel, friction, max) {
            if (accel) {
                return (vel + accel * ig.system.tick).limit(-max, max);
            } else if (friction) {
                var delta = friction * ig.system.tick;
                if (vel - delta > 0) {
                    return vel - delta;
                } else if (vel + delta < 0) {
                    return vel + delta;
                } else {
                    return 0;
                }
            }
            return vel.limit(-max, max);
        },
        handleMovementTrace: function (res) {
            this.standing = false;
            if (res.collision.y) {
                if (this.bounciness > 0 && Math.abs(this.vel.y) > this.minBounceVelocity) {
                    this.vel.y *= -this.bounciness;
                } else {
                    if (this.vel.y > 0) {
                        this.standing = true;
                    }
                    this.vel.y = 0;
                }
            }
            if (res.collision.x) {
                if (this.bounciness > 0 && Math.abs(this.vel.x) > this.minBounceVelocity) {
                    this.vel.x *= -this.bounciness;
                } else {
                    this.vel.x = 0;
                }
            }
            if (res.collision.slope) {
                var s = res.collision.slope;
                if (this.bounciness > 0) {
                    var proj = this.vel.x * s.nx + this.vel.y * s.ny;
                    this.vel.x = (this.vel.x - s.nx * proj * 2) * this.bounciness;
                    this.vel.y = (this.vel.y - s.ny * proj * 2) * this.bounciness;
                } else {
                    var lengthSquared = s.x * s.x + s.y * s.y;
                    var dot = (this.vel.x * s.x + this.vel.y * s.y) / lengthSquared;
                    this.vel.x = s.x * dot;
                    this.vel.y = s.y * dot;
                    var angle = Math.atan2(s.x, s.y);
                    if (angle > this.slopeStanding.min && angle < this.slopeStanding.max) {
                        this.standing = true;
                    }
                }
            }
            this.pos = res.pos;
        },
        draw: function () {
            if (this.currentAnim) {
                this.currentAnim.draw(this.pos.x - this.offset.x - ig.game._rscreen.x, this.pos.y - this.offset.y - ig.game._rscreen.y);
            }
        },
        kill: function () {
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from) {
            this.health -= amount;
            if (this.health <= 0) {
                this.kill();
            }
        },
        touches: function (other) {
            return !(this.pos.x >= other.pos.x + other.size.x || this.pos.x + this.size.x <= other.pos.x || this.pos.y >= other.pos.y + other.size.y || this.pos.y + this.size.y <= other.pos.y);
        },
        distanceTo: function (other) {
            var xd = (this.pos.x + this.size.x / 2) - (other.pos.x + other.size.x / 2);
            var yd = (this.pos.y + this.size.y / 2) - (other.pos.y + other.size.y / 2);
            return Math.sqrt(xd * xd + yd * yd);
        },
        angleTo: function (other) {
            return Math.atan2((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2), (other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2));
        },
        check: function (other) {},
        collideWith: function (other, axis) {},
        ready: function () {}
    });
    ig.Entity._lastId = 0;
    ig.Entity.COLLIDES = {
        NEVER: 0,
        LITE: 1,
        PASSIVE: 2,
        ACTIVE: 4,
        FIXED: 8
    };
    ig.Entity.TYPE = {
        NONE: 0,
        A: 1,
        B: 2,
        BOTH: 3
    };
    ig.Entity.checkPair = function (a, b) {
        if (a.checkAgainst & b.type) {
            a.check(b);
        }
        if (b.checkAgainst & a.type) {
            b.check(a);
        }
        if (a.collides && b.collides && a.collides + b.collides > ig.Entity.COLLIDES.ACTIVE) {
            ig.Entity.solveCollision(a, b);
        }
    };
    ig.Entity.solveCollision = function (a, b) {
        var weak = null;
        if (a.collides == ig.Entity.COLLIDES.LITE || b.collides == ig.Entity.COLLIDES.FIXED) {
            weak = a;
        } else if (b.collides == ig.Entity.COLLIDES.LITE || a.collides == ig.Entity.COLLIDES.FIXED) {
            weak = b;
        }
        if (a.last.x + a.size.x > b.last.x && a.last.x < b.last.x + b.size.x) {
            if (a.last.y < b.last.y) {
                ig.Entity.seperateOnYAxis(a, b, weak);
            } else {
                ig.Entity.seperateOnYAxis(b, a, weak);
            }
            a.collideWith(b, 'y');
            b.collideWith(a, 'y');
        } else if (a.last.y + a.size.y > b.last.y && a.last.y < b.last.y + b.size.y) {
            if (a.last.x < b.last.x) {
                ig.Entity.seperateOnXAxis(a, b, weak);
            } else {
                ig.Entity.seperateOnXAxis(b, a, weak);
            }
            a.collideWith(b, 'x');
            b.collideWith(a, 'x');
        }
    };
    ig.Entity.seperateOnXAxis = function (left, right, weak) {
        var nudge = (left.pos.x + left.size.x - right.pos.x);
        if (weak) {
            var strong = left === weak ? right : left;
            weak.vel.x = -weak.vel.x * weak.bounciness + strong.vel.x;
            var resWeak = ig.game.collisionMap.trace(weak.pos.x, weak.pos.y, weak == left ? -nudge : nudge, 0, weak.size.x, weak.size.y);
            weak.pos.x = resWeak.pos.x;
        } else {
            var v2 = (left.vel.x - right.vel.x) / 2;
            left.vel.x = -v2;
            right.vel.x = v2;
            var resLeft = ig.game.collisionMap.trace(left.pos.x, left.pos.y, -nudge / 2, 0, left.size.x, left.size.y);
            left.pos.x = Math.floor(resLeft.pos.x);
            var resRight = ig.game.collisionMap.trace(right.pos.x, right.pos.y, nudge / 2, 0, right.size.x, right.size.y);
            right.pos.x = Math.ceil(resRight.pos.x);
        }
    };
    ig.Entity.seperateOnYAxis = function (top, bottom, weak) {
        var nudge = (top.pos.y + top.size.y - bottom.pos.y);
        if (weak) {
            var strong = top === weak ? bottom : top;
            weak.vel.y = -weak.vel.y * weak.bounciness + strong.vel.y;
            var nudgeX = 0;
            if (weak == top && Math.abs(weak.vel.y - strong.vel.y) < weak.minBounceVelocity) {
                weak.standing = true;
                nudgeX = strong.vel.x * ig.system.tick;
            }
            var resWeak = ig.game.collisionMap.trace(weak.pos.x, weak.pos.y, nudgeX, weak == top ? -nudge : nudge, weak.size.x, weak.size.y);
            weak.pos.y = resWeak.pos.y;
            weak.pos.x = resWeak.pos.x;
        } else if (ig.game.gravity && (bottom.standing || top.vel.y > 0)) {
            var resTop = ig.game.collisionMap.trace(top.pos.x, top.pos.y, 0, -(top.pos.y + top.size.y - bottom.pos.y), top.size.x, top.size.y);
            top.pos.y = resTop.pos.y;
            if (top.bounciness > 0 && top.vel.y > top.minBounceVelocity) {
                top.vel.y *= -top.bounciness;
            } else {
                top.standing = true;
                top.vel.y = 0;
            }
        } else {
            var v2 = (top.vel.y - bottom.vel.y) / 2;
            top.vel.y = -v2;
            bottom.vel.y = v2;
            var nudgeX = bottom.vel.x * ig.system.tick;
            var resTop = ig.game.collisionMap.trace(top.pos.x, top.pos.y, nudgeX, -nudge / 2, top.size.x, top.size.y);
            top.pos.y = resTop.pos.y;
            var resBottom = ig.game.collisionMap.trace(bottom.pos.x, bottom.pos.y, 0, nudge / 2, bottom.size.x, bottom.size.y);
            bottom.pos.y = resBottom.pos.y;
        }
    };
});

// lib/impact/map.js
ig.baked = true;
ig.module('impact.map').defines(function () {
    "use strict";
    ig.Map = ig.Class.extend({
        tilesize: 8,
        width: 1,
        height: 1,
        data: [
            []
        ],
        name: null,
        init: function (tilesize, data) {
            this.tilesize = tilesize;
            this.data = data;
            this.height = data.length;
            this.width = data[0].length;
        },
        getTile: function (x, y) {
            var tx = Math.floor(x / this.tilesize);
            var ty = Math.floor(y / this.tilesize);
            if ((tx >= 0 && tx < this.width) && (ty >= 0 && ty < this.height)) {
                return this.data[ty][tx];
            } else {
                return 0;
            }
        },
        setTile: function (x, y, tile) {
            var tx = Math.floor(x / this.tilesize);
            var ty = Math.floor(y / this.tilesize);
            if ((tx >= 0 && tx < this.width) && (ty >= 0 && ty < this.height)) {
                this.data[ty][tx] = tile;
            }
        }
    });
});

// lib/impact/collision-map.js
ig.baked = true;
ig.module('impact.collision-map').requires('impact.map').defines(function () {
    "use strict";
    ig.CollisionMap = ig.Map.extend({
        lastSlope: 1,
        tiledef: null,
        init: function (tilesize, data, tiledef) {
            this.parent(tilesize, data);
            this.tiledef = tiledef || ig.CollisionMap.defaultTileDef;
            for (var t in this.tiledef) {
                if (t | 0 > this.lastSlope) {
                    this.lastSlope = t | 0;
                }
            }
        },
        trace: function (x, y, vx, vy, objectWidth, objectHeight) {
            var res = {
                collision: {
                    x: false,
                    y: false,
                    slope: false
                },
                pos: {
                    x: x,
                    y: y
                },
                tile: {
                    x: 0,
                    y: 0
                }
            };
            var steps = Math.ceil(Math.max(Math.abs(vx), Math.abs(vy)) / this.tilesize);
            if (steps > 1) {
                var sx = vx / steps;
                var sy = vy / steps;
                for (var i = 0; i < steps && (sx || sy); i++) {
                    this._traceStep(res, x, y, sx, sy, objectWidth, objectHeight, vx, vy, i);
                    x = res.pos.x;
                    y = res.pos.y;
                    if (res.collision.x) {
                        sx = 0;
                        vx = 0;
                    }
                    if (res.collision.y) {
                        sy = 0;
                        vy = 0;
                    }
                    if (res.collision.slope) {
                        break;
                    }
                }
            } else {
                this._traceStep(res, x, y, vx, vy, objectWidth, objectHeight, vx, vy, 0);
            }
            return res;
        },
        _traceStep: function (res, x, y, vx, vy, width, height, rvx, rvy, step) {
            res.pos.x += vx;
            res.pos.y += vy;
            var t = 0;
            if (vx) {
                var pxOffsetX = (vx > 0 ? width : 0);
                var tileOffsetX = (vx < 0 ? this.tilesize : 0);
                var firstTileY = Math.max(Math.floor(y / this.tilesize), 0);
                var lastTileY = Math.min(Math.ceil((y + height) / this.tilesize), this.height);
                var tileX = Math.floor((res.pos.x + pxOffsetX) / this.tilesize);
                var prevTileX = Math.floor((x + pxOffsetX) / this.tilesize);
                if (step > 0 || tileX == prevTileX || prevTileX < 0 || prevTileX >= this.width) {
                    prevTileX = -1;
                }
                if (tileX >= 0 && tileX < this.width) {
                    for (var tileY = firstTileY; tileY < lastTileY; tileY++) {
                        if (prevTileX != -1) {
                            t = this.data[tileY][prevTileX];
                            if (t > 1 && t <= this.lastSlope && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, prevTileX, tileY)) {
                                break;
                            }
                        }
                        t = this.data[tileY][tileX];
                        if (t == 1 || t > this.lastSlope || (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY))) {
                            if (t > 1 && t <= this.lastSlope && res.collision.slope) {
                                break;
                            }
                            res.collision.x = true;
                            res.tile.x = t;
                            x = res.pos.x = tileX * this.tilesize - pxOffsetX + tileOffsetX;
                            rvx = 0;
                            break;
                        }
                    }
                }
            }
            if (vy) {
                var pxOffsetY = (vy > 0 ? height : 0);
                var tileOffsetY = (vy < 0 ? this.tilesize : 0);
                var firstTileX = Math.max(Math.floor(res.pos.x / this.tilesize), 0);
                var lastTileX = Math.min(Math.ceil((res.pos.x + width) / this.tilesize), this.width);
                var tileY = Math.floor((res.pos.y + pxOffsetY) / this.tilesize);
                var prevTileY = Math.floor((y + pxOffsetY) / this.tilesize);
                if (step > 0 || tileY == prevTileY || prevTileY < 0 || prevTileY >= this.height) {
                    prevTileY = -1;
                }
                if (tileY >= 0 && tileY < this.height) {
                    for (var tileX = firstTileX; tileX < lastTileX; tileX++) {
                        if (prevTileY != -1) {
                            t = this.data[prevTileY][tileX];
                            if (t > 1 && t <= this.lastSlope && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, prevTileY)) {
                                break;
                            }
                        }
                        t = this.data[tileY][tileX];
                        if (t == 1 || t > this.lastSlope || (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY))) {
                            if (t > 1 && t <= this.lastSlope && res.collision.slope) {
                                break;
                            }
                            res.collision.y = true;
                            res.tile.y = t;
                            res.pos.y = tileY * this.tilesize - pxOffsetY + tileOffsetY;
                            break;
                        }
                    }
                }
            }
        },
        _checkTileDef: function (res, t, x, y, vx, vy, width, height, tileX, tileY) {
            var def = this.tiledef[t];
            if (!def) {
                return false;
            }
            var lx = (tileX + def[0]) * this.tilesize,
                ly = (tileY + def[1]) * this.tilesize,
                lvx = (def[2] - def[0]) * this.tilesize,
                lvy = (def[3] - def[1]) * this.tilesize,
                solid = def[4];
            var tx = x + vx + (lvy < 0 ? width : 0) - lx,
                ty = y + vy + (lvx > 0 ? height : 0) - ly;
            if (lvx * ty - lvy * tx > 0) {
                if (vx * -lvy + vy * lvx < 0) {
                    return solid;
                }
                var length = Math.sqrt(lvx * lvx + lvy * lvy);
                var nx = lvy / length,
                    ny = -lvx / length;
                var proj = tx * nx + ty * ny;
                var px = nx * proj,
                    py = ny * proj;
                if (px * px + py * py >= vx * vx + vy * vy) {
                    return solid || (lvx * (ty - vy) - lvy * (tx - vx) < 0.5);
                }
                res.pos.x = x + vx - px;
                res.pos.y = y + vy - py;
                res.collision.slope = {
                    x: lvx,
                    y: lvy,
                    nx: nx,
                    ny: ny
                };
                return true;
            }
            return false;
        }
    });
    var H = 1 / 2,
        N = 1 / 3,
        M = 2 / 3,
        SOLID = true,
        NON_SOLID = false;
    ig.CollisionMap.defaultTileDef = {
        5: [0, 1, 1, M, SOLID],
        6: [0, M, 1, N, SOLID],
        7: [0, N, 1, 0, SOLID],
        3: [0, 1, 1, H, SOLID],
        4: [0, H, 1, 0, SOLID],
        2: [0, 1, 1, 0, SOLID],
        10: [H, 1, 1, 0, SOLID],
        21: [0, 1, H, 0, SOLID],
        32: [M, 1, 1, 0, SOLID],
        43: [N, 1, M, 0, SOLID],
        54: [0, 1, N, 0, SOLID],
        27: [0, 0, 1, N, SOLID],
        28: [0, N, 1, M, SOLID],
        29: [0, M, 1, 1, SOLID],
        25: [0, 0, 1, H, SOLID],
        26: [0, H, 1, 1, SOLID],
        24: [0, 0, 1, 1, SOLID],
        11: [0, 0, H, 1, SOLID],
        22: [H, 0, 1, 1, SOLID],
        33: [0, 0, N, 1, SOLID],
        44: [N, 0, M, 1, SOLID],
        55: [M, 0, 1, 1, SOLID],
        16: [1, N, 0, 0, SOLID],
        17: [1, M, 0, N, SOLID],
        18: [1, 1, 0, M, SOLID],
        14: [1, H, 0, 0, SOLID],
        15: [1, 1, 0, H, SOLID],
        13: [1, 1, 0, 0, SOLID],
        8: [H, 1, 0, 0, SOLID],
        19: [1, 1, H, 0, SOLID],
        30: [N, 1, 0, 0, SOLID],
        41: [M, 1, N, 0, SOLID],
        52: [1, 1, M, 0, SOLID],
        38: [1, M, 0, 1, SOLID],
        39: [1, N, 0, M, SOLID],
        40: [1, 0, 0, N, SOLID],
        36: [1, H, 0, 1, SOLID],
        37: [1, 0, 0, H, SOLID],
        35: [1, 0, 0, 1, SOLID],
        9: [1, 0, H, 1, SOLID],
        20: [H, 0, 0, 1, SOLID],
        31: [1, 0, M, 1, SOLID],
        42: [M, 0, N, 1, SOLID],
        53: [N, 0, 0, 1, SOLID],
        12: [0, 0, 1, 0, NON_SOLID],
        23: [1, 1, 0, 1, NON_SOLID],
        34: [1, 0, 1, 1, NON_SOLID],
        45: [0, 1, 0, 0, NON_SOLID]
    };
    ig.CollisionMap.staticNoCollision = {
        trace: function (x, y, vx, vy) {
            return {
                collision: {
                    x: false,
                    y: false,
                    slope: false
                },
                pos: {
                    x: x + vx,
                    y: y + vy
                },
                tile: {
                    x: 0,
                    y: 0
                }
            };
        }
    };
});

// lib/impact/background-map.js
ig.baked = true;
ig.module('impact.background-map').requires('impact.map', 'impact.image').defines(function () {
    "use strict";
    ig.BackgroundMap = ig.Map.extend({
        tiles: null,
        scroll: {
            x: 0,
            y: 0
        },
        distance: 1,
        repeat: false,
        tilesetName: '',
        foreground: false,
        enabled: true,
        preRender: false,
        preRenderedChunks: null,
        chunkSize: 512,
        debugChunks: false,
        anims: {},
        init: function (tilesize, data, tileset) {
            this.parent(tilesize, data);
            this.setTileset(tileset);
        },
        setTileset: function (tileset) {
            this.tilesetName = tileset instanceof ig.Image ? tileset.path : tileset;
            this.tiles = new ig.Image(this.tilesetName);
            this.preRenderedChunks = null;
        },
        setScreenPos: function (x, y) {
            this.scroll.x = x / this.distance;
            this.scroll.y = y / this.distance;
        },
        preRenderMapToChunks: function () {
            var totalWidth = this.width * this.tilesize * ig.system.scale,
                totalHeight = this.height * this.tilesize * ig.system.scale;
            var chunkCols = Math.ceil(totalWidth / this.chunkSize),
                chunkRows = Math.ceil(totalHeight / this.chunkSize);
            this.preRenderedChunks = [];
            for (var y = 0; y < chunkRows; y++) {
                this.preRenderedChunks[y] = [];
                for (var x = 0; x < chunkCols; x++) {
                    var chunkWidth = (x == chunkCols - 1) ? totalWidth - x * this.chunkSize : this.chunkSize;
                    var chunkHeight = (y == chunkRows - 1) ? totalHeight - y * this.chunkSize : this.chunkSize;
                    this.preRenderedChunks[y][x] = this.preRenderChunk(x, y, chunkWidth, chunkHeight);
                }
            }
        },
        preRenderChunk: function (cx, cy, w, h) {
            var tw = w / this.tilesize / ig.system.scale + 1,
                th = h / this.tilesize / ig.system.scale + 1;
            var nx = (cx * this.chunkSize / ig.system.scale) % this.tilesize,
                ny = (cy * this.chunkSize / ig.system.scale) % this.tilesize;
            var tx = Math.floor(cx * this.chunkSize / this.tilesize / ig.system.scale),
                ty = Math.floor(cy * this.chunkSize / this.tilesize / ig.system.scale);
            var chunk = ig.$new('canvas');
            chunk.width = w;
            chunk.height = h;
            var oldContext = ig.system.context;
            ig.system.context = chunk.getContext("2d");
            for (var x = 0; x < tw; x++) {
                for (var y = 0; y < th; y++) {
                    if (x + tx < this.width && y + ty < this.height) {
                        var tile = this.data[y + ty][x + tx];
                        if (tile) {
                            this.tiles.drawTile(x * this.tilesize - nx, y * this.tilesize - ny, tile - 1, this.tilesize);
                        }
                    }
                }
            }
            ig.system.context = oldContext;
            return chunk;
        },
        draw: function () {
            if (!this.tiles.loaded || !this.enabled) {
                return;
            }
            if (this.preRender) {
                this.drawPreRendered();
            } else {
                this.drawTiled();
            }
        },
        drawPreRendered: function () {
            if (!this.preRenderedChunks) {
                this.preRenderMapToChunks();
            }
            var dx = ig.system.getDrawPos(this.scroll.x),
                dy = ig.system.getDrawPos(this.scroll.y);
            if (this.repeat) {
                var w = this.width * this.tilesize * ig.system.scale;
                dx = (dx % w + w) % w;
                var h = this.height * this.tilesize * ig.system.scale;
                dy = (dy % h + h) % h;
            }
            var minChunkX = Math.max(Math.floor(dx / this.chunkSize), 0),
                minChunkY = Math.max(Math.floor(dy / this.chunkSize), 0),
                maxChunkX = Math.ceil((dx + ig.system.realWidth) / this.chunkSize),
                maxChunkY = Math.ceil((dy + ig.system.realHeight) / this.chunkSize),
                maxRealChunkX = this.preRenderedChunks[0].length,
                maxRealChunkY = this.preRenderedChunks.length;
            if (!this.repeat) {
                maxChunkX = Math.min(maxChunkX, maxRealChunkX);
                maxChunkY = Math.min(maxChunkY, maxRealChunkY);
            }
            var nudgeY = 0;
            for (var cy = minChunkY; cy < maxChunkY; cy++) {
                var nudgeX = 0;
                for (var cx = minChunkX; cx < maxChunkX; cx++) {
                    var chunk = this.preRenderedChunks[cy % maxRealChunkY][cx % maxRealChunkX];
                    var x = -dx + cx * this.chunkSize - nudgeX;
                    var y = -dy + cy * this.chunkSize - nudgeY;
                    ig.system.context.drawImage(chunk, x, y);
                    ig.Image.drawCount++;
                    if (this.debugChunks) {
                        ig.system.context.strokeStyle = '#f0f';
                        ig.system.context.strokeRect(x, y, this.chunkSize, this.chunkSize);
                    }
                    if (this.repeat && chunk.width < this.chunkSize && x + chunk.width < ig.system.realWidth) {
                        nudgeX = this.chunkSize - chunk.width;
                        maxChunkX++;
                    }
                }
                if (this.repeat && chunk.height < this.chunkSize && y + chunk.height < ig.system.realHeight) {
                    nudgeY = this.chunkSize - chunk.height;
                    maxChunkY++;
                }
            }
        },
        drawTiled: function () {
            var tile = 0,
                anim = null,
                tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
                tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
                pxOffsetX = this.scroll.x % this.tilesize,
                pxOffsetY = this.scroll.y % this.tilesize,
                pxMinX = -pxOffsetX - this.tilesize,
                pxMinY = -pxOffsetY - this.tilesize,
                pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
                pxMaxY = ig.system.height + this.tilesize - pxOffsetY;
            for (var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
                var tileY = mapY + tileOffsetY;
                if (tileY >= this.height || tileY < 0) {
                    if (!this.repeat) {
                        continue;
                    }
                    tileY = (tileY % this.height + this.height) % this.height;
                }
                for (var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize) {
                    var tileX = mapX + tileOffsetX;
                    if (tileX >= this.width || tileX < 0) {
                        if (!this.repeat) {
                            continue;
                        }
                        tileX = (tileX % this.width + this.width) % this.width;
                    }
                    if ((tile = this.data[tileY][tileX])) {
                        if ((anim = this.anims[tile - 1])) {
                            anim.draw(pxX, pxY);
                        } else {
                            this.tiles.drawTile(pxX, pxY, tile - 1, this.tilesize);
                        }
                    }
                }
            }
        }
    });
});

// lib/impact/game.js
ig.baked = true;
ig.module('impact.game').requires('impact.impact', 'impact.entity', 'impact.collision-map', 'impact.background-map').defines(function () {
    "use strict";
    ig.Game = ig.Class.extend({
        clearColor: '#000000',
        gravity: 0,
        screen: {
            x: 0,
            y: 0
        },
        _rscreen: {
            x: 0,
            y: 0
        },
        entities: [],
        namedEntities: {},
        collisionMap: ig.CollisionMap.staticNoCollision,
        backgroundMaps: [],
        backgroundAnims: {},
        autoSort: false,
        sortBy: null,
        cellSize: 64,
        _deferredKill: [],
        _levelToLoad: null,
        _doSortEntities: false,
        staticInstantiate: function () {
            this.sortBy = this.sortBy || ig.Game.SORT.Z_INDEX;
            ig.game = this;
            return null;
        },
        loadLevel: function (data) {
            this.screen = {
                x: 0,
                y: 0
            };
            this.entities = [];
            this.namedEntities = {};
            for (var i = 0; i < data.entities.length; i++) {
                var ent = data.entities[i];
                this.spawnEntity(ent.type, ent.x, ent.y, ent.settings);
            }
            this.sortEntities();
            this.collisionMap = ig.CollisionMap.staticNoCollision;
            this.backgroundMaps = [];
            for (var i = 0; i < data.layer.length; i++) {
                var ld = data.layer[i];
                if (ld.name == 'collision') {
                    this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data);
                } else {
                    var newMap = new ig.BackgroundMap(ld.tilesize, ld.data, ld.tilesetName);
                    newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
                    newMap.repeat = ld.repeat;
                    newMap.distance = ld.distance;
                    newMap.foreground = !! ld.foreground;
                    newMap.preRender = !! ld.preRender;
                    newMap.name = ld.name;
                    this.backgroundMaps.push(newMap);
                }
            }
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].ready();
            }
        },
        loadLevelDeferred: function (data) {
            this._levelToLoad = data;
        },
        getMapByName: function (name) {
            if (name == 'collision') {
                return this.collisionMap;
            }
            for (var i = 0; i < this.backgroundMaps.length; i++) {
                if (this.backgroundMaps[i].name == name) {
                    return this.backgroundMaps[i];
                }
            }
            return null;
        },
        getEntityByName: function (name) {
            return this.namedEntities[name];
        },
        getEntitiesByType: function (type) {
            var entityClass = typeof (type) === 'string' ? ig.global[type] : type;
            var a = [];
            for (var i = 0; i < this.entities.length; i++) {
                var ent = this.entities[i];
                if (ent instanceof entityClass && !ent._killed) {
                    a.push(ent);
                }
            }
            return a;
        },
        spawnEntity: function (type, x, y, settings) {
            var entityClass = typeof (type) === 'string' ? ig.global[type] : type;
            if (!entityClass) {
                throw ("Can't spawn entity of type " + type);
            }
            var ent = new(entityClass)(x, y, settings || {});
            this.entities.push(ent);
            if (ent.name) {
                this.namedEntities[ent.name] = ent;
            }
            return ent;
        },
        sortEntities: function () {
            this.entities.sort(this.sortBy);
        },
        sortEntitiesDeferred: function () {
            this._doSortEntities = true;
        },
        removeEntity: function (ent) {
            if (ent.name) {
                delete this.namedEntities[ent.name];
            }
            ent._killed = true;
            ent.type = ig.Entity.TYPE.NONE;
            ent.checkAgainst = ig.Entity.TYPE.NONE;
            ent.collides = ig.Entity.COLLIDES.NEVER;
            this._deferredKill.push(ent);
        },
        run: function () {
            this.update();
            this.draw();
        },
        update: function () {
            if (this._levelToLoad) {
                this.loadLevel(this._levelToLoad);
                this._levelToLoad = null;
            }
            if (this._doSortEntities || this.autoSort) {
                this.sortEntities();
                this._doSortEntities = false;
            }
            this.updateEntities();
            this.checkEntities();
            for (var i = 0; i < this._deferredKill.length; i++) {
                this.entities.erase(this._deferredKill[i]);
            }
            this._deferredKill = [];
            for (var tileset in this.backgroundAnims) {
                var anims = this.backgroundAnims[tileset];
                for (var a in anims) {
                    anims[a].update();
                }
            }
        },
        updateEntities: function () {
            for (var i = 0; i < this.entities.length; i++) {
                var ent = this.entities[i];
                if (!ent._killed) {
                    ent.update();
                }
            }
        },
        draw: function () {
            if (this.clearColor) {
                ig.system.clear(this.clearColor);
            }
            this._rscreen.x = ig.system.getDrawPos(this.screen.x) / ig.system.scale;
            this._rscreen.y = ig.system.getDrawPos(this.screen.y) / ig.system.scale;
            var mapIndex;
            for (mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++) {
                var map = this.backgroundMaps[mapIndex];
                if (map.foreground) {
                    break;
                }
                map.setScreenPos(this.screen.x, this.screen.y);
                map.draw();
            }
            this.drawEntities();
            for (mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++) {
                var map = this.backgroundMaps[mapIndex];
                map.setScreenPos(this.screen.x, this.screen.y);
                map.draw();
            }
        },
        drawEntities: function () {
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].draw();
            }
        },
        checkEntities: function () {
            var hash = {};
            for (var e = 0; e < this.entities.length; e++) {
                var entity = this.entities[e];
                if (entity.type == ig.Entity.TYPE.NONE && entity.checkAgainst == ig.Entity.TYPE.NONE && entity.collides == ig.Entity.COLLIDES.NEVER) {
                    continue;
                }
                var checked = {}, xmin = Math.floor(entity.pos.x / this.cellSize),
                    ymin = Math.floor(entity.pos.y / this.cellSize),
                    xmax = Math.floor((entity.pos.x + entity.size.x) / this.cellSize) + 1,
                    ymax = Math.floor((entity.pos.y + entity.size.y) / this.cellSize) + 1;
                for (var x = xmin; x < xmax; x++) {
                    for (var y = ymin; y < ymax; y++) {
                        if (!hash[x]) {
                            hash[x] = {};
                            hash[x][y] = [entity];
                        } else if (!hash[x][y]) {
                            hash[x][y] = [entity];
                        } else {
                            var cell = hash[x][y];
                            for (var c = 0; c < cell.length; c++) {
                                if (entity.touches(cell[c]) && !checked[cell[c].id]) {
                                    checked[cell[c].id] = true;
                                    ig.Entity.checkPair(entity, cell[c]);
                                }
                            }
                            cell.push(entity);
                        }
                    }
                }
            }
        }
    });
    ig.Game.SORT = {
        Z_INDEX: function (a, b) {
            return a.zIndex - b.zIndex;
        },
        POS_X: function (a, b) {
            return (a.pos.x + a.size.x) - (b.pos.x + b.size.x);
        },
        POS_Y: function (a, b) {
            return (a.pos.y + a.size.y) - (b.pos.y + b.size.y);
        }
    };
});

// lib/plugins/empika/debug_display.js
ig.baked = true;
ig.module('plugins.empika.debug_display').requires('impact.game').defines(function () {
    DebugDisplay = ig.Class.extend({
        pos: {
            x: 2,
            y: 2
        },
        framerateNow: (new Date()).getTime(),
        frames: [],
        average: [],
        frameCounter: 0,
        info: [],
        avg_fps: 0,
        init: function (font) {
            this.font = font;
        },
        draw: function (info, display_fps, display_average, average_time, interval_count) {
            var info = typeof (info) != 'undefined' ? info : [];
            var display_fps = typeof (display_fps) != 'undefined' ? display_fps : true;
            var display_average = typeof (display_average) != 'undefined' ? display_average : false;
            var average_time = typeof (average_time) != 'undefined' ? average_time : 10000;
            var interval_count = typeof (interval_count) != 'undefined' ? interval_count : 500;
            var offset = 0;
            var fps = 0;
            if (display_fps) {
                fps = this.calculateFrameRate();
                this.font.draw('FPS: ' + fps, this.pos.x, this.pos.y);
                offset = this.font.height;
            }
            if (display_fps && display_average) {
                var min = this.average.min() !== Infinity ? this.average.min() : 0;
                var max = this.average.max() !== Infinity ? this.average.max() : 0;
                if ((new Date()).getTime() % average_time < 100) {
                    this.avg_fps = this.calculateAverage(fps, interval_count);
                }
                this.font.draw('Avg FPS: ' + this.avg_fps + ' Min: ' + min + ' Max: ' + max, this.pos.x, offset + this.pos.y);
                offset = offset + offset;
            }
            for (var x = 0; x < info.length; x = x + 1) {
                this.font.draw(info[x], this.pos.x, offset + (this.font.height * x) + this.pos.y);
            }
        },
        calculateFrameRate: function () {
            var now = (new Date()).getTime();
            var delta = now - this.framerateNow;
            var avg = this.frames.sum();
            var av_length = this.frames.length;
            if (av_length > 11) {
                this.frames.shift();
            }
            this.frames.push(1000 / delta);
            this.framerateNow = now;
            return Math.floor(avg / av_length);
        },
        calculateAverage: function (current, interval_count) {
            var av_length = this.average.length;
            if (av_length > interval_count) {
                this.average.shift();
            }
            this.average.push(current);
            return Math.floor(this.average.sum() / av_length);
        }
    });
});
Array.prototype.sum = function () {
    for (var i = 0, sum = 0; i < this.length; sum += this[i++]);
    return sum;
}
Array.prototype.max = function () {
    return Math.max.apply({}, this)
}
Array.prototype.min = function () {
    return Math.min.apply({}, this)
}

// lib/plugins/houly/multitouch.js
ig.baked = true;
ig.module('plugins.houly.multitouch').requires('impact.game', 'impact.input').defines(function () {
    ig.Input.inject({
        touches: {},
        delayedTouchUp: [],
        initMouse: function () {
            if (this.isUsingMouse) {
                return;
            }
            this.isUsingMouse = true;
            if (typeof (ios) != 'undefined' && ios) {
                this._touchInput = new native.TouchInput();
                this._touchInput.touchStart(this.multitouchstart.bind(this));
                this._touchInput.touchEnd(this.multitouchend.bind(this));
                this._touchInput.touchMove(this.multitouchmove.bind(this));
            } else {
                var mouseWheelBound = this.mousewheel.bind(this);
                ig.system.canvas.addEventListener('mousewheel', mouseWheelBound, false);
                ig.system.canvas.addEventListener('DOMMouseScroll', mouseWheelBound, false);
                ig.system.canvas.addEventListener('contextmenu', this.contextmenu.bind(this), false);
                ig.system.canvas.addEventListener('mousedown', this.keydown.bind(this), false);
                ig.system.canvas.addEventListener('mouseup', this.keyup.bind(this), false);
                ig.system.canvas.addEventListener('mousemove', this.mousemove.bind(this), false);
                ig.system.canvas.addEventListener('touchstart', this.touchEvent.bind(this), false);
                ig.system.canvas.addEventListener('touchmove', this.touchEvent.bind(this), false);
                ig.system.canvas.addEventListener('touchend', this.touchEvent.bind(this), false);
            }
        },
        keydown: function (e) {
            this.parent(e);
            if (e.type == 'mousedown') {
                this.touches.mouse = {
                    x: this.mouse.x,
                    y: this.mouse.y,
                    id: 'mouse',
                    state: 'down'
                };
            }
        },
        keyup: function (e) {
            this.parent(e);
            if (e.type == 'mouseup') {
                this.touches.mouse = this.touches.mouse || {
                    id: 'mouse'
                };
                this.touches.mouse.state = 'up';
                this.touches.mouse.x = this.mouse.x;
                this.touches.mouse.y = this.mouse.y;
                this.delayedTouchUp.push('mouse');
            }
        },
        mousemove: function (e) {
            this.parent(e);
            if (this.state('click')) {
                this.touches.mouse.x = this.mouse.x;
                this.touches.mouse.y = this.mouse.y;
            }
        },
        clearPressed: function () {
            this.parent();
            for (var i = ig.input.delayedTouchUp.length; i--;) {
                delete ig.input.touches[ig.input.delayedTouchUp[i]];
            }
            ig.input.delayedTouchUp = [];
        },
        touchEvent: function (e) {
            e.stopPropagation();
            e.preventDefault();
            for (var i = e.changedTouches.length; i--;) {
                var t = e.changedTouches[i];
                this['multi' + e.type]((t.clientX - ig.system.canvas.offsetLeft) / ig.system.scale, (t.clientY - ig.system.canvas.offsetTop) / ig.system.scale, t.identifier);
            }
        },
        multitouchstart: function (x, y, id) {
            var action = this.bindings[ig.KEY.MOUSE1];
            if (action) {
                this.actions[action] = true;
                this.presses[action] = true;
            }
            this.touches[id] = {
                x: x,
                y: y,
                id: id,
                state: 'down'
            };
        },
        multitouchmove: function (x, y, id) {
            if (this.touches[id]) {
                this.touches[id].x = x;
                this.touches[id].y = y;
            }
        },
        multitouchend: function (x, y, id) {
            if (this.touches[id]) {
                this.touches[id].state = 'up';
                this.delayedTouchUp.push(id);
                var action = this.bindings[ig.KEY.MOUSE1];
                if (action && this._isEmpty(this.touches)) {
                    this.delayedKeyup[action] = true;
                }
            }
        },
        _isEmpty: function (obj) {
            for (var i in obj) return false;
            return true;
        }
    });
});

// lib/plugins/astar-for-entities.js
ig.baked = true;
ig.module('plugins.astar-for-entities').requires('impact.entity').defines(function () {
    ig.Entity.inject({
        path: null,
        headingDirection: 0,
        maxMovementActive: false,
        maxMovement: 200,
        directionChangeMalus45degree: 0,
        directionChangeMalus90degree: 0,
        ready: function () {
            this.directionChangeMalus45degree = ig.game.collisionMap.tilesize / 4;
            this.directionChangeMalus90degree = ig.game.collisionMap.tilesize * 5 / 8;
        },
        getPath: function (collisionMap, destinationX, destinationY, diagonalMovement, entityTypesArray, ignoreEntityArray) {
            if (typeof diagonalMovement === 'undefined') diagonalMovement = true;
            if (typeof entityTypesArray === 'undefined') entityTypesArray = [];
            if (typeof ignoreEntityArray === 'undefined') ignoreEntityArray = [];
            var mapWidth = ig.game.collisionMap.width,
                mapHeight = ig.game.collisionMap.height,
                mapTilesize = ig.game.collisionMap.tilesize,
                map = collisionMap,
                diagonalMovementCosts = Math.sqrt(2);
            this._addEraseEntities(true, entityTypesArray, ignoreEntityArray);
            var startNode = new asfeNode((this.pos.x / mapTilesize).floor(), (this.pos.y / mapTilesize).floor(), -1, 0),
                destinationNode = new asfeNode((destinationX / mapTilesize).floor(), (destinationY / mapTilesize).floor(), -1, 0);
            if (destinationNode.x === startNode.x && destinationNode.y === startNode.y) {
                this.path = null;
                this._addEraseEntities(false, entityTypesArray, ignoreEntityArray);
                return;
            }
            if (map[destinationNode.y][destinationNode.x] !== 0) {
                this.path = null;
                this._addEraseEntities(false, entityTypesArray, ignoreEntityArray);
                return;
            }
            var open = [],
                closed = [];
            var nodes = {};
            var bestCost, bestNode, currentNode, newX, newY, tempG, newNode, lastDirection, direction;
            open.push(startNode);
            nodes[startNode.x + ',' + startNode.y] = startNode;
            while (open.length > 0) {
                bestCost = open[0].f;
                bestNode = 0;
                for (var i = 1; i < open.length; i++) {
                    if (open[i].f < bestCost) {
                        bestCost = open[i].f;
                        bestNode = i;
                    }
                }
                currentNode = open[bestNode];
                if (currentNode.x === destinationNode.x && currentNode.y === destinationNode.y) {
                    this.path = [{
                        x: destinationNode.x * mapTilesize,
                        y: destinationNode.y * mapTilesize
                    }];
                    if (currentNode.x !== closed[currentNode.p].x && currentNode.y !== closed[currentNode.p].y) lastDirection = 0;
                    else if (currentNode.x !== closed[currentNode.p].x && currentNode.y === closed[currentNode.p].y) lastDirection = 1;
                    else if (currentNode.x === closed[currentNode.p].x && currentNode.y !== closed[currentNode.p].y) lastDirection = 2;
                    while (true) {
                        currentNode = closed[currentNode.p];
                        if (currentNode.p === -1) {
                            this._addEraseEntities(false, entityTypesArray, ignoreEntityArray);
                            if (this.maxMovement > 0 && this._getPathLength() > this.maxMovement && this.maxMovementActive) {
                                this._createNewLimitedPath();
                            }
                            return;
                        }
                        if (currentNode.x !== closed[currentNode.p].x && currentNode.y !== closed[currentNode.p].y) direction = 0;
                        else if (currentNode.x !== closed[currentNode.p].x && currentNode.y === closed[currentNode.p].y) direction = 1;
                        else if (currentNode.x === closed[currentNode.p].x && currentNode.y !== closed[currentNode.p].y) direction = 2;
                        this.path.unshift({
                            x: currentNode.x * mapTilesize,
                            y: currentNode.y * mapTilesize
                        });
                        lastDirection = direction;
                    }
                }
                open.splice(bestNode, 1);
                closed.push(currentNode);
                currentNode.closed = true;
                direction = 0;
                for (var dx = -1; dx <= 1; dx++) {
                    for (var dy = -1; dy <= 1; dy++) {
                        if (!diagonalMovement) {
                            if (Math.abs(dx) === Math.abs(dy)) {
                                continue;
                            }
                        }
                        if (dx === 0 && dy === 0) continue;
                        direction++;
                        newX = currentNode.x + dx;
                        newY = currentNode.y + dy;
                        if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) {
                            continue;
                        }
                        if (map[newY][newX] !== 0) continue;
                        if (currentNode.x === 0 || currentNode.x === mapWidth - 1 || currentNode.y === 0 || currentNode.y === mapHeight - 1) continue;
                        if (dy === -1 && !ig.game.ladder_lookup[currentNode.x][currentNode.y] && !ig.game.ladder_lookup[currentNode.x][currentNode.y - 1]) continue;
                        if (dy === -1 && !ig.game.ladder_lookup[currentNode.x][currentNode.y] && ig.game.ladder_lookup[currentNode.x][currentNode.y - 1]) continue;
                        if (dx === -1 && map[currentNode.y + 1][currentNode.x] === 0 && !ig.game.ladder_lookup[currentNode.x][currentNode.y + 1] && !ig.game.ladder_lookup[currentNode.x][currentNode.y]) continue;
                        if (dx === 1 && map[currentNode.y + 1][currentNode.x] === 0 && !ig.game.ladder_lookup[currentNode.x][currentNode.y + 1] && !ig.game.ladder_lookup[currentNode.x][currentNode.y]) continue;
                        if (dx === -1 && dy === -1 && (map[currentNode.y - 1][currentNode.x] !== 0 || map[currentNode.y][currentNode.x - 1] !== 0)) continue;
                        if (dx === 1 && dy === -1 && (map[currentNode.y - 1][currentNode.x] !== 0 || map[currentNode.y][currentNode.x + 1] !== 0)) continue;
                        if (dx === -1 && dy === 1 && (map[currentNode.y][currentNode.x - 1] !== 0 || map[currentNode.y + 1][currentNode.x] !== 0)) continue;
                        if (dx === 1 && dy === 1 && (map[currentNode.y][currentNode.x + 1] !== 0 || map[currentNode.y + 1][currentNode.x] !== 0)) continue;
                        if (nodes[newX + ',' + newY]) {
                            if (nodes[newX + ',' + newY].closed) {
                                continue;
                            }
                            tempG = currentNode.g + Math.sqrt(Math.pow(newX - currentNode.x, 2) + Math.pow(newY - currentNode.y, 2));
                            if (currentNode.d !== direction) {
                                if (currentNode.d === 1 && (direction === 2 || direction === 4)) tempG += this.directionChangeMalus45degree;
                                else if (currentNode.d === 2 && (direction === 1 || direction === 3)) tempG += this.directionChangeMalus45degree;
                                else if (currentNode.d === 3 && (direction === 2 || direction === 5)) tempG += this.directionChangeMalus45degree;
                                else if (currentNode.d === 4 && (direction === 1 || direction === 6)) tempG += this.directionChangeMalus45degree;
                                else if (currentNode.d === 5 && (direction === 3 || direction === 8)) tempG += this.directionChangeMalus45degree;
                                else if (currentNode.d === 6 && (direction === 4 || direction === 7)) tempG += this.directionChangeMalus45degree;
                                else if (currentNode.d === 7 && (direction === 6 || direction === 8)) tempG += this.directionChangeMalus45degree;
                                else if (currentNode.d === 8 && (direction === 5 || direction === 7)) tempG += this.directionChangeMalus45degree;
                                else tempG += this.directionChangeMalus90degree;
                            }
                            if (tempG < nodes[newX + ',' + newY].g) {
                                nodes[newX + ',' + newY].g = tempG;
                                nodes[newX + ',' + newY].f = tempG + nodes[newX + ',' + newY].h;
                                nodes[newX + ',' + newY].p = closed.length - 1;
                                nodes[newX + ',' + newY].d = direction;
                            }
                            continue;
                        }
                        newNode = new asfeNode(newX, newY, closed.length - 1, direction);
                        nodes[newNode.x + ',' + newNode.y] = newNode;
                        newNode.g = currentNode.g + Math.sqrt(Math.pow(newNode.x - currentNode.x, 2) + Math.pow(newNode.y - currentNode.y, 2));
                        if (currentNode.d !== newNode.d && currentNode.d !== 0) {
                            if (currentNode.d === 1 && (newNode.d === 2 || newNode.d === 4)) newNode.g += this.directionChangeMalus45degree;
                            else if (currentNode.d === 2 && (newNode.d === 1 || newNode.d === 3)) newNode.g += this.directionChangeMalus45degree;
                            else if (currentNode.d === 3 && (newNode.d === 2 || newNode.d === 5)) newNode.g += this.directionChangeMalus45degree;
                            else if (currentNode.d === 4 && (newNode.d === 1 || newNode.d === 6)) newNode.g += this.directionChangeMalus45degree;
                            else if (currentNode.d === 5 && (newNode.d === 3 || newNode.d === 8)) newNode.g += this.directionChangeMalus45degree;
                            else if (currentNode.d === 6 && (newNode.d === 4 || newNode.d === 7)) newNode.g += this.directionChangeMalus45degree;
                            else if (currentNode.d === 7 && (newNode.d === 6 || newNode.d === 8)) newNode.g += this.directionChangeMalus45degree;
                            else if (currentNode.d === 8 && (newNode.d === 5 || newNode.d === 7)) newNode.g += this.directionChangeMalus45degree;
                            else newNode.g += this.directionChangeMalus90degree;
                        }
                        if (diagonalMovement) {
                            var h_diagonal = Math.min(Math.abs(newNode.x - destinationNode.x), Math.abs(newNode.y - destinationNode.y));
                            var h_straight = Math.abs(newNode.x - destinationNode.x) + Math.abs(newNode.y - destinationNode.y);
                            newNode.h = (diagonalMovementCosts * h_diagonal) + (h_straight - (2 * h_diagonal));
                        } else {
                            newNode.h = Math.abs(newNode.x - destinationNode.x) + Math.abs(newNode.y - destinationNode.y);
                        }
                        newNode.f = newNode.g + newNode.h;
                        open.push(newNode);
                    }
                }
            }
            this.path = null;
            this._addEraseEntities(false, entityTypesArray, ignoreEntityArray);
            return;
        },
        _addEraseEntities: function (addErase, entityTypesArray, ignoreEntityArray) {
            var ignoreThisEntity;
            for (i = 0; i < entityTypesArray.length; i++) {
                var entities = ig.game.getEntitiesByType(entityTypesArray[i]);
                for (j = 0; j < entities.length; j++) {
                    ignoreThisEntity = false;
                    for (k = 0; k < ignoreEntityArray.length; k++) {
                        if (ignoreEntityArray[k].id === entities[j].id) {
                            ignoreThisEntity = true;
                        }
                    }
                    if (!ignoreThisEntity) {
                        var sizeX = (entities[j].size.x / ig.game.collisionMap.tilesize).floor();
                        var sizeY = (entities[j].size.y / ig.game.collisionMap.tilesize).floor();
                        for (k = 0; k < sizeX; k++) {
                            for (l = 0; l < sizeY; l++) {
                                var changeTileX = (entities[j].pos.x / ig.game.collisionMap.tilesize).floor() + k,
                                    changeTileY = (entities[j].pos.y / ig.game.collisionMap.tilesize).floor() + l;
                                if (changeTileX >= 0 && changeTileX < ig.game.collisionMap.width && changeTileY >= 0 && changeTileY < ig.game.collisionMap.height) {
                                    if (addErase && ig.game.collisionMap.data[changeTileY][changeTileX] === 0) {
                                        ig.game.collisionMap.data[changeTileY][changeTileX] = 9999;
                                    } else if (!addErase && ig.game.collisionMap.data[changeTileY][changeTileX] === 9999) {
                                        ig.game.collisionMap.data[changeTileY][changeTileX] = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        _getPathLength: function () {
            var distance = 0;
            if (this.path) {
                var prevWaypoint = this.pos;
                for (var i = 0; i < this.path.length; i++) {
                    if (this.path[i]) {
                        var currentWaypoint = this.path[i];
                        distance += this._distanceTo(prevWaypoint, currentWaypoint);
                        prevWaypoint = currentWaypoint;
                    }
                }
            }
            return distance;
        },
        _createNewLimitedPath: function () {
            var newPath = [];
            var distance = 0;
            if (this.path) {
                var prevWaypoint = this.pos;
                for (var i = 0; i < this.path.length; i++) {
                    if (this.path[i]) {
                        var currentWaypoint = this.path[i];
                        var newDistance = distance + this._distanceTo(prevWaypoint, currentWaypoint);
                        if (newDistance > this.maxMovement) {
                            var newWayPointLength = this.maxMovement - distance;
                            var newMaxMovementLastWaypoint = this._getPointSomeDistanceFromStart(prevWaypoint, currentWaypoint, newWayPointLength);
                            newPath.push(newMaxMovementLastWaypoint);
                            break;
                        } else {
                            distance += this._distanceTo(prevWaypoint, currentWaypoint);
                            newPath.push(currentWaypoint);
                        }
                        prevWaypoint = currentWaypoint;
                    }
                }
            }
            this.path = newPath;
            return;
        },
        _distanceTo: function (p1, p2) {
            var distSquared = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
            return distSquared;
        },
        _getPointSomeDistanceFromStart: function (startPos, endPos, distanceFromStart) {
            var totalDistance = this._distanceTo(startPos, endPos);
            var totalDelta = {
                x: endPos.x - startPos.x,
                y: endPos.y - startPos.y
            };
            var percent = distanceFromStart / totalDistance;
            var delta = {
                x: totalDelta.x * percent,
                y: totalDelta.y * percent
            };
            return {
                x: startPos.x + delta.x,
                y: startPos.y + delta.y
            };
        },
        followPath: function (speed, alignOnNearestTile) {
            if (typeof alignOnNearestTile === 'undefined') alignOnNearestTile = false;
            if (!this.path && alignOnNearestTile) {
                var cx = (this.pos.x / ig.game.collisionMap.tilesize).floor() * ig.game.collisionMap.tilesize,
                    cy = (this.pos.y / ig.game.collisionMap.tilesize).floor() * ig.game.collisionMap.tilesize;
                if (cx !== this.pos.x || cy !== this.pos.y) {
                    var dx = this.pos.x - cx,
                        dy = this.pos.y - cy;
                    var dxp = cx + ig.game.collisionMap.tilesize - this.pos.x,
                        dyp = cy + ig.game.collisionMap.tilesize - this.pos.y;
                    var tx;
                    if (dx < dxp) tx = cx;
                    else tx = cx + ig.game.collisionMap.tilesize;
                    var ty;
                    if (dy < dyp) ty = cy;
                    else ty = cy + ig.game.collisionMap.tilesize;
                    this.path = [{
                        x: tx,
                        y: ty
                    }];
                }
            }
            if (this.path) {
                if (((this.pos.x >= this.path[0].x && this.last.x < this.path[0].x) || (this.pos.x <= this.path[0].x && this.last.x > this.path[0].x) || this.pos.x === this.path[0].x) && ((this.pos.y >= this.path[0].y && this.last.y < this.path[0].y) || (this.pos.y <= this.path[0].y && this.last.y > this.path[0].y) || this.pos.y === this.path[0].y)) {
                    if (this.path.length === 1) {
                        this.vel.x = 0;
                        this.pos.x = this.path[0].x;
                        this.vel.y = 0;
                        this.pos.y = this.path[0].y;
                        this.path = null;
                        return;
                    }
                    this.path.splice(0, 1);
                }
                if (this.pos.x !== this.path[0].x && this.pos.y !== this.path[0].y) {
                    speed = Math.sqrt(Math.pow(speed, 2) / 2);
                }
                if ((this.pos.x >= this.path[0].x && this.last.x < this.path[0].x) || (this.pos.x <= this.path[0].x && this.last.x > this.path[0].x)) {
                    this.vel.x = 0;
                    this.pos.x = this.path[0].x;
                } else if (this.pos.x < this.path[0].x) {
                    this.vel.x = speed;
                } else if (this.pos.x > this.path[0].x) {
                    this.vel.x = -speed;
                }
                if ((this.pos.y >= this.path[0].y && this.last.y < this.path[0].y) || (this.pos.y <= this.path[0].y && this.last.y > this.path[0].y)) {
                    this.vel.y = 0;
                    this.pos.y = this.path[0].y;
                } else if (this.pos.y < this.path[0].y) {
                    this.vel.y = speed;
                } else if (this.pos.y > this.path[0].y) {
                    this.vel.y = -speed;
                }
                if (this.vel.x < 0 && this.vel.y < 0) this.headingDirection = 1;
                else if (this.vel.x < 0 && this.vel.y > 0) this.headingDirection = 3;
                else if (this.vel.x > 0 && this.vel.y < 0) this.headingDirection = 6;
                else if (this.vel.x > 0 && this.vel.y > 0) this.headingDirection = 8;
                else if (this.vel.x < 0) this.headingDirection = 2;
                else if (this.vel.x > 0) this.headingDirection = 7;
                else if (this.vel.y < 0) this.headingDirection = 4;
                else if (this.vel.y > 0) this.headingDirection = 5;
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
                this.headingDirection = 0;
            }
        },
        drawPath: function (r, g, b, a, lineWidth) {
            if (this.path) {
                var mapTilesize = ig.game.collisionMap.tilesize;
                ig.system.context.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
                ig.system.context.lineWidth = lineWidth * ig.system.scale;
                ig.system.context.beginPath();
                ig.system.context.moveTo(ig.system.getDrawPos(this.pos.x + this.size.x / 2 - ig.game.screen.x), ig.system.getDrawPos(this.pos.y + this.size.y / 2 - ig.game.screen.y));
                for (var i = 0; i < this.path.length; i++) {
                    ig.system.context.lineTo(ig.system.getDrawPos(this.path[i].x + mapTilesize / 2 - ig.game.screen.x), ig.system.getDrawPos(this.path[i].y + mapTilesize / 2 - ig.game.screen.y));
                }
                ig.system.context.stroke();
                ig.system.context.closePath();
            }
        },
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.last = {
                x: x,
                y: y
            };
        }
    });
    asfeNode = function (x, y, p, d) {
        this.x = x;
        this.y = y;
        this.p = p;
        this.d = d;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.closed = false;
    };
});

// lib/plugins/screen-fader.js
ig.baked = true;
ig.module('plugins.screen-fader').requires('impact.timer', 'impact.animation').defines(function () {
    ig.ScreenFader = ig.Class.extend({
        defaultOptions: {
            color: {
                r: 0,
                g: 0,
                b: 0,
                a: 1
            },
            fade: 'in',
            speed: 1,
            screenWidth: 0,
            screenHeight: 0,
            waitUntilLoaded: true,
            visible: true
        },
        init: function (options) {
            this._setOptions(options);
            var isFadingIn = this.options.fade != 'out';
            this._alpha = isFadingIn ? 0 : 1;
            this._alphaChange = isFadingIn ? 1 : -1;
            if (this.options.tileImagePath) {
                if (isNaN(this.options.tileWidth)) {
                    throw new Error("ScreenFader option for tileWidth is invalid");
                } else if (isNaN(this.options.tileHeight)) {
                    throw new Error("ScreenFader option for tileHeight is invalid");
                }
                this._sheet = new ig.AnimationSheet(this.options.tileImagePath, this.options.tileWidth, this.options.tileHeight);
                this._anim = new ig.Animation(this._sheet, 1.0, [0]);
                this._anim.alpha = this._alpha;
            }
            if (!isNaN(this.options.delayBefore)) {
                var delayTime = this.options.delayBefore <= 0 ? 0 : this.options.delayBefore;
                if (delayTime > 0) {
                    this.timerDelayBefore = new ig.Timer(delayTime);
                }
            }
        },
        draw: function () {
            if (this.timerDelayAfter && this.timerDelayAfter.delta() > 0) {
                delete this.timerDelayAfter;
                this._callUserCallback();
            }
            if (this.timerDelayBefore) {
                if (this.timerDelayBefore.delta() < 0) {
                    return;
                } else {
                    delete this.timerDelayBefore;
                }
            }
            if (!this.options.visible) {
                return;
            }
            if (!this.isFinished && (!this._sheet || (this._sheet.image.loaded || !this.options.waitUntilLoaded))) {
                this._fadeAlphaValue();
            }
            if (this._alpha <= 0) {
                return;
            }
            if (this._anim) {
                this.drawImageTiledOnScreen();
            } else {
                this.drawColorOnScreen();
            }
        },
        drawImageTiledOnScreen: function () {
            var tileX = 0,
                tileY = 0,
                totalWidth = this.options.screenWidth,
                totalHeight = this.options.screenHeight;
            var tileWidth = this.options.tileWidth,
                tileHeight = this.options.tileHeight;
            while (tileY < totalHeight) {
                tileX = 0;
                while (tileX < totalWidth) {
                    this._anim.draw(tileX, tileY);
                    tileX += tileWidth;
                }
                tileY += tileHeight;
            }
        },
        drawColorOnScreen: function () {
            ig.system.clear(this.getColorCssValue());
        },
        getColorCssValue: function (rgbaObject) {
            var color = rgbaObject || this.options.color;
            var a = ((typeof color.a != 'undefined') ? color.a : 1) * this._alpha;
            if (a < 0) {
                a = 0;
            } else if (a > 1) {
                a = 1;
            }
            return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + a + ')';
        },
        finish: function () {
            if (this.isFinished) {
                return;
            }
            if (this._alphaChange > 0) {
                this._alpha = 1;
            } else {
                this._alpha = 0;
            }
            if (this._anim) {
                this._anim.alpha = this._alpha;
            }
            this.isFinished = true;
            if (typeof this.options.callback == 'function') {
                var delayTime = isNaN(this.options.delayAfter) ? 0 : this.options.delayAfter;
                if (delayTime > 0) {
                    this.timerDelayAfter = new ig.Timer(delayTime);
                } else {
                    this._callUserCallback();
                }
            }
        },
        _callUserCallback: function () {
            this.options.callback.call(this.options.context || (ig.ScreenFader.globalGameIsContext ? ig.game : this));
        },
        _fadeAlphaValue: function () {
            this._alpha += (this._alphaChange * this.options.speed * ig.system.tick * ig.ScreenFader.globalSpeedFactor);
            if ((this._alphaChange > 0 && this._alpha >= 1) || (this._alphaChange < 0 && this._alpha <= 0)) {
                this.finish();
            }
            if (this._anim) {
                this._anim.alpha = this._alpha;
            }
        },
        _setOptions: function (userOptions) {
            this.options = ig.copy(this.defaultOptions);
            if (isNaN(this.options.screenWidth) || this.options.screenWidth <= 0) {
                this.options.screenWidth = ig.system.width;
            }
            if (isNaN(this.options.screenHeight) || this.options.screenHeight <= 0) {
                this.options.screenHeight = ig.system.height;
            }
            if (userOptions) {
                ig.merge(this.options, userOptions);
            }
        }
    });
    ig.ScreenFader.globalSpeedFactor = 2 / 3;
    ig.ScreenFader.globalGameIsContext = true;
});

// lib/plugins/joncom/entity.js
ig.baked = true;
ig.module('plugins.joncom.entity').requires('impact.entity').defines(function () {
    ig.Entity.inject({
        setVelocityByCoord: function (x, y, velocity) {
            var centerX = this.pos.x + this.size.x / 2;
            var centerY = this.pos.y + this.size.y / 2;
            var angleToTarget = Math.atan2(y - centerY, x - centerX);
            this.vel.x = Math.cos(angleToTarget) * velocity;
            this.vel.y = Math.sin(angleToTarget) * velocity;
        },
        setVelocityByAngle: function (angle, velocity) {
            var slope = Math.tan(angle);
            var x_factor = (Math.abs(angle) < 1.57 ? 1 : -1);
            var y_factor = (angle > 0 ? 1 : -1);
            var rise = (Math.abs(slope) / (1 + Math.abs(slope)));
            var run = (1 / (1 + Math.abs(slope)));
            this.vel.y = y_factor * velocity * rise;
            this.vel.x = x_factor * velocity * run;
        },
        isTouchingTile: function (x, y) {
            var tilesize = ig.game.collisionMap.tilesize;
            return (this.pos.x + this.size.x - 1 >= x * tilesize && this.pos.x < x * tilesize + tilesize && this.pos.y + this.size.y - 1 >= y * tilesize && this.pos.y < y * tilesize + tilesize);
        }
    });
});

// lib/game/entities/humanoid.js
ig.baked = true;
ig.module('game.entities.humanoid').requires('impact.entity').defines(function () {
    EntityHumanoid = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        _wmIgnore: true,
        fallSpeed: 30,
        speed: 60,
        defaultGravityFactor: 3,
        animSheet: new ig.AnimationSheet('media/player.png', 16, 16),
        input: null,
        climbing: false,
        over_ladder: false,
        ladder: null,
        over_bridge: false,
        bridge_that_entity_is_over: null,
        possible_land_on_entity: false,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.maxVel.x = this.speed;
            this.maxVel.y = Math.max(this.speed, this.fallSpeed);
            this.addAnim('idle', 0.1, [19]);
            this.addAnim('falling', 0.1, [12, 13, 14, 15, 16, 17]);
            this.addAnim('climbing', 0.1, [6, 7, 8, 9, 10, 11]);
            this.addAnim('running', 0.1, [0, 1, 2, 3, 4, 5]);

        },
        update: function () {

            if (this.input === null) this.stop();
            else this.handle_movement_input(this.input); if (this.over_ladder || this.over_bridge) this.gravityFactor = 0;
            else this.gravityFactor = this.defaultGravityFactor; if (this.climbing && this.input !== 'up' && this.input !== 'down')
                this.currentAnim.timer.pause();
            if (this.climbing && (this.input === 'up' || this.input === 'down'))
                this.currentAnim.timer.unpause();
            this.parent();
            this.after_movement_and_collision();
            this.input = null;
            if (!this.standing && this.anims.falling) this.currentAnim = this.anims.falling;
            else if (this.climbing && this.anims.climbing) this.currentAnim = this.anims.climbing;
            else if (this.vel.x !== 0 && this.anims.running) {
                this.currentAnim = this.anims.running;
                this.currentAnim.flip.x = (this.vel.x > 0 ? true : false);
            } else if (this.anims.idle) {
                this.currentAnim = this.anims.idle;
                this.currentAnim.flip.x = !this.is_facing_left();
            }
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (this.over_ladder || this.over_bridge) this.standing = true;
        },
        after_movement_and_collision: function () {
            if (this.climbing && this.input === 'down' && this.at_bottom_of_ladder()) {
                this.climbing = false;
            } else if (this.climbing && this.input === 'up' && this.at_top_of_ladder()) {
                this.pos.y = this.ladder.pos.y - this.size.y;
                this.vel.y = 0;
                this.climbing = false;
            }
            if (this.last.x !== this.pos.x || this.last.y !== this.pos.y) {
                this.check_for_ladder();
                this.check_for_bridge();
            }
            if (this.possible_land_on_entity && this.standing && this.over_ladder) this.pos.y = this.ladder.pos.y - this.size.y;
            else if (this.possible_land_on_entity && this.standing && this.over_bridge && this.bridge_that_entity_is_over.enemy) this.pos.y = this.bridge_that_entity_is_over.pos.y - this.size.y;
            this.flag_possible_land_on_entity();
        },
        flag_possible_land_on_entity: function () {
            this.possible_land_on_entity = !this.standing;
        },
        check_for_ladder: function () {
            this.ladder = null;
            this.over_ladder = false;
            this.size.y += 1;
            var ladders = ig.game.getEntitiesByType(EntityLadder);
            for (var i = 0; i < ladders.length; i++) {
                if (this.touches(ladders[i])) {
                    this.ladder = ladders[i];
                    this.over_ladder = true;
                    break;
                }
            }
            this.size.y -= 1;
        },
        check_for_bridge: function () {
            this.over_bridge = false;
            this.size.y += 1;
            var bridges = ig.game.getEntitiesByType(EntityBridge);
            for (var i = 0; i < bridges.length; i++) {
                if (this.touches(bridges[i]) && bridges[i].enemy && bridges[i].enemy !== this) {
                    this.over_bridge = true;
                    this.bridge_that_entity_is_over = bridges[i];
                    break;
                }
            }
            this.size.y -= 1;
        },
        at_top_of_ladder: function () {
            return this.pos.y + this.size.y - 2 <= this.ladder.pos.y;
        },
        at_bottom_of_ladder: function () {
            var velocity = {
                x: 0,
                y: 1
            };
            var result = ig.game.collisionMap.trace(this.pos.x, this.pos.y, velocity.x, velocity.y, this.size.x, this.size.y);
            var stopped_by_floor = result.collision.y;
            var out_of_ladder = this.pos.y >= this.ladder.pos.y + this.ladder.size.y;
            return stopped_by_floor || out_of_ladder;
        },
        mount_ladder: function () {
            this.pos.x = this.ladder.pos.x + this.ladder.size.x / 2 - this.size.x / 2;
            this.vel.x = 0;
            this.climbing = true;
        },
        jump_off_ladder: function (side) {
            this.stop();
            if (!this.can_move_in_direction(side)) return;
            this.pos.x += ig.game.collisionMap.tilesize * (side === 'left' ? -1 : 1);
            this.climbing = false;
            this.check_for_ladder();
        },
        set_velocity_by_direction: function (direction) {
            this.vel.x = 0;
            this.vel.y = 0;
            if (direction === 'left' || direction === 'right')
                this.vel.x = (direction === 'left' ? -1 : 1) * this.speed;
            if (direction === 'up' || direction === 'down')
                this.vel.y = (direction === 'up' ? -1 : 1) * this.speed;
        },
        handle_movement_input: function (direction) {
            
            if ((direction === 'left' || direction === 'right') && this.climbing) this.jump_off_ladder(direction);
            else if ((direction === 'left' || direction === 'right') && (this.standing || this.over_ladder)) this.set_velocity_by_direction(direction);
            else if ((direction === 'left' || direction === 'right') && !this.standing) this.stop();
            else if (this.climbing && ((direction === 'up' && this.at_top_of_ladder()) || (direction === 'down' && this.at_bottom_of_ladder()))) this.climbing = false;
            else if ((direction === 'up' || direction === 'down') && this.climbing) this.set_velocity_by_direction(direction);
            else if ((direction === 'up' || direction === 'down') && this.over_ladder) this.mount_ladder();
            else if ((direction === 'up' || direction === 'down') && this.standing) this.stop();
        },
        stop: function () {
            this.vel.x = 0;
            if (this.standing) this.vel.y = 0;
        },
        is_facing_left: function () {
            if (this.anims.running) return this.anims.running.flip.x === false;
            else return false;
        },
        can_move_in_direction: function (direction) {
            var velocity = {
                x: 0,
                y: 0
            };
            if (direction === 'left') velocity.x = -1 * (this.offset.x + 1);
            else if (direction === 'right') velocity.x = 1 * (this.offset.x + 1);
            else if (direction === 'up') velocity.y = -1;
            else if (direction === 'down') velocity.y = 1;
            var result = ig.game.collisionMap.trace(this.pos.x, this.pos.y, velocity.x, velocity.y, this.size.x, this.size.y);
            if (direction === 'left' || direction === 'right') return !result.collision.x;
            else return !result.collision.y;
        }
    });
});

// lib/game/entities/win-lose-overlay.js
ig.baked = true;
ig.module('game.entities.win-lose-overlay').requires('impact.entity').defines(function () {
    EntityWinLoseOverlay = ig.Entity.extend({
        _wmIgnore: true,
        won: false,
        gravityFactor: 0,
        zIndex: 8192,
        font: new ig.Font('media/04b03.font.png'),
        bigger_font: new ig.Font('media/font-perfect-dos-vga-white.png'),
        background: new ig.Image('media/bg-black-50-percect-alpha.png'),
        coin_pic: new ig.Image('media/8-bit-gratii-coin.png'),
        collected_points: 0,
        total_points: 0,
        y_offset: 30,
        cummilativeScore:0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.collected_points = ig.game.player.coins_collected * EntityCoin.prototype.worth;
            this.total_points = (this.won ? ig.game.completion_bonus : 0) * ig.game.win_streak + this.collected_points;
            if (ig.game.gratii_is_live && ig.baked) {
                var score = this.total_points;
                // simpleGameOver(score);
                // alert('game over');

            }
            if (this.won) {
                cummilativeCoinGrabs += 10;
                // alert('level complete');
                //this.cummilativeScore = parent.arcade.digga.cumulativeCoinGrabs;

                var thisGameID = parent.user.gameInProgress['gameID'];
                var thisGameEvent = "levelComplete";
                var scoreForThisEvent = 1;
                var gratiiEarnedInThisEvent = Math.floor(scoreForThisEvent*parent.user.gameInProgress['equations'].levelComplete);

                parent.user.arcadeEvents.push({"gameToken":gameToken, "score":scoreForThisEvent, "eventName":thisGameEvent, "gameID":thisGameID});
                parent.user.changeGratii(gratiiEarnedInThisEvent);

                var width = 80;
                var height = 20;
                x = ig.system.width / 2 - width / 2;
                y = ig.system.height / 2 + this.y_offset;
                var image = 'media/button.png';
                var trigger = 'pressedUp';
                var text = 'NEXT LEVEL';
                ig.game.level = (ig.game.level !== ig.game.level_count ? ig.game.level + 1 : 1);
                var action = ig.game['start_level'];
                var button = ig.game.spawnEntity(EntityButton, x, y, {
                    size: {
                        x: width,
                        y: height
                    },
                    zIndex: 16384,
                    text: text,
                    animSheet: new ig.AnimationSheet(image, width, height)
                });
                button[trigger] = action;
            } else {
               // this.cummilativeScore = parent.arcade.digga.cumulativeCoinGrabs;
                
                console.log( 'Digga is calling game over with token: ' + gameToken );
                //parent.arcade.spaceCrabs.gameOver(gameToken, score);
                if(parent.user.challengeIssueInProgress===true){
                    // Deliver challenge issue, return var to false
                }else if(parent.user.challengeResponseInProgress===true){
                    // Deliver challenge response, return var to false
                }else{
                    gameOverOccured = true;

                    //Offer Play Again option
                    var thisGameID = parent.user.gameInProgress['gameID'];
                    var thisGameEvent = "gameOver";
                    var scoreForThisEvent = 1;

                    parent.user.arcadeEvents.push({"gameToken":gameToken, "finalScore":score, "eventName":thisGameEvent, "gameID":thisGameID});
                    parent.user.postGameEvents();

                }
                //alert('try again');
                var width = 80;
                var height = 20;
                x = ig.system.width / 2 - width / 2;
                y = ig.system.height / 2 + this.y_offset;
                var image = 'media/button.png';
                var trigger = 'pressedUp';
                var text = 'TRY AGAIN';
                var action = ig.game['start_level'];
                var button = ig.game.spawnEntity(EntityButton, x, y, {
                    size: {
                        x: width,
                        y: height
                    },
                    zIndex: 16384,
                    text: text,
                    animSheet: new ig.AnimationSheet(image, width, height)
                });
                button[trigger] = action;
            }
        },
        update: function () {},
        draw: function () {
            if (this.background) this.background.draw(0, 0);
            var text = (this.won ? 'YOU WIN' : 'YOU ARE DEAD');
            var x = ig.system.width / 2;
            var y = ig.system.height / 2 - 73 + this.y_offset;
            this.bigger_font.draw(text, x, y, ig.Font.ALIGN.CENTER);
            //text = '+' + this.collected_points + ' COLLECTION';
            y = ig.system.height / 2 - 35 + this.y_offset;
            //this.font.draw(text, x, y, ig.Font.ALIGN.CENTER);
            //text = '+' + (this.won ? ig.game.completion_bonus : 0) + (ig.game.win_streak > 0 ? ' x' + ig.game.win_streak : '') + ' COMPLETION BONUS';
            y = ig.system.height / 2 - 25 + this.y_offset;
            //this.font.draw(text, x, y, ig.Font.ALIGN.CENTER);
            //text = this.total_points;
            x = ig.system.width / 2;
            y = ig.system.height / 2 - 60 + this.y_offset;
            //this.bigger_font.draw(text, x, y, ig.Font.ALIGN.RIGHT);
            //this.coin_pic.draw(x, y);

            //NEW - score
            text = "Score: " + cummilativeCoinGrabs;
            
            x = ig.system.width / 2;
            y = ig.system.height / 2 - 45 + this.y_offset;
            this.bigger_font.draw(text, x, y, ig.Font.ALIGN.CENTER);
        }
    });
});

// lib/game/entities/cursor.js
ig.baked = true;
ig.module('game.entities.cursor').requires('impact.entity').defines(function () {
    EntityCursor = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        _wmIgnore: true,
        zIndex: 4096,
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/cursor.png', 16, 16),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
        },
        update: function () {
            var tile = this.get_new_tile();
            if (ig.game.collisionMap.data[tile.y][tile.x] !== 0 && !ig.game.player.climbing) {
                this.currentAnim = this.anims.idle;
                var tilesize = ig.game.collisionMap.tilesize;
                this.pos.x = tile.x * tilesize;
                this.pos.y = tile.y * tilesize;
            } else {
                this.currentAnim = null;
            }
        },
        get_new_tile: function () {
            var tilesize = ig.game.backgroundMaps[0].tilesize;
            var playerTileX = Math.floor((ig.game.player.pos.x + ig.game.player.size.x / 2) / tilesize);
            var playerTileY = Math.floor(ig.game.player.pos.y / tilesize);
            var cursorTileX = playerTileX + 1 * (ig.game.player.is_facing_left() ? -1 : 1);
            var cursorTileY = playerTileY + 1;
            return {
                x: cursorTileX,
                y: cursorTileY
            };
        }
    });
});

// lib/game/entities/player.js
ig.baked = true;
ig.module('game.entities.player').requires('game.entities.humanoid', 'game.entities.win-lose-overlay', 'game.entities.cursor').defines(function () {
    EntityPlayer = EntityHumanoid.extend({
        size: {
            x: 10,
            y: 8
        },
        offset: {
            x: 3,
            y: 8
        },
        speed: 40,
        god: false,
        zIndex: 1024,
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.B,
        coins_collected: 0,
        animSheet: new ig.AnimationSheet('media/player.png', 16, 16),
        level_over: false,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.cursor = ig.game.spawnEntity(EntityCursor);
        },
        update: function () {
            if (ig.input.state('right')) this.input = 'right';
            else if (ig.input.state('left')) this.input = 'left';
            else if (ig.input.state('up')) this.input = 'up';
            else if (ig.input.state('down')) this.input = 'down';
            if (ig.input.pressed('dig')) this.dig();
            this.parent();
            if (!this.standing) {
                var offset = (ig.game.collisionMap.tilesize - this.size.x) / 2;
                this.pos.x = (Math.floor((this.pos.x + this.size.x / 2) / ig.game.collisionMap.tilesize) * ig.game.collisionMap.tilesize) + offset;
            }
        },
        get_tile: function () {
            var tilesize = ig.game.collisionMap.tilesize;
            var x = Math.floor((this.pos.x + this.size.x / 2) / tilesize);
            var y = Math.floor((this.pos.y) / tilesize);
            return {
                x: x,
                y: y
            };
        },
        check: function (other) {
            if (other.nature === 'enemy' && !this.god && !other.is_docile && !this.level_over) {
                this.lose();
            } else if (other.nature === 'coin') {
                cummilativeCoinGrabs++;

                var thisGameID = parent.user.gameInProgress['gameID'];
                var thisGameEvent = "coinGrab";
                var scoreForThisEvent = 1;
                var gratiiEarnedInThisEvent = Math.floor(scoreForThisEvent*parent.user.gameInProgress['equations'].coinGrab);

                parent.user.arcadeEvents.push({"gameToken":gameToken, "score":scoreForThisEvent, "eventName":thisGameEvent, "gameID":thisGameID});
                parent.user.changeGratii(gratiiEarnedInThisEvent);

                this.coins_collected++;
                if (this.coins_collected >= ig.game.coins_per_level) {
                    ig.game.exit.activate();
                }
                other.kill();
            } else if (other.nature === 'exit' && other.active && !this.level_over) {
                this.win();
            }
        },
        kill: function () {
            this.parent();
            this.lose();
        },
        win: function () {
            ig.game.clearEnemyRespawnQueue();
            if (ig.game.win_streak < 4) {
                ig.game.win_streak++
            };
            this.level_over = true;
            ig.game.freeze_entities();
            ig.game.terrain.paused = true;
            this.cursor.kill();
            ig.game.objective.kill();
            ig.game.bar.kill();
            if (ig.game.mobile_interface) ig.game.mobile_interface.kill();
            ig.game.spawnEntity(EntityWinLoseOverlay, 0, 0, {
                won: true
            });
        },
        lose: function () {
            ig.game.clearEnemyRespawnQueue();
            ig.game.win_streak = 0;
            this.level_over = true;
            ig.game.freeze_entities();
            ig.game.terrain.paused = true;
            this.cursor.kill();
            ig.game.objective.kill();
            ig.game.bar.kill();
            if (ig.game.mobile_interface) ig.game.mobile_interface.kill();
            ig.game.spawnEntity(EntityWinLoseOverlay, 0, 0, {
                won: false
            });
        },
        dig: function () {
            if (this.climbing) return;
            var tilesize = ig.game.backgroundMaps[0].tilesize;
            var tileX = Math.floor((this.pos.x + this.size.x / 2) / tilesize);
            var tileY = Math.floor(this.pos.y / tilesize);
            var x = tileX + 1 * (this.is_facing_left() ? -1 : 1);
            var y = tileY + 1;
            var enemies = ig.game.getEntitiesByType(EntityEnemy);
            var enemy, is_touching_tile;
            for (var i = 0; i < enemies.length; i++) {
                enemy = enemies[i];
                enemy.size.y += 1;
                is_touching_tile = enemy.isTouchingTile(x, y);
                enemy.size.y -= 1;
                if (is_touching_tile) return;
            }
            ig.game.terrain.clear_tile(x, y);
        }
    });
});

// lib/game/entities/enemy.js
ig.baked = true;
ig.module('game.entities.enemy').requires('game.entities.humanoid').defines(function () {
    EntityEnemy = EntityHumanoid.extend({
        realSize: {
            x: 10,
            y: 15
        },
        size: {
            x: 16,
            y: 16
        },
        offset: {
            x: 3,
            y: 1
        },
        speed: 20,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.B,
        zIndex: 512,
        nature: 'enemy',
        respawn_delay: 2,
        bridge: null,
        bridge_timer: null,
        bridge_duration: 4,
        sleep_timer: null,
        sleep_duration: 2,
        sleeping: true,
        is_docile: false,
        pathTimer: null,
        animSheet: new ig.AnimationSheet('media/enemy.png', 16, 16),
        spawn_point: null,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 0.1, [0]);
            this.spawn_point = this.pos;
            this.pathTimer = new ig.Timer(0.5);
            this.bridge_timer = new ig.Timer(this.bridge_duration);
            this.sleep_timer = new ig.Timer(this.sleep_duration);
            this.become_real_sized();
        },
        update: function () {
            this.become_tile_sized();
            if (this.sleeping && this.sleep_timer.delta() >= 0) {
                this.sleeping = false;
                this.is_docile = false;
            }
            if (!this.standing) {
                this.path = null;
                this.pos.x = Math.floor((this.pos.x + this.size.x / 2) / ig.game.collisionMap.tilesize) * ig.game.collisionMap.tilesize;
            } else {
                if (!this.path && this.pathTimer.delta() >= 0) {
                    this.calculate_path();
                    this.pathTimer.reset();
                }
                this.followPath();
            }
            this.become_real_sized();
            this.parent();
        },
        after_movement_and_collision: function () {
            this.parent();
            if (this.bridge && this.bridge_timer.delta() >= 0) {
                if (ig.game.player.pos.x >= this.pos.x && this.can_climb_out_of_hole('right')) this.climb_out_of_hole('right');
                else if (ig.game.player.pos.x < this.pos.x && this.can_climb_out_of_hole('left')) this.climb_out_of_hole('left');
                else if (this.can_climb_out_of_hole('right')) this.climb_out_of_hole('right');
                else if (this.can_climb_out_of_hole('left')) this.climb_out_of_hole('left');
            } else if (this.bridge && this.pos.y >= this.bridge.pos.y) {
                this.is_docile = true;
                this.standing = false;
                this.pos.y = this.bridge.pos.y;
                this.pos.x = this.bridge.pos.x + this.bridge.size.x / 2 - this.size.x / 2;
            }
        },
        kill: function () {
            var self = this;
            ig.game.enemyRespawnQueue.push(setTimeout(function () {
                ig.game.spawnEntity(EntityEnemy, self.spawn_point.x, self.spawn_point.y);
            }, this.respawn_delay * 1000));
            this.parent();
        },
        check: function (other) {
            if (other.nature === 'bridge' && !this.bridge) {
                var tilesize = ig.game.collisionMap.tilesize;
                var x = other.pos.x / tilesize;
                var y = other.pos.y / tilesize;
                if (ig.game.collisionMap.data[y + 1][x] !== 0 || ig.game.ladder_lookup[x][y + 1]) {
                    this.bridge = other;
                    other.enemy = this;
                    this.bridge_timer.reset();
                }
            }
        },
        draw: function () {
            this.parent();
        },
        can_climb_out_of_hole: function (side) {
            var tileX = Math.floor(this.pos.x / ig.game.collisionMap.tilesize);
            var tileY = Math.floor(this.pos.y / ig.game.collisionMap.tilesize);
            if (ig.game.collisionMap.data[tileY - 1][tileX + (side === 'left' ? -1 : 1)] === 0) return true;
            else return false;
        },
        climb_out_of_hole: function (side) {
            this.pos.x = this.pos.x + (side === 'left' ? -1 : 1) * ig.game.collisionMap.tilesize;
            this.pos.y = this.bridge.pos.y - this.size.y;
            this.bridge.enemy = null;
            this.bridge = null;
            this.check_for_ladder();
            this.check_for_bridge();
            this.sleeping = true;
            this.sleep_timer.set(this.sleep_duration);
        },
        flag_possible_land_on_entity: function () {
            if (this.bridge) this.possible_land_on_entity = false;
            else this.parent();
        },
        consider_sleeping_if_too_close_to_others: function () {
            if (!this.sleeping) {
                var enemies = ig.game.getEntitiesByType(EntityEnemy);
                for (var i = 0; i < enemies.length; i++) {
                    if (this.id !== enemies[i].id) {
                        if (this.is_stacked_too_close_with(enemies[i])) {
                            if (!enemies[i].sleeping) {
                                if (this.distanceTo(ig.game.player) > enemies[i].distanceTo(ig.game.player)) {
                                    this.sleep_timer.set(0.5);
                                    this.sleeping = true;
                                }
                            }
                        }
                    }
                }
            }
        },
        is_stacked_too_close_with: function (other) {
            var verical_range = 16;
            var horizontal_range = 16;
            var y = verical_range / 2;
            var x = horizontal_range / 2;
            if (this.touches(other) && (this.climbing && other.climbing) && (this.pos.y + this.size.y / 2 >= other.pos.y + other.size.y / 2 - y && this.pos.y + this.size.y / 2 < other.pos.y + other.size.y / 2 + y)) return true;
            else if (this.touches(other) && (!this.climbing && !other.climbing && this.standing && other.standing) && (this.pos.x + this.size.x / 2 >= other.pos.x + other.size.x / 2 - x && this.pos.x + this.size.x / 2 < other.pos.x + other.size.x / 2 + x)) return true;
            return false;
        },
        become_tile_sized: function () {
            var tilesize = ig.game.collisionMap.tilesize;
            var offset = {
                x: (tilesize - this.realSize.x) / 2,
                y: (tilesize - this.realSize.y)
            };
            this.pos.x -= offset.x;
            this.pos.y -= offset.y;
            this.last.x -= offset.x;
            this.last.y -= offset.x;
            this.size.x = this.size.y = tilesize;
        },
        become_real_sized: function () {
            var tilesize = ig.game.collisionMap.tilesize;
            var offset = {
                x: (tilesize - this.realSize.x) / 2,
                y: (tilesize - this.realSize.y)
            };
            this.pos.x += offset.x;
            this.pos.y += offset.y;
            this.last.x += offset.x;
            this.last.y += offset.x;
            this.size.x = this.realSize.x;
            this.size.y = this.realSize.y;
        },
        calculate_path: function () {
            if (!ig.game.player.standing) {
                var player_tile_x = Math.floor(ig.game.player.pos.x / ig.game.collisionMap.tilesize);
                var player_tile_y = Math.floor(ig.game.player.pos.y / ig.game.collisionMap.tilesize);
                var nearest_solid_tile_below_player;
                for (var y = player_tile_y; y < ig.game.collisionMap.height; y++) {
                    if (ig.game.collisionMap.data[y][player_tile_x] !== 0) {
                        nearest_solid_tile_below_player = {
                            x: player_tile_x,
                            y: y
                        };
                        break;
                    }
                }
                var ladders = ig.game.getEntitiesByType(EntityLadder);
                var viable_ladder, ladder_tile_x;
                for (var i = 0; i < ladders.length; i++) {
                    ladder_tile_x = Math.floor(ladders[i].pos.x / ig.game.collisionMap.tilesize);
                    if (ladder_tile_x === player_tile_x) {
                        if (ladders[i].pos.y > ig.game.player.pos.y + ig.game.player.size.y) {
                            if (ladders[i].pos.y < nearest_solid_tile_below_player.y * ig.game.collisionMap.tilesize) {
                                if (!this.viable_ladder) viable_ladder = ladders[i];
                                else if (this.viable_ladder && ladders[i].pos.y < viable_ladder.pos.y) {
                                    viable_ladder = ladders[i];
                                }
                            }
                        }
                    }
                }
                var y_position;
                if (viable_ladder) y_position = viable_ladder.pos.y - ig.game.collisionMap.tilesize;
                else y_position = (nearest_solid_tile_below_player.y - 1) * ig.game.collisionMap.tilesize;
                this.getPath(ig.game.collisionMap.data, ig.game.player.pos.x + ig.game.player.size.x / 2, y_position, false);
            } else if (ig.game.player.standing) {
                this.getPath(ig.game.collision_map_copy, ig.game.player.pos.x + ig.game.player.size.x / 2, ig.game.player.pos.y, false);
                if (!this.path) this.getPath(ig.game.collisionMap.data, ig.game.player.pos.x + ig.game.player.size.x / 2, ig.game.player.pos.y, false);
            }
        },
        followPath: function () {
            if (this.path && !this.sleeping) {
                if (((this.pos.x >= this.path[0].x && this.last.x < this.path[0].x) || (this.pos.x <= this.path[0].x && this.last.x > this.path[0].x) || this.pos.x == this.path[0].x) && ((this.pos.y >= this.path[0].y && this.last.y < this.path[0].y) || (this.pos.y <= this.path[0].y && this.last.y > this.path[0].y) || this.pos.y == this.path[0].y)) {
                    this.consider_sleeping_if_too_close_to_others();
                    this.pos.x = this.path[0].x;
                    this.pos.y = this.path[0].y;
                    this.calculate_path();
                    this.followPath();
                    return;
                }
                if (this.pos.x < this.path[0].x) this.input = 'right';
                else if (this.pos.x > this.path[0].x) this.input = 'left';
                else if (this.pos.y < this.path[0].y) this.input = 'down';
                else if (this.pos.y > this.path[0].y) this.input = 'up';
            }
        }
    });
});

// lib/plugins/houly/button.js
ig.baked = true;
ig.module('plugins.houly.button').requires('impact.entity', 'plugins.houly.multitouch').defines(function () {
    Button = ig.Entity.extend({
        size: {
            x: 64,
            y: 16
        },
        absolutePos: 'yes',
        text: [],
        textPos: {
            x: 0,
            y: 0
        },
        textAlign: ig.Font.ALIGN.LEFT,
        font: null,
        animSheet: new ig.AnimationSheet('media/button.png', 64, 16),
        state: 'idle',
        _ids: [],
        _oldIds: [],
        init: function (x, y, s) {
            this.parent(x, y, s);
            if (this.animSheet) {
                this.addAnim('idle', 1, [0]);
                this.addAnim('active', 1, [1]);
                this.addAnim('deactive', 1, [2]);
            }
            if (this.text.length > 0 && this.font === null) {
                this.font = ig.game.font || new ig.Font('media/font.png');
            }
        },
        update: function () {
            if (this.state !== 'hidden') {
                if (this.state !== 'deactive' && ig.input.state('click')) {
                    this._ids = this._inButton();
                    if (this._ids) {
                        var inBefore = this._compareWithOldIds();
                        if (!inBefore) {
                            this.setState('active');
                            this.pressedDown();
                            var num_ups = 0;
                            for (var t in ig.input.touches) {
                                if (ig.input.touches[t].state == 'up') num_ups++;
                            }
                            if (num_ups == this._ids.length) {
                                this.setState('idle');
                                this.pressedUp();
                                this._ids = [];
                            }
                        } else if (this._ids.length == 1 && ig.input.touches[this._ids[0]].state == 'up') {
                            this.setState('idle');
                            this.pressedUp();
                            this._ids = [];
                        } else {
                            this.setState('active');
                            this.pressed();
                        }
                    } else if (this.state == 'active') {
                        this.setState('idle');
                    }
                }
                this._oldIds = this._ids;
            }
        },
        draw: function () {
            if (this.state !== 'hidden') {
                if (this.currentAnim && this.absolutePos === 'yes') {
                    this.currentAnim.draw(this.pos.x, this.pos.y);
                } else if (this.currentAnim && this.absolutePos === 'no') {
                    this.currentAnim.draw(this.pos.x - this.offset.x - ig.game._rscreen.x, this.pos.y - this.offset.y - ig.game._rscreen.y);
                }
                for (var i = 0; i < this.text.length; i++) {
                    this.font.draw(this.text[i], this.pos.x + this.textPos.x + (this.absolutePos === 'no' ? (-this.offset.x - ig.game._rscreen.x) : 0), this.pos.y + ((this.font.height + 2) * i) + this.textPos.y + (this.absolutePos === 'no' ? (-this.offset.y - ig.game._rscreen.y) : 0), this.textAlign);
                }
            }
        },
        setState: function (s) {
            this.state = s;
            if (this.state !== 'hidden') {
                this.currentAnim = this.anims[this.state];
            }
        },
        pressedDown: function () {},
        pressed: function () {},
        pressedUp: function () {},
        _inButton: function () {
            var ids = [];
            for (var n in ig.input.touches) {
                var t = ig.input.touches[n];
                if (t.x > this.pos.x + (this.absolutePos === 'no' ? (-this.offset.x - ig.game._rscreen.x) : 0) && t.x < this.pos.x + this.size.x + (this.absolutePos === 'no' ? (-this.offset.x - ig.game._rscreen.x) : 0) && t.y > this.pos.y + (this.absolutePos === 'no' ? (-this.offset.y - ig.game._rscreen.y) : 0) && t.y < this.pos.y + this.size.y + (this.absolutePos === 'no' ? (-this.offset.y - ig.game._rscreen.y) : 0)) {
                    ids.push(n);
                }
            }
            return (ids.length > 0) ? ids : false;
        },
        _compareWithOldIds: function () {
            for (var i = this._ids.length; i--;) {
                for (var j = this._oldIds.length; j--;) {
                    if (this._ids[i] == this._oldIds[j]) return true;
                }
            }
            return false;
        }
    });
});

// lib/game/entities/mobile-interface.js
ig.baked = true;
ig.module('game.entities.mobile-interface').requires('impact.entity', 'plugins.houly.button').defines(function () {
    EntityMobileInterface = ig.Entity.extend({
        zIndex: 8192,
        buttons: [],
        images: [new ig.Image('media/button-up.png'), new ig.Image('media/button-right.png'), new ig.Image('media/button-left.png'), new ig.Image('media/button-down.png'), new ig.Image('media/button-dig.png')],
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            var button_size = 29;
            var actions = {};
            actions.left = {
                x: 4,
                y: ig.system.height - button_size - 4,
                trigger: 'pressed',
                action: function () {
                    ig.game.player.input = 'left';
                }
            };
            actions.right = {
                x: button_size + 4 * 2,
                y: ig.system.height - button_size - 4,
                trigger: 'pressed',
                action: function () {
                    ig.game.player.input = 'right';
                }
            };
            actions.dig = {
                x: ig.system.width - button_size * 2 - 4 * 2,
                y: ig.system.height - button_size - 4,
                trigger: 'pressedDown',
                action: function () {
                    ig.game.player.dig();
                }
            };
            actions.down = {
                x: ig.system.width - button_size - 4,
                y: ig.system.height - button_size - 4,
                trigger: 'pressed',
                action: function () {
                    ig.game.player.input = 'down';
                }
            };
            actions.up = {
                x: ig.system.width - button_size - 4,
                y: ig.system.height - button_size * 2 - 4 * 2,
                trigger: 'pressed',
                action: function () {
                    ig.game.player.input = 'up';
                }
            };
            for (var name in actions) {
                this.buttons.push(this.create_button(name, actions[name].x, actions[name].y, button_size, button_size, actions[name].trigger, actions[name].action));
            }
        },
        kill: function () {
            for (var i = 0; i < this.buttons.length; i++) this.buttons[i].kill();
            this.parent();
        },
        create_button: function (name, x, y, width, height, trigger, action) {
            var button = ig.game.spawnEntity(Button, x, y, {
                size: {
                    x: width,
                    y: height
                },
                zIndex: this.zIndex,
                animSheet: new ig.AnimationSheet('media/button-' + name + '.png', width, height)
            });
            button[trigger] = action;
            return button;
        }
    });
});

// lib/game/entities/coin.js
ig.baked = true;
ig.module('game.entities.coin').requires('impact.entity').defines(function () {
    EntityCoin = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        _wmIgnore: true,
        type: ig.Entity.TYPE.B,
        zIndex: 256,
        nature: 'coin',
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/palette.png', 16, 16),
        worth: 2,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [4]);
        },
        update: function () {}
    });
});

// lib/game/entities/exit.js
ig.baked = true;
ig.module('game.entities.exit').requires('impact.entity').defines(function () {
    EntityExit = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        offset: {
            x: 0,
            y: 7
        },
        _wmIgnore: true,
        type: ig.Entity.TYPE.B,
        nature: 'exit',
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/exit.png', 15, 23),
        active: false,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
        },
        update: function () {},
        draw: function () {
            if (this.active) this.parent();
        },
        activate: function () {
            this.active = true;
        }
    });
});

// lib/game/entities/camera.js
ig.baked = true;
ig.module('game.entities.camera').requires('impact.entity').defines(function () {
    EntityCamera = ig.Entity.extend({
        _wmIgnore: true,
        min_x: 0,
        max_x: 0,
        min_y: 0,
        max_y: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            if (ig.game.backgroundMaps[0]) {
                var tilesize = ig.game.collisionMap.tilesize;
                this.min_x = 0;
                this.max_x = (ig.game.backgroundMaps[0].width * tilesize) - ig.system.width;
                this.min_y = 0;
                this.max_y = (ig.game.backgroundMaps[0].height * tilesize) - ig.system.height;
                if (ig.ua.mobile) this.max_y += 36;
                this.min_y -= 28;
                this.min_x += tilesize;
                this.max_x -= tilesize;
                this.min_y += tilesize;
                this.max_y -= tilesize;
            }
        },
        update: function () {
            if (ig.game.player) {
                ig.game.screen.x = ig.game.player.pos.x - ig.system.width / 2 + ig.game.player.size.x / 2;
                if (ig.game.screen.x < this.min_x) ig.game.screen.x = this.min_x;
                else if (ig.game.screen.x > this.max_x) ig.game.screen.x = this.max_x;
                ig.game.screen.y = ig.game.player.pos.y - ig.system.height / 2;
                if (ig.game.screen.y < this.min_y) ig.game.screen.y = this.min_y;
                else if (ig.game.screen.y > this.max_y) ig.game.screen.y = this.max_y;
            } else if (ig.game.backgroundMaps[0]) {
                ig.game.screen.x = 0;
                ig.game.screen.y = -ig.system.height / 2 + ig.game.backgroundMaps[0].height * ig.game.backgroundMaps[0].tilesize / 2;
            }
        }
    });
});

// lib/game/entities/objective.js
ig.baked = true;
ig.module('game.entities.objective').requires('impact.entity').defines(function () {
    EntityObjective = ig.Entity.extend({
        _wmIgnore: true,
        gravityFactor: 0,
        zIndex: 16384,
        font: new ig.Font('media/04b03.font.png'),
        fontRed: new ig.Font('media/04b03.font.red.png'),
        flashTimer: new ig.Timer(1),
        font_is_toggled: false,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.pos.x = ig.system.width / 2;
            this.pos.y = 16;
        },
        update: function () {
            if (this.flashTimer.delta() >= 0) {
                this.font_is_toggled = !this.font_is_toggled;
                this.flashTimer.reset();
            }
        },
        draw: function () {
            if (ig.game.in_game) {
                var text, font;
                if (!ig.game.exit.active) {
                    text = 'GET COINS';
                    font = this.font;
                } else {
                    text = 'FIND EXIT';
                    font = (!this.font_is_toggled ? this.font : this.fontRed);
                }
                font.draw(text, this.pos.x, this.pos.y, ig.Font.ALIGN.CENTER);
            }
        }
    });
});

// lib/game/entities/black-bar.js
ig.baked = true;
ig.module('game.entities.black-bar').requires('impact.entity').defines(function () {
    EntityBlackBar = ig.Entity.extend({
        size: {
            x: 1,
            y: 28
        },
        _wmIgnore: true,
        zIndex: 8192,
        background: new ig.Image('media/bg-black-50-percect-alpha.png'),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.size.x = ig.system.width;
        },
        update: function () {},
        draw: function () {
            if (this.background) this.background.draw(0, 0, 0, 0, ig.system.width, this.size.y);
        }
    });
});

// lib/game/entities/bridge.js
ig.baked = true;
ig.module('game.entities.bridge').requires('impact.entity').defines(function () {
    EntityBridge = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        _wmIgnore: true,
        type: ig.Entity.TYPE.B,
        nature: 'bridge',
        gravityFactor: 0,
        enemy: null,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
        },
        update: function () {}
    });
});

// lib/game/entities/terrain-chunk.js
ig.baked = true;
ig.module('game.entities.terrain-chunk').requires('impact.entity').defines(function () {
    EntityTerrainChunk = ig.Entity.extend({
        size: {
            x: 8,
            y: 8
        },
        _wmIgnore: true,
        zIndex: 2048,
        gravityFactor: 5,
        speed: 300,
        tile: 1,
        chunk: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.tilesheet = new ig.Image(ig.game.backgroundMaps[0].tilesetName);
            this.maxVel.x = this.maxVel.y = this.speed;
            var angle;
            if (this.chunk === 0) angle = -110 * Math.PI / 180;
            else if (this.chunk === 1) angle = -70 * Math.PI / 180;
            else if (this.chunk === 2) angle = -150 * Math.PI / 180;
            else if (this.chunk === 3) angle = -30 * Math.PI / 180;
            this.setVelocityByAngle(angle, this.speed);
        },
        update: function () {
            this.last.x = this.pos.x;
            this.last.y = this.pos.y;
            this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
            this.vel.x = this.getNewVelocity(this.vel.x, this.accel.x, this.friction.x, this.maxVel.x);
            this.vel.y = this.getNewVelocity(this.vel.y, this.accel.y, this.friction.y, this.maxVel.y);
            var mx = this.vel.x * ig.system.tick;
            var my = this.vel.y * ig.system.tick;
            var res = {
                collision: {
                    x: false,
                    y: false,
                    slope: false
                },
                pos: {
                    x: this.pos.x + mx,
                    y: this.pos.y + my
                },
                tile: {
                    x: 0,
                    y: 0
                }
            };
            this.handleMovementTrace(res);
            if (this.currentAnim) {
                this.currentAnim.update();
            }
        },
        draw: function () {
            var sourceX = (this.tile - 1) * ig.game.collisionMap.tilesize;
            var sourceY = 0;
            if (this.chunk === 0) {} else if (this.chunk === 1) sourceX += this.size.x;
            else if (this.chunk === 2) sourceY += this.size.y;
            else if (this.chunk === 3) {
                sourceX += this.size.x;
                sourceY += this.size.y;
            }
            this.tilesheet.draw(this.pos.x - this.offset.x - ig.game._rscreen.x, this.pos.y - this.offset.y - ig.game._rscreen.y, sourceX, sourceY, this.size.x, this.size.y);
        }
    });
});

// lib/game/entities/terrain-manager.js
ig.baked = true;
ig.module('game.entities.terrain-manager').requires('impact.entity', 'game.entities.bridge', 'game.entities.terrain-chunk').defines(function () {
    EntityTerrainManager = ig.Entity.extend({
        _wmIgnore: true,
        tiles_to_set: {},
        regen_delay: 6,
        paused: false,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
        },
        update: function () {
            if (!this.paused) this.regen_tiles();
        },
        restore_level: function () {
            for (var x in this.tiles_to_set) {
                if (this.tiles_to_set.hasOwnProperty(x)) {
                    for (var y in this.tiles_to_set[x]) {
                        if (this.tiles_to_set[x].hasOwnProperty(y) && this.tiles_to_set[x][y]) {
                            var tile = this.tiles_to_set[x][y].tile;
                            var collision = this.tiles_to_set[x][y].collision;
                            this.set_tile(x, y, tile, collision);
                        }
                    }
                }
            }
        },
        clear_tile: function (x, y) {
            if (typeof this.tiles_to_set[x] === 'undefined' || typeof this.tiles_to_set[x][y] === 'undefined') {
                var old_tile = ig.game.backgroundMaps[0].data[y][x];
                var old_collision = ig.game.collisionMap.data[y][x];
                if (old_tile !== 0) {
                    var new_tile = 0;
                    var new_collision = 0;
                    ig.game.backgroundMaps[0].data[y][x] = new_tile;
                    ig.game.collisionMap.data[y][x] = new_collision;
                    this.queue_tile_for_regen(x, y, old_tile, old_collision);
                    var tilesize = ig.game.collisionMap.tilesize;
                    var spawn_x = x * tilesize;
                    var spawn_y = y * tilesize;
                    var chunks = [{
                        tile: old_tile,
                        x: spawn_x,
                        y: spawn_y
                    }, {
                        tile: old_tile,
                        x: spawn_x + tilesize / 2,
                        y: spawn_y
                    }, {
                        tile: old_tile,
                        x: spawn_x,
                        y: spawn_y + tilesize / 2
                    }, {
                        tile: old_tile,
                        x: spawn_x + tilesize / 2,
                        y: spawn_y + tilesize / 2
                    }];
                    for (var i = 0; i < chunks.length; i++) {
                        ig.game.spawnEntity(EntityTerrainChunk, chunks[i].x, chunks[i].y, {
                            tile: old_tile,
                            chunk: i
                        });
                    }
                }
            }
        },
        regen_tiles: function () {
            for (var x in this.tiles_to_set) {
                if (this.tiles_to_set.hasOwnProperty(x)) {
                    for (var y in this.tiles_to_set[x]) {
                        if (this.tiles_to_set[x].hasOwnProperty(y)) {
                            if (this.tiles_to_set[x][y] && this.tiles_to_set[x][y].timer.delta() >= this.regen_delay) {
                                var tile = this.tiles_to_set[x][y].tile;
                                var collision = this.tiles_to_set[x][y].collision;
                                this.set_tile(x, y, tile, collision);
                                if (this.tiles_to_set[x][y].bridge) this.tiles_to_set[x][y].bridge.kill();
                                if (Object.size(this.tiles_to_set[x]) === 1) this.tiles_to_set[x] = undefined;
                                else this.tiles_to_set[x][y] = undefined;
                                return;
                            }
                        }
                    }
                }
            }
        },
        queue_tile_for_regen: function (x, y, tile, collision) {
            if (typeof this.tiles_to_set[x] === 'undefined') this.tiles_to_set[x] = {};
            if (typeof this.tiles_to_set[x][y] === 'undefined') this.tiles_to_set[x][y] = {};
            this.tiles_to_set[x][y].tile = tile;
            this.tiles_to_set[x][y].collision = collision;
            this.tiles_to_set[x][y].timer = new ig.Timer();
            var tilesize = ig.game.collisionMap.tilesize;
            this.tiles_to_set[x][y].bridge = ig.game.spawnEntity(EntityBridge, x * tilesize, y * tilesize);
        },
        set_tile: function (x, y, tile, collision) {
            this.kill_stuff_at(x, y);
            ig.game.backgroundMaps[0].data[y][x] = tile;
            ig.game.collisionMap.data[y][x] = collision;
        },
        kill_stuff_at: function (x, y) {
            if (ig.game.player.isTouchingTile(x, y)) ig.game.player.kill();
            var enemies = ig.game.getEntitiesByType(EntityEnemy);
            for (var i = 0; i < enemies.length; i++) {
                if (enemies[i].isTouchingTile(x, y)) enemies[i].kill();
            }
        }
    });
});

// lib/game/entities/button.js
ig.baked = true;
ig.module('game.entities.button').requires('impact.entity', 'plugins.houly.button').defines(function () {
    EntityButton = Button.extend({
        zIndex: 16384,
        size: {
            x: 80,
            y: 20
        },
        textAlign: ig.Font.ALIGN.CENTER,
        animSheet: new ig.AnimationSheet('media/button.png', 80, 20),
        init: function (x, y, settings) {
            if (settings.image) this.animSheet = new ig.AnimationSheet(settings.image, settings.size.x, settings.size.y);
            this.parent(x, y, settings);
            if (settings.text) this.text = [settings.text];
            if (!ig.global.wm) {
                this.textPos.x = this.size.x / 2;
                this.textPos.y = this.size.y / 2 - ig.game.font.height / 2 + 2;
            }
            if (!ig.global.wm && settings.trigger && settings.action === "start_level" && settings.level) {
               
                var level = parseInt(settings.level);
                this[settings.trigger] = function () {
                    ig.game.level = level;
                    ig.game.start_level();
                };
            } else if (!ig.global.wm && settings.trigger && settings.action) {
                this[settings.trigger] = ig.game[settings.action];
            }
        },
        draw: function () {
            if (ig.global.wm) {
                if (this.currentAnim) {
                    this.currentAnim.draw(this.pos.x - this.offset.x - ig.game._rscreen.x, this.pos.y - this.offset.y - ig.game._rscreen.y);
                }
            } else {
                this.parent();
            }
        }
    });
});

// lib/game/entities/back-to-title-screen-button.js
ig.baked = true;
ig.module('game.entities.back-to-title-screen-button').requires('game.entities.button').defines(function () {
    EntityBackToTitleScreenButton = EntityButton.extend({
        _wmIgnore: true,
        size: {
            x: 20,
            y: 20
        },
        animSheet: new ig.AnimationSheet('media/button-house.png', 20, 20),
        pressedUp: function () {
            ig.game.title_screen();
        }
    });
});

// lib/game/entities/level-button-collection.js
ig.baked = true;
ig.module('game.entities.level-button-collection').requires('impact.entity').defines(function () {
    EntityLevelButtonCollection = ig.Entity.extend({
        _wmIgnore: true,
        size: {
            x: 60,
            y: 20
        },
        space_between_each_button: 6,
        image: 'media/button-small.png',
        trigger: 'pressedUp',
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.spawn_all_buttons();
        },
        spawn_all_buttons: function () {
            for (var i = 0; i < ig.game.level_count; i++) {
                var x = ig.system.width / 2 + (i % 2 === 0 ? -1 * (this.size.x + this.space_between_each_button / 2) : this.space_between_each_button / 2);
                var y = EntityBlackBar.prototype.size.y + ((ig.system.height - EntityBlackBar.prototype.size.y) / 2 - this.size.y * Math.floor(ig.game.level_count / 2) / 2 - this.space_between_each_button * (Math.floor(ig.game.level_count / 2) - 1) / 2) +
                    Math.floor(i / 2) * this.size.y + Math.floor(i / 2) * this.space_between_each_button;
                var level = i + 1;
                var text = 'LEVEL ' + level;
                var settings = {
                    text: text,
                    size: this.size,
                    image: this.image
                };
                this.spawn_button(x, y, level, settings);
            }
        },
        spawn_button: function (x, y, level, settings) {
            var action = function () {
                ig.game.level = level;
                ig.game.start_level();
            };
            button = ig.game.spawnEntity(EntityButton, x, y, settings);
            button[this.trigger] = action;
        }
    });
});

// lib/game/levels/title.js
ig.baked = true;
ig.module('game.levels.title').requires('impact.image', 'game.entities.button').defines(function () {
    LevelTitle = {
        "entities": [{
            "type": "EntityButton",
            "x": 40,
            "y": 40,
            "settings": {
                "size": {
                    "x": 80,
                    "y": 20
                },
                "trigger": "pressedUp",
                "action": "go_to_level_select",
                "text": "NEW GAME",
                "absolutePos": "no"
            }
        }, {
            "type": "EntityButton",
            "x": 40,
            "y": 68,
            "settings": {
                "size": {
                    "x": 80,
                    "y": 20
                },
                "trigger": "pressedUp",
                "action": "how_to_play",
                "text": "HOW TO PLAY",
                "absolutePos": "no"
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 10,
            "height": 11,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 6, 1, 1, 1, 1, 1, 1, 6, 0],
                [0, 6, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 6, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 6, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 6, 0, 0, 0, 0, 0, 0, 6, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "logo",
            "width": 10,
            "height": 11,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "media/logo.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }]
    };
    LevelTitleResources = [new ig.Image('media/palette.png'), new ig.Image('media/logo.png')];
});

// lib/game/levels/how-to-play-mobile.js
ig.baked = true;
ig.module('game.levels.how-to-play-mobile').requires('impact.image').defines(function () {
    LevelHowToPlayMobile = {
        "entities": [],
        "layer": [{
            "name": "floor",
            "width": 10,
            "height": 11,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "media/how-to-play-mobile.png",
            "repeat": false,
            "preRender": true,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 22, 23, 24, 25, 26, 27, 28, 29, 0],
                [0, 32, 33, 34, 35, 36, 37, 38, 39, 0],
                [0, 42, 43, 44, 45, 46, 47, 48, 49, 0],
                [0, 52, 53, 54, 55, 56, 57, 58, 59, 0],
                [0, 62, 63, 64, 65, 66, 67, 68, 69, 0],
                [0, 72, 73, 74, 75, 76, 77, 78, 79, 0],
                [0, 82, 83, 84, 85, 86, 87, 88, 89, 0],
                [0, 92, 93, 94, 95, 96, 97, 98, 99, 0],
                [0, 102, 103, 104, 105, 106, 107, 108, 109, 0],
                [0, 112, 113, 114, 115, 116, 117, 118, 119, 0],
                [0, 122, 123, 124, 125, 126, 127, 128, 129, 0]
            ]
        }]
    };
    LevelHowToPlayMobileResources = [new ig.Image('media/how-to-play-mobile.png')];
});

// lib/game/levels/how-to-play-desktop.js
ig.baked = true;
ig.module('game.levels.how-to-play-desktop').requires('impact.image').defines(function () {
    LevelHowToPlayDesktop = {
        "entities": [],
        "layer": [{
            "name": "floor",
            "width": 10,
            "height": 11,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "media/how-to-play-desktop.png",
            "repeat": false,
            "preRender": true,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 22, 23, 24, 25, 26, 27, 28, 29, 0],
                [0, 32, 33, 34, 35, 36, 37, 38, 39, 0],
                [0, 42, 43, 44, 45, 46, 47, 48, 49, 0],
                [0, 52, 53, 54, 55, 56, 57, 58, 59, 0],
                [0, 62, 63, 64, 65, 66, 67, 68, 69, 0],
                [0, 72, 73, 74, 75, 76, 77, 78, 79, 0],
                [0, 82, 83, 84, 85, 86, 87, 88, 89, 0],
                [0, 92, 93, 94, 95, 96, 97, 98, 99, 0],
                [0, 102, 103, 104, 105, 106, 107, 108, 109, 0],
                [0, 112, 113, 114, 115, 116, 117, 118, 119, 0],
                [0, 122, 123, 124, 125, 126, 127, 128, 129, 0]
            ]
        }]
    };
    LevelHowToPlayDesktopResources = [new ig.Image('media/how-to-play-desktop.png')];
});

// lib/game/levels/level-select.js
ig.baked = true;
ig.module('game.levels.level-select').requires('impact.image').defines(function () {
    LevelLevelSelect = {
        "entities": [],
        "layer": [{
            "name": "collision",
            "width": 12,
            "height": 32,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
});

// lib/game/entities/coin-spawn.js
ig.baked = true;
ig.module('game.entities.coin-spawn').requires('impact.entity').defines(function () {
    EntityCoinSpawn = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/palette.png', 16, 16),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [4]);
        },
        update: function () {}
    });
});

// lib/game/entities/enemy-spawn.js
ig.baked = true;
ig.module('game.entities.enemy-spawn').requires('impact.entity').defines(function () {
    EntityEnemySpawn = ig.Entity.extend({
        animSheet: new ig.AnimationSheet('media/enemy.png', 16, 16),
        size: {
            x: 16,
            y: 16
        },
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
        }
    });
});

// lib/game/entities/player-spawn.js
ig.baked = true;
ig.module('game.entities.player-spawn').requires('impact.entity').defines(function () {
    EntityPlayerSpawn = ig.Entity.extend({
        animSheet: new ig.AnimationSheet('media/player.png', 16, 16),
        size: {
            x: 16,
            y: 16
        },
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
        }
    });
});

// lib/game/entities/exit-spawn.js
ig.baked = true;
ig.module('game.entities.exit-spawn').requires('impact.entity').defines(function () {
    EntityExitSpawn = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        offset: {
            x: 0,
            y: 7
        },
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/exit.png', 15, 23),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
        },
        update: function () {}
    });
});

// lib/game/entities/ladder.js
ig.baked = true;
ig.module('game.entities.ladder').requires('impact.entity').defines(function () {
    EntityLadder = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        real_width: 10,
        _wmDrawBox: true,
        _wmScalable: true,
        zIndex: 256,
        nature: 'ladder',
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/palette.png', 16, 16),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [5]);
            if (!ig.global.wm) {
                var offset = (this.size.x - this.real_width) / 2;
                this.offset.x = offset;
                this.size.x = this.real_width;
                this.pos.x += offset;
            }
        },
        update: function () {},
        draw: function () {
            if (!ig.global.wm) {
                if (this.currentAnim) {
                    var tilesize = ig.game.collisionMap.tilesize;
                    var tile_height = this.size.y / tilesize;
                    for (var i = 1; i < tile_height; i++) {
                        this.currentAnim.draw(this.pos.x - this.offset.x - ig.game._rscreen.x, this.pos.y - this.offset.y - ig.game._rscreen.y + (i * tilesize));
                    }
                }
                this.parent();
            }
        }
    });
});

// lib/game/levels/pathfinding.js
ig.baked = true;
ig.module('game.levels.pathfinding').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.enemy-spawn', 'game.entities.player-spawn', 'game.entities.exit-spawn', 'game.entities.ladder').defines(function () {
    LevelPathfinding = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 192
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 384
        }, {
            "type": "EntityEnemySpawn",
            "x": 32,
            "y": 16
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 64
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 144
        }, {
            "type": "EntityPlayerSpawn",
            "x": 16,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 416
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 16
        }, {
            "type": "EntityExitSpawn",
            "x": 144,
            "y": 16
        }, {
            "type": "EntityExitSpawn",
            "x": 160,
            "y": 448
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 224
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 64,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 160,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 272,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 160,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 288,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 336,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 240,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 464
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 64,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 336,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 336,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 32,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 352,
            "settings": {
                "size": {
                    "y": 128,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 208,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 32,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 32,
            "settings": {
                "size": {
                    "y": 128,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 224,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 32,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 2, 2, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0],
                [0, 2, 2, 2, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 2, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 2, 2, 0, 0, 0, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 2, 0, 2, 2, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
                [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
                [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 32,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
                [1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
                [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelPathfindingResources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/bridge-test.js
ig.baked = true;
ig.module('game.levels.bridge-test').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.exit-spawn', 'game.entities.player-spawn', 'game.entities.enemy-spawn', 'game.entities.ladder').defines(function () {
    LevelBridgeTest = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 384
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 320
        }, {
            "type": "EntityExitSpawn",
            "x": 32,
            "y": 448
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 64
        }, {
            "type": "EntityPlayerSpawn",
            "x": 144,
            "y": 64
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 192
        }, {
            "type": "EntityEnemySpawn",
            "x": 48,
            "y": 64
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 256
        }, {
            "type": "EntityEnemySpawn",
            "x": 64,
            "y": 64
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 336,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 400,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 144,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 208,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 80,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 272,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 33,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 33,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelBridgeTestResources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level1.js
ig.baked = true;
ig.module('game.levels.level1').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.exit-spawn', 'game.entities.enemy-spawn', 'game.entities.player-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel1 = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 224
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 384
        }, {
            "type": "EntityExitSpawn",
            "x": 16,
            "y": 80
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 368
        }, {
            "type": "EntityEnemySpawn",
            "x": 64,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 464
        }, {
            "type": "EntityPlayerSpawn",
            "x": 96,
            "y": 96
        }, {
            "type": "EntityExitSpawn",
            "x": 32,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 320
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 432,
            "settings": {
                "size": {
                    "x": 16,
                    "y": 48
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 384,
            "settings": {
                "size": {
                    "x": 16,
                    "y": 48
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 96,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 240,
            "settings": {
                "size": {
                    "x": 16,
                    "y": 48
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 144,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 336,
            "settings": {
                "size": {
                    "x": 16,
                    "y": 96
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 288,
            "settings": {
                "size": {
                    "x": 16,
                    "y": 48
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 192,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 384,
            "settings": {
                "size": {
                    "x": 16,
                    "y": 48
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 96,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 144,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 32,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 1, 0, 3, 0, 0, 0, 0, 3, 0, 1, 0],
                [0, 0, 0, 3, 1, 1, 1, 1, 3, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 4, 4, 0, 0, 0, 0, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 1, 1, 0, 2, 0, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 32,
            "linkWithCollision": false,
            "visible": 0,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel1Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level2.js
ig.baked = true;
ig.module('game.levels.level2').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.exit-spawn', 'game.entities.enemy-spawn', 'game.entities.player-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel2 = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 384
        }, {
            "type": "EntityExitSpawn",
            "x": 80,
            "y": 432
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 32
        }, {
            "type": "EntityEnemySpawn",
            "x": 160,
            "y": 480
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 288
        }, {
            "type": "EntityPlayerSpawn",
            "x": 64,
            "y": 432
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 384
        }, {
            "type": "EntityExitSpawn",
            "x": 144,
            "y": 432
        }, {
            "type": "EntityEnemySpawn",
            "x": 80,
            "y": 128
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 256,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 352,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 208,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 208,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 96,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 144,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 400,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 352,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 352,
            "settings": {
                "size": {
                    "y": 144,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 448,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 304,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 144,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 33,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 4, 4, 4, 0, 4, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0],
                [0, 0, 0, 4, 4, 3, 4, 4, 4, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0, 3, 0, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 4, 0, 4, 3, 4, 4, 4, 0, 4, 4, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 4, 0, 4, 4, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 2, 0, 2, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 3, 0, 3, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
                [0, 0, 4, 4, 4, 4, 4, 0, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 33,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel2Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level3.js
ig.baked = true;
ig.module('game.levels.level3').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.exit-spawn', 'game.entities.player-spawn', 'game.entities.enemy-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel3 = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 352
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 336
        }, {
            "type": "EntityExitSpawn",
            "x": 144,
            "y": 464
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 96
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 240
        }, {
            "type": "EntityPlayerSpawn",
            "x": 160,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 384
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 80
        }, {
            "type": "EntityEnemySpawn",
            "x": 48,
            "y": 208
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 240
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 448
        }, {
            "type": "EntityEnemySpawn",
            "x": 112,
            "y": 80
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 96,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 144,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 224,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 272,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 352,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 352,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 480,
            "settings": {
                "size": {
                    "y": 16,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 464,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 33,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 4, 4, 4, 4, 0, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
                [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
                [0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 4, 4, 4, 4, 0, 4, 4, 4, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 2, 2, 2, 2, 2, 2, 0, 3, 0, 0],
                [0, 0, 3, 3, 3, 3, 3, 3, 0, 3, 0, 0],
                [0, 0, 4, 4, 4, 4, 4, 4, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 4, 4, 4, 4, 0, 2, 0, 0, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 2, 2, 2, 2, 3, 2, 2, 2, 2, 0],
                [0, 0, 4, 4, 4, 4, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 2, 2, 2, 0],
                [0, 2, 2, 2, 3, 2, 2, 2, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 33,
            "linkWithCollision": false,
            "visible": 0,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel3Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level4.js
ig.baked = true;
ig.module('game.levels.level4').requires('impact.image', 'game.entities.enemy-spawn', 'game.entities.coin-spawn', 'game.entities.player-spawn', 'game.entities.exit-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel4 = {
        "entities": [{
            "type": "EntityEnemySpawn",
            "x": 144,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 224
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 48
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 176
        }, {
            "type": "EntityPlayerSpawn",
            "x": 16,
            "y": 16
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 80
        }, {
            "type": "EntityExitSpawn",
            "x": 16,
            "y": 128
        }, {
            "type": "EntityEnemySpawn",
            "x": 112,
            "y": 224
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 288
        }, {
            "type": "EntityExitSpawn",
            "x": 128,
            "y": 80
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 432
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 288
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 432
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 304,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 96,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 144,
            "settings": {
                "size": {
                    "y": 96,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 304,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 48,
            "settings": {
                "size": {
                    "x": 16,
                    "y": 32
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 304,
            "settings": {
                "size": {
                    "y": 192,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 192,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 240,
            "settings": {
                "size": {
                    "y": 256,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 144,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 352,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 192,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 400,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 33,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 4, 4, 3, 0, 4, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 4, 0, 3, 4, 4, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 4, 4, 0, 3, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 2, 2, 3, 0, 2, 2, 2, 2, 0],
                [0, 4, 4, 4, 4, 3, 0, 3, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0],
                [0, 0, 3, 3, 0, 3, 0, 3, 0, 4, 4, 0],
                [0, 0, 3, 3, 0, 3, 0, 3, 0, 0, 0, 0],
                [0, 0, 4, 4, 0, 3, 0, 3, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 4, 0, 3, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                [0, 0, 2, 2, 0, 0, 0, 3, 0, 0, 0, 0],
                [0, 0, 3, 3, 0, 0, 0, 3, 0, 4, 4, 0],
                [0, 0, 3, 3, 0, 2, 0, 3, 0, 0, 0, 0],
                [0, 0, 3, 3, 0, 3, 0, 3, 0, 0, 0, 0],
                [0, 0, 4, 4, 0, 3, 0, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 33,
            "linkWithCollision": false,
            "visible": 0,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
                [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1],
                [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel4Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level5.js
ig.baked = true;
ig.module('game.levels.level5').requires('impact.image', 'game.entities.enemy-spawn', 'game.entities.coin-spawn', 'game.entities.player-spawn', 'game.entities.exit-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel5 = {
        "entities": [{
            "type": "EntityEnemySpawn",
            "x": 128,
            "y": 480
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 48
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 272
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 336
        }, {
            "type": "EntityEnemySpawn",
            "x": 160,
            "y": 352
        }, {
            "type": "EntityPlayerSpawn",
            "x": 80,
            "y": 480
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 416
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 112
        }, {
            "type": "EntityExitSpawn",
            "x": 160,
            "y": 480
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 416
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 112
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 336
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 224,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 208,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 160,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 400,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 400,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 448,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 304,
            "settings": {
                "size": {
                    "y": 96,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 96,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 256,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 208,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 304,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 33,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 2, 1, 1, 0, 1, 1, 1, 2, 0, 0],
                [0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 3, 0, 0, 2, 2, 2, 0, 3, 0, 0],
                [0, 0, 4, 0, 0, 4, 4, 4, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 2, 1, 1, 1, 1, 1, 3, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 3, 0, 2, 1, 1, 0, 3, 0, 0],
                [0, 0, 2, 4, 0, 3, 0, 0, 0, 3, 0, 0],
                [0, 0, 4, 0, 0, 3, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 4, 0, 4, 4, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 1, 0, 0, 0, 0, 4, 4, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 4, 4, 4, 4, 0, 1, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 4, 3, 4, 4, 0, 4, 4, 3, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 4, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 33,
            "linkWithCollision": false,
            "visible": 0,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel5Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level6.js
ig.baked = true;
ig.module('game.levels.level6').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.enemy-spawn', 'game.entities.exit-spawn', 'game.entities.player-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel6 = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 240
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 336
        }, {
            "type": "EntityEnemySpawn",
            "x": 16,
            "y": 256
        }, {
            "type": "EntityExitSpawn",
            "x": 144,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 64
        }, {
            "type": "EntityPlayerSpawn",
            "x": 16,
            "y": 512
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 128
        }, {
            "type": "EntityEnemySpawn",
            "x": 160,
            "y": 256
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 64
        }, {
            "type": "EntityExitSpawn",
            "x": 32,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 448
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 496
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 400
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 176
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 432
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 192
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 240
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 112,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 48,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 80,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 480,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 432,
            "settings": {
                "size": {
                    "y": 96,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 192,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 384,
            "settings": {
                "size": {
                    "y": 160,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 48,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 224,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 80,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 288,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 432,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 112,
            "settings": {
                "size": {
                    "y": 112,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 336,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 416,
            "settings": {
                "size": {
                    "y": 112,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 36,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0, 2, 2, 0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
                [0, 0, 4, 4, 4, 3, 3, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
                [0, 4, 4, 4, 0, 4, 4, 0, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 2, 0, 1, 1, 0, 1, 1, 1, 0],
                [0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 2, 0, 2, 1, 0, 0],
                [0, 0, 4, 4, 4, 0, 4, 0, 4, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
                [0, 3, 4, 4, 0, 4, 4, 4, 4, 4, 3, 0],
                [0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
                [0, 4, 4, 4, 4, 4, 4, 4, 0, 4, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 1, 1, 1, 2, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 0, 0],
                [0, 4, 4, 4, 4, 4, 3, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 4, 0, 3, 4, 0, 0],
                [0, 0, 1, 1, 2, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 3, 4, 0, 0],
                [0, 4, 4, 0, 3, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 4, 4, 0, 0],
                [0, 2, 2, 2, 3, 2, 2, 0, 0, 0, 0, 0],
                [0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 36,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
                [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1],
                [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1],
                [1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1],
                [1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel6Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level7.js
ig.baked = true;
ig.module('game.levels.level7').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.exit-spawn', 'game.entities.enemy-spawn', 'game.entities.player-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel7 = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 80
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 192
        }, {
            "type": "EntityExitSpawn",
            "x": 32,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 320
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 128
        }, {
            "type": "EntityEnemySpawn",
            "x": 128,
            "y": 80
        }, {
            "type": "EntityPlayerSpawn",
            "x": 80,
            "y": 16
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 224
        }, {
            "type": "EntityEnemySpawn",
            "x": 32,
            "y": 80
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 176
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 176
        }, {
            "type": "EntityExitSpawn",
            "x": 128,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 272
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 320
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 272
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 320
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 480
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 480
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 416
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 368
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 368
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 96,
            "settings": {
                "size": {
                    "y": 400,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 432,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 33,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 4, 4, 4, 0, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 4, 4, 4, 4, 0, 0, 0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 4, 4, 0, 4, 4, 0, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 2, 1, 0, 1, 1, 2, 0, 1, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 4, 0, 4, 4, 0, 4, 4, 4, 0, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 1, 0, 1, 0, 1, 1, 0, 1, 2, 0],
                [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
                [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
                [0, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 2, 2, 0, 2, 2, 2, 0, 4, 0],
                [0, 4, 4, 4, 4, 0, 4, 3, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
                [0, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 33,
            "linkWithCollision": false,
            "visible": 0,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel7Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level8.js
ig.baked = true;
ig.module('game.levels.level8').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.enemy-spawn', 'game.entities.player-spawn', 'game.entities.exit-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel8 = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 272
        }, {
            "type": "EntityEnemySpawn",
            "x": 64,
            "y": 128
        }, {
            "type": "EntityEnemySpawn",
            "x": 144,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 288
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 464
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 96
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 400
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 96
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 320
        }, {
            "type": "EntityPlayerSpawn",
            "x": 144,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 432
        }, {
            "type": "EntityExitSpawn",
            "x": 80,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 288
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 416,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 464,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 48,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 48,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 48,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 240,
            "settings": {
                "size": {
                    "y": 96,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 112,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 240,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 48,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 336,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 384,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 112,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 192,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 144,
            "settings": {
                "size": {
                    "y": 96,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 432,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 48,
            "settings": {
                "size": {
                    "y": 96,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 34,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0],
                [0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0],
                [0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                [0, 0, 2, 2, 2, 2, 0, 3, 0, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 0],
                [0, 0, 2, 0, 4, 4, 4, 3, 0, 3, 3, 0],
                [0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                [0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                [0, 0, 4, 4, 4, 3, 0, 3, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0],
                [0, 0, 4, 4, 4, 4, 0, 4, 0, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 4, 0, 0, 1, 1, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0],
                [0, 4, 4, 4, 4, 4, 0, 3, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 0, 4, 4, 0],
                [0, 0, 0, 4, 0, 4, 4, 3, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0],
                [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 34,
            "linkWithCollision": false,
            "visible": 0,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1],
                [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
                [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
                [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
                [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1],
                [1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel8Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level9.js
ig.baked = true;
ig.module('game.levels.level9').requires('impact.image', 'game.entities.exit-spawn', 'game.entities.enemy-spawn', 'game.entities.coin-spawn', 'game.entities.player-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel9 = {
        "entities": [{
            "type": "EntityExitSpawn",
            "x": 64,
            "y": 480
        }, {
            "type": "EntityEnemySpawn",
            "x": 160,
            "y": 512
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 208
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 32
        }, {
            "type": "EntityExitSpawn",
            "x": 128,
            "y": 448
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 304
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 304
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 304
        }, {
            "type": "EntityEnemySpawn",
            "x": 32,
            "y": 144
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 224
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 32
        }, {
            "type": "EntityPlayerSpawn",
            "x": 112,
            "y": 48
        }, {
            "type": "EntityEnemySpawn",
            "x": 144,
            "y": 208
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 384
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 208
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 448
        }, {
            "type": "EntityExitSpawn",
            "x": 32,
            "y": 464
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 224,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 224,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 416,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 144,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 352,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 480,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 288,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 400,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 288,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 96,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 64,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 96,
            "y": 512,
            "settings": {
                "size": {
                    "y": 16,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 496,
            "settings": {
                "size": {
                    "y": 32,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 464,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 416,
            "settings": {
                "size": {
                    "y": 16,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 35,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 2, 2, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 4, 4, 0, 3, 2, 2, 0, 2, 0],
                [0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 3, 0],
                [0, 0, 3, 3, 4, 0, 4, 4, 4, 0, 4, 0],
                [0, 0, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0],
                [0, 2, 2, 2, 2, 0, 3, 3, 3, 3, 3, 0],
                [0, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 0],
                [0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 4, 3, 0, 0, 3, 0, 4, 4, 4, 0],
                [0, 0, 0, 4, 4, 0, 4, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 4, 4, 0, 4, 4, 4, 4, 0, 4, 4, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
                [0, 2, 2, 2, 2, 2, 3, 3, 2, 2, 0, 0],
                [0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 3, 4, 4, 4, 0, 0],
                [0, 4, 4, 4, 4, 0, 4, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 35,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1],
                [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
                [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1],
                [1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel9Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/level10.js
ig.baked = true;
ig.module('game.levels.level10').requires('impact.image', 'game.entities.exit-spawn', 'game.entities.coin-spawn', 'game.entities.player-spawn', 'game.entities.enemy-spawn', 'game.entities.ladder').defines(function () {
    LevelLevel10 = {
        "entities": [{
            "type": "EntityExitSpawn",
            "x": 16,
            "y": 176
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 128
        }, {
            "type": "EntityExitSpawn",
            "x": 112,
            "y": 336
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 176
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 128
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 176
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 432
        }, {
            "type": "EntityPlayerSpawn",
            "x": 128,
            "y": 32
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 32
        }, {
            "type": "EntityEnemySpawn",
            "x": 128,
            "y": 80
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 224
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 96
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 224
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 336
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 272
        }, {
            "type": "EntityEnemySpawn",
            "x": 48,
            "y": 80
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 432
        }, {
            "type": "EntityCoinSpawn",
            "x": 160,
            "y": 336
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 432
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 352,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 144,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 240,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 144,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 48,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 240,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 192,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 240,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 288,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 128,
            "y": 416,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 352,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 48,
            "y": 416,
            "settings": {
                "size": {
                    "y": 80,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 192,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 32,
            "y": 192,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 80,
            "y": 288,
            "settings": {
                "size": {
                    "y": 128,
                    "x": 16
                }
            }
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 33,
            "linkWithCollision": true,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0, 4, 4, 0, 2, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 4, 4, 3, 4, 4, 4, 0, 3, 4, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 4, 0, 3, 0, 4, 4, 4, 3, 0, 4, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0],
                [0, 0, 4, 4, 3, 4, 4, 0, 4, 4, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 3, 0, 2, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 3, 0, 3, 4, 4, 4, 4, 0],
                [0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 3, 0, 3, 3, 3, 3, 0, 0],
                [0, 0, 0, 0, 3, 0, 4, 4, 4, 4, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 4, 4, 4, 4, 0, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 33,
            "linkWithCollision": false,
            "visible": 0,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelLevel10Resources = [new ig.Image('media/palette.png')];
});

// lib/game/levels/test.js
ig.baked = true;
ig.module('game.levels.test').requires('impact.image', 'game.entities.coin-spawn', 'game.entities.player-spawn', 'game.entities.exit-spawn', 'game.entities.ladder', 'game.entities.enemy-spawn').defines(function () {
    LevelTest = {
        "entities": [{
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 48
        }, {
            "type": "EntityCoinSpawn",
            "x": 16,
            "y": 416
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 48
        }, {
            "type": "EntityCoinSpawn",
            "x": 128,
            "y": 48
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 112
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 176
        }, {
            "type": "EntityCoinSpawn",
            "x": 144,
            "y": 304
        }, {
            "type": "EntityCoinSpawn",
            "x": 48,
            "y": 240
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 304
        }, {
            "type": "EntityPlayerSpawn",
            "x": 48,
            "y": 16
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 304
        }, {
            "type": "EntityCoinSpawn",
            "x": 64,
            "y": 368
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 368
        }, {
            "type": "EntityCoinSpawn",
            "x": 96,
            "y": 368
        }, {
            "type": "EntityCoinSpawn",
            "x": 108,
            "y": 112
        }, {
            "type": "EntityCoinSpawn",
            "x": 112,
            "y": 240
        }, {
            "type": "EntityCoinSpawn",
            "x": 80,
            "y": 240
        }, {
            "type": "EntityCoinSpawn",
            "x": 32,
            "y": 416
        }, {
            "type": "EntityExitSpawn",
            "x": 28,
            "y": 176
        }, {
            "type": "EntityExitSpawn",
            "x": 16,
            "y": 48
        }, {
            "type": "EntityExitSpawn",
            "x": 88,
            "y": 464
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 128,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 256,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 128,
            "settings": {
                "size": {
                    "y": 128,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 320,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 160,
            "y": 384,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 112,
            "y": 432,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 64,
            "y": 432,
            "settings": {
                "size": {
                    "y": 48,
                    "x": 16
                }
            }
        }, {
            "type": "EntityLadder",
            "x": 144,
            "y": 64,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityEnemySpawn",
            "x": 32,
            "y": 16
        }, {
            "type": "EntityLadder",
            "x": 16,
            "y": 64,
            "settings": {
                "size": {
                    "y": 64,
                    "x": 16
                }
            }
        }, {
            "type": "EntityEnemySpawn",
            "x": 96,
            "y": 176
        }, {
            "type": "EntityEnemySpawn",
            "x": 32,
            "y": 464
        }],
        "layer": [{
            "name": "floor",
            "width": 12,
            "height": 32,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "media/palette.png",
            "repeat": false,
            "preRender": false,
            "distance": "1",
            "tilesize": 16,
            "foreground": false,
            "data": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
                [0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        }, {
            "name": "collision",
            "width": 12,
            "height": 32,
            "linkWithCollision": false,
            "visible": 0,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 16,
            "foreground": false,
            "data": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelTestResources = [new ig.Image('media/palette.png')];
});

// lib/game/main.js
ig.baked = true;
ig.module('game.main').requires('impact.game', 'impact.font', 'plugins.empika.debug_display', 'plugins.houly.multitouch', 'plugins.astar-for-entities', 'plugins.screen-fader', 'plugins.joncom.entity', 'game.entities.player', 'game.entities.enemy', 'game.entities.mobile-interface', 'game.entities.coin', 'game.entities.exit', 'game.entities.camera', 'game.entities.objective', 'game.entities.black-bar', 'game.entities.terrain-manager', 'game.entities.back-to-title-screen-button', 'game.entities.level-button-collection', 'game.levels.title', 'game.levels.how-to-play-mobile', 'game.levels.how-to-play-desktop', 'game.levels.level-select', 'game.levels.pathfinding', 'game.levels.bridge-test', 'game.levels.level1', 'game.levels.level2', 'game.levels.level3', 'game.levels.level4', 'game.levels.level5', 'game.levels.level6', 'game.levels.level7', 'game.levels.level8', 'game.levels.level9', 'game.levels.level10', 'game.levels.test').defines(function () {
    MyGame = ig.Game.extend({
        version: 1.16,
        phase: 'c',
        font: new ig.Font('media/04b03.font.png'),
        gravity: 200,
        coins_per_level: 5,
        clearColor: '#222222',
        ladder_lookup: [],
        in_game: false,
        at_title_screen: true,
        at_level_select_screen: false,
        collision_map_copy: [],
        player: null,
        level: null,
        level_count: 10,
        completion_bonus: 5,
        win_streak: 0,
        gratii_is_live: true,
        enemyRespawnQueue: [],
        to_preload: [new ig.Image('media/button.png'), new ig.Image('media/button-small.png'), new ig.Image('media/button-house.png'), new ig.Image('media/button-x.png')],
        init: function () {
            //if (this.gratii_is_live && ig.baked) startGratiiSession("Digga");
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.W, 'up');
            ig.input.bind(ig.KEY.NUMPAD_8, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.S, 'down');
            ig.input.bind(ig.KEY.NUMPAD_5, 'down');
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.A, 'left');
            ig.input.bind(ig.KEY.NUMPAD_4, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.D, 'right');
            ig.input.bind(ig.KEY.NUMPAD_6, 'right');
            ig.input.bind(ig.KEY.SPACE, 'dig');
            ig.input.bind(ig.KEY.MOUSE1, 'click');
            this.title_screen();
            this.debugDisplay = new DebugDisplay(this.font);
            this.debugDisplay.pos = {
                x: 6,
                y: 6
            };
        },
        spawnEntity: function (type, x, y, settings) {
            this.sortEntitiesDeferred();
            return this.parent(type, x, y, settings);
        },
        loadLevel: function (data) {
            var color = {
                r: 34,
                g: 34,
                b: 34,
                a: 1
            };
            this.screenFader = new ig.ScreenFader({
                fade: 'out',
                speed: 7,
                color: color
            });
            if (this.terrain) {
                this.terrain.restore_level();
                this.terrain = null;
            }
            this.clearEnemyRespawnQueue();
            this.parent(data);
            if (this.at_level_select_screen) this.spawnEntity(EntityLevelButtonCollection, 0, 0);
            if (this.gratii_is_live && ig.baked) {
                var width = 20;
                var height = 20;
                var x = 4;
                var y = 4;
                var image = 'media/button-x.png';
                var trigger = 'pressedUp';
                var action = function () {
                    exitGame();
                };
                //REMOVED exit button
               /* var button = ig.game.spawnEntity(EntityButton, x, y, {
                    size: {
                        x: width,
                        y: height
                    },
                    zIndex: 16384,
                    animSheet: new ig.AnimationSheet(image, width, height)
                });
                button[trigger] = action;*/
            }
            if (!this.at_title_screen) this.spawnEntity(EntityBackToTitleScreenButton, 136, 4);
            this.camera = this.spawnEntity(EntityCamera, 0, 0);
            this.player = null;
            if (this.in_game && ig.ua.mobile) this.mobile_interface = this.spawnEntity(EntityMobileInterface, 0, 0);
            else this.mobile_interface = null; if (this.in_game) {
                this.bar = this.spawnEntity(EntityBlackBar, 0, 0);
                this.collision_map_copy = this.copy_collision_map();
                this.terrain = this.spawnEntity(EntityTerrainManager, 0, 0);
                this.objective = this.spawnEntity(EntityObjective, 0, 0);
                var start = this.getEntitiesByType(EntityPlayerSpawn)[0];
                if (start) {
                    this.player = this.spawnEntity(EntityPlayer, start.pos.x, start.pos.y);
                    start.kill();
                }
                var coin_spawns = this.getEntitiesByType(EntityCoinSpawn).shuffle();
                for (var i = 0; i < coin_spawns.length; i++) {
                    if (i < this.coins_per_level)
                        this.spawnEntity(EntityCoin, coin_spawns[i].pos.x, coin_spawns[i].pos.y);
                    coin_spawns[i].kill();
                }
                var exit_spawns = this.getEntitiesByType(EntityExitSpawn).shuffle();
                for (var j = 0; j < exit_spawns.length; j++) {
                    if (j === 0)
                        this.exit = this.spawnEntity(EntityExit, exit_spawns[j].pos.x, exit_spawns[j].pos.y);
                    exit_spawns[j].kill();
                }
                var enemy_spawns = this.getEntitiesByType(EntityEnemySpawn);
                for (var k = 0; k < enemy_spawns.length; k++) {
                    this.spawnEntity(EntityEnemy, enemy_spawns[k].pos.x, enemy_spawns[k].pos.y);
                    enemy_spawns[k].kill();
                }
                var mapWidth = ig.game.collisionMap.width;
                var mapHeight = ig.game.collisionMap.height;
                var mapTilesize = ig.game.collisionMap.tilesize;
                var ladders = this.getEntitiesByType(EntityLadder);
                var x, y, m;
                this.ladder_lookup = [];
                for (x = 0; x < mapWidth; x++) {
                    if (typeof this.ladder_lookup[x] === 'undefined') this.ladder_lookup[x] = [];
                    for (y = 0; y < mapHeight; y++) {
                        if (typeof this.ladder_lookup[x][y] === 'undefined') this.ladder_lookup[x][y] = false;
                        for (m = 0; m < ladders.length; m++) {
                            if (ladders[m].isTouchingTile(x, y)) {
                                this.ladder_lookup[x][y] = true;
                            }
                        }
                    }
                }
            }
        },
        draw: function () {
            this.parent();
            if (this.screenFader) {
                this.screenFader.draw();
            }
            if (this.at_title_screen) {
                this.font.draw('version ' + this.version.toFixed(2) + this.phase, ig.system.width / 2, ig.system.height - this.font.height - 2, ig.Font.ALIGN.CENTER);
            }
            var x = ig.system.width / 2,
                y = ig.system.height / 2;
            var debug_array = ["\n", "\n"];
        },
        clearEnemyRespawnQueue: function () {
            for (var i = 0; i < this.enemyRespawnQueue.length; i++) clearTimeout(this.enemyRespawnQueue[i]);
            this.enemyRespawnQueue = [];
        },
        copy_collision_map: function () {
            var collision_map = [];
            for (var y = 0; y < this.collisionMap.data.length; y++) {
                if (typeof collision_map[y] === 'undefined') collision_map[y] = [];
                for (var x = 0; x < this.collisionMap.data[y].length; x++) {
                    collision_map[y][x] = this.collisionMap.data[y][x];
                }
            }
            return collision_map;
        },
        go_to_level_select: function () {
            ig.game.in_game = false;
            ig.game.at_title_screen = false;
            ig.game.at_level_select_screen = true;
            ig.game.loadLevelDeferred(LevelLevelSelect);
        },
        how_to_play: function () {
            ig.game.in_game = false;
            ig.game.at_title_screen = false;
            ig.game.at_level_select_screen = false;
            var level = (ig.ua.mobile ? LevelHowToPlayMobile : LevelHowToPlayDesktop);
            ig.game.loadLevelDeferred(level);
        },
        title_screen: function () {
            // parent.arcade.digga.cumulativeCoinGrabs = 0;
            // parent.arcade.eventStorage.submitAndClearAll('ArcadeEvents');
            ig.game.in_game = false;
            ig.game.at_title_screen = true;
            ig.game.at_level_select_screen = false;
            ig.game.loadLevelDeferred(LevelTitle);
        },
        start_level: function () {
            if(gameOverOccured === true){
                cummilativeCoinGrabs = 0;
                gameOverOccured = false;
            }
            ig.game.in_game = true;
            ig.game.at_title_screen = false;
            ig.game.at_level_select_screen = false;
            ig.game.loadLevelDeferred(ig.global['LevelLevel' + ig.game.level]);
        },
        freeze_entities: function () {
            var enemies = ig.game.getEntitiesByType(EntityEnemy);
            for (var i = 0; i < enemies.length; i++) enemies[i].update = function () {};
            if (this.player) this.player.update = function () {};
        }
    });
    var width, height, scale;
    if (ig.ua.mobile && !ig.ua.iPad) {
        width = 160;
        height = Math.floor((window.innerHeight-100) / 2);
        scale = 2;
        ig.main('#canvas', MyGame, 60, width, height, scale);
    } else {
        width = 160;
        height = 284;
        scale = 2;
        ig.main('#canvas', MyGame, 60, width, height, scale);
    }
});
Array.prototype.shuffle = function () {
    var len = this.length;
    var i = len;
    while (i--) {
        var p = parseInt(Math.random() * len);
        var t = this[i];
        this[i] = this[p];
        this[p] = t;
    }
    return this;
};
Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
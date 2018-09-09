function H5sPlayerWS(t) {
    this.sourceBuffer, 
    this.buffer = [],
    this.t, 
    //视频dom对象
    this.s, 
    //websocket实例
    this.i, 
    //记录视频数据定时器
    this.o, 
    //记录心跳包定时器
    this.h, 
    this.l = 0, 
    this.u = 0, 
    this.S = 0, 
    //是否断开连接
    this.v = !1, 
    this.p = !1, 
    this.H = !1, 
    this.C, 
    //配置信息
    this.k = t, 
    console.log("Websocket Conf:", t), 
    //html video元素id
    this.P = t.videoid, 
    //token
    this.W = t.token, 
    void 0 === this.P ? (this.R = t.videodom, console.log(t.token, "use dom directly")) : (this.R = document.getElementById(this.P), console.log(t.token, "use videoid")),
    this.s = this.R;
    var posterUrl = this.k.protocol + "//" + this.k.host + this.k.rootpath + "api/v1/GetImage?token=" + this.W + "&session=" + this.k.session;
    this.R.setAttribute("poster", posterUrl)
}

//监测是否断开连接，断开就重连
H5sPlayerWS.prototype.D = function () {
    console.log("Try Reconnect...", this.v), 
    !0 === this.v && (console.log("Reconnect..."), this.G(this.W), this.v = !1), 
    console.log("Try Reconnect...", this.v)
}; 
//创建websoket连接
H5sPlayerWS.prototype.U = function (websoketUri) {
    var h5SWebSocketClients;
    console.log("H5SWebSocketClient");
    try {
        "http:" == this.k.protocol && (h5SWebSocketClients = "undefined" != typeof MozWebSocket ? new MozWebSocket("ws://127.0.0.1:8001") : new WebSocket("ws://127.0.0.1:8001")), 
        "https:" == this.k.protocol && (console.log(this.k.host), h5SWebSocketClients = "undefined" != typeof MozWebSocket ? new MozWebSocket("wss://" + this.k.host + websoketUri) : new WebSocket("wss://" + this.k.host + websoketUri)), 
        console.log(this.k.host)
    } catch (websoketUri) {
        return void alert("error")
    }
    return h5SWebSocketClients
}; 
H5sPlayerWS.prototype.K = function () {
    if (null !== this.sourceBuffer && void 0 !== this.sourceBuffer) {
        if (0 !== this.buffer.length && !this.sourceBuffer.updating)
            // try {
                var t = this.buffer.shift(), s = new Uint8Array(t);
                this.sourceBuffer.appendBuffer(s)
            // } catch (t) {
            //     console.log(t)
            // }
            this.s.play()
    } else {
        console.log(this.sourceBuffer, "is null or undefined")
    }
}, 
//心跳包
H5sPlayerWS.prototype.V = function () {
    try {
        this.i.send("keepalive")
    } catch (t) {
        console.log(t)
    }
}; 
//接收到视频数据方法
H5sPlayerWS.prototype.j = function (t) {
    console.log("j==============================")
    console.log(t.data)
    if (!0 !== this.p)
    return !1 === this.H ? (this.C = 'video/mp4; codecs="avc1.64001E, mp4a.40.2"', this.q(this), void(this.H = !0)) : (this.buffer.push(t.data), void this.K())
}; 
H5sPlayerWS.prototype.q = function (t) {
    try {
        window.MediaSource = window.MediaSource || window.WebKitMediaSource, 
        window.MediaSource || console.log("MediaSource API is not available");
        var mediaType = 'video/mp4; codecs="avc1.64001E, mp4a.40.2"';
        "MediaSource" in window && MediaSource.isTypeSupported(mediaType) ? console.log("MIME type or codec: ", mediaType) : console.log("Unsupported MIME type or codec: ", mediaType), 
        t.t = new window.MediaSource, 
        // t.s.autoplay = !0, 
        console.log(t.P);
        t.s.src = window.URL.createObjectURL(t.t), 
        console.log("==============================")
        console.log(t.t)
        // t.s.play(), 
        t.t.addEventListener("sourceopen", t.F.bind(t), !1)
    } catch (t) {
        console.log(t)
    }
}; 
H5sPlayerWS.prototype.F = function () {
    console.log("Add SourceBuffer"), 
    this.sourceBuffer = this.t.addSourceBuffer('video/mp4; codecs="avc1.64001E, mp4a.40.2"'),
    this.t.duration = 1 / 0, 
    this.t.removeEventListener("sourceopen", this.F, !1), 
    this.sourceBuffer.addEventListener("updateend", this.K.bind(this), !1)
};
//连接websoket 
H5sPlayerWS.prototype.G = function (t) {
    // this.s.autoplay = !0;
    var websoketUri = "api/v1/h5swsapi";
    websoketUri = this.k.rootpath + websoketUri + "?token=" + t + "&session=" + this.k.session, 
    console.log(websoketUri), 
    this.i = this.U(websoketUri), 
    console.log("setupWebSocket", this.i), 
    this.i.binaryType = "arraybuffer", 
    //接收到返回的视频数据
    (this.i.X = this).i.onmessage = this.j.bind(this), 
    this.i.onopen = function () {
        //此处的this是websoket对象
        console.log("wsSocket.onopen", this.X), 
        this.X.o = setInterval(this.X.Y.bind(this.X), 1e4), 
        this.X.h = setInterval(this.X.V.bind(this.X), 1e3)
    }, 
    this.i.onclose = function () {
        console.log("wsSocket.onclose", this.X), 
        !0 === this.X.p ? console.log("wsSocket.onclose disconnect") : this.X.v = !0,
         this.X.Z(this.X), 
         this.X.$(this.X), 
         this.X.C = "", 
         this.X.H = !1
    }
}; 
H5sPlayerWS.prototype.Z = function (t) {
    console.log("Cleanup Source Buffer", t);
    try {
        t.sourceBuffer.removeEventListener("updateend", t.K, !1), t.sourceBuffer.abort(), document.documentMode || /Edge/.test(navigator.userAgent) ? console.log("IE or EDGE!") : t.t.removeSourceBuffer(t.sourceBuffer), t.sourceBuffer = null, t.t = null, t.buffer = []
    } catch (t) {
        console.log(t)
    }
}; 
H5sPlayerWS.prototype.$ = function (t) {
    console.log("CleanupWebSocket", t), 
    clearInterval(t.h), 
    clearInterval(t.o), 
    t.l = 0, 
    t.u = 0, 
    t.S = 0
}; 
H5sPlayerWS.prototype.Y = function () {
    !0 === this.p && (
        console.log("CheckSourceBuffer has been disconnect", this), 
        clearInterval(this.h), 
        clearInterval(this.o), 
        clearInterval(this._)
    );
    try {
        if (console.log("CheckSourceBuffer", this), this.sourceBuffer.buffered.length <= 0) {
            if (this.l++, 8 < this.l)
                return console.log("CheckSourceBuffer Close 1"), void this.i.close()
        } else {
            this.l = 0;
            this.sourceBuffer.buffered.start(0);
            var t = this.sourceBuffer.buffered.end(0), 
            s = t - this.s.currentTime;
            if (5 < s || s < 0)
                return console.log("CheckSourceBuffer Close 2", s), void this.i.close();
            if (t == this.u) {
                if (this.S++, 3 < this.S)
                    return console.log("CheckSourceBuffer Close 3"), void this.i.close()
            } else 
                this.S = 0;
            this.u = t
        }
    } catch (t) {
        console.log(t)
    }
}; 
H5sPlayerWS.prototype.connect = function () {
    this.G(this.W), 
    this._ = setInterval(this.D.bind(this), 3e3)
}; 
H5sPlayerWS.prototype.disconnect = function () {
    console.log("disconnect", this), 
    this.p = !0, 
    clearInterval(this._), 
    null != this.i && (
        this.i.close(), 
        this.i = null
    ), 
    console.log("disconnect", this)
}

export default H5sPlayerWS;
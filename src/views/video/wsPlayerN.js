export class WsPlayer{
    constructor(conf){
        this.conf = Object.assign({
            videoId: '',
            host: '127.0.0.1:8001',
        },conf);
        this.h5SWebSocketClient;
        this.mediaSource;
        this.sourceBuffer;
        this.h5Player;
        this.mediaType;
        this.init();
    }

    init(){
        this.h5Player = document.getElementById(this.conf.videoId);
        this.mediaType = 'video/mp4; codecs="avc1.64001E, mp4a.40.2"';
        var sourceBuffer1;
        this.mediaSourceConf(this.h5Player,sourceBuffer1,this.mediaType);
        // this.h5SWebSocketClient = "undefined" != typeof MozWebSocket ? new MozWebSocket("ws://" + this.conf.host) : new WebSocket("ws://" + this.conf.host );
        // this.h5SWebSocketClient.binaryType = 'arraybuffer';
        // this.h5SWebSocketClient.onmessage = function(rep){
        //     if(sourceBuffer1){
        //         sourceBuffer1.appendBuffer(rep.data);
        //     }
        //     console.log(rep.data)
        // }
    }

    // wsOnMessage(rep){
        
    // }

    mediaSourceConf(h5Player,sourceBuffer,mediaType){
        var queue = [];
        try {
            if(!window.MediaSource){
                console.log("MediaSource API is not available");
            }
            if("MediaSource" in window && MediaSource.isTypeSupported(this.mediaType)){
                console.log("MIME type or codec: ", this.mediaType)
            } else{
                console.log("Unsupported MIME type or codec: ", this.mediaType)
            } 
            var mediaSource = window.MediaSource?new MediaSource() : new WebKitMediaSource();
            this.h5Player.src = URL.createObjectURL(mediaSource);
            // this.h5Player.play();
            
            
            mediaSource.addEventListener('sourceopen',function(_){

                
                if(!sourceBuffer){
                    sourceBuffer = mediaSource.addSourceBuffer(mediaType);
                    sourceBuffer.mode = 'segments';
                }

                sourceBuffer.addEventListener('updatestart', function(e) { console.log('updatestart: ' + mediaSource.readyState); });
                sourceBuffer.addEventListener('update', function(e) { console.log('update: ' + mediaSource.readyState); });
                sourceBuffer.addEventListener('updateend', function(e) { console.log('updateend: ' + mediaSource.readyState); });
                sourceBuffer.addEventListener('error', function(e) { console.log('error: ' + mediaSource.readyState); });
                sourceBuffer.addEventListener('abort', function(e) { console.log('abort: ' + mediaSource.readyState); });
                // console.log(mediaSource)
                mediaSource.duration = 1 / 0;
                h5Player.play();
                // this.mediaSource.removeEventListener("sourceopen", this.F, !1), 
                sourceBuffer.addEventListener('updateend', function (_) {
                    // this.mediaSource.endOfStream();
                    console.log(queue.length > 0 )
                    console.log(!sourceBuffer.updating)
                    h5Player.play();
                    if (queue.length > 0 && !sourceBuffer.updating) {
                        sourceBuffer.appendBuffer(queue.shift());
                        h5Player.play();
                    }
                });

                var h5SWebSocketClient = "undefined" != typeof MozWebSocket ? new MozWebSocket("ws://127.0.0.1:8081") : new WebSocket("ws://127.0.0.1:8001" );
                h5SWebSocketClient.binaryType = 'arraybuffer';
                h5SWebSocketClient.onmessage = function(rep){
                    // var downloadElement = document.createElement("a");
                    // var href = window.URL.createObjectURL(rep.data); //创建下载的链接
                    // downloadElement.href = href;
                    // downloadElement.download =
                    //     "已上线车位管理.mp4"; //下载后文件名
                    // document.body.appendChild(downloadElement);
                    // downloadElement.click(); //点击下载
                    // document.body.removeChild(downloadElement); //下载完成移除元素
                    // window.URL.revokeObjectURL(href); //释放掉blob对象
                    if (sourceBuffer.updating || queue.length > 0) {
                        queue.push(new Uint8Array(rep.data));
                    } else {
                        sourceBuffer.appendBuffer(new Uint8Array(rep.data));
                    }
                    // if(sourceBuffer){
                    //     sourceBuffer.appendBuffer(rep.data);
                    // }
                    console.log(rep.data)
                }
            }, false);

            mediaSource.addEventListener('sourceopen', function(e) { console.log('sourceopen: ' + mediaSource.readyState); });
            mediaSource.addEventListener('sourceended', function(e) { console.log('sourceended: ' + mediaSource.readyState); });
            mediaSource.addEventListener('sourceclose', function(e) { console.log('sourceclose: ' + mediaSource.readyState); });
            mediaSource.addEventListener('error', function(e) { console.log('error: ' + mediaSource.readyState); });
            
        } catch (e) {
            console.log(e)
        }
    }

    // sourceOpen (_) {
    //     this.sourceBuffer = this.mediaSource.addSourceBuffer(this.mediaType);
    //     console.log(this.sourceBuffer)
    //     this.sourceBuffer.addEventListener('updateend', function (_) {
    //         this.mediaSource.endOfStream();
    //         this.h5Player.play();
    //     });
        
    // }

}
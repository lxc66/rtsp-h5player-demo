<style lang="less">
    @import "./h5splayer.less";
</style>

<template>
    <div >
        <div class="h5videodiv">
            <video class="h5video" id="h5sVideo" @click="createH5Video" autoplay webkit-playsinline playsinline>
        
            </video>
            <div class="playpause" id="playpause1" @click="closeH5Video" ></div>
        </div>
    </div>
</template>

<script>
    import H5sPlayerWS from "./wsplayerC";
    export default {
        data() {
            return {
                v1: '',
                conf: {
                    videoid:'h5sVideo',
                    protocol: 'http:', //http: or https:
                    host: '127.0.0.1:8080', //localhost:8080
                    rootpath:'/', // '/' or window.location.pathname
                    token:'13a0',
                    hlsver:'v1', //v1 is for ts, v2 is for fmp4
                    session:'' //session got from login
                },
            }
        },
        methods: {
            createH5Video() {
                console.log(this.htWsPlayer)
                this.v1 = new H5sPlayerWS(this.conf)
                this.v1.connect()
            },
            closeH5Video() {
                if (this.v1) {
                }
            }

        },
        created() {
        }
    };
</script>

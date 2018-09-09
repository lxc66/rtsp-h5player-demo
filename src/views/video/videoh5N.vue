<style lang="less">
    @import "./h5splayer.less";
</style>

<template>
    <div >
        <div class="h5videodiv">
            <video class="h5video" id="videoId">
        
            </video>
            <div class="playpause" id="playpause1" @click="closeH5Video" ></div>
        </div>
        <div @click="createH5Video" ><h2>播放</h2></div>
    </div>
</template>

<script>
    import {WsPlayer} from "./wsplayerN";
    export default {
        data() {
            return {
            }
        },
        methods: {
            createH5Video() {
                new WsPlayer({
                    videoId: 'videoId',
                    host: '127.0.0.1:8001',
                });
            },
            closeH5Video() {
            }

        },
        created() {
        }
    };
</script>

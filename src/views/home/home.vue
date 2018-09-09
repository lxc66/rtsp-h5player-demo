<style lang="less">
    @import './home.less';
</style>
<template>
    <Col :md="24" :lg="10">
    <Card>
        <p slot="title">
            <Icon type="android-clipboard"></Icon>
            设备信息统计
        </p>
        <a slot="extra" @click="getDevDataAgain">
            <Icon type="ios-loop-strong"></Icon>
            刷新
        </a>
        <Row :gutter="5">
            <Col :xs="24" :sm="12" :md="12" :style="{marginBottom: '10px'}">
            <infor-card
                    id-name="user_created_count"
                    :end-val="count.devTotal"
                    iconType="aperture"
                    color="#2d8cf0"
                    intro-text="全部设备数"
            ></infor-card>
            </Col>
            <!--<Col :xs="24" :sm="12" :md="8" :style="{marginBottom: '10px'}">
            <infor-card
                    id-name="visit_count"
                    :end-val="count.online"
                    iconType="android-checkmark-circle"
                    color="#64d572"
                    :iconSize="50"
                    intro-text="已激活设备数"
            ></infor-card>
            </Col>-->
            <Col :xs="24" :sm="12" :md="12" :style="{marginBottom: '10px'}">
            <infor-card
                    id-name="collection_count"
                    :end-val="count.enable"
                    iconType="android-arrow-dropright-circle"
                    color="#ffd572"
                    intro-text="正在使用的设备数"
            ></infor-card>
            </Col>
        </Row>

    </Card>
    </Col>
</template>

<script>
    import inforCard from './components/inforCard.vue';
    import countUp from './components/countUp.vue';

    export default {
        name: "home",
        components: {
            inforCard,
            countUp
        },
        data () {
            return {
                count: {
                    devTotal: 0,//设备总数
                    online: 0,//已激活开机的设备
                    enable: 0//正在使用的设备
                },
            };
        },
      methods: {
        init() {
          this.queryDeviceData();
        },
          queryDeviceData(){
              this.$axios.get("/device/devCount").then(
                  success => {
                      this.count.devTotal = success.data.data.devTotal;
                      this.count.enable = success.data.data.enable;
                  },
                  error => {
                      console.error(error);
                  }
              );
          },
          getDevDataAgain(){
              this.count.online=0;
              this.count.devTotal=0;
              this.count.enable=0;
              this.queryDeviceData();
          }
      },
      mounted() {
        this.init();
      }
};
</script>
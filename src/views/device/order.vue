<style lang="less">
    @import '../../styles/common.less';
</style>
<template>
    <div>
        <Row :gutter="10">
            <Col>
            <Card>
                <p slot="title">
                    <Icon type="clipboard"></Icon>
                    充值记录
                </p>
                <Row>
                    <form :action="exportAction" method="post" id="orderForm" name="orderForm" ref="orderForm">
                    <Input v-model="code"  @on-change="checkInput('code')" placeholder="订单编号" style="width: 170px" name="code" />
                    <Input v-model="imei"  @on-change="checkInput('imei')" placeholder="设备IMEI号" style="width:170px" name="imei"/>
                    <Select v-model="status" name="status" style="width:128px" @on-change="checkInput('status')" placeholder="订单状态">
                        <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.displayName }}</Option>
                    </Select>
                    <date-picker @on-clear="search()" name="createdAt1" type="datetime" placeholder="起始时间" v-model="createdAt1" style="width: 160px"></date-picker>
                    —
                    <date-picker @on-clear="search()" name="createdAt2" type="datetime" placeholder="结束日期" v-model="createdAt2" style="width: 160px"></date-picker>
                    <Button type="info" @click="search()"><Icon type="ios-search-strong"></Icon>&nbsp;&nbsp;搜索</Button>
                    <Button type="primary" @click="searchAll()"><Icon type="refresh"></Icon>&nbsp;&nbsp;重置</Button>
                    <Button  @click="exportExcel()"><Icon type="android-download"></Icon>&nbsp;&nbsp;导出excel</Button>
                    </form>
                </Row>
                <Row class="margin-top-10 searchable-table-con1">
                    <Table border  stripe :columns="columns" :data="orderData" :loading="loading"></Table>
                    <Page :total="dataCount" :page-size="pageSize" show-total show-elevator show-sizer  @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="pageSizeOpts"></Page>
                </Row>
            </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
    import util from '@/libs/util'
    import dayjs from 'dayjs';
    export default {
        name: 'order',
        data () {
            return {
                pageSizeOpts:[10,20,50,100,200],
                exportAction:util.baseUrl + "/order/export",
                loading:false,
                //搜索关键词,code,imei,status,createdAt
                code: null,//订单编号
                imei: '',//设备imei号
                status: '',//订单状态，1待付款，2充值成功，已退款
                createdAt1: null,//下单时间（起始）
                createdAt2: null,//下单时间（结束）
                statusList:'',//订单状态下拉内容

                //下面的用于订单table
                orderData: [],//订单列表数据
                columns: [//订单table的表头
                    {
                        key: 'code',
                        title: '订单编号',
                        align: 'center'
                    },
                    {
                        key: 'device',
                        title: '设备IMEI号',
                        align: 'center',
                        render: function (h, params) {
                             return h('div',this.row.device.imei);
                        }
                    },
                    {
                        key: 'phone',
                        title: '用户手机号',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.user == null){
                                return h('--');
                            }else {
                                return h('div',this.row.user.phone);
                            }
                        }
                    },
                    {
                        key: 'ip',
                        title: '下单IP地址',
                        width: 128,
                        align: 'center',
                    },
                    {
                        key: 'type',
                        title: '订单类型',
                        width: 110,
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.type==1){
                                return "基础套餐充值";
                            }else if(this.row.type==2){
                                return "叠加包充值";
                            }
                        }
                    },
                    {
                        key: 'amount',
                        title: '支付金额',
                        width: 95,
                        align: 'center',
                        render: function (h, params) {
                            return h('div','￥'+(this.row.product.price/100).toFixed(2));
                        }
                    },
                    {
                        key: 'product',
                        title: '高速流量',
                        width: 90,
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.type==1){
                                return h('div',(this.row.product.flow)<1048576?(this.row.product.flow/1024).toFixed(0)+'MB':(this.row.product.flow/1048576).toFixed(0)+'GB/月');
                            }if(this.row.type==2){
                                return h('div',(this.row.product.flow)<1048576?(this.row.product.flow/1024).toFixed(0)+'MB':(this.row.product.flow/1048576).toFixed(0)+'GB');
                            }

                        }
                    },
                    {
                        key: 'month',
                        title: '生效月数',
                        width: 95,
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.type==1){
                                return h('div',(this.row.product.month));
                            }if(this.row.type==2){
                                return h('div',1);
                            }
                        }
                    },
                    {
                        key: 'status',
                        title: '订单状态',
                        width:90,
                        align: 'center',
                        render: function (h, params) {
                            switch (this.row.status) {
                                case 1:
                                    return h('div',{style:{color: '#FF5500','font-weight':'bold'}},"待付款");
                                    break;
                                case 2:
                                    return h('div',{style:{color: '#3DB55E','font-weight':'bold'}},"充值成功")
                                    break;
                                case 3:
                                    return h('div',{style:{color: '#b4b4b4','font-weight':'bold'}},"已退款")
                                    break;
                            }
                        }
                    },
                    {
                        key: 'createdAt',
                        title: '下单时间',
                        width: 145,
                        align: 'center',
                        render: function (h, params) {
                            return h('div',dayjs(new Date(this.row.createdAt)).format('YY-MM-DD HH:mm:ss'));
                        }
                    }
                ],

                //下面的用于分页组件
                dataCount:0,//订单列表数据总数
                pageSize:10,// 每页显示多少条
                pageNum:1,//页数
            };
        },
        methods: {
            //**********下面各按钮相关处理函数***********
            exportExcel(){
                 this.$refs.orderForm.submit();
            },
            checkInput(searchType){//搜索输入框变化时调用
                if(searchType=='code'){
                    if(this.code==''||(!this.code)) {
                        this.search();
                    }
                }else if(searchType=='imei'){
                    if(this.imei==''||(!this.imei)) {
                        this.search();
                    }
                }else if(searchType=='status'){
                    if(this.status==''||(!this.status)) {
                        this.search();
                    }
                }
            },
            search () {//搜索按钮
                this.pageNum=1;//页数，恢复到第一页
                this.queryOrderList();
            },
            searchAll(){
                //清空条件，重新查询
                this.pageNum=1;
                this.code= null;//订单编号
                this.imei= '';//设备imei号
                this.status= '';//订单状态，1待付款，2充值成功，3已退款
                this.createdAt1= '';//下单时间（起始）
                this.createdAt2= '';//下单时间（结束）
                this.search ();
            },

            //*************下面为分页组件的相关函数****************
            changePage(index){//页数改变,index为页数
                this.pageNum=index;
                this.queryOrderList();
            },
            changePageSize(index){//改变每页条数,index为每页条数
                this.pageSize =index;
                this.queryOrderList();
            },

            //****************下面为各项ajax请求数据函数************
            queryOrderList(){//查询订单列表函数
                this.loading=true
                let self = this
                this.$axios.get('order/list',
                    {
                        params:{
                            page:this.pageNum,
                            pageSize:this.pageSize,
                            code:this.code,
                            imei:this.imei,
                            status:this.status == 'all'?'':this.status,
                            createdAt1:this.timeChange(this.createdAt1),
                            createdAt2:this.timeChange(this.createdAt2)
                        }
                    }
                )
                    .then((success)=>{
                        self.loading = false
                        var data = success.data.data;
                        var orderListTemp = data.rows;
                        this.orderData = orderListTemp;
                        this.dataCount = data.total;
                    },(fail)=>{
                        self.loading = false
                        console.log(fail)
                    })
            },

            /**
             * 获取订单状态搜索框下拉内容请求函数
             */
            queryOrder(){
                this.$axios.get('/order/getOrderStatusEnum').then((success)=>{
                    if(success.data){
                        let orderLists = success.data.data;
                        let defaultOrder = {
                            "displayName": "选择订单状态",
                            "value": 'all'
                        }
                        orderLists.unshift(defaultOrder);
                        this.statusList = orderLists;
                    }
                },(fail)=>{
                    console.info(fail)
                })
            },

            //*********其他共用函数***********
            timeChange(dateDay) {//时间转换函数
                if(!dateDay)
                    return null;
                    return dayjs(dateDay).format('YYYY-MM-DD HH:mm:ss');
            },
            init () {//初始化函数，用于初始化获取各类列表等
                this.queryOrderList();//初始化查询订单列表
                this.queryOrder();//初始化查询订单搜索下拉内容
            }

        },//以上为methods

        //初始化运行下面函数
        mounted () {
            this.init();//执行初始化函数初始化页面
        }
    };

</script>

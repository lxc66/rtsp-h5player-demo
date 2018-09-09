<template>
    <div>
        <Row :gutter="10">
            <Col>
            <Card>
                <p slot="title">
                    <Icon type="ios-body"></Icon>
                    用户信息
                </p>
                <Row>
                    <form :action="exportAction" method="post" id="userForm" name="userForm" ref="userForm">
                    <Input v-model="phone" @on-change="checkPhoneInput()" placeholder="手机号码" style="width: 140px" />
                    <Input v-model="imei" @on-change="checkImeiInput()" placeholder="设备IMEI号" style="width: 140px" />
                    <Select  v-model="agentModel" @on-change="changeAgent" filterable style="width:180px;" placeholder="所属代理商">
                        <Option v-for="item in agentList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>
                    <Button type="info" @click="search()"><Icon type="ios-search-strong"></Icon>&nbsp;&nbsp;搜索</Button>
                    <Button type="primary" @click="searchAll()"><Icon type="refresh"></Icon>&nbsp;&nbsp;重置</Button>
                    <Button  @click="exportExcel()"><Icon type="android-download"></Icon>&nbsp;&nbsp;导出excel</Button>
                    </form>
                </Row>
                <Row class="margin-top-10 searchable-table-con1">
                    <Table border  stripe :columns="userTitle" :data="userListData" ref="selection" @on-selection-change="selectRowChange" :loading="loading"></Table>
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
        name: 'devList',
        data () {
            return {
                pageSizeOpts:[10,20,50,100,200],
                exportAction:util.baseUrl + "/user/export?type=4",
                //下面的用于修改样式
                loading: false,
                agentList: '',//存放所属代理商下拉显示数据
                agentModel:'',//存放下拉选中代理商的名称
                agentType:3,//查询账号类型为二级代理商的用户


                //下面的用于标记或按钮相关数据
                phone:'',//用于手机号码搜索词关键词
                imei:'',//用于IMEI号搜索词关键词

                //下面字段用于设备表table
                selectedData:[],//列表中选中的条目
                userListData: [],//存放用户列表查询数据
                userTitle: [//用户table的表头
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        key: 'phone',
                        title: '手机号码',
                        align: 'center',
                    },
                    {
                        key: 'imei',
                        title: '设备IMEI号',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.device == null){
                                return '--';
                            }else {
                                return this.row.device.imei;
                            }
                        }
                    },
                    {
                        key: 'sim',
                        title: 'SIM卡号',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.device == null){
                                return '--';
                            }else {
                                return this.row.device.sim;
                            }
                        }
                    },
                    {
                        key: 'outAgentTwo',
                        title: '所属代理商',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.outAgentTwo == null){
                                return '--';
                            }else {
                                return this.row.outAgentTwo.name;
                            }
                        }
                    },
                    {
                        key: 'createdAt',
                        title: '创建时间',
                        width: 145,
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.createdAt == null){
                                return '--';
                            }else {
                                return h('div',dayjs(new Date(this.row.createdAt)).format('YY-MM-DD HH:mm:ss'));
                            }

                        }
                    },
                    {
                        key: 'device',
                        title: '套餐截止时间',
                        width: 145,
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.device == null){
                                return '--';
                            }else {
                                return h('div',{style:{color: '#2e8cf0','font-weight':'bold'}},dayjs(new Date(this.row.device.deadtime)).format('YY-MM-DD HH:mm:ss'));
                            }
                        }
                    },
                ],

                //下面的用于分页组件
                dataCount:0,//用户列表数据总数
                pageSize:10,// 每页显示多少条
                pageNum:1,//页数
            };
        },
        methods: {

            exportExcel(){
                 this.$refs.userForm.submit();
            },

            init () {//初始化函数，用于初始化获取各类列表等
                this.queryUserList();//初始化查询用户列表
                this.queryAgentList();//初始化查询代理商列表
            },

            //**********下面各按钮相关处理函数***********
            checkPhoneInput(){//电话搜索输入框变化时调用
                if(this.phone==''||(!this.phone)){
                    this.search();
                }
            },
            checkImeiInput(){//imei号搜索输入框变化时调用
                if(this.imei==''||(!this.imei)){
                    this.search();
                }
            },
            changeAgent(){//选中发生变化时还回选中设备的ID
                if(this.agentModel=='all'||(!this.imei)){
                    this.search();
                }
            },
            search () {//条件搜索按钮
                this.pageNum=1;//页数，恢复到第一页
                this.queryUserList();
            },

            searchAll(){//全部查询
                this.pageNum=1;//页数，恢复到第一页
                this.phone = '';
                this.imei = '';
                this.agentModel = '';
                this.queryUserList();
            },

            //***********下面为表格相关处理函数*************

            selectRowChange(selection){//用户表格勾选变化时触发
                this.selectedData=selection;
            },

            //*************下面为分页组件的相关函数****************
            changePage(index){//页数改变,index为页数
                this.pageNum=index;
                this.queryUserList();
            },
            changePageSize(index){//改变每页条数,index为每页条数
                this.pageSize =index;
                this.queryUserList();
            },

            //****************下面为各项ajax请求数据函数************
            queryUserList(){//查询设备列表方法
                this.loading=true;
                let self = this;
                let type = 4;
                this.$axios.get('/user/list',
                    {
                        params: {
                            page: this.pageNum,
                            pageSize:this.pageSize,
                            phone:this.phone,
                            imei:this.imei,
                            outAgentTwoId:this.agentModel == 'all'?'':this.agentModel,
                            type:type
                        }
                    }).then((success)=>{
                        self.loading = false;
                        if(success.data.status){
                            this.userListData = success.data.data.rows;
                            this.dataCount = success.data.data.total;
                        }
                },(fail)=>{
                    this.loading = false;
                    console.info(fail)
                })
            },
            queryAgentList(){//代理商查询方法
                this.$axios.get('/user/list',
                    {
                        params: {
                            page:1,
                            pageSize:9999,
                            type: this.agentType
                        }
                    }).then((success)=>{
                    if(success.data.status){
                        let agentLists = success.data.data.rows;
                        let defaultAgent = {
                            "name": "选择所属代理商",
                            "id": 'all'
                        }
                        agentLists.unshift(defaultAgent);
                        this.agentList = agentLists;
                    }
                },(fail)=>{
                    this.loading = false;
                    console.info(fail)
                })
            },

            //*********其他共用函数***********
            warn(message) {//提醒函数，message为提醒内容
                this.$Message.warning({
                    duration: 2,
                    content: `<span style="font-size: 14px;font-weight: bold;">温馨提示</span><br><br>`+message
                });
            },
            success(message) {//提醒函数，message为提醒内容
                this.$Message.success({
                    duration: 2,
                    content: `<span style="font-size: 14px;font-weight: bold;">温馨提示</span><br><br>`+message
                });
            },

        },//以上为methods

        //初始化运行下面函数
        mounted () {
            this.init();//执行初始化函数初始化页面
        }
    };
</script>

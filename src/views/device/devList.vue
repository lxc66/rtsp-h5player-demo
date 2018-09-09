<template>
    <div>
        <Row :gutter="10">
            <Col>
            <Card>
                <p slot="title">
                    <Icon type="clipboard"></Icon>
                    设备列表
                </p>
                <Row>
                    <Input v-model="account" @on-change="checkInput()" placeholder="设备IMEI号" style="width: 140px" />
                    <i-select v-model="wifiModel" style="width:140px" placeholder="wifi状态">
                        <i-option v-for="item in wifiList" :value="item.value" :key="item.value">{{ item.displayName }}</i-option>
                    </i-select>
                    <i-select v-model="enableModel" style="width:140px" placeholder="使用状态">
                        <i-option v-for="item in enableList" :value="item.value" :key="item.value">{{ item.displayName }}</i-option>
                    </i-select>
                    <Button type="info" @click="search()"><Icon type="ios-search-strong"></Icon>&nbsp;&nbsp;搜索</Button>
                    <Button type="primary" @click="searchAll()"><Icon type="refresh"></Icon>&nbsp;&nbsp;重置</Button>
                    <div style="margin-top: 10px;">
                        <Button type="primary" @click="flowControl()"><Icon type="shuffle"></Icon>&nbsp;&nbsp;流速控制</Button>
                        <Button type="success" @click="wifiControl()"><Icon type="wifi"></Icon>&nbsp;&nbsp;WIFI控制</Button>
                        <Button type="error" @click="unbind()"><Icon type="flash-off"></Icon>&nbsp;&nbsp;解除绑定</Button>
                    </div>
                </Row>
                <Row class="margin-top-10 searchable-table-con1">
                    <Table border  stripe :columns="columns" :data="devData" ref="selection" @on-selection-change="selectRowChange" :loading="loading"></Table>
                    <Page :total="dataCount" :page-size="pageSize" show-total show-elevator show-sizer  @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="pageSizeOpts"></Page>
                </Row>
            </Card>
            </Col>
        </Row>
        <modal v-model="modalFlow"
               :styles="{top:'15px'}"
               width="500">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>流速控制</span>
            </p>
            <div style="text-align:center;width:60%;margin-left: 10%;">
                <i-form ref="flowForm" :model="flowForm" :rules="flowFormRules" :label-width="85">
                    <form-item prop="flowUpSpeed">
                        <i-input v-model="flowForm.flowUpSpeed" :maxlength="8">
                            <span slot="prepend">上行流量速度</span>
                            <span slot="append">KB/s</span>
                        </i-input>
                    </form-item>
                    <form-item prop="flowDownSpeed">
                        <i-input v-model="flowForm.flowDownSpeed" :maxlength="8">
                            <span slot="prepend">下行流量速度</span>
                            <span slot="append">KB/s</span>
                        </i-input>
                    </form-item>
                </i-form>
            </div>
            <div slot="footer">
                <Button type="info" size="large" @click="cancel(2)">取消</Button>
                <Button type="success" size="large" @click="updateFlow">提交</Button>
            </div>
        </modal>
        <modal v-model="modalWifi"
               :styles="{top:'15px'}"
               width="400">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>WIFI控制</span>
            </p>
            <div style="text-align:center;width:40%;margin-left: 24%;">
                <i-form ref="wifiForm" :model="wifiForm" :label-width="100">
                    <form-item label="WIFI状态
                    ：">
                        <i-switch v-model="wifiSwitchValue" size="large" :true-value="2" :false-value="1"  @on-change="wifiSwitchChange" >
                            <span slot="open">激活</span>
                            <span slot="close">停止</span>
                        </i-switch>
                    </form-item>
                </i-form>
            </div>
            <div slot="footer">
                <Button type="info" size="large" @click="cancel(4)">取消</Button>
                <Button type="success" size="large" @click="updateWifi">提交</Button>
            </div>
        </modal>
    </div>
</template>

<script>
    import dayjs from 'dayjs';
    export default {
        name: 'devList',
        data () {
            const flowFormRule = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('流速不能为空！'));
                }
                var reg = /^[1-9]\d*$/;
                if (!(reg.test(value))) {
                    callback(new Error('请输入正确的数值(正整数)'));
                }else {
                    callback();
                }
            };
            const imeiRule = (rule, value, callback) => {
                var rule = /^[0-9]{15}$/;
                if (!(rule.test(value))) {
                    callback(new Error('请输入15位设备imei号'));
                }
                else {
                    callback();
                }
            }
            const simFormRule = (rule, value, callback) => {
                var rule = /(?:^1[3456789]|^9[28])\d{9}$/;
                if (!(rule.test(value))) {
                    callback(new Error('请输入正确的手机号码'));
                }
                else {
                    callback();
                }
            };
            return {
                //下面的用于修改样式
                pageSizeOpts:[10,20,50,100,200],
                loading: false,
                modalDevice:false,//设备新增修改框默认隐藏（模态框）
                modalFlow:false,//控制上下行流量框默认隐藏（模态框）
                modalWifi:false,//控制WiFi开启关闭默认隐藏（模态框）
                modalFlo:false,
                abled:true,

                wifiList: '',//WiFi状态下拉
                wifiModel:'',//WiFi状态下拉选中值value
                enableList: '',//使用状态下拉
                enableModel:'',//使用状态下拉选中值value


                //下面的用于标记或按钮相关数据
                account: '',//用于搜索词关键词

                //下面字段用于设备表table
                selectedData:[],//列表中选中的条目
                devData: [],//设备列表数据
                columns: [//用户table的表头
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        key: 'imei',
                        title: '设备IMEI号',
                        align: 'center'
                    },
                    {
                        key: 'sim',
                        title: 'SIM卡号',
                        align: 'center',

                    },
                    {
                        key: 'active',
                        title: 'WIFI状态',
                        align: 'center',
                        render: function (h, params) {
                            switch (this.row.active) {
                                case 1:
                                    return h('div',{style:{color: '#FF4040	','font-weight':'bold'}},"停止");
                                    break;
                                case 2:
                                    return h('div',{style:{color: '#3DB55E','font-weight':'bold'}},"激活");
                                    break;
                            }
                        }
                    },
                    {
                        key: 'enable',
                        title: '使用状态',
                        align: 'center',
                        render: function (h, params) {
                            switch (this.row.enable) {
                                case 1:
                                    return h('div',{style:{color: '#FF4040	','font-weight':'bold'}},"未使用");
                                    break;
                                case 2:
                                    return h('div',{style:{color: '#3DB55E','font-weight':'bold'}},"使用中");
                                    break;
                            }
                        }
                    },
                    {
                        key: 'flowUpSpeed',
                        title: '流速控制（↑上行）',
                        align: 'center',
                        render: function (h, params) {

                            if(this.row.flowUpSpeed == null || this.row.flowUpSpeed > 12800){
                                return h('strong',"无限制");
                            }else if(this.row.flowUpSpeed >= 1024){
                                return h('strong',this.row.flowUpSpeed/1024  + " MB/s");
                            }else {
                                return h('strong',this.row.flowUpSpeed  + " KB/s");
                            }
                        }

                    },
                    {
                        key: 'flowDownSpeed',
                        title: '流速控制（↓下行）',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.flowDownSpeed == null || this.row.flowDownSpeed > 12800){
                                return h('strong',"无限制");
                            }else if(this.row.flowDownSpeed >= 1024){
                                return h('strong',this.row.flowDownSpeed/1024  + " MB/s");
                            }else{
                                return h('strong',this.row.flowDownSpeed  + " KB/s");
                            }
                        }
                    },
                    {
                        key: 'highUseFlow',
                        title: '已使用高速流量',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',{style: {'font-weight': 'bold'}},(this.row.highUseFlow)<1048576?(this.row.highUseFlow/1024).
                                toFixed(0)+'MB':(this.row.highUseFlow/1048576).toFixed(0)+'GB');
                        }
                    },
                    {
                        key: 'highTotalFlow',
                        title: '总高速流量',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',{style: {'font-weight': 'bold'}},(this.row.highTotalFlow)<1048576?(this.row.highTotalFlow/1024).toFixed(0)+'MB':(this.row.highTotalFlow/1048576).toFixed(0)+'GB');
                        }
                    },
                    {
                        key: 'lowUseFlow',
                        title: '已使用普通流量',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',{style: {'font-weight': 'bold'}},(this.row.lowUseFlow)<1048576?(this.row.lowUseFlow/1024).toFixed(0)+'MB':(this.row.lowUseFlow/1048576).toFixed(0)+'GB');
                        }
                    },
                    {
                        key: 'limitFlow',
                        title: '下次限流流量',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',{style: {'font-weight': 'bold'}},(this.row.limitFlow)<1048576?(this.row.limitFlow/1024).toFixed(0)+'MB':(this.row.limitFlow/1048576).toFixed(0)+'GB');
                        }
                    },
                    {
                        key: 'deadtime',
                        title: '套餐截止日期',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.deadtime == null || this.row.deadtime == ''){
                                return h('div',dayjs(new Date()).format('YY-MM-DD HH:mm:ss'))
                            }else {
                                return h('div',{style:{color: '#2e8cf0','font-weight':'bold'}},dayjs(new Date(this.row.deadtime)).format('YY-MM-DD HH:mm:ss'));
                            }
                        }
                    },
                ],

                unitList:[
                    {
                        value: 'KB',
                        label: 'KB'
                    },
                    {
                        value: 'MB',
                        label: 'MB'
                    },
                    {
                        value: 'GB',
                        label: 'GB'
                    }
                ],
                unit:'',
                selectValue:'',//选中的单位
                placeholder:'单位',

                //下面的用于分页组件
                dataCount:0,//设备列表数据总数
                pageSize:10,// 每页显示多少条
                pageNum:1,//页数

                ruleValidate: {//表单规则控制
                    name: [
                        { required: true, message: '设备名称不能为空', trigger: 'blur' }
                    ],
                    imei: [
                        { required: true, message: '设备imei号不能为空', trigger: 'blur' },
                        { validator: imeiRule, trigger: 'blur' }
                    ],
                    sim: [
                        { required: true, message: '手机号码不能为空!', trigger: 'blur' },
                        { validator: simFormRule, trigger: 'blur' }
                    ]
                },
                flowForm:{//流速控制表单数据
                    ids:'',
                    flowUpSpeed:'',
                    flowDownSpeed:''
                },
                flowFormRules:{//流速控制表单数据规则
                    flowUpSpeed: [
                        { validator: flowFormRule, trigger: 'blur' }
                    ],
                    flowDownSpeed: [
                        { validator: flowFormRule, trigger: 'blur' }
                    ]
                },
                totalFlow:'',//存放转换为KB的总流量
                wifiForm:{//WiFi表单数据
                    ids:'',
                    switchValue:''
                },
                wifiSwitchValue:1,//默认开关选择关闭
                unbindIds:'',

            };
        },
        methods: {

            init () {//初始化函数，用于初始化获取各类列表等
                this.queryDevList();//初始化查询用户列表
                this.queryDevActive();//初始化查询WIFI状态下拉内容
                this.queryDevEnable();//初始化查询使用状态下拉内容
            },

            selectChange(value){//下拉选中的元素
                this.selectValue = value;
            },

            wifiSwitchChange(change){//WiFi开关改变函数
                this.wifiForm.switchValue = change;
            },

            //**********下面各按钮相关处理函数***********
            checkInput(){//搜索输入框变化时调用
                if(this.account==''||(!this.account)){
                    this.search();
                }
            },
            search () {//条件搜索按钮
                this.pageNum=1;//页数，恢复到第一页
                this.queryDevList();
            },

            searchAll(){//全部查询
                this.pageNum=1;//页数，恢复到第一页
                this.account = '';
                this.offOnModel = '';
                this.wifiModel = '';
                this.enableModel = '';
                this.queryDevList();
            },

            flowControl(){//流速控制按钮
                if(this.selectedData.length<1){//限制只能选择一条数据编辑
                    this.warn("请至少选择一台设备进行操作");
                    return false;
                };
                this.$refs.flowForm.resetFields();
                let flowIds = [];
                for(let i=0;i<this.selectedData.length;i++){//更新selectedRoleIds数组
                    flowIds.push(this.selectedData[i].id)
                }
                flowIds = flowIds.join(",");
                this.flowForm.ids = flowIds;
                this.modalFlow=true;
            },
            updateFlow(){//流速控制提交按钮
                this.$refs.flowForm.validate((valid) => {
                    if (valid) {
                        this.ctrlFlowSpeed();
                        //成功后关闭模态框>>>写在Ajax请求后
                        this.modalFlow=false;
                    }
                })
            },
            wifiControl(){//WIFI控制按钮
                if(this.selectedData.length<1){//限制只能选择一条数据编辑
                    this.warn("请至少选择一台设备进行操作");
                    return false;
                };
                this.$refs.wifiForm.resetFields();
                let flowIds = [];
                for(let i=0;i<this.selectedData.length;i++){//更新selectedRoleIds数组
                    flowIds.push(this.selectedData[i].id)
                }
                flowIds = flowIds.join(",");
                this.wifiForm.ids = flowIds;
                this.modalWifi=true;
            },
            updateWifi(){//WIFI控制提交按钮
                if(this.wifiForm.switchValue == ''){
                    this.wifiForm.switchValue = this.wifiSwitchValue;
                }
                this.active();
                //成功后关闭模态框>>>写在Ajax请求后
                this.modalWifi=false;
            },
            cancel(index){//模态框取消按钮
                if(index==2){
                    this.modalFlow=false;
                }
                else if(index==4){
                    this.modalWifi=false;
                }
            },

            unbind(){
                if(this.selectedData.length<1){//限制只能选择一条数据编辑
                    this.warn("请至少选择一台设备进行操作");
                    return false;
                }else if(this.selectedData.length>1){
                    this.warn("只能选择一条设备进行操作，请从新选择！！！");
                    return false;
                }
                this.$Modal.confirm({
                    title: '警告',
                    content: '<h3>当前操作为不可逆操作，请谨慎操作!!!</h3>'+'<br>' + '<h3>确定要解除绑定选中的设备吗？</h3>',
                    onOk: () => {
                        let flowIds = [];
                        for(let i=0;i<this.selectedData.length;i++){//更新selectedRoleIds数组
                            flowIds.push(this.selectedData[i].id)
                        }
                        flowIds = flowIds.join(",");
                        this.unbindIds = flowIds;
                        this.$axios.post('/device/unbind',{ids:this.unbindIds})
                            .then((success)=>{
                                if(success.data.status==true){
                                    this.success('已成功解除绑定选中的设备！！！');
                                    this.unbindIds = '';
                                    this.queryDevList();//上架或下架成功，重新查询列表
                                }else {
                                    this.warn(success.data.message);
                                }
                            },(fail)=>{
                                console.log(fail);
                            }
                        );
                    },
                    onCancel: () => {
                        console.log("取消-->不操作");
                    }
                });
            },

            //***********下面为表格相关处理函数*************

            selectRowChange(selection){//用户表格勾选变化时触发
                this.selectedData=selection;
            },

            //*************下面为分页组件的相关函数****************
            changePage(index){//页数改变,index为页数
                this.pageNum=index;
                this.queryDevList();
            },
            changePageSize(index){//改变每页条数,index为每页条数
                this.pageSize =index;
                this.queryDevList();
            },

            //****************下面为各项ajax请求数据函数************
            queryDevList(){//查询设备列表方法
                this.loading=true
                let status = 6;
                this.$axios.get('/device/list',
                    {
                        params: {
                            page: this.pageNum,
                            pageSize:this.pageSize,
                            status:status,
                            imei:this.account,
                            offOn:this.offOnModel,
                            active:this.wifiModel == 'all'?'':this.wifiModel,
                            enable:this.enableModel == 'notSelected'?'':this.enableModel
                        }
                    }).then((success)=>{
                        self.loading = false;
                        if(success.data.status){
                            this.loading = false;
                            this.devData = success.data.data.rows;
                            this.dataCount = success.data.data.total;
                        }
                    },(fail)=>{
                        this.loading = false;
                        console.info(fail)
                    })
            },
            ctrlFlowSpeed(){//修改上下行流速方法
                this.$axios.post('/device/flowSpeed',{
                    flowUpSpeed:this.flowForm.flowUpSpeed,
                    flowDownSpeed:this.flowForm.flowDownSpeed,
                    ids:this.flowForm.ids
                }).then((success)=>{
                    if(success.data.status){
                        this.success('设置成功');
                        this.selectedData = '';
                        this.queryDevList();//更新成功，重新查询用户列表
                    }else {
                        this.warn(success.data.message);
                    }
                },(fail)=>{
                    console.log(fail)
                });
            },
            active(){//单个或批量激活或者停止wifi
                this.$axios.post('/device/active',{
                    ids:this.wifiForm.ids,
                    active:this.wifiForm.switchValue
                }).then((success)=>{
                    if(success.data.status){
                        this.success('设置成功');
                        this.selectedData = '';
                        this.wifiForm.switchValue = '';
                        this.queryDevList();//更新成功，重新查询用户列表
                    }else {
                        this.warn(success.data.message);
                    }
                },(fail)=>{
                    console.log(fail)
                });
            },

            /**
             * 获取设备WIFI状态搜索框下拉内容请求函数
             */
            queryDevActive(){
                this.$axios.get('/device/getActiveEnum').then((success)=>{
                    if(success.data){
                        let activeLists = success.data.data;
                        let defaultActive = {
                            "displayName": "选择WIFI状态",
                            "value": 'all'
                        }
                        activeLists.unshift(defaultActive);
                        this.wifiList = activeLists;
                    }
                },(fail)=>{
                    console.info(fail)
                })
            },

            /**
             * 获取设备使用状态搜索框下拉内容请求函数
             */
            queryDevEnable(){
                this.$axios.get('/device/getEnableEnum').then((success)=>{
                    if(success.data){
                        let enableLists = success.data.data;
                        let defaultEnable = {
                            "displayName": "选择使用状态",
                            "value": 'notSelected'
                        }
                        enableLists.unshift(defaultEnable);
                        this.enableList = enableLists;
                    }
                },(fail)=>{
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

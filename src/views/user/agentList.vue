<template>
    <div>
        <Row :gutter="10">
            <Col>
            <Card>
                <p slot="title">
                    <Icon type="ios-body"></Icon>
                    代理商信息
                </p>
                <Row>
                    <Input v-model="account" @on-change="checkInput('account')" placeholder="用户账号" style="width: 140px" />
                    <Input v-model="name" @on-change="checkInput('name')" placeholder="用户名称" style="width: 140px" />
                    <Input v-model="phone" @on-change="checkInput('phone')" placeholder="手机号码" style="width: 140px" />
                    <i-select v-model="disableModel" @on-change="checkInput('disableModel')" style="width:140px" placeholder="状态">
                        <i-option v-for="item in disableList" :value="item.value" :key="item.value">{{ item.displayName }}</i-option>
                    </i-select>
                    <i-select v-model="agentType"  style="width:140px" placeholder="代理商类型">
                        <i-option v-for="item in agentTypeList" :value="item.value" :key="item.value">{{ item.displayName }}</i-option>
                    </i-select>
                    <Button type="info" @click="search()"><Icon type="ios-search-strong"></Icon>&nbsp;&nbsp;搜索</Button>
                    <Button type="primary" @click="searchAll()"><Icon type="refresh"></Icon>&nbsp;&nbsp;重置</Button>
                    <div style="margin-top: 10px;">
                        <Button type="primary" @click="openAdd()"><Icon type="android-add-circle"></Icon>&nbsp;&nbsp;新增</Button>
                        <ButtonGroup v-if="showDisableBtn">
                            <Button type="error" @click="agentDisabled(1)"><Icon type="android-cancel"></Icon>&nbsp;&nbsp;禁用</Button>
                            <Button type="success" @click="agentDisabled(2)" ><Icon type="android-checkmark-circle"></Icon>&nbsp;&nbsp;启用</Button>
                        </ButtonGroup>
                    </div>
                </Row>
                <Row class="margin-top-10 searchable-table-con1">
                    <Table border  stripe :columns="agentTitle" :data="agentListData" ref="selection" @on-selection-change="selectRowChange" :loading="loading"></Table>
                    <Page :total="dataCount" :page-size="pageSize" show-total show-elevator show-sizer  @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="pageSizeOpts"></Page>
                </Row>
            </Card>
            </Col>
        </Row>
        <modal v-model="modalAgent"
               :styles="{top:'15px'}"
               width="500">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>{{isNew?'新增一级代理商':'修改一级代理商信息'}}</span>
            </p>
            <div style="text-align:center;width:70%;margin-left: 10%;">
                <i-form ref="agentForm" :model="agentForm" :rules="ruleValidate" :label-width="100">
                    <form-item label="登录账号" prop="account">
                        <i-input v-model="agentForm.account" placeholder="登录账号" :disabled="disabled" ></i-input>
                    </form-item>
                    <form-item label="用户名称" prop="name">
                        <i-input v-model="agentForm.name" placeholder="用户名称" :disabled="disabled" ></i-input>
                    </form-item>
                    <form-item label="手机号码" prop="phone">
                        <i-input v-model="agentForm.phone" placeholder="手机号码"></i-input>
                    </form-item>
                    <form-item label="固定电话" prop="tel">
                        <i-input v-model="agentForm.tel" placeholder="固定电话"></i-input>
                    </form-item>
                </i-form>
            </div>
            <div slot="footer">
                <Button type="info" size="large" @click="cancel(1)">取消</Button>
                <Button type="success" size="large" @click="updateAgent">提交</Button>
            </div>
        </modal>
        <modal v-model="modalCommission"
               :styles="{top:'15px'}"
               width="500"
               @on-cancel="cancel">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>计算代理商分成</span>
            </p>
            <div style="text-align:center;width:70%;margin-left: 10%;">
                <i-form ref="commissionForm" :model="commissionForm" :rules="ruleCommission" :label-width="100">
                    <form-item label="起始月份:">
                        <date-picker name="createdAt1" type="month" placeholder="请选择起始月份..." v-model="commissionForm.createdAt1"></date-picker>
                    </form-item>
                    <form-item label="结束月份:">
                        <date-picker name="createdAt2" type="month" placeholder="请选择结束月份..." v-model="commissionForm.createdAt2"></date-picker>
                    </form-item>
                    <form-item label="充值总额:">
                        <i-input :disabled="disabled" v-model="commissionForm.totalRecharge">
                            <span slot="append">元</span>
                        </i-input>
                    </form-item>
                    <form-item label="分成比例:" prop="royaltyRate">
                        <span style="width: 50%;display: inline-block;">
                            <i-input v-model="commissionForm.royaltyRate" :maxlength="2">
                                <span slot="append">%</span>
                            </i-input>
                        </span>
                        <span style="display: inline-block;vertical-align: text-bottom;color: #FF3030;margin-left: 20px">*输入0-99的数字</span>
                    </form-item>
                    <form-item label="分成金额:">
                        <i-input :disabled="disabled" v-model="commissionForm.royaltyQuota">
                            <span slot="append">元</span>
                        </i-input>
                    </form-item>
                </i-form>
            </div>
            <div slot="footer" style="text-align: center">
                <Button type="success" size="large" @click="calculationAndPartition">计算分成</Button>
            </div>
        </modal>
    </div>
</template>

<script>
    import dayjs from 'dayjs';
    export default {
        name: 'devList',
        data () {
            const accountFormRule = (rule, value, callback) => {
                let reg = /^[a-zA-Z0-9_]{4,16}$/;
                if (!(reg.test(value))) {
                    callback(new Error('请按照正确的格式输入(4-16位字母、数字、下划线)'));
                }else {
                    callback();
                }
            };
            const nameFormRule = (rule, value, callback) => {
                let reg =/^[\u4E00-\u9FA5a-zA-Z0-9_]{3,16}$/;
                if (!(reg.test(value))) {
                    callback(new Error('请按照正确的格式输入(3-16位中文、字母、数字、下划线)'));
                }else {
                    callback();
                }
            };
            const phoneFormRule = (rule, value, callback) => {
                var rule = /(?:^1[3456789]|^9[28])\d{9}$/;
                if (!(rule.test(value))) {
                    callback(new Error('请输入正确的手机号码'));
                }
                else {
                    callback();
                }
            };
            const telFormRule = (rule, value, callback) => {
                var rule = /0\d{2,3}-\d{7,8}/;
                if (!(rule.test(value)) && value != '') {
                    callback(new Error('请输入正确的固定电话号码'));
                }
                else {
                    callback();
                }
            };
            const comFormRule = (rule, value, callback) => {
                if(value === ''|| value === null){
                    callback(new Error('分成比例不能为空！！！'));
                }
                var rule = /^[0-9_]+$/;
                if (!(rule.test(value)) && value != '') {
                    callback(new Error('请输入数字'));
                }
                else {
                    callback();
                }
            };
            return {
                showDisableBtn:true,
                agentType:"",
                agentTypeList:[{value:2,displayName:"一级代理商"},{value:3,displayName:"二级代理商"}],
                pageSizeOpts:[10,20,50,100,200],
                //下面的用于修改样式
                loading: false,
                disabled:true,//account输入框是否禁止更改样式
                modalAgent:false,//一级代理商新增修改弹框框默认隐藏（模态框）
                modalCommission:false,//计算分成按钮弹框默认隐藏
                isNew:true,
                disableList: '',//禁用状态下拉
                selectValue:'',//下拉选中的元素

                //下面的用于标记或按钮相关数据
                account: '',//用于账号搜索词关键词
                name:'',//用于名称搜索词关键词
                phone:'',//用于电话号码搜索关键词
                disableModel:'',//用于禁用状态搜索关键词

                //下面字段用于代理商表table
                selectedData:[],//列表中选中的条目
                agentListData: [],//存放代理商列表查询数据
                agentTitle: [//代理商table的表头
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        key: 'account',
                        title: '登录账号',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',{style:{'font-weight':'bold'}},this.row.account);
                        }
                    },
                    {
                        key: 'name',
                        title: '用户名称',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',{style:{'font-weight':'bold'}},this.row.name);
                        }
                    },
                    {
                        key: 'type',
                        title: '代理商类型',
                        align: 'center',
                        render: function (h, params) {
                            switch (this.row.type) {
                                case 2:
                                    return h('div',{style:{color: '#1751d6','font-weight':'bold'}},"一级代理商");
                                    break;
                                case 3:
                                    return h('div',{style:{color: '#f90','font-weight':'bold'}},"二级代理商");
                                    break;
                            }
                        }
                    },
                    {
                        key: 'disabled',
                        title: '状态',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.disabled == null || this.row.disabled == ''){
                                return '--';
                            }else{
                                switch (this.row.disabled) {
                                    case 1:
                                        return h('div',{style:{color: '#FF4040	','font-weight':'bold'}},"已禁用");
                                        break;
                                    case 2:
                                        return h('div',{style:{color: '#3DB55E','font-weight':'bold'}},"已启用");
                                        break;
                                }
                            }
                        }
                    },
                    {
                        key: 'phone',
                        title: '手机号码',
                        align: 'center',
                    },
                    {
                        key: 'tel',
                        title: '固定电话',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.tel == null || this.row.tel == ''){
                                return '--';
                            }else {
                                return this.row.tel;
                            }
                        }
                    },
                    {
                        key: 'createdAt',
                        title: '创建时间',
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
                        title: '操作',
                        key: 'action',
                        width: 230,
                        align: 'center',
                        render: (h, params) => {

                            let btnArr = [
                                h('Button',{
                                    props:{
                                        type:'info',
                                        size:'small'
                                    },
                                    style:{
                                        marginRight: '5px'
                                    },
                                    on:{
                                        click:()=>{
                                            this.commissionInput(params.row)

                                        }
                                    }
                                },'计算分成'),
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.resePasswordInput(params.row);
                                        }
                                    }
                                }, '重置密码'),
                                h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.openEdit(params.row)
                                        }
                                    }
                                }, '修改')
                            ]

                            if (params.row.type == 3) {
                                btnArr = []
                            }

                            return h('div', btnArr);
                        }
                    },
                ],

                //下面的用于分页组件
                dataCount:0,//用户列表数据总数
                pageSize:10,// 每页显示多少条
                pageNum:1,//页数

                //下面的用于提交的表单
                agentForm: {//新增编辑设备信息表单数据
                    id:null,
                    type:'',
                    account:'',
                    name:'',
                    phone:'',
                    tel:'',
                },
                telValue:'',//检测tel是否有输入

                ruleValidate: {//表单规则控制
                    account: [
                        { required: true, message: '登录账号不能为空！', trigger: 'blur' },
                        { validator: accountFormRule, trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '用户名称不能为空！', trigger: 'blur' },
                        { validator: nameFormRule, trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '手机号码不能为空!', trigger: 'blur' },
                        { validator: phoneFormRule, trigger: 'blur' }
                    ],
                    tel: [
                        { validator: telFormRule, trigger: 'blur' }
                    ]
                },
                commissionForm:{
                    outAgentIdOne:null,
                    createdAt1:'',//选中的起始月份
                    createdAt2:'',//选中的结束月份
                    updatedAt1:'',//选中的起始月份的第一天
                    updatedAt2:'',//选中的结束月份的最后一天
                    totalRecharge:0,//充值总额
                    royaltyRate:0,//分成比例
                    royaltyQuota:0,//分成金额
                },
                ruleCommission:{
                    royaltyRate:[
//                        { required: true, message: '分成比例不能为空!', trigger: 'blur' },
                        { validator: comFormRule, trigger: 'blur' }
                    ]
                },
            };
        },
        methods: {

            init () {//初始化函数，用于初始化获取各类列表等
                this.queryAgentList();//初始化查询用户列表
                this.queryAgentDisabled();//初始化禁用状态下拉内容
            },

            //**********下面各按钮相关处理函数***********
            checkInput(input){//搜索框发生改变时的相关处理函数
              if(input == 'account'){
                  if(this.account==''||(!this.account)){
                      this.search();
                  }
              } else if(input == 'name'){
                  if(this.name==''||(!this.name)){
                      this.search();
                  }
              }else if(input == 'phone'){
                  if(this.phone==''||(!this.phone)){
                      this.phone = null;
                      this.search();
                  }
              }else if(input == 'disableModel'){
                  if(this.disableModel=='all'||(!this.disableModel)){
                      this.search();
                  }
              }
            },
            search () {//条件搜索按钮
                this.pageNum=1;//页数，恢复到第一页
                this.queryAgentList();
            },

            searchAll(){//全部查询
                this.pageNum=1;//页数，恢复到第一页
                this.account = '';
                this.name = '';
                this.phone = '';
                this.disableModel = '';
                this.agentType = '';
                this.queryAgentList();
            },

            openAdd(){//新增按钮
                this.isNew = true;
                this.disabled=false;//设置信息可编辑，与修改区别
                this.modalAgent=true;
                this.$refs.agentForm.resetFields();
                this.agentForm.id=null;//将id设为null，表示新增
                this.agentForm.type=2;//将type设为2，表示新增一级代理商
            },

            openEdit(value){//编辑按钮
                this.isNew = false;
                this.$refs.agentForm.resetFields();
                let agentData=this.agentForm;
                for(let key in this.agentForm){//防止数据绑定导致更改selectedData的之值
                    agentData[key]=value[key];
                }
                this.agentForm=agentData;
                this.disabled=true;//设置account不可编辑，与新增区别
                this.modalAgent=true;
            },
            updateAgent(){//新增编辑提交按钮
                this.$refs.agentForm.validate((valid) => {
                    if (valid) {
                        this.addAgent();
                        //成功后关闭模态框>>>写在Ajax请求后
                        this.modalAgent=false;
                    }
                })
            },
            cancel(index){//模态框取消按钮
                if(index==1){
                    this.modalAgent=false;
                }
            },

            resePasswordInput(value){//重置密码按钮
                let phone = value.phone;
                let id = value.id;
                this.$Modal.confirm({
                    title: '提示',
                    content: '确定要进行重置密码操作吗？',
                    onOk: () => {
                        this.resePassword(id,phone);
                    },
                    onCancel: () => {
                        console.log("取消-->不操作");
                    }
                });
            },

            commissionInput(value){//计算分成按钮方法
                this.$refs.commissionForm.resetFields();//操作前清空计算分成表单

                /**
                 * 重新点击计算分成按钮清空表单数据
                 *
                 */
                this.commissionForm.outAgentIdOne = null;
                this.commissionForm.createdAt1 = '';
                this.commissionForm.createdAt2 = '';
                this.commissionForm.updatedAt1 = '';
                this.commissionForm.updatedAt2 = '';
                this.commissionForm.totalRecharge = 0;
                this.commissionForm.royaltyRate = 0;
                this.commissionForm.royaltyQuota = 0;

                this.commissionForm.outAgentIdOne = value.id;
                this.modalCommission = true;
            },

            calculationAndPartition(){//计算分成按钮方法
                if(this.commissionForm.createdAt1 == '' || this.commissionForm.createdAt1 == null){
                    this.warn('起始月份不能为空，请重新选择！！！');
                    return false;
                }
                if(this.commissionForm.createdAt2 == '' || this.commissionForm.createdAt2 == null){
                    this.warn('结束月份不能为空，请重新选择！！！');
                    return false;
                }
                if(this.commissionForm.createdAt1 > this.commissionForm.createdAt2){
                    this.warn('结束月份不能小于起始月份，请重新选择！！！');
                    return false;
                }
                this.commissionForm.updatedAt1 = dayjs(new Date(this.commissionForm.createdAt1)).format('YYYY-MM-DD HH:mm:ss');
                this.commissionForm.updatedAt2 = dayjs(new Date(this.commissionForm.createdAt2)).endOf('month').format('YYYY-MM-DD HH:mm:ss');
                this.queryCalculationTotal();

                this.$refs.commissionForm.validate((valid) => {
                    if (valid) {
                        /**
                         * 计算分成金额
                         */
                        this.commissionForm.royaltyQuota = this.commissionForm.totalRecharge * (this.commissionForm.royaltyRate/100);
                    }
                })
            },

            agentDisabled(num){//禁用按钮
                if(this.selectedData.length<1){
                    this.warn("请至少选择一个代理商进行操作");
                    return false;
                }
                let ids=[];
                //组装需要删除的id数组
                for(var i=0;i<this.selectedData.length;i++){
                    let agentDisabled = this.selectedData[i].disabled;
                    if(agentDisabled == num){
                        (num == 1)?this.warn("已禁用的代理商禁止进行禁用操作，请重新选择！"):this.warn("已启用的代理商禁止进行启用操作，请重新选择！");
                        return false;
                    }
                    ids.push(this.selectedData[i].id);
                }
                this.$Modal.confirm({
                    title: '提示',
                    content: '确定要'+ ((num==1) ?"禁用":"启用")+'选中的代理商吗？',
                    onOk: () => {
                        this.$axios.post('/user/offOn',{ids:ids,disabled:num})
                            .then((success)=>{
                                if(success.data.status==true){
                                    (num==1) ? this.success('已成功禁用代理商！') : this.success('已成功启用代理商！');
                                    this.selectedData = [];
                                    this.queryAgentList();//上架或下架成功，重新查询列表
                                }else {
                                    this.warn(success.data.message);
                                }
                            },(fail)=>{
                                console.log(fail)
                            });
                    },
                    onCancel: () => {
                        console.log("取消-->不操作");
                    }
                });

            },

            //***********下面为表格相关处理函数*************

            selectRowChange(selection){//用户表格勾选变化时触发
                this.showDisableBtn = true;
                if (selection && selection.length > 0) {
                    selection.forEach(element => {
                        if(element.type == 3){
                            this.showDisableBtn = false;
                            return;
                        }
                    });
                }
            
                this.selectedData=selection;
            },

            //*************下面为分页组件的相关函数****************
            changePage(index){//页数改变,index为页数
                this.pageNum=index;
                this.queryAgentList();
            },
            changePageSize(index){//改变每页条数,index为每页条数
                this.pageSize =index;
                this.queryAgentList();
            },

            //****************下面为各项ajax请求数据函数************
            queryAgentList(){//查询设备列表方法
                let types = this.agentType ? this.agentType : "2,3";
                this.loading=true;
                let self = this;
                this.$axios.get('/user/list',
                    {
                        params: {
                            page: this.pageNum,
                            pageSize:this.pageSize,
                            account:this.account,
                            name:this.name,
                            phone:this.phone,
                            disabled:this.disableModel == 'all'?'':this.disableModel,
                            types:types
                        }
                    }).then((success)=>{
                    self.loading = false;
                    if(success.data.status){
                        this.agentListData = success.data.data.rows;
                        this.dataCount = success.data.data.total;
                    }
                },(fail)=>{
                    this.loading = false;
                    console.info(fail)
                })
            },
            addAgent(){//新增一级代理商方法
                this.$axios.post('/user/add',this.agentForm)
                    .then((success)=>{
                        if(success.data.status){
                            (this.agentForm.id) ? this.success('成功修改一级代理商信息') : this.success('成功添加一级代理商！！！');
                            this.queryAgentList();//更新成功，重新查询一级代理商列表
                        }else {
                            this.warn(success.data.message);
                        }
                    },(fail)=>{
                        console.log(fail)
                    }
                );
            },

            resePassword(id,phone){//重置密码请求函数
                this.$axios.post('/user/resetPwd',{
                        id:id,
                        phone:phone
                    }).then((success)=>{
                            if(success.data.status){
                                this.success('重置密码成功！');
                            }else {
                                this.warn(success.data.message);
                            }
                        },(fail)=>{
                            console.log(fail)
                        }
                    );
            },

            queryCalculationTotal(){//计算充值总额请求方法
                this.$axios.post('/order/agenterGain',{
                    outAgentIdOne:this.commissionForm.outAgentIdOne,
                    updatedAt1:this.commissionForm.updatedAt1,
                    updatedAt2:this.commissionForm.updatedAt2
                }).then((success)=>{
                        if(success.data.status){
//                            this.success('查询成功！');
                            this.commissionForm.totalRecharge = (success.data.data)/100;
                        }else {
                            this.warn(success.data.message);
                        }
                    },(fail)=>{
                        console.log(fail)
                    }
                );
            },

            /**
             * 获取禁用状态搜索框下拉内容请求函数
             */
            queryAgentDisabled(){
                this.$axios.get('/user/getUserDisabled').then((success)=>{
                    if(success.data){
                        let disableLists = success.data.data;
                        let defaultDisable = {
                            "displayName": "选择禁用状态",
                            "value": 'all'
                        }
                        disableLists.unshift(defaultDisable);
                        this.disableList = disableLists;
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

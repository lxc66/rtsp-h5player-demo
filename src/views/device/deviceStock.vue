<style lang="less">
    @import '../../styles/common.less';
    .ivu-table .ivu-table-body .excel-error{
        color: red
    }

    .detail{
        width: 300px;
        border: 0px
    }

    .detail {
        td{
            border: none;
            text-align: center;
            line-height: 30px;
        }
        td:nth-child(1){
            text-align: right;
        }
        td:nth-child(2){
            padding-left: 10px;
            text-align: left;
            font-weight: bold
        }
    }

</style>
<template>
    <div>
        <Row :gutter="10">
            <Col>
            <Card>
                <p slot="title">
                    <Icon type="clipboard"></Icon>
                    设备库存
                </p>
                <Row>
                    <Input v-model="imei"  @on-change="checkInput('imei')" placeholder="设备IMEI号" style="width:150px" />
                    <Input v-model="sim"  @on-change="checkInput('sim')" placeholder="SIM卡号" style="width: 150px" />
                    <Select v-model="status" style="width:150px" @on-change="checkInput('status')" placeholder="状态">
                        <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.displayName }}</Option>
                    </Select>
                    <!--<Input v-model="inCode"  @on-change="checkInput('inCode')" placeholder="设备入库单号搜索..." style="width: 150px" />-->
                    <ButtonGroup>
                        <Button type="info" @click="search()"><Icon type="ios-search-strong"></Icon>&nbsp;&nbsp;搜索</Button>
                        <Button type="primary" @click="searchAll()"><Icon type="refresh"></Icon>&nbsp;&nbsp;重置</Button>
                    </ButtonGroup>
                    <div style="margin-top: 10px;">
                        <ButtonGroup>
                            <Button type="success" @click="openAdd()"><Icon type="android-add-circle"></Icon>&nbsp;&nbsp;新增</Button>
                            <Button type="error" @click="deleteDev()"><Icon type="trash-a"></Icon>&nbsp;&nbsp;删除</Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button type="warning" @click="storage()"><Icon type="archive"></Icon>&nbsp;&nbsp;入库</Button>
                            <Button type="ghost" @click="allStorage()"><Icon type="archive"></Icon>&nbsp;&nbsp;全部入库</Button>
                            <Button type="info" @click="storageRevoke()"><Icon type="reply"></Icon>&nbsp;&nbsp;入库撤销</Button>
                            <Button type="primary" @click="firstLevelOutage()"><Icon type="android-person-add"></Icon>&nbsp;&nbsp;一级出库</Button>
                            <Button type="success" @click="firstLevelOutageRevoke()"><Icon type="reply-all"></Icon>&nbsp;&nbsp;一级出库撤销</Button>
                        </ButtonGroup>
                        <Button @click="importExcel()"><Icon type="android-upload"></Icon>&nbsp;&nbsp;导入</Button>
                    </div>
                </Row>
                <Row class="margin-top-10 searchable-table-con1">
                    <Table border  stripe :columns="columns" :data="orderData" @on-selection-change="selectRowChange" :loading="loading"></Table>
                    <Page :total="dataCount" :page-size="pageSize" show-total show-elevator show-sizer  @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="pageSizeOpts"></Page>
                </Row>
            </Card>
            </Col>
        </Row>

        <!--新增修改弹框-->
        <modal v-model="modalDevice"
               :styles="{top:'15px'}"
               :mask-closable=false
               width="500">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>{{isNew?'新增设备':'修改设备信息'}}</span>
            </p>
            <div style="text-align:center;width:70%;margin-left: 10%;">
                <i-form ref="deviceForm" :model="deviceForm" :rules="ruleValidate" :label-width="100">
                    <form-item label="imei号" prop="imei">
                        <i-input v-model="deviceForm.imei" placeholder="设备imei号" :disabled="disabled" :maxlength='15' ></i-input>
                    </form-item>
                    <form-item label="sim号" prop="sim">
                        <i-input v-model="deviceForm.sim" placeholder="设备sim号" :maxlength='11'></i-input>
                    </form-item>
                    <form-item label="imsi号" prop="imsi">
                        <i-input v-model="deviceForm.imsi" placeholder="IMSI号" :maxlength='15'></i-input>
                    </form-item>
                </i-form>
            </div>
            <div slot="footer">
                <Button type="info" size="large" @click="cancel(1)">取消</Button>
                <Button type="success" size="large" @click="updateUser">提交</Button>
            </div>
        </modal>

        <!--一级出库按钮弹框-->
        <modal v-model="moduleFirstLevelOutage"
               :styles="{top:'15px'}"
               width="500">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>分配一级代理商</span>
            </p>
            <div style="text-align:center;width:70%;margin-left: 16%;">
                <label>一级代理商：</label>
                <Select  v-model="selectFirstLevelOutage" @on-change="changeUser" filterable style="width:180px;" placeholder="请选择一级代理商出库...">
                    <Option v-for="item in userList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
            </div>
            <div slot="footer">
                <Button type="info" size="large" @click="cancel(2)">取消</Button>
                <Button type="success" size="large" @click="levelOutage">提交</Button>
            </div>
        </modal>


        <!--上传excel弹框-->
        <modal v-model="modalUpload"
               :styles="{top:'15px'}"
               width="500"
               @on-ok="onOk">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>上传excel</span>
            </p>
            <div style="text-align:center;width:70%;margin-left: 10%;">
                <Upload
                    type="drag"
                    name="file"
                    accept=".xlsx,.xls"
                    :show-upload-list=false  
                    :format="['xlsx','xls']"
                    :max-size=10240
                    :action="uploadUrl"
                    :with-credentials=true
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    :on-exceeded-size="handleExceededSize">
                    <div style="padding: 20px 0">
                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>点击或拖动上传文件</p>
                    </div>
                </Upload>
                <br>
                <Button  @click="exportExcel()"><Icon type="archive"></Icon>&nbsp;&nbsp;下载EXCEL模板</Button>
            </div>
        </modal>

        <!--excel验证出错弹框-->
        <Modal
            width="500"
            v-model="modalError"
            :title="errorTitle">
            <Table :columns="errorCol" :data="errorList" height="400" ></Table>
        </Modal>

    </div>
</template>

<script>
    import util from '@/libs/util'
    import dayjs from 'dayjs';
    export default {
        name: 'deviceStock',
        data () {
            const imeiRule = (rule, value, callback) => {
                var rule = /^[0-9]{15}$/;
                if (!(rule.test(value))) {
                    callback(new Error('请输入15位设备imei号'));
                }
                else {
                    callback();
                }
            };
            const simRule = (rule, value, callback) => {
                var rule = /(?:^1[3456789]|^9[28])\d{9}$/;
                if (!(rule.test(value))) {
                    callback(new Error('请输入正确的sim卡号'));
                }
                else {
                    callback();
                }
            };
            const imsiRule = (rule, value, callback) => {
                var rule = /^[0-9]{15}$/;
                if (!(rule.test(value))) {
                    callback(new Error('请输入15位设备imsi号'));
                }
                else {
                    callback();
                }
            };
            return {
                modalError:false,
                errorTitle:"",
                errorList:[],
                errorCol:[{
                        key: 'imei',
                        title: 'IMEI号',
                        width:'155px',
                        align: 'center'
                    },
                    {
                        key: 'sim',
                        title: 'SIM卡号',
                        width:'155px',
                        align: 'center',
                    },{
                        key: 'errorMsg',
                        title: '错误详情',
                        width:'155px',
                        align: 'center',
                        className:'excel-error'
                    }],
                uploadUrl:util.baseUrl + '/deviceStock/uploadExcel',
                modalUpload:false,
                modalDevice:false,//设备新增修改框默认隐藏（模态框）
                isNew:true,//控制新增修改，true为新增，false为修改
                deviceForm: {//新增编辑设备信息表单数据
                    id:null,
                    imei: '',
                    sim: '',
                    imsi:'',
                },
                ruleValidate: {//新增编辑设备表单规则控制
                    imei: [
                        { required: true, message: '设备imei号不能为空!', trigger: 'blur' },
                        { validator: imeiRule, trigger: 'blur' }
                    ],
                    sim: [
                        { required: true, message: 'sim号不能为空!', trigger: 'blur' },
                        {validator: simRule, trigger: 'blur' }
                    ],
                    imsi: [
                        { required: true, message: 'imsi号不能为空!', trigger: 'blur' },
                        {validator: imsiRule, trigger: 'blur' }
                    ],
                },
                disabled:true,//imei号输入框是否禁止更改样式

                moduleFirstLevelOutage:false,//一级出库弹框，默认隐藏
                selectFirstLevelOutage:'',
                userType:2,//查询一级出库代理商用户即type为2的用户
                userDisabled:2,//查询一级出库代理商用户即disabled为2的用户
                userList:[],//存放一级代理商信息,用于下拉框显示
                onChangeUser:'',//存放选中的代理商的ID

                loading:false,
                //搜索关键词,imei,sim,status,inCode
                imei: '',//设备imei号
                sim:'',//设备sim号
                status: '',//库存状态，1未入库，2已入库，3一级出库,4二级出库,5未注册,6已注册
//                inCode:'',//设备入库单号
                statusList:'',//库存状态下拉动态内容

                //下面的用于设备table
                selectedData:[],//列表中选中的条目
                deviceIds:[],//记录列表中选中的id
                orderData: [],//订单列表数据
                columns: [//订单table的表头
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
                        key: 'imsi',
                        title: 'IMSI号',
                        align: 'center',
                    },
                    {
                        key: 'status',
                        title: '状态',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.status==1){
                                return h('strong',{style:{color: '#ccc'}},
                                    "未入库"
                                );
                            }else if(this.row.status==2){
                                return h('strong',{style:{color: '#FFAD33'}},
                                    "已入库"
                                );
                            }else if(this.row.status==3){
                                return h('strong',{style:{color: '#2D8CF0'}},
                                    "一级出库"
                                );
                            }else if(this.row.status==4){
                                return h('strong',{style:{color: '#7b16ad'}},
                                    "二级出库"
                                );
                            }else if(this.row.status==5){
                                return h('strong',{style:{color: '#ad9c16'}},
                                    "未注册"
                                );
                            }else if(this.row.status==6){
                                return h('strong',{style:{color: '#16ad3f'}},
                                    "已开通"
                                );
                            }
                        }
                    },
                   {
                       key: 'outAgentOneUser',
                       title: '一级代理商',
                       align: 'center',
                       render: function (h, params) {
                           if(this.row.outAgentOneUser == null){
                               return '--';
                           }else {
                               return this.row.outAgentOneUser.name;
                           }
                       }
                   },
                   {
                       key: 'outAgentTwoUser',
                       title: '二级代理商',
                       align: 'center',render: function (h, params) {
                       if(this.row.outAgentTwoUser == null){
                           return '--';
                       }else {
                           return this.row.outAgentTwoUser.name;
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
                        width: 130,
                        align: 'center',
                        render: (h, params) => {
                            if(params.row.status == 1){
                                return h('div', [
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
                                                this.show(params.row)
                                            }
                                        }
                                    }, '查看'),
                                    h('Button', {
                                        props: {
                                            type: 'warning',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.modify(params.row)
                                            }
                                        }
                                    }, '修改')
                                ]);
                            }else {
                                return h('div', [
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
                                                this.show(params.row)
                                            }
                                        }
                                    }, '查看'),
                                    h('Button', {
                                        props: {
                                            type: 'warning',
                                            size: 'small',
                                            disabled: true
                                        },
                                        on: {
                                            click: () => {
                                                this.modify(params.row)
                                            }
                                        }
                                    }, '修改')
                                ]);
                            }

                        }
                    }
                ],

                //下面的用于分页组件
                dataCount:0,//订单列表数据总数
                pageSize:10,// 每页显示多少条
                pageNum:1,//页数，
                pageSizeOpts:[10,20,50,100,200]
            };
        },
        methods: {

            handleExceededSize(){
                this.$Message.warning('文件大小限制在10M之内')
            },

            handleUploadError(res,msg){ 
                this.$Message.error({
                    duration: 2,
                    content: `<span style="font-size: 14px;font-weight: bold;">上传失败</span><br><br>`+msg.message
                });
            },
            handleUploadSuccess(res){
                this.modalError = true
                if (res.failSize == 0) {
                    this.errorList = []
                } else {
                    this.errorList = res.failList;
                }

                this.errorTitle = "成功："+res.successSize+"条，失败："+res.failSize+'条，失败记录如下：';
                
            },
            
            exportExcel(){
                window.location.href = util.baseUrl + '/deviceStock/exportExcel'//导出excel模板url
            },

            importExcel(){
                this.modalUpload = true
            },

            //**********下面各按钮相关处理函数***********
            checkInput(searchType){//搜索输入框变化时调用
                if(searchType=='sim'){
                    if(this.sim==''||(!this.sim)) {
                        this.search();
                    }
                }else if(searchType=='imei'){
                    if(this.imei==''||(!this.imei)) {
                        this.search();
                    }
                }else if(searchType=='status'){
                    if(this.status=='all'||(!this.status)) {
                        this.search();
                    }
                }
//                else if(searchType=='inCode'){
//                    if(this.inCode==''||(!this.inCode)) {
//                        this.search();
//                    }
//                }
            },
            search () {//搜索按钮
                this.pageNum=1;//页数，恢复到第一页
                this.queryDeviceStock();
            },
            searchAll(){
                //清空条件，重新查询
                this.pageNum=1;
                this.imei= '';//设备imei号
                this.sim='';//设备sim号
                this.status= '';//库存状态（1：未入库；2：已入库；3：一级出库；4：二级出库；5：未注册；6：已注册）
//                this.inCode= '';
                this.search ();
            },

            openAdd(){//新增按钮
                this.isNew = true;
                this.disabled=false;//设置account可编辑，与修改区别
                this.modalDevice=true;
                this.$refs.deviceForm.resetFields();
                this.deviceForm.id=null;//将id设为null，表示新增
            },

            deleteDev(){//删除按钮方法
                if(this.selectedData.length<1){//限制只能选择一条数据编辑
                    this.warn("请至少选择一个设备进行删除操作");
                    return false;
                }
                this.$Modal.confirm({
                    title: '警告',
                    content: '<h3>是否确定删除选中设备？</h3>',
                    onOk: () => {
                        let deviceIds = [];
                        for(let i=0;i<this.selectedData.length;i++){//更新selectedRoleIds数组
                            deviceIds.push(this.selectedData[i].id);
                            let status = this.selectedData[i].status;
                            if(status != 1){
                                this.warn("非未入库状态的设备禁止进行入库操作,请重新选择！！！");
                                return false;
                            }
                        }
                        deviceIds = deviceIds.join(",");
                        this.deviceIds = deviceIds;
                        this.deleteDevPost();
                    },
                    onCancel: () => {
                        console.log("取消-->不操作");
                    }
                });
            },

            modify(deviceData){//修改按钮
                if(deviceData.status == 2){
                    this.warn("当前设备为已入库设备,请入库撤销后修改！！！");
                    return false;
                }
                this.isNew = false;
                this.$refs.deviceForm.resetFields();
                let userData=this.deviceForm;
                for(let key in this.deviceForm){
                    userData[key]=deviceData[key];
                }
                this.deviceForm=userData;
                this.disabled=true;//设置account不可编辑，与新增区别
                this.modalDevice=true;
            },

            updateUser(){//新增编辑提交按钮
                this.$refs.deviceForm.validate((valid) => {
                    if (valid) {
                        this.addDevice();
                        //成功后关闭模态框>>>写在Ajax请求后
                        this.modalDevice=false;
                    }
                })
            },

            cancel(index){//模态框取消按钮
                if(index==1){
                    this.modalDevice=false;
                }else if(index==2){
                    this.moduleFirstLevelOutage=false;
                }
                else if(index==3){
                    this.modalTraffic=false;
                }
                else if(index==4){
                    this.modalWifi=false;
                }
            },

            show (deviceInformation) {//查看按钮
                let status = deviceInformation.status;
                switch(status){
                    case 1:
                        status = "未入库";break;
                    case 2:
                        status = "已入库";break;
                    case 3:
                        status = "一级出库";break;
                    case 4:
                        status = "二级出库";break;
                    case 5:
                        status = "未注册";break;
                    case 6:
                        status = "已开通";break;
                    default :
                        status = "--";
                }

                let content = `<table class="detail" cellspacing=0 cellpadding=0 border=0>
                                    <tr>
                                        <td>IMEI号</td>
                                        <td>${deviceInformation.imei}</td>
                                    </tr>
                                    <tr>
                                        <td>SIM卡号</td>
                                        <td>${deviceInformation.sim}</td>
                                    </tr>
                                    <tr>
                                        <td>IMSI号</td>
                                        <td>${deviceInformation.imsi}</td>
                                    </tr>
                                    <tr>
                                        <td>状态</td>
                                        <td>${status}</td>
                                    </tr>
                                    <tr>
                                        <td>入库单号</td>
                                        <td>${deviceInformation.inCode==null?'--':deviceInformation.inCode}</td>
                                    </tr>
                                    <tr>
                                        <td>入库时间</td>
                                        <td>${deviceInformation.inDate == null?'--':dayjs(new Date(deviceInformation.inDate)).format('YYYY-MM-DD HH:mm:ss')}</td>
                                    </tr>
                                    <tr>
                                        <td>入库操作员</td>
                                        <td>${deviceInformation.inUser ? deviceInformation.inUser.name :'--'}</td>
                                    </tr>
                                    <tr>
                                        <td>一级出库单号</td>
                                        <td>${deviceInformation.outCodeOne ? deviceInformation.outCodeOne : '--'}</td>
                                    </tr>
                                    <tr>
                                        <td>一级出库时间</td>
                                        <td>${deviceInformation.outDateOne ? dayjs(new Date(deviceInformation.outDateOne)).format('YYYY-MM-DD HH:mm:ss') :'--'}</td>
                                    </tr>
                                    <tr>
                                        <td>一级出库操作员</td>
                                        <td>${deviceInformation.outOneUser ? deviceInformation.outOneUser.name :'--'}</td>
                                    </tr>
                                    <tr>
                                        <td>一级代理商</td>
                                        <td>${!deviceInformation.outAgentOneUser ?'--':deviceInformation.outAgentOneUser.name}</td>
                                    </tr>
                                    <tr>
                                        <td>二级出库单号</td>
                                        <td>${!deviceInformation.outCodeTwo ?'--':deviceInformation.outCodeTwo}</td>
                                    </tr>
                                    <tr>
                                        <td>二级出库时间</td>
                                        <td>${!deviceInformation.outDateTwo ?'--':dayjs(new Date(deviceInformation.outDateTwo)).format('YYYY-MM-DD HH:mm:ss')}</td>
                                    </tr>
                                    <tr>
                                        <td>二级代理商</td>
                                        <td>${!deviceInformation.outAgentTwoUser ?'--':deviceInformation.outAgentTwoUser.name}</td>
                                    </tr>
                                    <tr>
                                        <td>创建时间</td>
                                        <td>${!deviceInformation.createdAt ?'--':dayjs(new Date(deviceInformation.createdAt)).format('YYYY-MM-DD HH:mm:ss')}</td>
                                    </tr>
                                    <tr>
                                        <td>用户手机号码</td>
                                        <td>${!deviceInformation.user ?'--':deviceInformation.user.phone}</td>
                                    </tr>
                                </table>`

                this.$Modal.info({
                    title: '设备信息',
                    content: content
                })
            },

            storage(){//入库按钮
                if(this.selectedData.length<1){//限制只能选择一条数据编辑
                    this.warn("请至少选择一个设备进行操作");
                    return false;
                }
                let deviceIds = [];
                for(let i=0;i<this.selectedData.length;i++){//更新selectedRoleIds数组
                    deviceIds.push(this.selectedData[i].id);
                    let status = this.selectedData[i].status;
                    if(status != 1){
                        this.warn("非未入库状态的设备禁止进行入库操作,请重新选择！！！");
                        return false;
                    }
                }
                deviceIds = deviceIds.join(",");
                this.deviceIds = deviceIds;
                this.queryStorage();
            },

            allStorage(){//全部入库按钮

                this.$Modal.confirm({
                    title: '警告',
                    content: '<h3>是否确定全部入库？</h3>',
                    onOk: () => {
                        this.$axios.post('/deviceStock/allStorage').then((success)=>{
                            if(success.data.status){
                                this.success('全部入库成功');
                                this.queryDeviceStock();//设置成功，重新查询设备列表
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

            storageRevoke(){//入库撤销按钮
                if(this.selectedData.length<1){//限制只能选择一条数据编辑
                    this.warn("请至少选择一个设备进行操作");
                    return false;
                }
                let deviceIds = [];
                for(let i=0;i<this.selectedData.length;i++){
                    deviceIds.push(this.selectedData[i].id);
                    let status = this.selectedData[i].status;
                    if(status != 2){
                        this.warn("非已入库状态的设备禁止进行入库撤销操作,请重新选择！！！");
                        return false;
                    }
                }
                deviceIds = deviceIds.join(",");
                this.deviceIds = deviceIds;
                this.queryStorageRevoke();
            },

            firstLevelOutage(){//一级出库按钮
                if(this.selectedData.length<1){//限制只能选择一条数据编辑
                    this.warn("请至少选择一个设备进行操作");
                    return false;
                }
                this.selectFirstLevelOutage = '';
                let deviceIds = [];
                for(let i=0;i<this.selectedData.length;i++){
                    deviceIds.push(this.selectedData[i].id);
                    let status = this.selectedData[i].status;
                    if(status != 2){
                        this.warn("非已入库状态的设备禁止一级出库操作,请重新选择！！！");
                        return false;
                    }
                }
                deviceIds = deviceIds.join(",");
                this.deviceIds = deviceIds;
                this.queryUserList();
                this.moduleFirstLevelOutage = true;

            },

            firstLevelOutageRevoke(){//一级出库撤销按钮
                if(this.selectedData.length<1){//限制只能选择一条数据编辑
                    this.warn("请至少选择一个设备进行操作");
                    return false;
                }
                let deviceIds = [];
                for(let i=0;i<this.selectedData.length;i++){
                    deviceIds.push(this.selectedData[i].id);
                    let status = this.selectedData[i].status;
                    if(status != 3){
                        this.warn("非一级出库状态的设备禁止一级出库撤销操作,请重新选择！！！");
                        return false;
                    }
                }
                deviceIds = deviceIds.join(",");
                this.deviceIds = deviceIds;
                this.postFirstLevelOutageRevoke();
            },

            changeUser(value){//选中发生变化时还回选中设备的ID
                this.onChangeUser = value;
            },

            levelOutage(){//一级出库提交按钮
                this.postFirstLevelOutage();
                //成功后关闭模态框>>>写在Ajax请求后
                this.moduleFirstLevelOutage=false;
            },

            onOk(){
                this.queryDeviceStock();
            },

            //***********下面为表格相关处理函数*************

            selectRowChange(selection){//设备表格勾选变化时触发
                this.selectedData=selection;
            },

            //*************下面为分页组件的相关函数****************
            changePage(index){//页数改变,index为页数
                this.pageNum=index;
                this.queryDeviceStock();
            },
            changePageSize(index){//改变每页条数,index为每页条数
                this.pageSize =index;
                this.queryDeviceStock();
            },

            //****************下面为各项ajax请求数据函数************
            queryDeviceStock(){//查询订单列表函数
                this.loading=true
                let self = this
                this.$axios.get('deviceStock/list',
                    {
                        params:{
                            page:this.pageNum,
                            pageSize:this.pageSize,
                            imei:this.imei.trim(),
                            sim:this.sim.trim(),
                            status:this.status == 'all'?'':this.status,
//                            inCode:this.inCode
                        }
                    }
                )
                    .then((success)=>{
                        self.loading = false
                        this.orderData = success.data.data.rows;
                        this.dataCount = success.data.data.total;
                    },(fail)=>{
                        self.loading = false
                        console.log(fail)
                    })
            },

            addDevice(){//新增修改设备方法
                this.$axios.post('/deviceStock/add',this.deviceForm)
                    .then((success)=>{
                        if(success.data.status){
                            (this.deviceForm.id) ? this.success('成功修改设备信息') : this.success('成功添加设备');
                            this.queryDeviceStock();//更新成功，重新查询设备列表
                        }else {
                            this.warn(success.data.message);
                        }
                    },(fail)=>{
                        console.log(fail)
                    });
            },

            deleteDevPost(){//删除按钮方法
                this.$axios.post('/deviceStock/delete',{
                    ids:this.deviceIds
                }).then((success)=>{
                    if(success.data.status){
                        this.success('删除成功');
                        this.selectedData = [];
                        this.deviceIds = [];
                        this.queryDeviceStock();//设置成功，重新查询设备列表
                    }else {
                        this.warn(success.data.message);
                    }
                },(fail)=>{
                    console.log(fail)
                });
            },

            queryStorage(){//入库请求
                this.$axios.post('/deviceStock/storage',{
                    ids:this.deviceIds
                }).then((success)=>{
                    if(success.data.status){
                        this.success('入库成功');
                        this.selectedData = [];
                        this.deviceIds = [];
                        this.queryDeviceStock();//设置成功，重新查询设备列表
                    }else {
                        this.warn(success.data.message);
                    }
                },(fail)=>{
                    console.log(fail)
                });
            },

            queryStorageRevoke(){//入库撤销请求
                this.$axios.post('/deviceStock/storageUndo',{
                    ids:this.deviceIds
                }).then((success)=>{
                    if(success.data.status){
                        this.success('撤销入库成功');
                        this.selectedData = [];
                        this.deviceIds = [];
                        this.queryDeviceStock();//设置成功，重新查询设备列表
                    }else {
                        this.warn(success.data.message);
                    }
                },(fail)=>{
                    console.log(fail)
                });
            },

            queryUserList(){//用户查询方法
                this.$axios.get('/user/list',
                    {
                        params: {
                            page:1,
                            pageSize:9999,
                            type: this.userType,
                            disabled:this.userDisabled
                        }
                    }).then((success)=>{
                        if(success.data.status){
                            this.userList = success.data.data.rows;
                        }
                },(fail)=>{
                    this.loading = false;
                    console.info(fail)
                })
            },
            postFirstLevelOutage(){//一级出库请求
                this.$axios.post('/deviceStock/outputOne',{
                    ids:this.deviceIds,
                    outAgentIdOne:this.onChangeUser
                }).then((success)=>{
                    if(success.data.status){
                        this.success('一级出库成功');
                        this.onChangeUser = '';
                        this.selectedData = [];
                        this.deviceIds = [];
                        this.queryDeviceStock();//设置成功，重新查询设备列表
                    }else {
                        this.warn(success.data.message);
                    }
                },(fail)=>{
                    console.log(fail)
                });
            },
            postFirstLevelOutageRevoke(){
                this.$axios.post('/deviceStock/outputOneUndo',{
                    ids:this.deviceIds
                }).then((success)=>{
                    if(success.data.status){
                        this.success('一级出库撤销成功');
                        this.selectedData = [];
                        this.deviceIds = [];
                        this.queryDeviceStock();//设置成功，重新查询设备列表
                    }else {
                        this.warn(success.data.message);
                    }
                },(fail)=>{
                    console.log(fail)
                });
            },


            /**
             * 获取库存状态搜索框下拉内容请求函数
             */
            queryDevStockStatus(){
                this.$axios.get('deviceStock/getStatusEnum').then((success)=>{
                    if(success.data){
                        let statusLists = success.data.data;
                        let defaultStatus = {
                            "displayName": "设备库存状态",
                            "value": 'all'
                        }
                    statusLists.unshift(defaultStatus);
                        this.statusList = statusLists;
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

            init () {//初始化函数，用于初始化获取各类列表等
                this.queryDeviceStock();//初始化查询订单列表
                this.queryDevStockStatus();//初始化设备库存状态下拉内容
            }

        },//以上为methods

        //初始化运行下面函数
        mounted () {
            this.init();//执行初始化函数初始化页面
        }
    };

</script>

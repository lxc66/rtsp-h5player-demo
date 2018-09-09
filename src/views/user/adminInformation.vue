<style>
    #avatarClass{
        background: #619fe7;
        margin-left:10px;
        width: 90px;
        line-height: 90px;
        height: 90px;
        font-size: 50px;
        border-radius: 50%;
    }

</style>
<template>
    <div>
        <Row :gutter="10">
            <Col>
                <Card>
                    <p slot="title">
                        <Icon type="ios-body"></Icon>
                        管理员信息
                    </p>
                    <Row type="flex" class="user-infor">
                        <Col span="3">
                            <Row class-name="made-child-con-middle" type="flex" align="middle">
                                <Avatar icon="person" id="avatarClass"></Avatar>
                            </Row>
                        </Col>
                        <Col span="21" style="padding-left:6px;">
                            <Row class-name="made-child-con-middle" type="flex" align="middle">
                                <div>
                                    <b class="card-user-infor-name">{{account}}</b>
                                    <p>超级管理员</p>
                                </div>
                            </Row>
                        </Col>
                    </Row>
                    <div class="line-gray"></div>
                    <Row class="margin-top-8" style="margin-left: 20px;">
                        <Col span="3"><p class="notwrap">账号:</p></Col>
                        <Col span="21" class="padding-left-8">{{account}}</Col>
                    </Row>
                    <Row class="margin-top-8" style="margin-left: 20px;">
                        <Col span="3"><p class="notwrap">启用状态:</p></Col>
                        <Col span="21" class="padding-left-8">{{disabled == 2?'已启用':'已禁用'}}</Col>
                    </Row>
                    <Row class="margin-top-8" style="margin-left: 20px;">
                        <Col span="3"><p class="notwrap">名称:</p></Col>
                        <Col span="21" class="padding-left-8">{{name}}</Col>
                    </Row>
                    <Row class="margin-top-8" style="margin-left: 20px;">
                        <Col span="3"><p class="notwrap">手机:</p></Col>
                        <Col span="21" class="padding-left-8">{{(phone == null || phone == '')?'--':phone}}</Col>
                    </Row>
                    <Row class="margin-top-8" style="margin-left: 20px;">
                        <Col span="3"><p class="notwrap">电话:</p></Col>
                        <Col span="21" class="padding-left-8">{{(tel == null || tel == '')?'--':tel}}</Col>
                    </Row>
                    <Row class="margin-top-8" style="margin-left: 20px;">
                        <Col span="3"><p class="notwrap">创建时间:</p></Col>
                        <Col span="21" class="padding-left-8">{{(createdAt == null || createdAt == '')?'--':getDateTime(createdAt)}}</Col>
                    </Row>
                    <Row class="margin-top-8" style="margin-left: 70px;margin-top: 20px">
                        <Button type="info" @click="modifyAdmin()"><Icon type="compose"></Icon>&nbsp;&nbsp;信息修改</Button>
                    </Row>
                </Card>
            </Col>
        </Row>
        <modal v-model="modifyAdminModal"
               :styles="{top:'15px'}"
               width="400">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>管理员信息修改</span>
            </p>
            <div style="text-align:center;width:80%;margin: 0px auto;">
                <i-form ref="modifyAdminForm" :model="modifyAdminForm" :rules="ruleValidate" :label-width="100">
                    <form-item label="账号：">
                        <i-input v-model="modifyAdminForm.account" readonly></i-input>
                    </form-item>
                    <form-item label="名称：" prop="name">
                        <i-input v-model="modifyAdminForm.name" placeholder="新名称"></i-input>
                    </form-item>
                    <form-item label="手机：" prop="phone">
                        <i-input v-model="modifyAdminForm.phone" placeholder="新手机号码"></i-input>
                    </form-item>
                    <form-item label="电话：" prop="tel">
                        <i-input v-model="modifyAdminForm.tel" placeholder="新电话"></i-input>
                    </form-item>
                </i-form>
            </div>
            <div slot="footer">
                <Button type="info" size="large" @click="cancel">取消</Button>
                <Button type="success" size="large" @click="updateAdmin">提交</Button>
            </div>
        </modal>
    </div>
</template>

<script>
    import cookie from 'js-cookie'
    import dayjs from 'dayjs';
    export default {
        name: 'adminList',
        data () {
            const nameFormRule = (rule, value, callback) => {
                let reg =/^[\u4E00-\u9FA5a-zA-Z0-9_]{2,16}$/;
                if (!(reg.test(value))) {
                    callback(new Error('请按照正确的格式输入(2-16位中文、字母、数字、下划线)'));
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
//            const telFormRule = (rule, value, callback) => {
//                var rule = /0\d{2,3}-\d{7,8}/;
//                if (!(rule.test(value))) {
//                    callback(new Error('请输入正确的固定电话号码'));
//                }
//                else {
//                    callback();
//                }
//            };
            return {
                account:'',
                disabled:'',
                name:'',
                phone:'',
                tel:'',
                createdAt:'',
                adminList:[//查询出来的管理员信息

                ],

                modifyAdminModal:false,//信息修改弹框默认关闭
                modifyAdminForm:{//弹框表单数据
                    id:'',
                    account:'',
                    name:'',
                    phone:'',
                    tel:''
                },
                ruleValidate: {//表单规则控制
                    name: [
                        { required: true, message: '用户名称不能为空！', trigger: 'blur' },
                        { validator: nameFormRule, trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '手机号码不能为空!', trigger: 'blur' },
                        { validator: phoneFormRule, trigger: 'blur' }
                    ],
//                    tel: [
//                        { validator: telFormRule, trigger: 'blur' }
//                    ]
                },
            };
        },
        methods: {

            init () {//初始化函数，用于初始化获取各类列表等
                this.queryAdminList();
            },

            modifyAdmin(){//信息修改按钮
                this.$refs.modifyAdminForm.resetFields();
                let amdinList = this.modifyAdminForm;
                for(let key in amdinList){//防止数据绑定导致更改selectedData的之值
                    amdinList[key]=this.adminList[0][key];
                }
                this.modifyAdminForm = amdinList;
                this.modifyAdminModal = true;
            },

            updateAdmin(){//信息修改提交按钮
                this.$refs.modifyAdminForm.validate((valid) => {
                    if (valid) {
                        this.modifyAdminInfo();
                        //成功后关闭模态框>>>写在Ajax请求后
                        this.modifyAdminModal=false;
                    }
                })
            },

            cancel(){//信息修改返回按钮
                this.modifyAdminModal = false;
            },

            //****************下面为各项ajax请求数据函数************
            queryAdminList(){//查询管理员
                this.loading=true
                let type = 1;
                this.$axios.get('/user/list',
                    {
                        params: {
                            page: this.pageNum,
                            pageSize:this.pageSize,
                            type:type,
                            account:cookie.get("account")
                        }
                    }).then((success)=>{
                    self.loading = false;
                    if(success.data.status){
                        this.adminList = success.data.data.rows;
                        this.id = this.adminList[0].id;
                        this.account = this.adminList[0].account;
                        this.disabled = this.adminList[0].disabled;
                        this.name = this.adminList[0].name;
                        this.phone = this.adminList[0].phone;
                        this.tel = this.adminList[0].tel;
                        this.createdAt = this.adminList[0].createdAt;
                    }
                },(fail)=>{
                    this.loading = false;
                    console.info(fail)
                })
            },

            modifyAdminInfo(){//修改管理员信息函数
                this.$axios.post('/user/add',this.modifyAdminForm)
                    .then((success)=>{
                            if(success.data.status){
                                this.success('成功修改管理员信息！');
                                this.queryAdminList();//修改成功重新查询管理员信息
                            }else {
                                this.warn(success.data.message);
                            }
                        },(fail)=>{
                            console.log(fail)
                        }
                    );
            },



            getDateTime(time){//时间格式转换
                return dayjs(new Date(time)).format('YYYY-MM-DD HH:mm:ss')
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
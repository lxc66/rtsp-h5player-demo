<template>
    <div>
        <Row :gutter="10">
            <Col>
            <Card>
                <p slot="title">
                    <Icon type="ios-body"></Icon>
                    修改密码
                </p>
                <Row>
                    <div style="text-align:center;width:30%;">
                        <i-form ref="modifyPasswordForm" :model="modifyPasswordForm" :rules="ruleValidate" :label-width="100">
                            <form-item label="原密码：" prop="password">
                                <i-input v-model="modifyPasswordForm.password" type="password" placeholder="原密码！"></i-input>
                            </form-item>
                            <form-item label="新密码：" prop="newPassword">
                                <i-input v-model="modifyPasswordForm.newPassword" type="password" placeholder="新密码！"></i-input>
                            </form-item>
                            <form-item label="确认密码：" prop="reaffirmNewPwd">
                                <i-input v-model="modifyPasswordForm.reaffirmNewPwd" type="password" placeholder="请再次输入新密码！"></i-input>
                            </form-item>
                        </i-form>
                    </div>
                </Row>
                <Row class="margin-top-8" style="margin-left: 13%;margin-top: 20px;">
                    <Button type="info" @click="modifyPassword()"><Icon type="compose"></Icon>&nbsp;&nbsp;确认修改</Button>
                </Row>
            </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
    import dayjs from 'dayjs';
    export default {
        name: 'modifyPwd',
        data () {
            const newPwdRule = (rule, value, callback) => {
                var rule = this.modifyPasswordForm.password;
                if (rule == value) {
                    callback(new Error('原密码与新密码输入相同，请重新输入！'));
                }
                else {
                    callback();
                }
            };
            const reaffirmNewPwdRule = (rule, value, callback) => {
                if (value !== this.modifyPasswordForm.newPassword) {
                    callback(new Error('确认密码与新密码输入不一致，请重新输入！'));
                }
                else {
                    callback();
                }
            };
            return {
                modifyPasswordForm:{//修改密码表单数据
                    password:'',//原密码
                    newPassword:'',//新密码
                    reaffirmNewPwd:''//确认新密码
                },

                ruleValidate:{//表单字段验证
                    password: [
                        { required: true, message: '原密码不能为空！', trigger: 'blur' },
                    ],
                    newPassword: [
                        { required: true, message: '新密码不能为空!', trigger: 'blur' },
                        { validator: newPwdRule, trigger: 'blur' }
                    ],
                    reaffirmNewPwd: [
                        { required: true, message: '确认密码不能为空!', trigger: 'blur' },
                        { validator: reaffirmNewPwdRule, trigger: 'blur' }
                    ]
                },

            };
        },
        methods: {

            modifyPassword(){//确认密码按钮方法
                this.$refs.modifyPasswordForm.validate((valid) => {
                    if (valid) {
                        this.$Modal.confirm({
                            title: '提示',
                            content: '确定要修改密码吗？',
                            onOk: () => {
                                this.$axios.post('/user/changeAdminPwd',{oldPassword:this.modifyPasswordForm.password,password:this.modifyPasswordForm.newPassword})
                                    .then((success)=>{
                                        if(success.data.status==true){
                                            this.success('已成功修改密码,请重新登陆！');
                                            this.$refs.modifyPasswordForm.resetFields();
                                            this.$store.commit("logout", this);
                                            this.$router.push({
                                                name: "login"
                                            });
                                        }else {
                                            this.warn(success.data.message);
                                        }
                                    },(fail)=>{
                                        console.log(fail)
                                    });
                            },
                            onCancel: () => {
                                this.$refs.modifyPasswordForm.resetFields();
                                console.log("取消-->不操作");
                            }
                        });
                    }
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
        }
    };
</script>
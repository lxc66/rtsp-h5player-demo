<style lang="less">
    @import "./login.less";
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false" style="background:#aba9a4;opacity: 0.9;">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="account">
                            <Input v-model="form.account" placeholder="用户名">
                            <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="密码">
                            <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
    import Cookies from "js-cookie";
    import util from "../libs/util";
    export default {
        data() {
            return {
                form: {
                    account: "",
                    password: ""
                },
                rules: {
                    account: [{required: true, message: "账号不能为空", trigger: "blur"}],
                    password: [{required: true, message: "密码不能为空", trigger: "blur"}]
                }
            };
        },
        methods: {
            handleSubmit() {
                this.$refs.loginForm.validate(valid => {
                    if (valid) {
                        this.$axios
                            .post("/login", {
                                account: this.form.account,
                                password: this.form.password
                            })
                            .then(
                                success => {
                                    if (success.data.status) {
                                        this.$store.commit('clearAllTags');
                                        this.success("登录成功！");
                                        Cookies.set("account", success.data.data.account);
                                        Cookies.set("token", success.data.data.token,{ secure: util.isProductionEnv});

                                        let redirect = util.getUrlKey("redirect");
                                        if (redirect != null) {
                                            window.location.href = "/#" + redirect;
                                        } else {
                                            this.$router.push("/home");
                                        }
                                    } else {
                                        this.warning(success.data.message);
                                    }
                                },
                                fail => {
                                    console.log(fail);
                                }
                            );
                    }
                });
            },

            //*********其他共用函数***********
            warning(message) {
                //提醒函数，message为提醒内容
                this.$Message.warning({
                    duration: 3,
                    content: `<span style="font-size: 14px;font-weight: bold;">温馨提示</span><br><br>` +
                    message
                });
            },
            success(message) {
                //提醒函数，message为提醒内容
                this.$Message.success({
                    duration: 3,
                    content: `<span style="font-size: 14px;font-weight: bold;">温馨提示</span><br><br>` +
                    message
                });
            }
        }
    };
</script>

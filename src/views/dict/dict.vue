<template>
    <div>
        <Row :gutter="10">
            <Col>
            <Card>
                <p slot="title">
                    <Icon type="ios-body"></Icon>
                    参数管理
                </p>
                <Row>
                    <Input v-model="paramName"  placeholder="参数名" style="width: 200px" />
                    <Button type="info" @click="search()"><Icon type="ios-search-strong"></Icon>&nbsp;&nbsp;搜索</Button>
                    <Button type="primary" @click="searchAll()"><Icon type="refresh"></Icon>&nbsp;&nbsp;重置</Button>
                    <div style="margin-top: 10px;">
                        <Button type="primary" @click="openAdd()"><Icon type="android-add-circle"></Icon>&nbsp;&nbsp;新增</Button>
                    </div>
                </Row>
                <Row class="margin-top-10 searchable-table-con1">
                    <Table border  stripe :columns="agentTitle" :data="agentListData" ref="selection"  :loading="loading"></Table>
                </Row>
            </Card>
            </Col>
        </Row>
        <modal v-model="modalAgent"
               :styles="{top:'15px'}"
               width="500">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>{{isNew?'新增参数':'修改参数'}}</span>
            </p>
            <div style="text-align:center;width:70%;margin-left: 10%;">
                <i-form ref="agentForm" :model="agentForm" :rules="ruleValidate" :label-width="100">
                    <form-item label="参数名" prop="key">
                        <i-input v-model="agentForm.key" placeholder="参数名"  ></i-input>
                    </form-item>
                    <form-item label="值" prop="value">
                        <i-input v-model="agentForm.value" placeholder="值"  ></i-input>
                    </form-item>
                    <form-item label="描述" prop="desc">
                        <i-input v-model="agentForm.desc" placeholder="描述"></i-input>
                    </form-item>
                </i-form>
            </div>
            <div slot="footer">
                <Button type="info" size="large" @click="cancel(1)">取消</Button>
                <Button type="success" size="large" @click="updateAgent">保存</Button>
            </div>
        </modal>
    </div>
</template>

<script>
    import dayjs from 'dayjs';
    export default {
        name: 'devList',
        data () {
            return {
                //下面的用于修改样式
                loading: false,
                modalAgent:false,//一级代理商新增修改弹框框默认隐藏（模态框）
                isNew:true,
                paramName:"",


                //下面字段用于代理商表table
                agentListData: [],//存放代理商列表查询数据
                agentTitle: [//代理商table的表头
                    {
                        key: 'id',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        key: 'key',
                        title: '参数名',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',{style:{'font-weight':'bold'}},this.row.key);
                        }
                    },
                    {
                        key: 'value',
                        title: '值',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',{style:{'font-weight':'bold'}},this.row.value);
                        }
                    },
                    {
                        key: 'desc',
                        title: '描述',
                        align: 'center'
                    },
                    {
                        key: '',
                        title: '操作',
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
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
                                    }, '修改')," ",
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.remove(params.row.id)
                                            }
                                        }
                                    }, '删除')
                                ]);
                        }
                    },
                ],


                //下面的用于提交的表单
                agentForm: {//新增编辑设备信息表单数据
                    id:null,
                    key:''
                },

                ruleValidate: {//表单规则控制
                    key: [
                        { required: true, message: '参数名不能为空！', trigger: 'blur' },
                        { validator: (rule, value, callback) => {
                            if(value === ''|| value === null){
                                callback(new Error('参数名不能为空！'));
                            }else{
                                callback();
                            }
                        }, trigger: 'blur' }
                    ],
                    value: [
                        { required: true, message: '值不能为空！', trigger: 'blur' },
                        { validator: (rule, value, callback) => {
                            if(value === ''|| value === null){
                                callback(new Error('值不能为空！'));
                            }else{
                                callback();
                            }
                        }, trigger: 'blur' }
                    ]
                },
            };
        },
        methods: {

            init () {//初始化函数，用于初始化获取各类列表等
                this.queryDictList();//初始化查询用户列表
            },

            remove(id){
                let self = this;
                this.$Modal.confirm({
                    title:'提示',
                    content:'<b>此操作可能对系统会造成一定的影响，确认要删除此条记录？</b>',
                    onOk:() =>{
                        this.$axios.post('/dict/remove',
                            {
                                id:id
                            }).then((success)=>{
                            if(success.data.status){
                                self.queryDictList();
                            }
                        },(fail)=>{
                            console.info(fail)
                        })
                    }
                })

                
            },

            search () {//条件搜索按钮
                this.queryDictList();
            },

            searchAll(){//全部查询
                this.paramName = '';
                this.queryDictList();
            },

            openAdd(){//新增按钮
                this.isNew = true;
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

            //****************下面为各项ajax请求数据函数************
            queryDictList(){//查询设备列表方法
                this.loading=true;
                let self = this;
                this.$axios.get('/dict/findAll',
                    {
                        params:{key:this.paramName}
                    }).then((success)=>{
                    self.loading = false;
                    if(success.data.status){
                        this.agentListData = success.data.data;
                    }
                },(fail)=>{
                    this.loading = false;
                    console.info(fail)
                })
            },
            addAgent(){//新增一级代理商方法
                this.$axios.post('/dict/save',this.agentForm)
                    .then((success)=>{
                        if(success.data.status){
                            (this.agentForm.id) ? this.success('成功') : this.success('成功');
                            this.queryDictList();//更新成功，重新查询一级代理商列表
                        }else {
                            this.warn(success.data.message);
                        }
                    },(fail)=>{
                        console.log(fail)
                    }
                );
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

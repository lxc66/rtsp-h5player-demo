<style lang="less">
    @import '../../styles/common.less';
</style>
<template>
    <div>
        <Row :gutter="10">
            <Col>
            <Card>
                <p slot="title">
                    <Icon type="ios-list-outline"></Icon>
                    套餐清单
                </p>
                <Row>
                    <Select v-model="status" @on-change="checkInputByStatus" style="width:140px" placeholder="套餐状态">
                        <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.displayName }}</Option>
                    </Select>
                    <Select v-model="productType" @on-change="checkInputByType" style="width:140px" placeholder="套餐类别">
                        <Option v-for="item in typeLists" :value="item.value" :key="item.value">{{ item.displayName }}</Option>
                    </Select>
                    <Button type="info" @click="search()"><Icon type="ios-search-strong"></Icon>&nbsp;&nbsp;搜索</Button>
                    <Button type="primary" @click="searchAll()"><Icon type="refresh"></Icon>&nbsp;&nbsp;重置</Button>
                    <div style="margin-top: 10px;">
                        <Button type="primary" @click="openAdd"><Icon type="android-add-circle"></Icon>&nbsp;&nbsp;新增</Button>
                        <!--<Button type="warning" @click="openEdit"><Icon type="compose" size="14"></Icon>&nbsp;&nbsp;编辑</Button>-->
                        <Button type="error" @click="onOrOff(1)"><Icon type="arrow-down-a"></Icon>&nbsp;&nbsp;下架</Button>
                        <Button type="success" @click="onOrOff(2)"><Icon type="arrow-up-a"></Icon>&nbsp;&nbsp;上架</Button>
                    </div>
                </Row>
                <Row class="margin-top-10 searchable-table-con1">
                    <Table border stripe :columns="columns" :data="productData" @on-selection-change="selectRowChange" :loading="loading"></Table>
                    <Page :total="dataCount" :page-size="pageSize" show-total show-elevator show-sizer  @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="pageSizeOpts"></Page>
                </Row>
            </Card>
            </Col>
        </Row>
        <modal v-model="productModal"
               :styles="{top:'15px'}"
               width="400">
            <p slot="header" style="color:#3E4147;text-align:center">
                <span>{{(productForm.id==null)?'新增套餐':'修改套餐'}}</span>
            </p>
            <div style="text-align:center;padding: 0px 50px">
                <i-form ref="productForm" :model="productForm" :rules="ProductRule" >
                    <form-item label="套餐类型" prop="type">
                        <radio-group v-model="productForm.type">
                            <Radio label="1" :style="{display:(!productForm.id || productForm.type == '1')?'inline-block':'none'}">基础包</Radio>
                            <Radio label="2" :style="{ display: (!productForm.id||productForm.type=='2')?'inline-block':'none' }">叠加包</Radio>
                        </radio-group>
                    </form-item>
                    <form-item prop="flowBase" :hidden="flowBaseHidden">
                        <i-input v-model="productForm.flowBase"  placeholder="请填写套餐流量" :disabled="hide">
                            <span slot="prepend">套餐流量：</span>
                            <span slot="append">
                                 <i-select v-model="unitBase" placeholder="GB/月"
                                           style="width:100px" disabled>
                                    <i-option v-for="item in unitListBase" :value="item.value" :key="item.value">{{
                                        item.label }}</i-option>
                                </i-select>
                            </span>
                        </i-input>
                    </form-item>
                    <form-item prop="flowExtra" :hidden="flowExtraHidden" >
                        <i-input v-model="productForm.flowExtra"  placeholder="请填写套餐流量">
                            <span slot="prepend">套餐流量：</span>
                            <span slot="append">
                                 <i-select v-model="unitExtra" placeholder="MB"
                                           style="width:100px">
                                    <i-option v-for="item in unitListExtra" :value="item.value" :key="item.value">{{
                                        item.label }}</i-option>
                                </i-select>
                            </span>
                        </i-input>
                    </form-item>
                    <form-item prop="price">
                        <i-input v-model="productForm.price" placeholder="请填写套餐单价">
                            <span slot="prepend">套餐单价：</span>
                            <span slot="append" style="width: 60px">&nbsp;&nbsp;&nbsp;元&nbsp;&nbsp;&nbsp;</span>
                        </i-input>
                    </form-item>
                    <form-item prop="monthBase" :hidden="monthBaseHidden">
                        <i-input v-model="productForm.monthBase" placeholder="请填写套餐生效月数">
                            <span slot="prepend">生效月数：</span>
                            <span slot="append" style="width: 60px">&nbsp;&nbsp;&nbsp;个月&nbsp;&nbsp;&nbsp;</span>
                        </i-input>
                    </form-item>
                    <form-item prop="monthExtra" :hidden="monthExtraHidden">
                        <i-input v-model="productForm.monthExtra" placeholder="请填写套餐生效月数" :disabled="hide">
                            <span slot="prepend">生效月数：</span>
                            <span slot="append" style="width: 60px">&nbsp;&nbsp;&nbsp;个月&nbsp;&nbsp;&nbsp;</span>
                        </i-input>
                    </form-item>
                    <form-item label="配置套餐状态：" style="width:160px" >
                        <i-switch true-value="2" false-value="1" size="large" v-model="productForm.status">
                            <span slot="open">上架</span>
                            <span slot="close">下架</span>
                        </i-switch>
                    </form-item>
                </i-form>
            </div>
            <div slot="footer">
                <Button type="info" size="large" @click="cancel">取消</Button>
                <Button type="success" size="large" @click="updateProduct">提交</Button>
            </div>
        </modal>
    </div>
</template>

<script>
    import dayjs from 'dayjs';
    export default {
        name: 'productList',
        data () {
            //自定义表单规则，流量为正整数，价格为小数点少于两位的非负数
            const flowRule = (rule, value, callback) => {
                    if (!value) {
                    callback(new Error('套餐流量不能为空'));
                }
                var reg = /^[1-9]\d*$/;
                if (!(reg.test(value))) {
                    callback(new Error('请输入正确的数值(正整数)'));
                }
                else {
                    callback();
                }
            };
            const priceRule = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('套餐单价不能为空'));
                }
                var reg = /^\d+(\.\d{1,2})?$/;
                if (!(reg.test(value))) {
                    callback(new Error('请输入正确数值(小数点少于2位的非负数字)'));
                } else {
                    callback();
                }
            };

            return {
                pageSizeOpts:[10,20,50,100,200],
                loading:false,
                //搜索关键词,id，status
                id: '',//套餐Id
                status: '',//套餐状态，1已下架，2上架中
                statusList:'',//套餐状态查询下拉框

                //下面的用于套餐table
                productData: [],//套餐列表数据
                columns: [//套餐table的表头
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        key: 'id',
                        width: 80,
                        title: '套餐ID',
                        align: 'center'
                    },
//                    {
//                        key: 'flow',
//                        title: '套餐流量',
//                        align: 'center',
//                        render: function (h, params) {
//                            return h('strong',(this.row.flow)<1048576?(this.row.flow/1024).toFixed(0)+'MB':(this.row.flow/1048576).toFixed(0)+'GB');
//                        }
//                    },
                    {
                        key: 'type',
                        title: '套餐类别',
                        align: 'center',
                        render: function (h, params) {

                            if(this.row.type==1){
                                return h('div',{style:{color:'#DAA520','font-weight':'bold'}},"基础套餐");
                            }else if(this.row.type==2){
                                return h('div',{style:{color:'#4c8cf5','font-weight':'bold'}},"叠加包");
                            }
                        }
                    },
                    {
                        key: 'flow',
                        title: '套餐詳情',
                        align: 'center',
                        render: function (h, params) {
                            if(this.row.type==1){
                                return h('strong',{style:{color: '#DAA520	','font-weight':'bold'}},this.row.month+'月');
                            }else if(this.row.type==2){
                                return h('strong',{style:{color: '#4c8cf5	','font-weight':'bold'}},
                                    (this.row.flow)<1048576?(this.row.flow/1024).toFixed(0)+'MB':(this.row.flow/1048576).toFixed(0)+'GB'
                                );
                            }
                        }
                    },
                    {
                        key: 'status',
                        title: '套餐状态',
                        align: 'center',
                        render: function (h, params) {
                            switch (this.row.status) {
                                case 1:
                                    return h('div',{style:{color: '#FF4040	','font-weight':'bold'}},"已下架");
                                    break;
                                case 2:
                                    return h('div',{style:{color: '#3DB55E','font-weight':'bold'}},"上架中");
                                    break;
                            }
                        }
                    },
                    {
                        key: 'price',
                        title: '套餐单价',
                        align: 'center',
                        render: function (h, params) {
                            return h('strong',(this.row.price/100).toFixed(2)+'元');
                        }
                    },
//                    {
//                        key: 'month',
//                        title: '生效月数',
//                        align: 'center',
//                        render: function (h, params) {
//                            return h('strong',this.row.month);
//                        }
//                    },
                    {
                        key: 'createdAt',
                        title: '创建时间',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',dayjs(new Date(this.row.createdAt)).format('YY-MM-DD HH:mm:ss'));
                        }
                    }
                    ,
                    /*{
                        key: 'updatedAt',
                        title: '更新时间',
                        align: 'center',
                        render: function (h, params) {
                            return h('div',dayjs(new Date(this.row.updatedAt)).format('YY-MM-DD HH:mm:ss'));
                        }
                    }*/
                    {
                        title: '操作',
                        key: 'action',
                        align: 'center',
                        render: (h, params) => {
                            if(params.row.status == 2){
                                return h('div', [
                                    h('Button', {
                                        props: {
                                            type: 'warning',
                                            size: 'small',
                                            disabled: true
                                        },
                                        on: {
                                            click: () => {
                                                this.openEdit(params.row)
                                            }
                                        }
                                    }, '修改')
                                ]);
                            }else {
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
                                    }, '修改')
                                ]);
                            }
                        }
                    },
                ],
                selectedProduct:[],//选中的套餐

                //下面的用于分页组件
                dataCount:0,//套餐列表数据总数
                pageSize:10,// 每页显示多少条
                pageNum:1,//页数

                //下面的用于模态框部分
                hide:true,
                productModal:false,//模态框默认关闭
                unitBase:1048576,//流量单位转换，1M=1024KB
                unitExtra:1024,//流量单位转换，1M=1024KB
                monthBaseHidden:false,
                flowBaseHidden:false,
                monthExtraHidden:true,
                flowExtraHidden:true,
                productForm: {//编辑的套餐表单
                    id:null,
                    flowBase: '10',
                    flowExtra: null,
                    price: null,
                    monthBase: '1',
                    monthExtra: '1',
                    status:'2',
                    type: '1'
                },
                unitListBase:[//流量单位
                    {
                        value: 1,
                        label: 'KB/月'
                    },
                    {
                        value: 1024,
                        label: 'MB/月'
                    },
                    {
                        value: 1048576,
                        label: 'GB/月'
                    }
                ],
                unitListExtra:[//流量单位
                    {
                        value: 1,
                        label: 'KB'
                    },
                    {
                        value: 1024,
                        label: 'MB'
                    },
                    {
                        value: 1048576,
                        label: 'GB'
                    }
                ],
                ProductRule: {//套餐表单规则控制
                    flow: [
                        { validator: flowRule, trigger: 'blur' }

                    ],
                    price: [
                        { validator: priceRule, trigger: 'blur' }
                    ]
                },
                /**
                 * 根据套餐类别搜索相关定义字段
                 */
                productType:'',//v-model绑定选中套餐类别的value值
                typeLists:[],//搜索框下拉显示内容

            };
        },
        methods: {
            //**********下面各按钮相关处理函数***********
            checkInputById(){//搜索输入框变化时调用
                if(!(this.id == '' || this.status == 'all' || this.productType=='notSelected')){
                    this.status = '';
                    this.productType='';
                }
                this.search();
            },
            checkInputByStatus(){//选择套餐状态实现查询
                if(!(this.status == 'all')){
                    this.id = '';
                }
                    this.search();
            },

            /**
             * 套餐类别搜索框内容变化调用函数
             */
            checkInputByType(){
                if(!(this.productType == 'notSelected')){
                    this.id = '';
                }
                this.search();
            },

            search () {//搜索按钮
                this.pageNum=1;//页数，恢复到第一页
                this.queryProductList();
            },

            searchAll(){//重置按钮
                this.pageNum=1;
                this.id = '';
                this.status = '';
                this.productType='';
                this.search();
            },


            openAdd(){//新增按钮
                this.disabled=false;//设置account可编辑，与修改区别
                this.$refs.productForm.resetFields();
                this.productForm.id=null;//将id设为null，表示新增
                this.productForm.status='1';//将状态设为默认值1，表示下架
                this.productModal=true;
            },
            openEdit(value){//编辑按钮
//                console.log(this.selectedProduct);
//                if(this.selectedProduct.length<1){//限制只能选择一条数据编辑
//                    this.warn("请选择一条数据进行编辑");
//                    return false;
//                }else if(this.selectedProduct.length>1){
//                    this.warn("最多只能选择一条数据编辑");
//                    return false;
//                };
                this.$refs.productForm.resetFields();//清空规则
                this.productForm.id = value.id;
                if(value.flow<1024){//流量少于1M，单位选择KB，即unit为1
                    this.productForm.flowBase = value.flow;
                    this.productForm.flowExtra = value.flow;
                    this.unitBase=1;
                    this.unitExtra=1;
                }else if (value.flow<1048576){//流量少于1G，单位选择MB，即unit为1024
                    this.productForm.flowBase = (value.flow)/1024;
                    this.productForm.flowExtra = (value.flow)/1024;
                    this.unitBase=1024;
                    this.unitExtra=1024;
                }else {//流量大于1G，单位选择GB，即unit为1048576
                    this.productForm.flowBase = (value.flow)/1048576;
                    this.productForm.flowExtra = (value.flow)/1048576;
                    this.unitBase=1048576;
                    this.unitExtra=1048576;

                }
                this.productForm.price = (value.price)/100;
                this.productForm.status = value.status==1?'1':'2';
                this.productForm.monthBase = value.month;
                this.productForm.monthExtra = value.month;
                this.productForm.type = value.type+'';
                this.productModal=true;
            },
            updateProduct(){//套餐信息提交按钮
                this.$refs.productForm.validate((valid) => {
                    if (valid) {
                        var updateFlowBase = (this.productForm.flowBase*this.unitBase).toFixed(0);
                        var updateFlowExtra = (this.productForm.flowExtra*this.unitExtra).toFixed(0);
                        var updatePrice = (this.productForm.price*100).toFixed(0);
                        var monthBase = this.productForm.monthBase;
                        var monthExtra = this.productForm.monthExtra;
                        this.$axios.post('/product/add',
                            {
                                id: this.productForm.id,
                                flowBase: updateFlowBase,
                                flowExtra: updateFlowExtra,
                                price: updatePrice,
                                monthBase: monthBase,
                                monthExtra: monthExtra,
                                status: this.productForm.status,
                                type: this.productForm.type
                            })
                            .then((success)=>{
                                if(success.data.status==true){
                                    this.queryProductList();//更新成功，重新查询用户列表
                                    (this.productForm.id) ? this.success('套餐修改成功') : this.success('新增套餐成功');
                                }else {
                                    this.warn(success.data.message);
                                }
                            },(fail)=>{
                                console.log(fail)
                            });
                        //成功后关闭模态框>>>写在Ajax请求后
                        this.productModal=false;
                    }
                })
            },
            cancel(){//取消编辑套餐信息
                console.log("点击取消，不进行操作");
                this.productModal=false;
            },
            onOrOff (status) {//套餐上架/下架按钮
                if(this.selectedProduct.length<1){
                    this.warn("请至少选择一条数据进行操作");
                    return false;
                }else {
                    var ids=[];
                    //组装需要删除的id数组
                    for(var i=0;i<this.selectedProduct.length;i++){
                        ids.push(this.selectedProduct[i].id);
                    }
                    this.$Modal.confirm({
                        title: '提示',
                        content: '确定要'+ ((status==2) ?"上架":"下架")+'选中的套餐吗？',
                        onOk: () => {
                            this.$axios.post('/product/offOn',{ids:ids,status:status})
                                .then((success)=>{
                                    if(success.data.status==true){
                                        this.queryProductList();//上架或下架成功，重新查询列表
                                        (status==2) ? this.success('套餐成功上架') : this.success('套餐成功下架');
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
                }
            },
            //*************下面为table组件的相关函数****************
            selectRowChange(selection){//用户表格勾选变化时触发
                this.selectedProduct=selection;
            },
            //*************下面为分页组件的相关函数****************
            changePage(index){//页数改变,index为页数
                this.pageNum=index;
                this.queryProductList();
            },
            changePageSize(index){//改变每页条数,index为每页条数
                this.pageSize =index;
                this.queryProductList();
            },

            //****************下面为各项ajax请求数据函数************
            queryProductList(){//查询套餐列表函数
                this.selectedProduct = [];//重新查询数据时，清空选中数据，防止点编辑按钮时打开模态框
                this.loading=true;
                this.$axios.get('product/list',
                    {
                        params:{
                            page:this.pageNum,
                            pageSize:this.pageSize,
                            id:this.id,
                            status:this.status=='all'?'':this.status,
                            type:this.productType == 'notSelected'?'':this.productType
                        }
                    }
                )
                    .then((success)=>{
                        var data = success.data.data;
                        this.productData = data.rows;
                        this.dataCount = data.total;
                    },(fail)=>{
                        console.log(fail)
                    })
                    this.loading = false;
            },

            /**
             * 获取套餐状态搜索框下拉内容请求函数
             */
            queryProductStatus(){
                this.$axios.get('/product/getStatusEnum').then((success)=>{
                    if(success.data){
                        let statusLists = success.data.data;
                        let defaultStatus = {
                            "displayName": "选择套餐状态",
                            "value": 'all'
                        }
                        statusLists.unshift(defaultStatus);
                        this.statusList = statusLists;
                    }
                },(fail)=>{
                    console.info(fail)
                })
            },

            /**
             * 获取套餐类别搜索框下拉内容请求函数
             */
            queryProductType(){
                this.$axios.get('/product/getTypeEnum').then((success)=>{
                    if(success.data){
                        let typeLists = success.data.data;
                        let defaultType = {
                            "displayName": "选择套餐类别",
                            "value": 'notSelected'
                        }
                        typeLists.unshift(defaultType);
                        this.typeLists = typeLists;
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
                this.queryProductList();//初始化查询套餐列表
                this.queryProductType();//初始化查询套餐类型下拉内容
                this.queryProductStatus();//初始化查询套餐状态下拉内容
            }

        },//以上为methods

        //初始化运行下面函数
        mounted () {
            this.init();//执行初始化函数初始化页面
        },
        watch: {
            productForm:{
                handler: function (val) {
                    if(val.type == 1 ){
                        this.flowBaseHidden = false;
                        this.monthBaseHidden = false;
                        this.flowExtraHidden = true;
                        this.monthExtraHidden = true;
                    }else if(val.type == 2){
                        this.flowBaseHidden = true;
                        this.monthBaseHidden = true;
                        this.flowExtraHidden = false;
                        this.monthExtraHidden = false;
                    }
                },
                deep:true
            }
        }
    };

</script>

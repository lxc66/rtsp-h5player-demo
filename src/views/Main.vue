<style lang="less">
@import "./main.less";
</style>
<template>
    <div class="main" :class="{'main-hide-text': shrink}">
        <div class="sidebar-menu-con" :style="{width: shrink?'60px':'200px', overflow: shrink ? 'visible' : 'auto'}">
            <shrinkable-menu 
                :shrink="shrink"
                :menu-list="menuList">
                <div slot="top" class="logo-con"  @click="goHome" >
                    <img v-show="!shrink"  src="../images/logo.png" key="max-logo"/>
                    <img v-show="shrink" src="../images/logo-min.png" key="min-logo" />
                </div>
            </shrinkable-menu>
        </div>
        <div class="main-header-con" :style="{paddingLeft: shrink?'60px':'200px'}">
            <div class="main-header">
                <div class="navicon-con">
                    <Button :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <div class="header-avator-con">
                    <div class="user-dropdown-menu-con">
                        <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
                            <Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
                                <a href="javascript:void(0)">
                                    <span class="main-user-name">{{ userName }}</span>
                                    <Icon type="arrow-down-b"></Icon>
                                </a>
                                <DropdownMenu slot="list">
                                    <DropdownItem name="ownSpace">个人中心</DropdownItem>
                                    <DropdownItem name="loginout" >退出登录</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <div @click="goAdminInf">
                                <Avatar icon="person" style="background: #619fe7;margin-left:10px;cursor:pointer;"></Avatar>
                            </div>
                        </Row>
                    </div>
                </div>
            </div>
            <div class="tags-con">
                <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
            </div>
        </div>

        <div class="single-page-con" :style="{left: shrink?'60px':'200px'}">
            <div class="single-page">
                    <router-view></router-view>
            </div>
        </div>
    </div>
</template>
<script>
import Cookies from "js-cookie";
import shrinkableMenu from "./main-components/shrinkable-menu/shrinkable-menu.vue";
import tagsPageOpened from './main-components/tags-page-opened.vue';

export default {
  components: {
    tagsPageOpened,
    shrinkableMenu
  },
  data() {
    return {
      shrink: false,
      userName: ""
    };
  },
  computed: {
    menuList() {
        return this.$store.state.app.menuList;
    },
    pageTagsList () {
        let list = this.$store.state.app.pageOpenedList
        return list; // 打开的页面的页面对象
    },
  },
  methods: {
    toLoginView() {
    //   let self = this;
    //   setTimeout(function() {
    //     self.$router.push({
    //       name: "login"
    //     });
    //   }, 100);
    },

    init() {
    //   let account = Cookies.get("account");
    //   if (account) {
    //     this.userName = account;
    //   } else {
    //     this.toLoginView();
    //   }
    },
    toggleClick() {
      this.shrink = !this.shrink;
    },
    handleClickUserDropdown(name) {
        if(name == 'ownSpace'){
            //个人中心
            this.goAdminInf();
        }else if(name == 'loginout'){
            // 退出登录
            this.$store.commit("logout", this);
            this.$router.push({
                name: "login"
            });
        }


    },
    goHome(){
        this.$router.push({
            name: "home"
        });
    },
    goAdminInf(){
        this.$router.push({
            name: "adminInformation"
        });
    }
  },
  mounted() {
    this.init();
  },
    created () {
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
    }
};
</script>

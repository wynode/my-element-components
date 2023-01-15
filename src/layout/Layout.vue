<template>
  <div class="layout">
    <div class="layout-aside" :class="{ 'layout-aside--collapse': isCollapse }">
      <div class="side-nav">
        <div class="side-nav__hd">
          <a href="#">
            <i class="el-icon-platform-eleme side-nav__logo"></i>
            <p class="side-nav__title">内部审核</p>
          </a>
        </div>

        <el-menu class="side-nav__menu" :collapse="isCollapse" :collapse-transition="true">
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span slot="title">内容安全</span>
            </template>
            <el-menu-item index="1-1">服务管理</el-menu-item>
            <el-menu-item index="1-2">智能审核平台</el-menu-item>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span slot="title">行为式验证码</span>
            </template>
            <el-menu-item index="2-1">服务管理</el-menu-item>
            <el-menu-item index="2-2">数据统计</el-menu-item>
            <el-menu-item index="2-3">业务ID管理</el-menu-item>
            <el-menu-item index="2-4">自定义底图</el-menu-item>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span slot="title">反作弊</span>
            </template>
            <el-menu-item index="3-1">服务管理</el-menu-item>
            <el-menu-item index="3-2">风险分析</el-menu-item>
            <el-menu-item index="3-3">数据查询</el-menu-item>
            <el-menu-item index="3-4">名单管理</el-menu-item>
            <el-menu-item index="3-4">策略管理</el-menu-item>
          </el-submenu>

          <el-menu-item index="3" disabled>
            <i class="el-icon-document"></i>
            <span slot="title">反作弊</span>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-setting"></i>
            <span slot="title">信息认证</span>
          </el-menu-item>
        </el-menu>
      </div>
    </div>
    <div class="layout-container" :class="{ 'layout-container--collapse': isCollapse }">
      <div class="layout-header">
        <div class="header-nav">
          <div class="header-nav__left">
            <button class="header-nav__collapse" @click="isCollapse = !isCollapse">
              <i class="el-icon-s-unfold" v-if="isCollapse"></i>
              <i class="el-icon-s-fold" v-else></i>
            </button>
            <div class="announce">
              <a href="#/announce/detail/?id=20" class="announce__text">你有一条新的通知</a>
            </div>
          </div>
          <div class="header-nav__right"></div>
        </div>
      </div>
      <div class="layout-main">
        <el-button type="text">ssdfjksjd</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLogin: false,
      navCollapse: false,
    }
  },

  computed: {
    isCollapse: {
      get() {
        this.navCollapse = Boolean(JSON.parse(localStorage.getItem('nav_collapse')))
        return this.navCollapse
      },
      set(newValue) {
        localStorage.setItem('nav_collapse', newValue)
        this.navCollapse = newValue
      },
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/styles/variables';
@mixin menu-item-colors(
  $color: $nav-color,
  $color-hover: $nav-color-hover,
  $color-active: $nav-color-active,
  $bgcolor: $nav-bgcolor,
  $bgcolor-hover: $nav-bgcolor-hover,
  $bgcolor-active: $nav-bgcolor-active
) {
  color: $color;
  background-color: $bgcolor;
  &:hover {
    color: $color-hover;
    background-color: $bgcolor-hover;
    i {
      color: $color-hover;
    }
    &::before {
      background-color: $color-hover;
    }
  }
  &.is-active {
    color: $color-active;
    background-color: $bgcolor-active;
    &::before {
      background-color: $color-active;
    }
    i {
      color: $color-active;
    }
  }
}
.layout {
  height: 100%;
  .layout-aside {
    background-color: $nav-bgcolor;
    width: 180px;
    height: 100%;
    position: fixed;
    left: 0;
    z-index: 1000;
    transition: all 0.3s ease-in-out;
  }
  .layout-aside--collapse {
    width: 56px;
    .side-nav__hd {
      width: 56px;
    }
    .el-menu--collapse {
      width: 56px;
    }
  }
  .layout-container {
    height: 100%;
    padding-left: 180px;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease-in-out;
    .layout-header {
      height: 48px;
      position: fixed;
      left: 180px;
      right: 0;
      z-index: 1000;
      overflow: hidden;
      transition: all 0.3s ease-in-out;
    }
    .layout-main {
      position: relative;
      top: 48px;
      width: 100%;
      height: calc(100% - 48px);
      padding: 22px 42px 22px 42px;
      background-color: #fff;
      overflow-y: auto;
      box-sizing: border-box;
    }
  }
  .layout-container--collapse {
    padding-left: 56px;
    .layout-header {
      left: 56px;
    }
  }
}

.header-nav {
  background-color: $header-bgcolor;
  display: flex;
  height: 48px;
  justify-content: space-between;
  .header-nav__left {
    display: flex;
    .header-nav__collapse {
      display: flex;
      cursor: pointer;
      background-color: $header-bgcolor;
      width: 50px;
      height: 100%;
      justify-content: center;
      padding: 0;
      border: 0;
      align-items: center;
      box-sizing: border-box;
      border-left: 1px solid $nav-bgcolor;
      border-right: 1px solid $nav-bgcolor;
      &:hover {
        background-color: $nav-bgcolor;
      }
      i {
        display: inline-block;
        width: 16px;
        height: 16px;
        color: #ccc;
      }
    }
    .announce {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 16px;
      &::before {
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        background-color: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAXpJREFUOBHNUs1KAlEUPsfRGLGfVQUtoyyKaN0iwlIzEEcI0meIdkG7XiCIeoB2LdSpoNEgYkYwaNMLRCXUojZB6xzD5nTu4DXFkZZ1F3PPnPN93/m7AH99sFcBOpHiFMv7CDSR0WLJXji/V0A3zSHHsHSOxQmhKjGGYY3WAI5UNbCZXl16EX6fDBIxlM9p6XqSPvCWzbiMybueWnkXdr32WWS8y3VJ+XPrAYDCEthxcwVZLRYuGGaVEA+CpB7bZD9zuq2sFs1LlbEOkscPgrINDhw2FHuYkHKceU3AWi14cDpcG9pykQd63/iCRSbdEdBUS4AVe26jXYVb8CGiI3xMcTmyhV8FdMNKAAHPyX/D3GlAePypgPC1PZOX7RDsgg93ghh6A4eyjLkSuK7MZxfWOPdZ4jXNuELNLQhbrLpglHNc/NzIoDIfiUQaXUNcT0afBgL9C4B46Qq0fU4qlRCnVPsCmBJkEeqqQOKbT3kPiWYz6VhC+v/f/Q1xaoD4Hb4DagAAAABJRU5ErkJggg==)
          no-repeat;
      }
    }
    .announce__text {
      max-width: 368px;
      padding-left: 8px;
      font-size: 12px;
      color: #fff;
      box-sizing: border-box;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-decoration: none;
    }
  }
  .header-nav__right {
  }
}

.el-menu {
  &.el-menu--popup,
  .el-menu--inline {
    background-color: $nav-item-bgcolor;
    .el-menu-item {
      color: $nav-color;
      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #727e90;
        margin-right: 14px;
        vertical-align: middle;
      }
      @include menu-item-colors(
        $nav-color,
        $nav-color-hover,
        $nav-item-color-active,
        $nav-item-bgcolor,
        $nav-item-bgcolor-hover,
        $nav-item-bgcolor
      );
    }
  }
}

.side-nav {
  height: 100%;
  .side-nav__hd {
    width: 180px;
    height: 48px;
    padding-left: 16px;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-color: $header-bgcolor;
    transition: all 0.3s ease-in-out;
    a {
      text-decoration: none;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .side-nav__logo {
      font-size: 24px;
    }
    .side-nav__title {
      font-size: 20px;
      margin-left: 14px;
      width: 84px;
    }
  }
  .side-nav__menu {
    height: calc(100% - 48px);
    overflow-y: auto;
    overflow-x: hidden;
    border-right: none;
    background-color: $nav-bgcolor;
    transition: all 0.3s ease-in-out;
    > .el-menu-item {
      i {
        font-size: 16px;
        width: 16px;
      }
      @include menu-item-colors();
    }
    // &.el-menu--collapse {
    //   .el-submenu {
    //     .el-submenu__title {
    //       span {
    //         opacity: 0;
    //       }
    //     }
    //   }
    // }
    .el-submenu {
      transition: all .3s ease-in-out;
      &:has(:hover) {
        .el-submenu__title {
          color: $nav-color-hover;
          i {
            color: $nav-color-hover;
          }
        }
      }
      .el-submenu__title {
        i {
          font-size: 16px;
          width: 16px;
        }
        // span {
        //   display: inline-block;
        //   max-width: 100px;
        //   vertical-align: middle;
        //   line-height: 1;
        //   white-space: nowrap;
        // }
        @include menu-item-colors();
      }
      &.is-active {
        .el-submenu__title {
          color: $nav-color-active;
          background-color: $nav-bgcolor-active;
          i {
            color: $nav-color-active;
          }
        }
      }
    }
  }
}
</style>

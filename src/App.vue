<template>
  <div id="app">
    <!-- <MyUpload
      ref="MyUpload"
      v-model="image"
      :autoUpload="false"
      responseKey="url"
      :limitSize="100"
      :limit="5"
      listType="picture-card"
    />
    <el-button @click="handleSubmit">点击上传</el-button> -->

    <!-- <MySwiper></MySwiper> -->

    <Login></Login>
  </div>
</template>

<script>
export default {
  name: 'App',

  components: {
    // MyUpload: () => import('./components/MyUpload.vue'),
    // MySwiper: () => import('./components/MySwiper.vue'),
    Login: () => import('./views/Login.vue'),
  },

  data() {
    return {
      image: [],
    }
  },

  methods: {
    handleSubmit() {
      this.$refs.MyUpload.submitFileList()
    },
  },
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

<template>
  <div id="app">
    {{ image }}
    <MyUpload v-model="image" :autoUpload="false" responseKey="previewUrl" />
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
    MyUpload: () => import('./components/MyUpload.vue'),
  },
  data() {
    return {
      image: [
        'blob:http://localhost:8080/8130f053-2f93-4d1f-8f9b-211e97883655',
        'blob:http://localhost:8080/8130f053-2f93-4d1f-8f9b-211e97883655',
      ],
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

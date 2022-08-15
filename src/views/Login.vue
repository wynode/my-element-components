<template>
  <div>
    <el-card class="login_input_box">
      <el-input v-model="form.username" placeholder="请输入帐户"></el-input>
      <el-input v-model="form.password" placeholder="请输入密码"></el-input>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
    }
  },
}
</script>


<style lang="scss">
.login_input_box {
  width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
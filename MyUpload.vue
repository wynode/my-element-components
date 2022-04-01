<template>
  <div>
    <el-upload
      id="upload_wy"
      ref="upload_wy"
      action=""
      :accept="accept"
      :fileList="fileList"
      :limit="limit"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-change="handleFileChange"
      :auto-upload="false"
      :list-type="listType"
    >
      <!-- <template v-if="listType === 'picture-card'">
        <i slot="default" class="el-icon-plus"></i>
        <div slot="tip" class="el-upload__tip">
          单张图片大小不能超过{{ limitSize }}M，支持拖拽或复制粘贴上传。
        </div>
      </template> -->

      <template>
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">
          只能上传 {{ limitFileType }}文件，且不超过
          {{ limitSize }}m，支持剪切板上传
        </div>
      </template>
    </el-upload>
    <el-dialog :visible.sync="previewImageDialogVis" append-to-body top="5vh">
      <img width="100%" :src="previewImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios"
import { BACKEND_API, TOKEN_NAME } from "@/config"

const $http = axios.create({
  baseURL: BACKEND_API,
  timeout: 3 * 60 * 1000, // 3 minutes
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

export default {
  props: {
    accept: {
      // input原生支持的accept，限制文件选择
      // 可以从以下选项中选择一个或者多个组合
      // 1.一个以英文句号（"."）开头的合法的不区分大小写的文件名扩展名。例如： .jpg，.pdf 或 .doc。
      // 2.一个不带扩展名的 MIME 类型字符串。
      // 3.字符串 audio/*， 表示 “任何音频文件”。
      // 4.字符串 video/*，表示 “任何视频文件”。
      // 5.字符串 image/*，表示 “任何图片文件”。（一般再加上.pdf)

      // excel速写：.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
      // word速写：.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
      type: String,
      default: "",
    },
    responseKey: {
      // 需要取的fileList里面的值，可以取
      // raw（二进制binary）
      // base64（base64）
      // url，id等需后端返回的字段
      type: String,
      default: "raw",
    },
    responseValue: {
      type: [String, Number],
      default: "",
    },
    responseValueList: {
      type: Array,
      default: () => [],
    },
    limit: {
      // 限制文件数量
      type: Number,
      default: 1,
    },
    limitSize: {
      // 限制单个文件大小
      type: Number,
      default: 5,
    },
    limitFileType: {
      // 限制文件上传类型（只做提示用）
      type: String,
      default: "image",
    },
    initFileListData: {
      // 初始化FileList
      type: Array,
      default: () => [],
    },
    uploadFieldName: {
      type: String,
      default: "file",
    },
    uploadUrl: {
      type: String,
      default: "",
    },
    listType: {
      type: String,
      default: "text",
    },
    autoUpload: {
      type: Boolean,
      default: true,
    },
    needBase64: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      previewImageDialogVis: false,
      previewImageUrl: "",
      fileList: [],
    }
  },

  computed: {
    headers() {
      const token = localStorage.getItem(TOKEN_NAME)
      if (typeof token === "string") {
        return {
          Authorization: `JWT ${token}`,
        }
      }
      return {
        Authorization: `JWT ${JSON.parse(token)}`,
      }
    },
  },

  watch: {
    initFileListData: {
      immediate: true,
      handler(newValue) {
        if (newValue.length) {
          newValue.forEach((item) => {
            this.fileList.push({
              type: "image",
              name: item.split("/").pop(),
              previewUrl: item,
            })
          })
        }
      },
    },
  },

  methods: {
    // 二进制binary转base64
    transFile2Base64(fileObj) {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.readAsDataURL(fileObj)
      })
    },

    // 处理上传错误
    handleDealWithUploadError(error) {
      let { data: errorMsg } = error.response || {}
      // 这么写是为了防止data是null
      errorMsg = errorMsg || "上传出现错误，请联系管理员"
      if (typeof errorMsg === "string") {
        this.$message.error(errorMsg)
      } else if (typeof errorMsg === "object") {
        const errorMsgList = Object.values(errorMsg)
        if (errorMsgList.length) {
          this.$message.error(`${errorMsgList}`)
        }
      }
    },

    // 更新responseValue即上传后返回的值
    updateResponseValue() {
      const res = this.fileList.map((item) => item[this.responseKey] || "")
      if (this.limit === 1) {
        this.$emit("update:responseValue", res[0])
      } else {
        this.$emit("update:responseValue", res)
      }
    },

    // 文件超过数量钩子
    handleExceed(files, fileList) {
      const tip = `当前限制选择 ${this.limit} 个文件，本次选择了 ${
        files.length
      } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      this.$message.warning(tip)
    },

    // 上传之前检查是否为空和文件大小
    beforeUpload(file = { size: 0, type: "" }) {
      if (!file || file.size === 0) {
        this.$message.error("不能上传空文件")
        return false
      }
      const isLimitScope = file.size / 1024 / 1024 < this.limitSize
      if (!isLimitScope) {
        this.$message.error(`上传的文件大小不能超过 ${this.limitSize}MB!`)
        return false
      }
      return true
    },

    // 用户选择文件或者粘贴复制文件后的钩子
    async handleFileChange(comFile) {
      if (!this.beforeUpload(comFile.raw)) {
        this.handleRemove(comFile)
        return
      }
      let base64Data = ""
      if (this.needBase64) {
        base64Data = await this.transFile2Base64(comFile.raw)
      }
      this.fileList.push({
        uid: new Date().getTime(),
        name: comFile.name,
        size: comFile.size,
        raw: comFile.raw,
        type: comFile.raw && comFile.raw.type,
        percentage: 0,
        status: "ready",
        previewUrl: URL.createObjectURL(comFile.raw),
        base64: base64Data,
      })
      // 不需要上传
      if (!this.autoUpload) {
        this.updateResponseValue()
        return
      }
      // 直接上传
      this.submit(this.fileList.slice(-1))
    },

    // 上传传入的单个file
    submit(comFile) {
      const formData = new FormData()
      // 表单名称，表单的值，传给服务器的名称
      formData.append(this.uploadFieldName, comFile.raw, comFile.name)
      $http
        .post(this.uploadUrl, formData, {
          headers: {
            ...this.headers,
          },
        })
        .then((res) => {
          this.handleSuccess(res.data, comFile)
        })
        .catch((error) => {
          this.handleDealWithUploadError(error)
        })
    },

    // 手动上传文件列表（提供给外部调用）
    submitFileList() {
      if (this.fileList.length) {
        this.fileList.forEach((item) => {
          this.submit(item || {})
        })
      } else {
        this.$message.error("未选择或粘贴文件")
      }
    },

    async handleSuccess(res, file) {
      let responseKeyValue = ""
      if (res && this.responseKey) {
        responseKeyValue = res[this.responseKey]
      }
      this.fileList.forEach((item) => {
        if (file.uid === item.uid) {
          item.percentage = 100
          item.status = "success"
          item[this.responseKey] = responseKeyValue
        }
      })
      this.updateResponseValue()
      this.$emit("success")
    },

    // handleProgress(event, file, fileList) {
    //   console.log(event, file, fileList)
    // },

    handlePreview(comFile) {
      if (comFile.type && comFile.type.includes("image")) {
        this.previewImageUrl = comFile.previewUrl
        this.previewImageDialogVis = true
      } else {
        window.open(comFile.previewUrl || comFile.url, "_blank")
      }
    },

    handleRemove(comFile) {
      this.fileList = this.fileList.filter((item) => {
        return item.name !== comFile.name
      })
      this.updateResponseValue()
      this.$emit("remove")
    },

    async handlePasteData(e) {
      if (!(e.clipboardData && e.clipboardData.items)) {
        this.$notify.error("未获取到剪切板数据，请手动上传")
        return false
      }
      const clipboardItems = e.clipboardData.items
      for (let i = 0; i < clipboardItems.length; i += 1) {
        if (
          clipboardItems[i].kind === "string" &&
          clipboardItems[i].type.match("^text/plain")
        ) {
          // 此方法可用于获取剪切板文字
          // clipboardItems[i].getAsString(function(text) {
          //   console.log(text)
          // })
          this.$message.warning("你的剪切板没有文件！")
        } else if (clipboardItems[i].kind === "file") {
          const file = clipboardItems[i].getAsFile() || {}
          if (!file.type) {
            this.$message.warning("未识别的文件格式，请谨慎上传！")
          }
          const comFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            raw: file,
          }
          // 这样写是为了和element的fileChange钩子传入值保持一致,主要是创造了file.raw用来存储file
          // 据此，本组件中所有comFile即为包装了file.raw的上传文件对象

          this.handleFileChange(comFile)
        }
      }

      return true
    },

    registerPasteEvent() {
      document.addEventListener("paste", this.handlePasteData, false)
    },

    handleManulDestory() {
      this.fileList.forEach((file) => {
        if (file.url && file.url.indexOf("blob:") === 0) {
          URL.revokeObjectURL(file.url)
        }
        if (file.previewUrl && file.previewUrl.indexOf("blob:") === 0) {
          URL.revokeObjectURL(file.previewUrl)
        }
      })
      this.fileList = []
      document.removeEventListener("paste", this.handlePasteData, false)
    },
  },

  mounted() {
    // if (this.initFileListData.length) {
    //   this.initFileListData.forEach((item) => {
    //     this.fileList.push({
    //       name: item.split('/').pop(),
    //       url: item,
    //     })
    //   })
    // }
    this.registerPasteEvent()
  },

  beforeDestroy() {
    this.fileList.forEach((file) => {
      if (file.url && file.url.indexOf("blob:") === 0) {
        URL.revokeObjectURL(file.url)
      }
      if (file.previewUrl && file.previewUrl.indexOf("blob:") === 0) {
        URL.revokeObjectURL(file.previewUrl)
      }
    })
    this.fileList = []
    document.removeEventListener("paste", this.handlePasteData, false)
  },
}
</script>

<style lang="scss">
#upload_wy {
  .el-upload--picture-card {
    border: none;
    width: 148px;
    height: 148px;
    .el-upload-dragger {
      width: 148px;
    }
  }
  .el-upload__tip {
    margin-top: 10px;
  }
  .el-upload-list {
    line-height: 0;
    vertical-align: bottom;
  }
}
</style>

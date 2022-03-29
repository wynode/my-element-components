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
          只能上传 {{ limitFileType.join(",") }}文件，且不超过
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
    responseValue: {
      type: [String, Number],
      default: "",
    },
    responseValueList: {
      type: Array,
      default: () => [],
    },
    fileListBase64: {
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
      // 限制上传文件类型
      type: Array,
      default: () => [],
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
    responseKey: {
      type: String,
      default: "url",
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
    transFile2Base64(fileObj) {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.readAsDataURL(fileObj)
      })
    },

    updatePropsData() {
      this.$emit(
        "update:responseValue",
        this.fileList[0] ? this.fileList[0][this.responseKey] : ""
      )
      this.$emit(
        "update:responseValueList",
        this.fileList.map((item) => item[this.responseKey])
      )
      this.$emit(
        "update:fileListBase64",
        this.fileList.map((item) => item.base64)
      )
    },

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

    handleExceed(files, fileList) {
      const tip = `当前限制选择 ${this.limit} 个文件，本次选择了 ${
        files.length
      } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      this.$message.warning(tip)
    },

    beforeUpload(file = { size: 0, type: "" }) {
      if (!file || file.size === 0) {
        this.$message.error("不能上传空文件")
        return false
      }
      const isLimitScope = file.size / 1024 / 1024 < this.limitSize
      if (!isLimitScope) {
        this.$message.error(`上传头像图片大小不能超过 ${this.limitSize}MB!`)
        return false
      }

      if (this.limitFileType.length) {
        const isLimitFileType = this.limitFileType.reduce((acc, cur) => {
          return (file.type && file.type.includes(cur)) || acc
        }, false)
        if (!isLimitFileType) {
          this.$message.error("上传文件不符合文件格式要求!")
          return false
        }
      }
      return true
    },

    async handleFileChange(comFile) {
      if (!this.beforeUpload(comFile.raw)) {
        this.handleRemove(comFile)
        return
      }
      // 不需要上传
      if (!this.autoUpload) {
        let base64Data = ""
        if (this.needBase64) {
          base64Data = await this.transFile2Base64(comFile.raw)
        }
        this.fileList.push({
          name: comFile.name,
          size: comFile.size,
          raw: comFile.raw,
          type: comFile.raw && comFile.raw.type,
          percentage: 0,
          status: "ready",
          previewUrl: URL.createObjectURL(comFile.raw),
          base64: base64Data,
        })
        return
      }

      // 否则就是直接上传
      this.submit(comFile)
    },

    submit(comFile) {
      const formData = new FormData()
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

    submitFileList() {
      if (this.fileList.length) {
        this.fileList.forEach((item) => {
          this.submit(item || {})
        })
      }
    },

    async handleSuccess(res, comFile) {
      let responseKeyValue = ""
      let base64Data = ""
      if (res && this.responseKey) {
        responseKeyValue = res[this.responseKey]
      }
      if (this.needBase64) {
        base64Data = await this.transFile2Base64(comFile.raw)
      }

      this.fileList.push({
        name: comFile.name,
        size: comFile.size,
        raw: comFile.raw,
        type: comFile.raw && comFile.raw.type,
        percentage: 100,
        status: "success",
        previewUrl: URL.createObjectURL(comFile.raw),
        [this.responseKey]: responseKeyValue,
        base64: base64Data,
      })
      this.updatePropsData()
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
      this.updatePropsData()
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
            status: "ready",
            name: file.name,
            type: file.type,
            size: file.size,
            percentage: 0,
            uid: Date.now(),
            raw: file,
          }

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

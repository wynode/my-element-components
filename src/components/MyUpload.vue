<template>
  <div>
    <el-upload
      id="my_upload"
      ref="my_upload"
      action=""
      :accept="acceptComp"
      :fileList="fileList"
      :limit="limit"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-change="handleFileChange"
      :auto-upload="false"
      :list-type="listType"
      :drag="draggable"
    >
      <!-- 拖拽显示 -->
      <template v-if="draggable">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </template>
      <!-- 图片列表显示 -->
      <template v-else-if="listType === 'picture-card'">
        <i slot="default" class="el-icon-plus"></i>
      </template>
      <!-- 只有一个上传按钮 -->
      <template v-else>
        <el-button size="small" type="primary">点击上传</el-button>
      </template>
      <div slot="tip" class="el-upload__tip">
        可上传{{ limitFileType }}文件，且不超过{{ limitSize }}m，支持剪切板上传
      </div>
    </el-upload>
    <el-dialog :visible.sync="previewImageDialogVis" append-to-body top="5vh">
      <el-image style="width: 100%" :src="previewImageUrl">
      </el-image>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

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
      default: '',
    },
    limitFileType: {
      // 提示文件的上传类型
      type: String,
      default: '',
    },
    limit: {
      // 限制文件数量
      type: Number,
      default: 1,
    },
    limitSize: {
      // 限制单个文件大小
      type: Number,
      default: 2,
    },
    responseKey: {
      // 需要取的fileList里面的值，可以取
      // raw（二进制binary）
      // default (直接取后端发的res.data)
      // base64（base64）
      // url，id等需后端返回的字段
      type: String,
      default: 'default',
    },
    value: {
      // 从fileList里取responseKey的值，更新绑定。
      type: [String, Number, Array],
      default: '',
    },
    uploadFormDataKey: {
      // 上传文件formdata的key
      type: String,
      default: 'file',
    },
    uploadUrl: {
      // 上传完整url
      type: String,
      default: 'upload',
    },
    uploadToken: {
      // 上传认证的Authorization
      type: String,
      default: '',
    },
    data: {
      // 上传的额外数据
      type: Object,
      default: () => ({}),
    },
    uploadFormDataFileListKey: {
      // 需要上传的fileList里面的数据的key键值对
      type: Object,
      default: () => ({}),
    },
    listType: {
      // 上传列表的样式，有text/picture/picture-card三种选项
      type: String,
      default: 'text',
    },
    autoUpload: {
      type: Boolean,
      default: true,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    needBase64: {
      // 是否需要base64格式
      type: Boolean,
      default: false,
    },
    needUploadBase64: {
      // 是否需要上传文件的base64格式
      type: Boolean,
      default: false,
    },
    needInitFileList: {
      // 是否需求根据v-model数据初始化fileList
      type: Boolean,
      default: true,
    },
    vModelFormat: {
      type: Function,
      default: null,
    },
    myBeforeUpload: {
      type: Function,
      default: null,
    },
    fileListInitFunc: {
      type: Function,
      default: null,
    },
  },

  data() {
    return {
      previewImageDialogVis: false,
      previewImageUrl: '',
      previewImageUrlList: '',
      fileList: [],
    }
  },

  computed: {
    acceptType() {
      return {
        image: 'image/*,',
        audio: 'audio/*',
        video: 'video/*',
        pdf: '.pdf',
        excel:
          '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        word: '.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }
    },

    acceptComp() {
      if (this.accept) {
        return this.accept
      }
      const compileAccept = []
      Object.keys(this.acceptType).forEach((item) => {
        if (this.limitFileType.includes(item)) {
          compileAccept.push(this.acceptType[item])
        }
      })
      return compileAccept.join(',')
    },
  },

  methods: {
    // 上传FileList的单个file
    submit(comFile) {
      let formData = new FormData()
      // 表单名称，表单的值，传给服务器的名称
      if (this.needUploadBase64) {
        formData = { [this.uploadFormDataKey]: comFile.base64 }
      } else {
        formData.append(this.uploadFormDataKey, comFile.raw, comFile.name)
      }
      if (Object.keys(this.data || {}).length) {
        Object.keys(this.data).forEach((key) => {
          if (this.needUploadBase64) {
            formData[key] = this.data[key]
          } else {
            formData.append(key, this.data[key])
          }
        })
      }
      if (Object.keys(this.uploadFormDataFileListKey || {}).length) {
        Object.keys(this.uploadFormDataFileListKey).forEach((key) => {
          if (Object.keys(comFile).includes(key)) {
            if (this.needUploadBase64) {
              formData[this.uploadFormDataFileListKey[key]] = comFile[key]
            } else {
              formData.append(this.uploadFormDataFileListKey[key], comFile[key])
            }
          }
        })
      }
      this.$emit('uploading')
      return axios
        .post(this.uploadUrl, formData, {
          headers: {
            Authorization: this.uploadToken,
          },
          onUploadProgress: (e) => {
            if (e.total > 0) {
              comFile.status = 'uploading'
              comFile.percentage = (e.loaded / e.total) * 100
            }
          },
        })
        .then((res) => {
          this.handleSuccess(res, comFile)
        })
        .catch((error) => {
          this.handleDealWithUploadError(error)
          this.handleRemove(comFile)
        })
    },

    // 手动上传文件列表（提供给外部调用）
    submitFileList() {
      if (this.fileList.length) {
        return this.fileList.map((item) => item.upload(item))
      }
      this.$message.error('未选择或粘贴文件')
      return ''
    },

    // 用户选择文件或者粘贴复制文件后的钩子
    async handleFileChange(file) {
      let base64Data = ''
      if (this.needBase64) {
        base64Data = await this.transFile2Base64(file.raw)
      }
      const comFile = {
        uid: new Date().getTime(),
        name: file.name,
        size: file.size,
        raw: file.raw,
        type: file.raw && file.raw.type,
        percentage: 0,
        status: 'ready',
        url: URL.createObjectURL(file.raw),
        base64: base64Data,
        upload: this.submit,
      }
      if (!this.beforeUpload(comFile)) {
        // 因为element内部维护了一个uploadFiles渲染uploadList列表 所以需要更新一下fileList（uploadFiles监听了fileList）
        this.handleRemove(comFile)
        return
      }
      if (this.myBeforeUpload && !this.myBeforeUpload(comFile, this.fileList)) {
        this.handleRemove(comFile)
        return
      }
      this.fileList.push(comFile)
      // 不需要上传
      if (!this.autoUpload) {
        this.updateResponseValue()
        return
      }
      // 直接上传
      comFile.upload(comFile)
    },

    async handlePasteData(e) {
      if (!(e.clipboardData && e.clipboardData.items)) {
        this.$notify.error('未获取到剪切板数据，请手动上传')
        return false
      }
      const clipboardItems = e.clipboardData.items
      for (let i = 0; i < clipboardItems.length; i += 1) {
        if (clipboardItems[i].kind === 'string' && clipboardItems[i].type.match('^text/plain')) {
          // 此方法可用于获取剪切板文字
          // clipboardItems[i].getAsString(function(text) {
          //   console.log(text)
          // })
          // this.$message.warning('你的剪切板没有文件！')
        } else if (clipboardItems[i].kind === 'file') {
          const file = clipboardItems[i].getAsFile() || {}
          if (!file.type) {
            this.$message.warning('未识别的文件格式，请谨慎上传！')
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

    // 更新responseValue即上传后返回的值
    updateResponseValue() {
      if (this.vModelFormat) {
        this.$emit('input', this.vModelFormat(this.fileList))
      } else {
        const res = this.fileList.map((item) => item[this.responseKey] || '')
        this.$emit('input', res)
      }
      this.$emit('fileList', this.fileList)
    },

    // 文件超过数量钩子
    handleExceed(files, fileList) {
      const tip = `当前限制选择 ${this.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
        files.length + fileList.length
      } 个文件`
      this.$message.warning(tip)
    },

    // 上传之前检查是否为空和文件大小
    beforeUpload(file = { size: 0, type: '' }) {
      if (!file || file.size === 0) {
        this.$message.error('不能上传空文件')
        return false
      }
      if (file.type && this.limitFileType) {
        const fileType = ['audio', 'video', 'image']
        if (fileType.includes(this.limitFileType) && !file.type.includes(this.limitFileType)) {
          this.$message.error('上传文件类型不符合要求')
          return false
        }
      }
      const isLimitScope = file.size / 1024 / 1024 < this.limitSize
      if (!isLimitScope) {
        this.$message.error(`上传的文件大小不能超过 ${this.limitSize}MB!`)
        return false
      }
      return true
    },

    // 处理上传错误
    handleDealWithUploadError(error = {}) {
      const response = error.response || {}
      let errorMsg = '上传出现错误，请联系管理员'
      if (response.status === 500) {
        errorMsg = '服务器处理出错，请联系管理员'
      } else if (response.data && typeof response.data === 'string') {
        errorMsg = response.data
      } else if (typeof response.data === 'object') {
        const errorMsgList = Object.values(response.data)
        if (errorMsgList.length) {
          errorMsg = `${errorMsgList}`
        }
      }
      this.$message.error(errorMsg)
      this.$emit('error')
    },

    async handleSuccess(response, file) {
      const data = response.data || {}
      const responseKeyValue = this.responseKey === 'default' ? data : data[this.responseKey]

      this.fileList = this.fileList.map((item) => {
        if (file.uid === item.uid) {
          return {
            ...item,
            percentage: 100,
            status: 'success',
            [this.responseKey]: responseKeyValue,
          }
        }
        return item
      })
      this.updateResponseValue()
      this.$emit('success', response)
    },

    handlePreview(comFile) {
      if (comFile.type && comFile.type.includes('image')) {
        this.previewImageUrl = comFile.url
        this.previewImageUrlList = this.fileList.map((item) => item.url || '')
        this.previewImageDialogVis = true
      } else {
        window.open(comFile.url || comFile.url, '_blank')
      }
    },

    handleRemove(comFile) {
      this.fileList = this.fileList.filter((item) => {
        return item.uid !== comFile.uid
      })
      this.updateResponseValue()
      this.$emit('remove')
    },

    registerPasteEvent() {
      document.addEventListener('paste', this.handlePasteData, false)
    },

    handleManulDestory() {
      // 释放createObjectURL创建的URL对象，清空FileList和移除剪切板监听
      this.fileList.forEach((file) => {
        if (file.url && file.url.indexOf('blob:') === 0) {
          URL.revokeObjectURL(file.url)
        }
      })
      this.fileList = []
      document.removeEventListener('paste', this.handlePasteData, false)
    },

    handleInitFileList(initData) {
      if (this.fileListInitFunc) {
        this.fileList = this.fileListInitFunc(initData)
      } else {
        const fillFileList = (value, index) => {
          const uid = new Date().getTime() + index
          this.fileList.push({
            // forEach的速率有可能小于1ms导致uid一样，所以需要加上index
            uid,
            status: 'success',
            percentage: 100,
            name: String(value).includes('base64') ? uid : String(value).split('/').pop(),
            url: value,
            [this.responseKey]: value,
          })
        }
        if (Array.isArray(initData)) {
          initData.forEach((item, index) => {
            fillFileList(item, index)
          })
        } else if (initData && typeof initData === 'string') {
          fillFileList(initData, 0)
        }
      }
    },
  },

  mounted() {
    this.handleInitFileList(this.value)
    this.registerPasteEvent()
  },

  beforeDestroy() {
    this.handleManulDestory()
  },
}
</script>

<style lang="scss">
#my_upload {
  .el-upload--picture-card {
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

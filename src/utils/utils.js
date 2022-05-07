// 显示文件大小
function returnFileSize(size) {
  if (typeof size !== "number") {
    return
  }
  if (size < 1024) {
    return size + "bytes"
  } else if (size >= 1024 && size < 1048576) {
    return (size / 1024).toFixed(1) + "KB"
  } else if (size >= 1048576) {
    return (size / 1048576).toFixed(1) + "MB"
  }
}

function padLeftZero (str) {
  return ('00' + str).substr(str.length)
}

function padRightZero (str) {
  return (str + '000').substr(str.length)
}

// 用于格式化时间串
export function fmtDate (t, fmt) {
  if (t == null) {
    return ''
  }

  if ((t + '').length < 13) {
    t = (t + '0000').substr(0, 13)
  }

  var date = new Date(parseInt(t))
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : padLeftZero(str)
      )
    }
  }
  return fmt
}

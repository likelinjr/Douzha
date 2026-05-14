import os from 'node:os'

const getOSInfo = (platform: string): string => {
  const osMap: Record<string, string> = {
    'win32': 'Windows',
    'darwin': 'macOS',
    'linux': 'Linux',
    'freebsd': 'FreeBSD',
    'openbsd': 'OpenBSD',
    'netbsd': 'NetBSD',
    'sunos': 'Solaris',
    'android': 'Android'
  }
  return osMap[platform] || platform
}
export const osInfo = getOSInfo(os.platform())

export const getCurrentTime = ( isDetal:boolean=false ):string => {
  const format = (num:number) => String(num).padStart(2, '0')
  const now = new Date()
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
  const dayStr = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][now.getDay()]
  const timeStr = `${format(now.getHours())}点${format(now.getMinutes())}分${format(now.getSeconds())}秒`
  return `${dateStr} ${dayStr} ${ isDetal ? timeStr:"" }`
}

export const getFormattedTime = () =>  `[${new Date().toLocaleTimeString('en-GB', { hour12: false })}]`
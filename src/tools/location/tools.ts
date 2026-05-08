export async function getUserLocation(): Promise<string> {
  try {
    const response = await fetch('http://ip-api.com/json/?lang=zh-CN')
    
    if (!response.ok) {
      throw new Error(`HTTP 错误! 状态码: ${response.status}`)
    }

    const data = await response.json() as any

    if (data.status !== 'success') {
      return `❌ 无法获取位置信息: ${data.message || '未知错误'}`
    }

    return [
      `📍 当前地理位置信息：`,
      `国家: ${data.country}`,
      `省份/地区: ${data.regionName}`,
      `城市: ${data.city}`,
      `经纬度: ${data.lat}, ${data.lon}`,
      `服务商: ${data.isp}`,
      `当前 IP: ${data.query}`
    ].join('\n')

  } catch (error: any) {
    return `❌ 获取地理位置失败: ${error.message}`
  }
}
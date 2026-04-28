export async function getWeather(city: string): Promise<string> {
  const apiKey = process.env.WEATHER_API_KEY?.trim()
  if (!apiKey) return "❌ 错误: .env 文件中未检测到 WEATHER_API_KEY。"

  const host = "nx4nmuragd.re.qweatherapi.com"
  const headers = {
    "X-QW-Api-Key": apiKey,
    "Accept-Encoding": "gzip",
  }

  try {
    // 步骤 1: 搜索城市获取 Location ID
    const geoUrl = `https://${host}/geo/v2/city/lookup?location=${encodeURIComponent(city)}&number=1`
    const geoRes = await fetch(geoUrl, { headers })
    const geoData: any = await geoRes.json()

    if (geoData.code !== "200" || !geoData.location || geoData.location.length === 0) {
      return `❌ 找不到城市 "${city}"，请检查城市名称是否正确。`
    }

    const { id, name, adm1, adm2 } = geoData.location[0]
    const fullCityName = `${adm1} ${adm2} ${name}`

    // 步骤 2: 获取实时天气
    const weatherUrl = `https://${host}/v7/weather/now?location=${id}`
    const weatherRes = await fetch(weatherUrl, { headers })
    const weatherData: any = await weatherRes.json()

    if (weatherData.code !== "200") {
      return `❌ 获取 "${fullCityName}" 的天气失败，API 错误代码: ${weatherData.code}`
    }

    const now = weatherData.now
    return (
      `📍 城市: ${fullCityName}\n` +
      `🌡️ 温度: ${now.temp}°C (体感: ${now.feelsLike}°C)\n` +
      `🌤️ 天气: ${now.text}\n` +
      `💨 风向: ${now.windDir} (${now.windScale} 级)\n` +
      `💧 湿度: ${now.humidity}%\n` +
      `⏰ 更新时间: ${weatherData.updateTime.substring(0, 16).replace("T", " ")}`
    )
  } catch (error) {
    console.error("Weather API Error:", error)
    return "❌ 获取天气数据时发生网络错误。"
  }
}
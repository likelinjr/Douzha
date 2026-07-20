
import { ToolResult } from '../../types/tool.js'

export async function getHoursWeather(city: string, hours: number): Promise<ToolResult> {
  const apiKey = process.env.WEATHER_API_KEY?.trim()
  if (!apiKey) {
    return {
      content: [{ type: "text", text: "错误: .env 文件中未检测到 WEATHER_API_KEY。" }],
      isError: true
    }
  }
  const host = "nx4nmuragd.re.qweatherapi.com"
  const headers = {
    "X-QW-Api-Key": apiKey,
    "Accept-Encoding": "gzip",
  }
  try {
    const geoUrl = `https://${host}/geo/v2/city/lookup?location=${encodeURIComponent(city)}&number=1`
    const geoRes = await fetch(geoUrl, { headers })
    const geoData: any = await geoRes.json()
    if (geoData.code !== "200" || !geoData.location || geoData.location.length === 0) {
      return {
        content: [{ type: "text", text: `找不到城市 "${city}"，请检查城市名称是否正确。` }],
        isError: true
      }
    }
    const { id, name, adm1, adm2 } = geoData.location[0]
    const fullCityName = `${adm1} ${adm2} ${name}`
    const weatherUrl = `https://${host}/v7/weather/${hours}h?location=${id}`
    const weatherRes = await fetch(weatherUrl, { headers })
    const weatherData: any = await weatherRes.json()
    if (weatherData.code !== "200") {
      return {
        content: [{ type: "text", text: `获取 "${fullCityName}" 的逐小时天气失败，API 错误代码: ${weatherData.code}` }],
        isError: true
      }
    }
    const hourly = weatherData.hourly
    const lines = hourly.map((h: any) => {
      const time = h.fxTime.substring(11, 16)
      return `${time} | ${h.temp}°C | ${h.text} | ${h.windDir}${h.windScale}级 | 湿度${h.humidity}% | 降水${h.pop}%`
    })
    return {
      content: [{ type: "text", text: `城市: ${fullCityName}\n未来${hours}小时逐小时预报:\n${lines.join('\n')}` }],
      isError: false
    }
  } catch (error) {
    console.error("Weather API Error:", error)
    return {
      content: [{ type: "text", text: "获取天气数据时发生网络错误。" }],
      isError: true
    }
  }
}

export async function get24HoursWeather(city: string): Promise<ToolResult> {
  return getHoursWeather(city, 24)
}

export async function get72HoursWeather(city: string): Promise<ToolResult> {
  return getHoursWeather(city, 72)
}

export async function getDaysWeather(city: string, days: number): Promise<ToolResult> {
  const apiKey = process.env.WEATHER_API_KEY?.trim()
  if (!apiKey) {
    return {
      content: [{ type: "text", text: "错误: .env 文件中未检测到 WEATHER_API_KEY。" }],
      isError: true
    }
  }
  const host = "nx4nmuragd.re.qweatherapi.com"
  const headers = {
    "X-QW-Api-Key": apiKey,
    "Accept-Encoding": "gzip",
  }
  try {
    const geoUrl = `https://${host}/geo/v2/city/lookup?location=${encodeURIComponent(city)}&number=1`
    const geoRes = await fetch(geoUrl, { headers })
    const geoData: any = await geoRes.json()
    if (geoData.code !== "200" || !geoData.location || geoData.location.length === 0) {
      return {
        content: [{ type: "text", text: `找不到城市 "${city}"，请检查城市名称是否正确。` }],
        isError: true
      }
    }
    const { id, name, adm1, adm2 } = geoData.location[0]
    const fullCityName = `${adm1} ${adm2} ${name}`
    const weatherUrl = `https://${host}/v7/weather/${days}d?location=${id}`
    const weatherRes = await fetch(weatherUrl, { headers })
    const weatherData: any = await weatherRes.json()
    if (weatherData.code !== "200") {
      return {
        content: [{ type: "text", text: `获取 "${fullCityName}" 的每日天气失败，API 错误代码: ${weatherData.code}` }],
        isError: true
      }
    }
    const daily = weatherData.daily
    const lines = daily.map((d: any) => {
      return `${d.fxDate} | ${d.tempMin}~${d.tempMax}°C | ${d.textDay}/${d.textNight} | ${d.windDirDay}${d.windScaleDay}级 | 湿度${d.humidity}% | 降水${d.precip}mm | UV${d.uvIndex}`
    })
    return {
      content: [{ type: "text", text: `城市: ${fullCityName}\n未来${days}天每日预报:\n${lines.join('\n')}` }],
      isError: false
    }
  } catch (error) {
    console.error("Weather API Error:", error)
    return {
      content: [{ type: "text", text: "获取天气数据时发生网络错误。" }],
      isError: true
    }
  }
}

export async function get3DaysWeather(city: string): Promise<ToolResult> {
  return getDaysWeather(city, 3)
}

export async function get7DaysWeather(city: string): Promise<ToolResult> {
  return getDaysWeather(city, 7)
}

export async function getAirQuality(city: string): Promise<ToolResult> {
  const apiKey = process.env.WEATHER_API_KEY?.trim()
  if (!apiKey) {
    return {
      content: [{ type: "text", text: "错误: .env 文件中未检测到 WEATHER_API_KEY。" }],
      isError: true
    }
  }
  const host = "nx4nmuragd.re.qweatherapi.com"
  const headers = {
    "X-QW-Api-Key": apiKey,
    "Accept-Encoding": "gzip",
  }
  try {
    const geoUrl = `https://${host}/geo/v2/city/lookup?location=${encodeURIComponent(city)}&number=1`
    const geoRes = await fetch(geoUrl, { headers })
    const geoData: any = await geoRes.json()

    if (geoData.code !== "200" || !geoData.location || geoData.location.length === 0) {
      return {
        content: [{ type: "text", text: `找不到城市 "${city}"，请检查城市名称是否正确。` }],
        isError: true
      }
    }
    const { name, adm1, adm2, lat, lon } = geoData.location[0]
    const fullCityName = `${adm1} ${adm2} ${name}`
    const airUrl = `https://${host}/airquality/v1/hourly/${lat}/${lon}`
    const airRes = await fetch(airUrl, { headers })
    const airData: any = await airRes.json()
    if (!airData.hours || airData.hours.length === 0) {
      return {
        content: [{ type: "text", text: `获取 "${fullCityName}" 的空气质量失败` }],
        isError: true
      }
    }
    const hours = airData.hours.slice(0, 24)
    const lines = hours.map((h: any) => {
      const time = h.forecastTime.substring(11, 16)
      const index = h.indexes?.find((i: any) => i.code === 'us-epa') || h.indexes?.[0]
      const aqi = index?.aqiDisplay || 'N/A'
      const category = index?.category || 'N/A'
      const primary = index?.primaryPollutant?.name || 'N/A'
      return `${time} | AQI:${aqi} ${category} | 主要:${primary}`
    })
    return {
      content: [{ type: "text", text: `城市: ${fullCityName}\n未来24小时空气质量预报:\n${lines.join('\n')}` }],
      isError: false
    }
  } catch (error) {
    console.error("Air Quality API Error:", error)
    return {
      content: [{ type: "text", text: "获取空气质量数据时发生网络错误。" }],
      isError: true
    }
  }
}

export async function getWeatherWarning(city: string): Promise<ToolResult> {
  const apiKey = process.env.WEATHER_API_KEY?.trim()
  if (!apiKey) {
    return {
      content: [{ type: "text", text: "错误: .env 文件中未检测到 WEATHER_API_KEY。" }],
      isError: true
    }
  }
  const host = "nx4nmuragd.re.qweatherapi.com"
  const headers = {
    "X-QW-Api-Key": apiKey,
    "Accept-Encoding": "gzip",
  }
  try {
    const geoUrl = `https://${host}/geo/v2/city/lookup?location=${encodeURIComponent(city)}&number=1`
    const geoRes = await fetch(geoUrl, { headers })
    const geoData: any = await geoRes.json()
    if (geoData.code !== "200" || !geoData.location || geoData.location.length === 0) {
      return {
        content: [{ type: "text", text: `找不到城市 "${city}"，请检查城市名称是否正确。` }],
        isError: true
      }
    }
    const { id, name, adm1, adm2 } = geoData.location[0]
    const fullCityName = `${adm1} ${adm2} ${name}`
    const warningUrl = `https://${host}/v7/warning/now?location=${id}`
    const warningRes = await fetch(warningUrl, { headers })
    const warningData: any = await warningRes.json()
    if (warningData.code !== "200") {
      return {
        content: [{ type: "text", text: `获取 "${fullCityName}" 的预警信息失败，API 错误代码: ${warningData.code}` }],
        isError: true
      }
    }
    const warnings = warningData.warning
    if (!warnings || warnings.length === 0) {
      return {
        content: [{ type: "text", text: `城市: ${fullCityName}\n当前无生效预警` }],
        isError: false
      }
    }
    const lines = warnings.map((w: any) => {
      return `⚠️ ${w.title}\n   等级: ${w.level} | 类型: ${w.typeName}\n   发布时间: ${w.pubTime?.substring(0, 16).replace('T', ' ')}\n   ${w.text}`
    })
    return {
      content: [{ type: "text", text: `城市: ${fullCityName}\n当前生效预警:\n${lines.join('\n\n')}` }],
      isError: false
    }
  } catch (error) {
    console.error("Weather Warning API Error:", error)
    return {
      content: [{ type: "text", text: "获取预警数据时发生网络错误。" }],
      isError: true
    }
  }
}
import { executeCommand } from '../command/tools.js'
import { think } from '../../brain/index.js'
const speaker_ip = process.env.SPEAKER_IP

async function searchBilibili(keyword: string): Promise<string> {
  const args = [
    '--cookies', 'www.bilibili.com_cookies.txt',
    '--add-header', 'Referer: https://www.bilibili.com',
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    '--print', '%(index)d. [%(id)s] %(title)s | 播放量: %(view_count)s | 时长: %(duration_string)s',
    `bilisearch5:${keyword}`
  ]
  
  const stdout = await executeCommand('yt-dlp', args)
  
  if (!stdout || stdout.trim().length === 0 || stdout.includes('❌')) {
    throw new Error(stdout || '搜索结果为空')
  }
  return stdout
}

async function aiSelectVideo(searchResults: string, keyword: string): Promise<string> {
  const prompt = `用户想听歌曲: "${keyword}"

以下是搜索结果:
${searchResults}

请从中选择最匹配的一个，优先选择播放量最高的，直接输出视频的 BV 编号（如 BV1Ss4peuEzV），不要输出其他内容。只输出一个 BV 号。`

  const response = await think(
    [{ role: 'user', content: prompt }],
    [],
    '',
    process.env.DECISION_MAKER || 'deepseek',
    false
  )
  
  const answer = (response.answer || '').trim()
  const bvMatch = answer.match(/BV[\w]+/i)
  
  if (bvMatch) {
    return bvMatch[0]
  }
  
  if (!answer || answer === 'null' || answer === '未定义') {
    const fallbackMatch = searchResults.match(/BV[\w]+/i)
    return fallbackMatch ? fallbackMatch[0] : ''
  }
  
  const fallbackMatch = searchResults.match(/BV[\w]+/i)
  return fallbackMatch ? fallbackMatch[0] : ''
}

export async function playOnlineMusic(keyword: string): Promise<string> {
  try {
    const searchResults = await searchBilibili(keyword)
    
    if (!searchResults || searchResults.trim().length === 0) {
      return `❌ 未找到 "${keyword}" 相关结果`
    }

    const bvId = await aiSelectVideo(searchResults, keyword)
    
    if (!bvId) {
      return `❌ 无法从搜索结果中提取有效的 BV 号`
    }

    await stopMusic()

    
    const sshArgs = [
      '-o', 'ConnectTimeout=30',
      `root@${speaker_ip}`,
      `nohup mpv --no-video --audio-device=alsa/plughw:2,0 --ytdl-raw-options=cookies='/root/bili_cookies.txt' 'https://www.bilibili.com/video/${bvId}' > /dev/null 2>&1 &`
    ]
    
    const result = await executeCommand('ssh', sshArgs)
    
    if (result.includes('❌') && !result.includes('Warning')) {
      return result
    }
    
    return `✅ 正在播放: ${keyword} (${bvId})`
    
  } catch (error: any) {
    if (error.message.includes('ETIMEDOUT') || error.message.includes('Connection refused')) {
      return '❌ 无法连接到音箱，请检查设备是否在线'
    }
    return `❌ 播放失败: ${error.message}`
  }
}

export async function stopMusic(): Promise<string> {
  try {
    const stopArgs = [`root@${speaker_ip}`, 'pkill -f mpv']
    const result = await executeCommand('ssh', stopArgs)
    return result.includes('❌') ? "ℹ️ 当前似乎没有正在播放。" : "✅ 音乐已停止播放。"
  } catch {
    return "ℹ️ 当前似乎没有正在播放。"
  }
}

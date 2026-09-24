type ToolArgs = Record<string, unknown>

type ToolLabel = { en: string; ch: string }

const toolRenderMap: Record<string, ToolLabel> = {
  read_file: { en: 'Read', ch: '读取文件' },
  write_file: { en: 'Write', ch: '写入文件' },
  list_files: { en: 'List files', ch: '查看目录' },
  delete_file: { en: 'Delete', ch: '删除文件' },
  copy_file: { en: 'Copy', ch: '复制文件' },
  edit_file: { en: 'Edit', ch: '编辑文件' },
  get_directory_tree: { en: 'Get directory tree', ch: '查看目录树' },
  extract_file: { en: 'Extract', ch: '解压文件' },
  execute_command: { en: 'Execute', ch: '执行命令' },
  download_file: { en: 'Download', ch: '下载文件' },
  list_sessions: { en: 'List sessions', ch: '查看历史列表' },
  get_session_detail: { en: 'Session detail', ch: '查看对话' },
  http_request: { en: 'HTTP request', ch: 'HTTP请求' },
  play_song: { en: 'Play song', ch: '播放音乐' },
  play_folder: { en: 'Play folder', ch: '播放文件夹' },
  stop_music: { en: 'Stop music', ch: '停止播放' },
  skill: { en: 'Skill', ch: '学习技能' },
  get_current_time: { en: 'Get time', ch: '获取时间' },
  get_24hours_weather: { en: 'Get 24h weather', ch: '获取24h天气' },
  get_72hours_weather: { en: 'Get 72h weather', ch: '获取72h天气' },
  get_3days_weather: { en: 'Get 3days weather', ch: '获取3日天气' },
  get_7days_weather: { en: 'Get 7days weather', ch: '获取7日天气' },
  get_air_quality: { en: 'Get air quality', ch: '获取空气质量' },
  get_weather_warning: { en: 'Get weather warning', ch: '获取天气预警' },
  web_search: { en: 'Search', ch: '搜索' },
  update_task_plan: { en: 'Update plan', ch: '更新计划' },
}

function extractDisplayValue(name: string, args: ToolArgs): string | undefined {
  const extractors: Record<string, (args: ToolArgs) => string | undefined> = {
    read_file: args => args.path as string | undefined,
    write_file: args => args.path as string | undefined,
    edit_file: args => args.path as string | undefined,
    delete_file: args => args.path as string | undefined,
    copy_file: args => {
      const source = args.source as string | undefined
      const destination = args.destination as string | undefined
      if (source && destination) return `${source} -> ${destination}`
      return source
    },
    list_files: args => args.path as string | undefined,
    get_directory_tree: args => args.path as string | undefined,
    extract_file: args => args.filepath as string | undefined,
    execute_command: args => args.command as string | undefined,
    download_file: args => args.url as string | undefined,
    web_search: args => args.query as string | undefined,
    http_request: args => args.url as string | undefined,
    play_song: args => args.file_path as string | undefined,
    play_folder: args => args.folder_path as string | undefined,
    skill: args => args.skill as string | undefined,
    get_session_detail: args => args.session_id as string | undefined,
    update_task_plan: args => {
      const updates = args.updates as Array<unknown> | undefined
      return updates ? `${updates.length} steps` : undefined
    },
    get_24hours_weather: args => args.city as string | undefined,
    get_72hours_weather: args => args.city as string | undefined,
    get_3days_weather: args => args.city as string | undefined,
    get_7days_weather: args => args.city as string | undefined,
    get_air_quality: args => args.city as string | undefined,
    get_weather_warning: args => args.city as string | undefined,
  }
  return extractors[name]?.(args)
}

export function renderToolCall(name: string, args?: ToolArgs): string {
  const label = toolRenderMap[name]?.en || name
  if (!args) return label

  const value = extractDisplayValue(name, args)
  if (!value) return label

  const displayValue = value.length > 50 ? value.slice(0, 50) + '...' : value
  return `${label}: ${displayValue}`
}


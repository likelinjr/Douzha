const toolRenderMap: Record<string, string> = {
  // file
  read_file: '读取文件',
  write_file: '写入文件',
  list_files: '查看目录',
  delete_file: '删除文件',
  copy_file: '复制文件',
  edit_file: '编辑文件',
  get_directory_tree: '查看目录树',
  extract_file: '解压文件',
  // command
  execute_command: '执行命令',
  // download
  download_file: '下载文件',
  // history
  list_sessions: '查看历史列表',
  get_session_detail: '查看对话',
  // http
  http_request: 'HTTP请求',
  // music
  play_song: '播放音乐',
  play_folder: '播放文件夹',
  stop_music: '停止播放',
  // skill
  skill: '学习技能',
  // time
  get_current_time: '获取时间',
  // weather
  get_24hours_weather: '获取24h天气',
  get_72hours_weather: '获取72h天气',
  get_3days_weather: '获取3日天气',
  get_7days_weather: '获取7日天气',
  get_air_quality: '获取空气质量',
  get_weather_warning: '获取天气预警',
  // webSearch
  web_search: '搜索',
  // plan
  update_task_plan: '更新计划',
}

export function renderToolCall(name: string): string {
  return toolRenderMap[name] || name
}


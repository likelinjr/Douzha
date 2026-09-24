import { EmbedBuilder } from 'discord.js'
import { ToolCall } from '../../types/tool.js'

const TOOL_COLORS: Record<string, number> = {
  read_file: 0x5865f2,
  write_file: 0x57f287,
  list_files: 0x5865f2,
  delete_file: 0xed4245,
  copy_file: 0x57f287,
  edit_file: 0xfee75c,
  execute_command: 0xeb459e,
  web_search: 0x00b4d8,
  http_request: 0x00b4d8,
  download_file: 0x00b4d8,
  get_24hours_weather: 0x00b4d8,
  get_72hours_weather: 0x00b4d8,
  get_3days_weather: 0x00b4d8,
  get_7days_weather: 0x00b4d8,
  get_air_quality: 0x00b4d8,
  get_weather_warning: 0xed4245,
  update_task_plan: 0xfee75c,
  list_sessions: 0x99aab5,
  get_session_detail: 0x99aab5,
  play_song: 0xeb459e,
  play_folder: 0xeb459e,
  stop_music: 0xed4245,
  get_current_time: 0x99aab5,
  skill: 0x5865f2,
}

const TOOL_ICONS: Record<string, string> = {
  read_file: '📖',
  write_file: '✏️',
  list_files: '📂',
  delete_file: '🗑️',
  copy_file: '📋',
  edit_file: '📝',
  get_directory_tree: '🌳',
  extract_file: '📦',
  execute_command: '🖥️',
  web_search: '🔍',
  http_request: '🌐',
  download_file: '⬇️',
  get_24hours_weather: '🌡️',
  get_72hours_weather: '🌡️',
  get_3days_weather: '🌤️',
  get_7days_weather: '☀️',
  get_air_quality: '💨',
  get_weather_warning: '⚠️',
  update_task_plan: '📋',
  list_sessions: '💬',
  get_session_detail: '🔍',
  play_song: '🎵',
  play_folder: '🎶',
  stop_music: '⏹️',
  get_current_time: '🕐',
  skill: '⚡',
}

function getToolColor(name: string): number {
  return TOOL_COLORS[name] || 0x99aab5
}

function getToolIcon(name: string): string {
  return TOOL_ICONS[name] || '⚙️'
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

export function formatToolCall(toolCall: ToolCall): EmbedBuilder {
  const { name } = toolCall.function

  return new EmbedBuilder()
    .setTitle(`${getToolIcon(name)} ${name}`)
    .setColor(getToolColor(name))
    .setFooter({ text: '工具调用' })
    .setTimestamp()
}

export function formatThinking(chunks: string): string {
  const text = truncate(chunks, 1000)
  return `💭 **思考过程**\n> ${text.replace(/\n/g, '\n> ')}`
}

export function formatContent(chunks: string): string {
  return chunks
}

export function formatError(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('❌ 错误')
    .setColor(0xed4245)
    .setDescription(message)
    .setTimestamp()
}

export function formatWarning(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('⚠️ 警告')
    .setColor(0xfee75c)
    .setDescription(message)
    .setTimestamp()
}

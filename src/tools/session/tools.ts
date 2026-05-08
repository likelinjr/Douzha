import { Session } from '../../database/dbTools.js'

export async function createNewSession(summary: string, planId?: number): Promise<string> {
  try {
    const sessionId = Session.create(summary, planId)
    return `✅ 会话创建成功！会话ID: ${sessionId}${planId ? `，已关联计划ID: ${planId}` : ''}`
  } catch (error: any) {
    return `❌ 创建会话失败: ${error.message}`
  }
}
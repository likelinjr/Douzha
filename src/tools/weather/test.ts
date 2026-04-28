// test-weather.ts
import { getWeather } from './tools.js' // 假设你的函数保存在 weather.ts

async function runTest() {
  console.log("🚀 开始测试天气工具函数...\n")

  // 测试用例 1: 正常城市查询（北京）
  console.log("测试 1: 查询已知城市 '北京'")
  const resultBeijing = await getWeather("北京")
  console.log("返回结果:\n", resultBeijing)
  console.log("-----------------------------------\n")

  // 测试用例 2: 英文城市名查询（Tokyo）
  console.log("测试 2: 查询英文城市名 'Tokyo'")
  const resultTokyo = await getWeather("Tokyo")
  console.log("返回结果:\n", resultTokyo)
  console.log("-----------------------------------\n")

  // 测试用例 3: 异常处理（不存在的城市）
  console.log("测试 3: 查询不存在的城市 '不存在的城市名123'")
  const resultError = await getWeather("不存在的城市名123")
  console.log("返回结果:\n", resultError)
  console.log("-----------------------------------\n")

  // 测试用例 4: 边界情况（空字符串）
  console.log("测试 4: 查询空字符串")
  const resultEmpty = await getWeather("")
  console.log("返回结果:\n", resultEmpty)
}

// 执行测试
runTest().catch(err => {
  console.error("❌ 测试运行过程中发生崩溃:", err)
})
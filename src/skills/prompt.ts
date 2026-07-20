import dedent from 'dedent'
import { loadSkills } from './index.js'

export const prompt = dedent`
  # 技能
  当用户的需求匹配以下某个技能时，你应该调用对应的技能来完成任务，必须严格按照 skill 进行
  每个技能的文件都在对应的目录下:
  - 技能目录格式: /Skills/[skill-name]
  - 如果技能包含可执行文件，文件位于: /Skills/[skill-name]/scripts/
  - 其他相关文件位置: /Skills/[skill-name]
  访问：
  - 读文件: readFile('/Skills/[skill-name]/[skill-file].md')
  - 执行可执行文件: executeCommand('python /Skills/[skill-name]/scripts/[script-name].py') 
`

export function getSkillsPrompt(): string {
  const skills = loadSkills()
  if (skills.length === 0) return ''
  const skillsList = skills.map(skill => {
    let entry = `- name: ${skill.name}\n- description: ${skill.description}`
    if (skill.when_to_use) entry += `\n- when to use: ${skill.when_to_use}`
    return entry
  }).join('\n\n')
  return `${prompt}\n\n# 技能列表：\n${skillsList}`.trim()
}
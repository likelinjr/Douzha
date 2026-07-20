import fs from 'fs'
import path from 'path'
import { SkillMeta } from '../types/skill.js'
import { fileURLToPath } from 'url'
import { parse } from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function preprocessYaml(content: string): string {
  return content.replace(/^(\w+):\s*(.+:.*)$/gm, (match, key, value) => {
    if (value.trim().startsWith('"') || value.trim().startsWith("'")) {
      return match
    }
    if (value.trim().startsWith('-')) {
      return match
    }
    return `${key}: "${value.replace(/"/g, '\\"')}"`
  })
}

function parseSkillMarkdown(content: string): SkillMeta {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/
  const match = content.match(frontmatterRegex)
  if (!match) {
    return { name: 'unknown', description: '' }
  }
  const yamlContent = preprocessYaml(match[1])
  const parsed = parse(yamlContent) as SkillMeta
  return parsed
}

export function loadSkills(): SkillMeta[] {
  const skillsDir = path.join(__dirname, 'skills')
  const skills: SkillMeta[] = []
  try {
    const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
    for (const folder of skillFolders) {
      const skillPath = path.join(skillsDir, folder, 'SKILL.md')
      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, 'utf-8')
        const meta = parseSkillMarkdown(content)
        skills.push(meta)
      }
    }
  } catch (error) {
    console.error('Error loading skills:', error)
  }
  return skills
}

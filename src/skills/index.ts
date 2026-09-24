import fs from 'fs'
import path from 'path'
import { SkillMeta } from '../types/skill.js'
import { parse } from 'yaml'

const __dirname = import.meta.dirname

function preprocessYaml(content: string): string {
  // Split into lines to process each line individually
  return content.split('\n').map(line => {
    // Only process top-level keys (no leading whitespace)
    const topLevelMatch = line.match(/^(\w+):\s*(.+:.*)$/)
    if (!topLevelMatch) return line
    
    const [, key, value] = topLevelMatch
    
    // Skip if value is already quoted
    if (value.trim().startsWith('"') || value.trim().startsWith("'")) {
      return line
    }
    // Skip if value is a list item
    if (value.trim().startsWith('-')) {
      return line
    }
    
    return `${key}: "${value.replace(/"/g, '\\"')}"`
  }).join('\n')
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

import { TextAttributes } from '@opentui/core'
import { TUI_THEMES, COLORS } from '../../../config/themes/colors.js'

const MD_COLORS = {
  heading: TUI_THEMES,
  bold: COLORS.PLUM,
  italic: COLORS.SLATE,
  code: COLORS.GREEN,
  link: TUI_THEMES,
  listMarker: TUI_THEMES,
  quote: COLORS.SLATE,
  text: 'white'
}

interface InlineToken {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link'
  content: string
  url?: string
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let remaining = text

  while (remaining.length > 0) {
    // code: `text`
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      tokens.push({ type: 'code', content: codeMatch[1] })
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // bold: **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/)
    if (boldMatch) {
      tokens.push({ type: 'bold', content: boldMatch[1] })
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // italic: *text* 或 _text_（前后需有空格或边界）
    const italicMatch = remaining.match(/(?:^|[\s])[*_]([^*_]+)[*_](?=[\s]|$)/)
    if (italicMatch) {
      tokens.push({ type: 'italic', content: italicMatch[1] })
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      tokens.push({ type: 'link', content: linkMatch[1], url: linkMatch[2] })
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // find next special char
    const nextSpecial = remaining.search(/[`[*_]/)
    if (nextSpecial === -1) {
      tokens.push({ type: 'text', content: remaining })
      break
    }
    if (nextSpecial > 0) {
      tokens.push({ type: 'text', content: remaining.slice(0, nextSpecial) })
      remaining = remaining.slice(nextSpecial)
    } else {
      // nextSpecial === 0，但前面没有匹配任何 pattern，当作普通文本跳过
      tokens.push({ type: 'text', content: remaining[0] })
      remaining = remaining.slice(1)
    }
  }

  return tokens
}

function renderInline(tokens: InlineToken[], keyPrefix: string) {
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`
    switch (token.type) {
      case 'bold':
        return <span key={key} fg={MD_COLORS.bold} attributes={TextAttributes.BOLD}>{token.content}</span>
      case 'italic':
        return <span key={key} fg={MD_COLORS.italic}>{token.content}</span>
      case 'code':
        return <span key={key} fg={MD_COLORS.code}>{token.content}</span>
      case 'link':
        return <span key={key} fg={MD_COLORS.link}>{token.content}</span>
      default:
        return <span key={key} fg={MD_COLORS.text}>{token.content}</span>
    }
  })
}

interface Block {
  type: 'heading' | 'list' | 'code' | 'quote' | 'paragraph'
  content: string
  level?: number
  marker?: string
}

function parseBlocks(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []
  let codeBuffer: string[] | null = null
  let codeLang = ''

  for (const line of lines) {
    // code block
    if (line.startsWith('```')) {
      if (codeBuffer === null) {
        codeBuffer = []
        codeLang = line.slice(3).trim()
      } else {
        blocks.push({ type: 'code', content: codeBuffer.join('\n'), level: codeLang ? 1 : 0 })
        codeBuffer = null
        codeLang = ''
      }
      continue
    }

    if (codeBuffer !== null) {
      codeBuffer.push(line)
      continue
    }

    // heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({ type: 'heading', content: headingMatch[2], level: headingMatch[1].length })
      continue
    }

    // list
    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/)
    if (listMatch) {
      blocks.push({ type: 'list', content: listMatch[3], marker: listMatch[2] })
      continue
    }

    // quote
    if (line.startsWith('>')) {
      blocks.push({ type: 'quote', content: line.slice(1).trim() })
      continue
    }

    // empty line
    if (line === '') {
      blocks.push({ type: 'paragraph', content: '' })
      continue
    }

    // paragraph
    blocks.push({ type: 'paragraph', content: line })
  }

  // unclosed code block
  if (codeBuffer !== null) {
    blocks.push({ type: 'code', content: codeBuffer.join('\n'), level: codeLang ? 1 : 0 })
  }

  return blocks
}

export function MarkdownText({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  return (
    <box flexDirection="column" marginTop={1}>
      {blocks.map((block, i) => {
        const key = `md-block-${i}`
        switch (block.type) {
          case 'heading':
            return (
              <text key={key} fg={MD_COLORS.heading} attributes={TextAttributes.BOLD}>
                {block.content}
              </text>
            )
          case 'list':
            return (
              <text key={key}>
                <span fg={MD_COLORS.listMarker}>{`${block.marker} `}</span>
                {renderInline(parseInline(block.content), key)}
              </text>
            )
          case 'code':
            return (
              <text key={key} fg={MD_COLORS.code} attributes={TextAttributes.DIM}>
                {block.content}
              </text>
            )
          case 'quote':
            return (
              <text key={key} fg={MD_COLORS.quote}>
                {'> '}{renderInline(parseInline(block.content), key)}
              </text>
            )
          default:
            return (
              <text key={key}>
                {renderInline(parseInline(block.content), key)}
              </text>
            )
        }
      })}
    </box>
  )
}

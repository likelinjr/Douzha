import { createCliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'
import { App } from '../tui/App.js'
import './initiate.js'

const renderer = await createCliRenderer()
const root = createRoot(renderer)
root.render(<App />)

process.on('SIGINT', () => {
  root.unmount()
  process.exit(0)
})

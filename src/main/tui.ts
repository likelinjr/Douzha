import React from 'react'
import { render } from 'ink'
import { App } from '../tui/App.js'
import './initiate.js'

const { unmount } = render(React.createElement(App))

process.on('SIGINT', () => {
  unmount()
  process.exit(0)
})

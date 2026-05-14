import React from 'react'
import { render } from 'ink'
import { App } from '../interface/App.js'

const { unmount } = render(React.createElement(App))

process.on('SIGINT', () => {
  unmount()
  process.exit(0)
})

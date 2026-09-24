import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { router } from './router/index.js'

export function App() {
  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}
import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ConsoleLayout } from '../layouts/Layout.js'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ConsoleLayout />,
    children: []
  }
])

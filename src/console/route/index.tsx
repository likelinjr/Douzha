import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ConsoleLayout } from '../layouts/Layout.js'
import { Home } from '../views/Home/Home.js'
import { Tool } from '../views/Tool/Tool.js'
import { Skill } from '../views/Skill/Skill.js'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ConsoleLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: 'home',
        element: <Home />
      },
      {
        path: 'tool',
        element: <Tool />
      },
      {
        path: 'skill',
        element: <Skill />
      }
    ]
  }
])
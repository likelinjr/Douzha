import React, { useState } from 'react'
import { Layout, Menu, Breadcrumb } from 'antd'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  ToolOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import styles from './Layout.module.scss'

const { Sider, Content, Header } = Layout

const menuItems = [
  {
    key: '/home',
    icon: <HomeOutlined />,
    label: 'Home',
  },
  {
    key: '/tool',
    icon: <ToolOutlined />,
    label: 'Tool',
  },
  {
    key: '/skill',
    icon: <AppstoreOutlined />,
    label: 'Skill',
  },
]

export const ConsoleLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  return (
    <Layout className={styles.layout}>
      <Sider
        collapsible
        collapsed={isCollapsed}
        onCollapse={setIsCollapsed}
        trigger={null}
        width={130}
        theme="dark"
        className={styles.sider}
      >
        <div
          className={`${styles.logo} ${isCollapsed ? styles.logoCollapsed : ''}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <img src="../assets/cat.png" alt="Logo" className={styles.logoImg} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <Breadcrumb
            style={{ fontSize: '17px' }}
            items={[
              { title: 'Console' },
              { title: menuItems.find(item => item.key === location.pathname)?.label || 'Home' },
            ]}
          />
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
import React, { useState } from 'react'
import { Layout, Breadcrumb } from 'antd'
import { Outlet } from 'react-router-dom'
import styles from './Layout.module.scss'

const { Sider, Content, Header } = Layout

export const ConsoleLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <Breadcrumb
            style={{ fontSize: '17px' }}
            items={[{ title: 'Console' }]}
          />
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

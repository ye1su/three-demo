import { useEffect, useRef } from 'react'
import './App.css'
import { Layout, Menu } from 'antd';
import MenuItem from 'antd/es/menu/MenuItem';
import PDB from './views/pdb/pdb'

const { Sider, Content } = Layout;

import {

  PieChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}



const items: MenuItem[] = [
  getItem('pdb预览', <PieChartOutlined />),

];


function App() {

  return (
    <Layout style={{ width: '100vw', height: '100vh' }}>
      <Sider>
        <Menu
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          theme="dark"
          items={items}
        />
      </Sider>
      <Layout>
        <Content>
          <PDB />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Badge, Drawer, Space } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  WalletOutlined,
  SwapOutlined,
  LogoutOutlined,
  MenuOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../utils/Web3Context';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState('home');
  
  const { 
    isConnected, 
    isRegistered, 
    connectWallet, 
    account, 
    tokenBalance, 
    userProfile,
    loading
  } = useWeb3();

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === '/') setSelectedKey('home');
    else if (pathname === '/profile') setSelectedKey('profile');
    else if (pathname === '/buy-sell') setSelectedKey('buy-sell');
    else if (pathname === '/transfer') setSelectedKey('transfer');
    else setSelectedKey('');
  }, [location]);

  const handleMobileMenuClick = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuVisible(false);
  };

  const showConnectButton = !isConnected;
  const showRegisterButton = isConnected && !isRegistered;
  const showUserMenu = isConnected && isRegistered;

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Главная</Link>,
    }
  ];

  if (showUserMenu) {
    menuItems.push(
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/profile">Профиль</Link>,
      },
      {
        key: 'buy-sell',
        icon: <DollarOutlined />,
        label: <Link to="/buy-sell">Купить/Продать</Link>,
      },
      {
        key: 'transfer',
        icon: <SwapOutlined />,
        label: <Link to="/transfer">Перевод</Link>,
      }
    );
  }

  return (
    <Layout className="main-layout">
      <Header className="site-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Title level={3} style={{ color: 'white', margin: 0, marginRight: 16 }}>
                <WalletOutlined /> GymToken
              </Title>
            </Link>
            
            {/* Desktop Menu */}
            <div className="desktop-menu" style={{ display: { xs: 'none', md: 'block' } }}>
              <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[selectedKey]}
                items={menuItems}
                style={{ backgroundColor: 'transparent', borderBottom: 'none' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* User Profile / Connection Section */}
            {showConnectButton && (
              <Button 
                type="primary" 
                onClick={connectWallet}
                loading={loading}
              >
                Подключить кошелек
              </Button>
            )}
            
            {showRegisterButton && (
              <Button 
                type="primary" 
                onClick={() => navigate('/registration')}
              >
                Регистрация
              </Button>
            )}
            
            {showUserMenu && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Badge count={Number(tokenBalance).toFixed(2) + ' GC'} style={{ backgroundColor: '#52c41a' }}>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                </Badge>
                <div style={{ marginLeft: 8, display: { xs: 'none', sm: 'block' } }}>
                  <Text style={{ color: 'white' }}>{userProfile?.username || 'Пользователь'}</Text>
                </div>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button 
              type="text" 
              icon={<MenuOutlined style={{ color: 'white', fontSize: 20 }} />}
              onClick={handleMobileMenuClick}
              style={{ marginLeft: 16, display: { md: 'none' } }}
            />
          </div>
        </div>
      </Header>
      
      {/* Mobile Menu Drawer */}
      <Drawer
        title="Меню"
        placement="right"
        onClose={handleMobileMenuClose}
        open={mobileMenuVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[selectedKey]}
          style={{ border: 'none' }}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={handleMobileMenuClose}>
              {item.label}
            </Menu.Item>
          ))}
          
          {showUserMenu && (
            <Menu.Item 
              key="logout" 
              icon={<LogoutOutlined />} 
              danger
              onClick={() => {
                handleMobileMenuClose();
                // Logout functionality would go here
              }}
            >
              Выйти
            </Menu.Item>
          )}
        </Menu>
      </Drawer>
      
      <Content className="site-content">
        <Outlet />
      </Content>
      
      <Footer className="site-footer">
        GymToken &copy; {new Date().getFullYear()} - Система токенов для сети спортзалов на блокчейне
      </Footer>
    </Layout>
  );
};

export default AppLayout;
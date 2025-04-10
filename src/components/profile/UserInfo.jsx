import React from 'react';
import { Card, Avatar, Typography, Divider, Tag, List } from 'antd';
import { UserOutlined, MailOutlined, WalletOutlined } from '@ant-design/icons';
import { useWeb3 } from '../../utils/Web3Context';
import { formatAddress } from '../../utils/formatters';

const { Title, Text } = Typography;

/**
 * Компонент для отображения информации о пользователе
 */
const UserInfo = () => {
  const { userProfile, account } = useWeb3();

  return (
    <Card className="dashboard-card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar
          size={80}
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        />
        <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
          {userProfile?.username || 'Пользователь'}
        </Title>
        <Tag color="blue" style={{ marginTop: 8 }}>Активный участник</Tag>
      </div>
      
      <Divider />
      
      <List
        itemLayout="horizontal"
        dataSource={[
          {
            icon: <MailOutlined />,
            title: 'Email',
            description: userProfile?.email || 'Не указан'
          },
          {
            icon: <WalletOutlined />,
            title: 'Адрес кошелька',
            description: account ? formatAddress(account) : 'Не подключен'
          }
        ]}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={item.icon} />}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default UserInfo;
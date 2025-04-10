import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Statistic, Button, Divider, List, Tag, Space, Avatar } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  WalletOutlined,
  DollarOutlined,
  SwapOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../utils/Web3Context';
import { ethers } from 'ethers';

const { Title, Paragraph, Text } = Typography;

// Mock transaction data (would come from contract events in a real app)
const mockTransactions = [
  { 
    id: '1', 
    type: 'buy', 
    amount: '50.00', 
    timestamp: new Date(Date.now() - 86400000 * 2).getTime(),
    ethAmount: '0.05'
  },
  { 
    id: '2', 
    type: 'transfer_out', 
    amount: '10.00', 
    timestamp: new Date(Date.now() - 86400000).getTime(),
    to: '0x1234...5678'
  },
  { 
    id: '3', 
    type: 'transfer_in', 
    amount: '5.00', 
    timestamp: new Date(Date.now() - 3600000 * 2).getTime(),
    from: '0x8765...4321'
  }
];

const Profile = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    account, 
    tokenBalance, 
    updateTokenBalance,
    loading
  } = useWeb3();

  useEffect(() => {
    updateTokenBalance();
  }, [updateTokenBalance]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'buy':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
      case 'sell':
        return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
      case 'transfer_out':
        return <SwapOutlined style={{ color: '#faad14' }} />;
      case 'transfer_in':
        return <SwapOutlined style={{ color: '#1890ff' }} />;
      default:
        return <SwapOutlined />;
    }
  };

  const getTransactionTitle = (transaction) => {
    switch (transaction.type) {
      case 'buy':
        return `Покупка ${transaction.amount} GC за ${transaction.ethAmount} ETH`;
      case 'sell':
        return `Продажа ${transaction.amount} GC за ${transaction.ethAmount} ETH`;
      case 'transfer_out':
        return `Отправка ${transaction.amount} GC на ${transaction.to}`;
      case 'transfer_in':
        return `Получение ${transaction.amount} GC от ${transaction.from}`;
      default:
        return 'Транзакция';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'buy':
        return 'green';
      case 'sell':
        return 'red';
      case 'transfer_out':
        return 'orange';
      case 'transfer_in':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
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
                  description: account ? 
                    `${account.substring(0, 6)}...${account.substring(account.length - 4)}` 
                    : 'Не подключен'
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
        </Col>
        
        <Col xs={24} lg={16}>
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card className="dashboard-card">
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12}>
                    <Statistic
                      title="Баланс GymCoin (GC)"
                      value={tokenBalance}
                      precision={2}
                      valueStyle={{ color: '#1890ff' }}
                      prefix={<DollarOutlined />}
                      suffix="GC"
                    />
                    <Button 
                      type="link" 
                      icon={<ReloadOutlined />}
                      onClick={updateTokenBalance}
                      loading={loading}
                      style={{ padding: 0, marginTop: 8 }}
                    >
                      Обновить баланс
                    </Button>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        type="primary" 
                        icon={<DollarOutlined />}
                        size="large"
                        block
                        onClick={() => navigate('/buy-sell')}
                      >
                        Купить/Продать GC
                      </Button>
                      <Button 
                        type="default" 
                        icon={<SwapOutlined />}
                        size="large"
                        block
                        onClick={() => navigate('/transfer')}
                      >
                        Перевести GC
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
            
            <Col xs={24}>
              <Card 
                className="dashboard-card"
                title={<Title level={4}>История транзакций</Title>}
              >
                {mockTransactions.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={mockTransactions}
                    renderItem={transaction => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={getTransactionIcon(transaction.type)} 
                              style={{ backgroundColor: getTransactionColor(transaction.type) === 'green' ? '#52c41a' : 
                                       getTransactionColor(transaction.type) === 'red' ? '#f5222d' : 
                                       getTransactionColor(transaction.type) === 'orange' ? '#faad14' : 
                                       '#1890ff' }}
                            />
                          }
                          title={getTransactionTitle(transaction)}
                          description={formatTimestamp(transaction.timestamp)}
                        />
                        <Tag color={getTransactionColor(transaction.type)}>
                          {transaction.type === 'transfer_out' || transaction.type === 'sell' 
                            ? '-' 
                            : '+'}{transaction.amount} GC
                        </Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <Paragraph>У вас пока нет транзакций</Paragraph>
                    <Button 
                      type="primary" 
                      onClick={() => navigate('/buy-sell')}
                    >
                      Купить первые токены
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
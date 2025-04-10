import React from 'react';
import { Row, Col, Card, Typography, Button, List, Space, Tag, Divider } from 'antd';
import { 
  SafetyOutlined, 
  GlobalOutlined, 
  SwapOutlined, 
  LockOutlined,
  CheckCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../utils/Web3Context';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const { isConnected, isRegistered, connectWallet } = useWeb3();

  const features = [
    {
      icon: <GlobalOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
      title: 'Доступ к любому спортзалу',
      description: 'Используйте свои токены в любом филиале сети GymToken без ограничений.'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 36, color: '#52c41a' }} />,
      title: 'Безопасность и прозрачность',
      description: 'Blockchain-технология гарантирует защиту ваших средств и прозрачность всех операций.'
    },
    {
      icon: <SwapOutlined style={{ fontSize: 36, color: '#fa8c16' }} />,
      title: 'Гибкий обмен',
      description: 'Покупайте, продавайте или передавайте токены GymCoin другим пользователям сети.'
    },
    {
      icon: <LockOutlined style={{ fontSize: 36, color: '#722ed1' }} />,
      title: 'Защита от изменений',
      description: 'Данные невозможно подделать или изменить задним числом - даже владельцам спортзалов.'
    }
  ];

  const steps = [
    {
      title: 'Подключите кошелёк',
      description: 'Используйте MetaMask для быстрого и безопасного подключения к сети.'
    },
    {
      title: 'Зарегистрируйтесь',
      description: 'Создайте профиль пользователя, указав имя и электронную почту.'
    },
    {
      title: 'Приобретите токены',
      description: 'Купите токены GymCoin (GC) за ETH по текущему курсу.'
    },
    {
      title: 'Начните пользоваться',
      description: 'Используйте токены для доступа к сети спортзалов или передавайте их другим пользователям.'
    }
  ];

  const handleGetStarted = () => {
    if (!isConnected) {
      connectWallet();
    } else if (!isRegistered) {
      navigate('/registration');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card 
            style={{ 
              borderRadius: 16,
              backgroundImage: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              color: 'white',
              padding: 20,
              textAlign: 'center',
              boxShadow: '0 8px 16px rgba(24, 144, 255, 0.2)'
            }}
          >
            <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
              GymToken - Сеть спортзалов на блокчейне
            </Title>
            <Paragraph style={{ fontSize: 18, color: 'white', marginBottom: 32 }}>
              Революционная система токенов, предоставляющая доступ к сети спортивных залов
              с использованием технологии блокчейн для максимальной безопасности и прозрачности.
            </Paragraph>
            <Button 
              type="primary" 
              size="large" 
              onClick={handleGetStarted} 
              style={{ 
                backgroundColor: 'white', 
                borderColor: 'white',
                color: '#1890ff',
                height: 50,
                fontSize: 16,
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {!isConnected 
                ? 'Подключить кошелек' 
                : !isRegistered 
                  ? 'Регистрация' 
                  : 'Мой профиль'
              }
            </Button>
          </Card>
        </Col>
      </Row>

      <Divider orientation="center">
        <Space>
          <Text strong style={{ fontSize: 24 }}>Преимущества</Text>
          <Tag color="#1890ff">GymCoin (GC)</Tag>
        </Space>
      </Divider>

      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              className="dashboard-card"
              style={{ textAlign: 'center', height: '100%' }}
              hoverable
            >
              <div style={{ marginBottom: 16 }}>
                {feature.icon}
              </div>
              <Title level={4}>{feature.title}</Title>
              <Paragraph>{feature.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider orientation="center">
        <Space>
          <Text strong style={{ fontSize: 24 }}>Как начать</Text>
          <Tag color="#52c41a">4 простых шага</Tag>
        </Space>
      </Divider>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card className="dashboard-card">
            <List
              itemLayout="horizontal"
              dataSource={steps}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        background: '#1890ff', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={<Text strong>{item.title}</Text>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="dashboard-card">
            <Title level={4}>Почему блокчейн?</Title>
            <Paragraph>
              Традиционные системы часто сталкиваются с проблемами совместимости между 
              различными филиалами и отслеживанием использования средств. 
            </Paragraph>
            <Paragraph>
              <strong>Blockchain решает эти проблемы, обеспечивая:</strong>
            </Paragraph>
            <List
              itemLayout="horizontal"
              dataSource={[
                'Безопасное хранение данных пользователей',
                'Прозрачность всех транзакций',
                'Невозможность подделки или манипуляций',
                'Децентрализованное управление'
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />}
                    title={item}
                  />
                </List.Item>
              )}
            />
            <Button 
              type="primary" 
              icon={<RightOutlined />} 
              size="large" 
              style={{ marginTop: 16 }}
              onClick={handleGetStarted}
            >
              Начать использование
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
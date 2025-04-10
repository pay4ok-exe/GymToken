import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Alert, Steps, Result, Spin, Row, Col } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  WalletOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../utils/Web3Context';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const Registration = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { 
    isConnected, 
    connectWallet, 
    registerUser, 
    isRegistered, 
    account,
    loading 
  } = useWeb3();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
    
    if (isRegistered) {
      navigate('/profile');
    }
  }, [isConnected, isRegistered, navigate]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      setError('Ошибка подключения кошелька: ' + error.message);
    }
  };

  const handleRegistration = async (values) => {
    try {
      setRegistrationLoading(true);
      setError('');
      
      const success = await registerUser(values.username, values.email);
      
      if (success) {
        setRegistrationSuccess(true);
        setCurrentStep(2);
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      }
    } catch (error) {
      setError('Ошибка регистрации: ' + error.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const steps = [
    {
      title: 'Подключение',
      content: (
        <div style={{ textAlign: 'center' }}>
          <WalletOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
          <Title level={3}>Подключите ваш кошелек</Title>
          <Paragraph>
            Для использования GymToken вам необходимо подключить MetaMask или другой совместимый кошелек.
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleConnectWallet}
            loading={loading}
            style={{ marginTop: 16 }}
          >
            Подключить кошелек
          </Button>
          {account && (
            <Alert
              message="Кошелек подключен"
              description={`Адрес: ${account}`}
              type="success"
              showIcon
              style={{ marginTop: 24 }}
            />
          )}
        </div>
      ),
    },
    {
      title: 'Регистрация',
      content: (
        <div>
          <Title level={3}>Регистрация пользователя</Title>
          <Paragraph>
            Заполните информацию профиля для завершения регистрации
          </Paragraph>
          
          <Form
            form={form}
            name="registration"
            layout="vertical"
            onFinish={handleRegistration}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label="Имя пользователя"
              rules={[
                { required: true, message: 'Пожалуйста, введите имя пользователя' },
                { min: 3, message: 'Имя пользователя должно содержать минимум 3 символа' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Введите имя пользователя" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Пожалуйста, введите email' },
                { type: 'email', message: 'Пожалуйста, введите корректный email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Введите email" />
            </Form.Item>

            <Form.Item
              name="walletAddress"
              label="Адрес кошелька"
            >
              <Input 
                prefix={<WalletOutlined />} 
                disabled 
                value={account} 
                placeholder={account} 
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={registrationLoading}
                block
              >
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      title: 'Завершение',
      content: (
        <Result
          status="success"
          title="Регистрация успешно завершена!"
          subTitle="Вы будете перенаправлены на страницу профиля через несколько секунд..."
          extra={[
            <Button 
              type="primary" 
              key="profile" 
              onClick={() => navigate('/profile')}
            >
              Перейти в профиль
            </Button>
          ]}
        />
      ),
    },
  ];

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card className="auth-card">
          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          
          {error && (
            <Alert
              message="Ошибка"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: 24 }}
            />
          )}
          
          {loading && currentStep === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
              <Paragraph style={{ marginTop: 16 }}>Подключение к кошельку...</Paragraph>
            </div>
          ) : (
            steps[currentStep].content
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default Registration;
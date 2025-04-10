import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';
import { UserOutlined, MailOutlined, WalletOutlined } from '@ant-design/icons';
import { useWeb3 } from '../../utils/Web3Context';
import { formatAddress } from '../../utils/formatters';

const { Title, Paragraph } = Typography;

/**
 * Компонент формы регистрации пользователя
 * @param {Function} onSuccess - Функция, вызываемая при успешной регистрации
 */
const RegisterForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { registerUser, account } = useWeb3();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      const success = await registerUser(values.username, values.email);
      
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 500, margin: '0 auto' }}>
      <Title level={3}>Регистрация пользователя</Title>
      <Paragraph>
        Заполните информацию профиля для завершения регистрации
      </Paragraph>
      
      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={handleSubmit}
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
            placeholder={formatAddress(account)}
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RegisterForm;
import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Alert } from 'antd';
import { UserOutlined, DollarOutlined, SendOutlined } from '@ant-design/icons';
import { useWeb3 } from '../../utils/Web3Context';
import { ethers } from 'ethers';

/**
 * Компонент для перевода токенов GC другому пользователю
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onSuccess - Функция, вызываемая после успешного перевода
 */
const TransferTokens = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { tokenBalance, transferTokens } = useWeb3();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddressChange = (e) => {
    setRecipientAddress(e.target.value);
  };

  const handleAmountChange = (value) => {
    setTransferAmount(value || 0);
  };

  const validateAddress = (address) => {
    try {
      if (address) {
        ethers.utils.getAddress(address); // Проверка корректности адреса
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleTransfer = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Проверка адреса
      if (!validateAddress(recipientAddress)) {
        setError('Некорректный адрес получателя');
        return;
      }
      
      // Проверка суммы
      if (transferAmount <= 0) {
        setError('Пожалуйста, введите сумму больше 0');
        return;
      }
      
      // Проверка баланса
      if (transferAmount > Number(tokenBalance)) {
        setError('Недостаточно токенов на балансе');
        return;
      }
      
      const success = await transferTokens(recipientAddress, transferAmount.toString());
      
      if (success) {
        form.resetFields();
        setRecipientAddress('');
        setTransferAmount(0);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      setError('Ошибка при переводе токенов: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="Ваш текущий баланс">
        <InputNumber
          style={{ width: '100%' }}
          value={Number(tokenBalance)}
          disabled
          precision={2}
          prefix={<DollarOutlined />}
          suffix="GC"
        />
      </Form.Item>
      
      <Form.Item
        name="recipient"
        label="Адрес получателя"
        rules={[
          { required: true, message: 'Пожалуйста, введите адрес получателя' },
          {
            validator: (_, value) => {
              if (value && !validateAddress(value)) {
                return Promise.reject('Некорректный Ethereum адрес');
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="0x..."
          onChange={handleAddressChange}
        />
      </Form.Item>
      
      <Form.Item
        name="amount"
        label="Количество GC для перевода"
        rules={[
          { required: true, message: 'Пожалуйста, введите количество' },
          { type: 'number', min: 0.01, message: 'Минимальное количество 0.01' },
          {
            validator: (_, value) => {
              if (value && value > Number(tokenBalance)) {
                return Promise.reject('Недостаточно токенов на балансе');
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Например: 5"
          min={0.01}
          max={Number(tokenBalance)}
          step={0.1}
          precision={2}
          onChange={handleAmountChange}
          prefix={<DollarOutlined />}
          suffix="GC"
        />
      </Form.Item>
      
      <Alert
        message="Безопасность"
        description="Пожалуйста, внимательно проверьте адрес получателя. Транзакции в блокчейне необратимы."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Button 
        type="primary" 
        icon={<SendOutlined />}
        size="large"
        onClick={handleTransfer}
        loading={loading}
        disabled={!validateAddress(recipientAddress) || transferAmount <= 0 || transferAmount > Number(tokenBalance)}
        block
      >
        Перевести GymCoin
      </Button>
      
      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          style={{ marginTop: 16 }}
        />
      )}
    </Form>
  );
};

export default TransferTokens;
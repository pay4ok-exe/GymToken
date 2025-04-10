import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Alert, Row, Col } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, SwapOutlined } from '@ant-design/icons';
import { useWeb3 } from '../../utils/Web3Context';
import { ethers } from 'ethers';

/**
 * Компонент для покупки токенов GC за ETH
 * @param {Object} props - Свойства компонента
 * @param {Object} props.rates - Курсы обмена (sellRate)
 * @param {Function} props.onSuccess - Функция, вызываемая после успешной покупки
 */
const BuyTokens = ({ rates = { sellRate: 0 }, onSuccess }) => {
  const [form] = Form.useForm();
  const { buyTokens } = useWeb3();
  
  const [buyAmount, setBuyAmount] = useState(0);
  const [buyEthAmount, setBuyEthAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обновить ETH amount при изменении GC amount или курса
  useEffect(() => {
    setBuyEthAmount(buyAmount * rates.sellRate);
  }, [buyAmount, rates.sellRate]);

  const handleAmountChange = (value) => {
    setBuyAmount(value || 0);
  };

  const handleBuy = async () => {
    try {
      setError('');
      setLoading(true);
      
      if (buyAmount <= 0) {
        setError('Пожалуйста, введите количество токенов больше 0');
        return;
      }
      
      const success = await buyTokens(buyAmount.toString());
      
      if (success) {
        form.resetFields();
        setBuyAmount(0);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      setError('Ошибка при покупке токенов: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item 
            name="buyAmount" 
            label="Количество GC для покупки"
            rules={[
              { required: true, message: 'Введите количество' },
              { 
                type: 'number', 
                min: 0.01, 
                message: 'Минимальное количество 0.01' 
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Например: 10"
              min={0.01}
              step={0.1}
              precision={2}
              onChange={handleAmountChange}
              prefix={<DollarOutlined />}
              suffix="GC"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Сумма ETH к оплате">
            <InputNumber
              style={{ width: '100%' }}
              value={buyEthAmount}
              disabled
              precision={6}
              prefix={<SwapOutlined />}
              suffix="ETH"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Alert
        message="Информация о курсе"
        description={`Текущий курс: 1 GC = ${rates.sellRate} ETH`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Button 
        type="primary" 
        icon={<ShoppingCartOutlined />}
        size="large"
        onClick={handleBuy}
        loading={loading}
        disabled={buyAmount <= 0}
        block
      >
        Купить GymCoin
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

export default BuyTokens;
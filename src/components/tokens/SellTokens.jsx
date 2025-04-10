import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Alert, Row, Col } from 'antd';
import { DollarOutlined, SwapOutlined } from '@ant-design/icons';
import { useWeb3 } from '../../utils/Web3Context';

/**
 * Компонент для продажи токенов GC за ETH
 * @param {Object} props - Свойства компонента
 * @param {Object} props.rates - Курсы обмена (buyRate)
 * @param {Function} props.onSuccess - Функция, вызываемая после успешной продажи
 */
const SellTokens = ({ rates = { buyRate: 0 }, onSuccess }) => {
  const [form] = Form.useForm();
  const { tokenBalance, sellTokens } = useWeb3();
  
  const [sellAmount, setSellAmount] = useState(0);
  const [sellEthAmount, setSellEthAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обновить ETH amount при изменении GC amount или курса
  useEffect(() => {
    setSellEthAmount(sellAmount * rates.buyRate);
  }, [sellAmount, rates.buyRate]);

  const handleAmountChange = (value) => {
    setSellAmount(value || 0);
  };

  const handleSell = async () => {
    try {
      setError('');
      setLoading(true);
      
      if (sellAmount <= 0) {
        setError('Пожалуйста, введите количество токенов больше 0');
        return;
      }
      
      if (sellAmount > Number(tokenBalance)) {
        setError('Недостаточно токенов на балансе');
        return;
      }
      
      const success = await sellTokens(sellAmount.toString());
      
      if (success) {
        form.resetFields();
        setSellAmount(0);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      setError('Ошибка при продаже токенов: ' + error.message);
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
    
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item 
            name="sellAmount" 
            label="Количество GC для продажи"
            rules={[
              { required: true, message: 'Введите количество' },
              { 
                type: 'number', 
                min: 0.01, 
                message: 'Минимальное количество 0.01' 
              },
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
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Сумма ETH к получению">
            <InputNumber
              style={{ width: '100%' }}
              value={sellEthAmount}
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
        description={`Текущий курс: 1 GC = ${rates.buyRate} ETH`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Button 
        type="primary" 
        danger
        icon={<DollarOutlined />}
        size="large"
        onClick={handleSell}
        loading={loading}
        disabled={sellAmount <= 0 || sellAmount > Number(tokenBalance)}
        block
      >
        Продать GymCoin
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

export default SellTokens;
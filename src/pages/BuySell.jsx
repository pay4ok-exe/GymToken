import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  InputNumber, 
  Button, 
  Divider, 
  Alert, 
  Tabs, 
  Form,
  Statistic,
  Space
} from 'antd';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  SwapOutlined, 
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useWeb3 } from '../utils/Web3Context';
import { ethers } from 'ethers';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const BuySell = () => {
  const [buyForm] = Form.useForm();
  const [sellForm] = Form.useForm();
  
  const { 
    tokenBalance, 
    updateTokenBalance, 
    buyTokens, 
    sellTokens, 
    gymCoinContract,
    loading
  } = useWeb3();
  
  const [activeTab, setActiveTab] = useState('buy');
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [buyEthAmount, setBuyEthAmount] = useState(0);
  const [sellEthAmount, setSellEthAmount] = useState(0);
  const [rates, setRates] = useState({ sellRate: 0, buyRate: 0 });
  const [isBuying, setIsBuying] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [error, setError] = useState('');

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        if (gymCoinContract) {
          const ratesResult = await gymCoinContract.getRates();
          setRates({
            sellRate: ethers.utils.formatEther(ratesResult.sellRate),
            buyRate: ethers.utils.formatEther(ratesResult.buyRate)
          });
        }
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };

    fetchRates();
  }, [gymCoinContract]);

  // Update ETH amount when GC amount changes
  useEffect(() => {
    setBuyEthAmount(buyAmount * rates.sellRate);
  }, [buyAmount, rates.sellRate]);

  useEffect(() => {
    setSellEthAmount(sellAmount * rates.buyRate);
  }, [sellAmount, rates.buyRate]);

  const handleBuy = async () => {
    try {
      setError('');
      setIsBuying(true);
      
      if (buyAmount <= 0) {
        setError('Пожалуйста, введите количество токенов больше 0');
        return;
      }
      
      const success = await buyTokens(buyAmount.toString());
      
      if (success) {
        buyForm.resetFields();
        setBuyAmount(0);
        updateTokenBalance();
      }
    } catch (error) {
      setError('Ошибка при покупке токенов: ' + error.message);
    } finally {
      setIsBuying(false);
    }
  };

  const handleSell = async () => {
    try {
      setError('');
      setIsSelling(true);
      
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
        sellForm.resetFields();
        setSellAmount(0);
        updateTokenBalance();
      }
    } catch (error) {
      setError('Ошибка при продаже токенов: ' + error.message);
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <div>
      <Title level={2}>Купить/Продать GymCoin</Title>
      <Paragraph>
        Здесь вы можете купить или продать токены GymCoin (GC) за ETH.
      </Paragraph>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="dashboard-card">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              type="card"
              size="large"
            >
              <TabPane 
                tab={
                  <span>
                    <ShoppingCartOutlined /> Купить GC
                  </span>
                } 
                key="buy"
              >
                <Form form={buyForm} layout="vertical">
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
                          onChange={(value) => setBuyAmount(value || 0)}
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
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Button 
                    type="primary" 
                    icon={<ShoppingCartOutlined />}
                    size="large"
                    onClick={handleBuy}
                    loading={isBuying}
                    disabled={buyAmount <= 0}
                    block
                  >
                    Купить GymCoin
                  </Button>
                </Form>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <DollarOutlined /> Продать GC
                  </span>
                } 
                key="sell"
              >
                <Form form={sellForm} layout="vertical">
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
                          onChange={(value) => setSellAmount(value || 0)}
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
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Button 
                    type="primary" 
                    danger
                    icon={<DollarOutlined />}
                    size="large"
                    onClick={handleSell}
                    loading={isSelling}
                    disabled={sellAmount <= 0 || sellAmount > Number(tokenBalance)}
                    block
                  >
                    Продать GymCoin
                  </Button>
                </Form>
              </TabPane>
            </Tabs>
            
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
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card className="dashboard-card">
            <Title level={4}>Курсы обмена</Title>
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Курс покупки (1 GC)"
                value={rates.sellRate}
                precision={6}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ArrowUpOutlined />}
                suffix="ETH"
              />
              
              <Statistic
                title="Курс продажи (1 GC)"
                value={rates.buyRate}
                precision={6}
                valueStyle={{ color: '#f5222d' }}
                prefix={<ArrowDownOutlined />}
                suffix="ETH"
              />
            </Space>
            
            <Divider />
            
            <Title level={4}>Ваш баланс</Title>
            <Statistic
              value={tokenBalance}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="GC"
            />
            <Button 
              type="link" 
              onClick={updateTokenBalance}
              loading={loading}
              style={{ padding: 0 }}
            >
              Обновить баланс
            </Button>
            
            <Divider />
            
            <Alert
              message="Информация"
              description="Курс покупки и продажи устанавливается владельцем контракта. При покупке или продаже токенов взимается небольшая комиссия сети Ethereum."
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BuySell;
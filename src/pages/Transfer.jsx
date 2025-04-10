import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Input, 
  InputNumber, 
  Button, 
  Form, 
  Alert, 
  Divider,
  Statistic,
  Steps,
  Result
} from 'antd';
import { 
  SwapOutlined, 
  DollarOutlined, 
  SendOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useWeb3 } from '../utils/Web3Context';
import { ethers } from 'ethers';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const Transfer = () => {
  const [form] = Form.useForm();
  const { tokenBalance, updateTokenBalance, transferTokens, loading } = useWeb3();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

  const handleAddressChange = (e) => {
    setRecipientAddress(e.target.value);
  };

  const handleAmountChange = (value) => {
    setTransferAmount(value || 0);
  };

  const validateForm = () => {
    try {
      // Check if address is valid
      ethers.utils.getAddress(recipientAddress);
      
      // Check if amount is valid
      if (transferAmount <= 0) {
        setError('Пожалуйста, введите сумму больше 0');
        return false;
      }
      
      // Check if user has enough balance
      if (transferAmount > Number(tokenBalance)) {
        setError('Недостаточно токенов на балансе');
        return false;
      }
      
      return true;
    } catch (e) {
      setError('Некорректный адрес получателя');
      return false;
    }
  };

  const handleTransfer = async () => {
    if (!validateForm()) return;
    
    setError('');
    setIsTransferring(true);
    
    try {
      const success = await transferTokens(recipientAddress, transferAmount.toString());
      
      if (success) {
        setTransferSuccess(true);
        setCurrentStep(2);
        setTransactionDetails({
          recipient: recipientAddress,
          amount: transferAmount,
          date: new Date().toLocaleString()
        });
        
        form.resetFields();
        setTransferAmount(0);
        updateTokenBalance();
      }
    } catch (error) {
      setError('Ошибка при переводе токенов: ' + error.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleProceedToConfirm = () => {
    if (validateForm()) {
      setCurrentStep(1);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep(0);
  };

  const handleNewTransfer = () => {
    setCurrentStep(0);
    setTransferSuccess(false);
    setTransactionDetails(null);
    form.resetFields();
  };

  const steps = [
    {
      title: 'Заполнение',
      content: (
        <Form form={form} layout="vertical">
          <Form.Item
            name="recipient"
            label="Адрес получателя"
            rules={[
              { required: true, message: 'Пожалуйста, введите адрес получателя' },
              {
                validator: (_, value) => {
                  try {
                    if (value) ethers.utils.getAddress(value);
                    return Promise.resolve();
                  } catch (e) {
                    return Promise.reject('Некорректный Ethereum адрес');
                  }
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
          
          <Divider />
          
          <Form.Item>
            <Button
              type="primary"
              size="large"
              onClick={handleProceedToConfirm}
              block
            >
              Продолжить
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: 'Подтверждение',
      content: (
        <div>
          <Alert
            message="Проверьте детали перевода"
            description="Пожалуйста, внимательно проверьте адрес получателя и сумму. Перевод токенов необратим."
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
          
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Statistic
                  title="Получатель"
                  value={recipientAddress}
                  valueStyle={{ fontSize: '16px', wordBreak: 'break-all' }}
                />
              </Col>
              <Col span={24}>
                <Statistic
                  title="Сумма перевода"
                  value={transferAmount}
                  precision={2}
                  suffix="GC"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Button 
                onClick={handleBackToForm} 
                block
              >
                Назад
              </Button>
            </Col>
            <Col span={12}>
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleTransfer}
                loading={isTransferring}
                block
              >
                Подтвердить и отправить
              </Button>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      title: 'Завершение',
      content: (
        <Result
          status="success"
          title="Перевод успешно выполнен!"
          subTitle={`${transferAmount} GC отправлены на адрес ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`}
          extra={[
            <Button 
              type="primary" 
              key="new" 
              onClick={handleNewTransfer}
            >
              Новый перевод
            </Button>
          ]}
        />
      ),
    },
  ];

  return (
    <Row justify="center">
      <Col xs={24} md={20} lg={16}>
        <Title level={2}>Перевод GymCoin</Title>
        <Paragraph>
          Здесь вы можете перевести токены GymCoin (GC) другому пользователю.
        </Paragraph>
        
        <Card className="dashboard-card">
          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            <Step title="Заполнение" icon={<UserOutlined />} />
            <Step title="Подтверждение" icon={<ExclamationCircleOutlined />} />
            <Step title="Завершение" icon={<CheckCircleOutlined />} />
          </Steps>
          
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
          
          <div style={{ marginBottom: 16 }}>
            {steps[currentStep].content}
          </div>
        </Card>
        
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card className="dashboard-card">
              <Statistic
                title="Ваш текущий баланс"
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
                message="Информация о переводах"
                description="Переводы токенов между пользователями происходят мгновенно и не требуют комиссии, кроме стандартной платы за газ в сети Ethereum."
                type="info"
                showIcon
              />
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Transfer;
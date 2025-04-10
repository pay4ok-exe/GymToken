import React from 'react';
import { Button, Typography, Space, Card, Alert } from 'antd';
import { WalletOutlined, WarningOutlined } from '@ant-design/icons';
import { useWeb3 } from '../../utils/Web3Context';
import { formatAddress } from '../../utils/formatters';

const { Title, Paragraph, Text } = Typography;

/**
 * Компонент для подключения кошелька MetaMask
 */
const ConnectWallet = () => {
  const { isConnected, connectWallet, account, loading } = useWeb3();

  return (
    <Card style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <WalletOutlined style={{ fontSize: 64, color: '#1890ff' }} />
        
        <Title level={3}>Подключите ваш кошелек</Title>
        
        <Paragraph>
          Для использования сервиса GymToken вам необходимо подключить MetaMask 
          или другой совместимый кошелек.
        </Paragraph>
        
        {!isConnected ? (
          <Button 
            type="primary" 
            size="large" 
            icon={<WalletOutlined />}
            onClick={connectWallet}
            loading={loading}
            style={{ marginTop: 16 }}
          >
            Подключить кошелек
          </Button>
        ) : (
          <Alert
            message="Кошелек подключен"
            description={`Адрес: ${formatAddress(account)}`}
            type="success"
            showIcon
          />
        )}
        
        <Alert
          message="Важно"
          description="Для работы с приложением требуется установленное расширение MetaMask и наличие тестовых ETH в сети Sepolia."
          type="info"
          showIcon
          icon={<WarningOutlined />}
        />
      </Space>
    </Card>
  );
};

export default ConnectWallet;
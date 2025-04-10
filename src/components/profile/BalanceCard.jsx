import React from 'react';
import { Card, Statistic, Button, Row, Col, Space } from 'antd';
import { 
  DollarOutlined, 
  ReloadOutlined, 
  SwapOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../utils/Web3Context';

/**
 * Компонент для отображения баланса токенов пользователя и основных действий
 */
const BalanceCard = () => {
  const navigate = useNavigate();
  const { tokenBalance, updateTokenBalance, loading } = useWeb3();

  return (
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
  );
};

export default BalanceCard;
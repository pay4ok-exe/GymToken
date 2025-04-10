import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Извините, страница, которую вы ищете, не существует."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Вернуться на главную
        </Button>
      }
    />
  );
};

export default NotFound;
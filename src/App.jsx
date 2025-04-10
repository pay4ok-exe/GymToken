import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/lib/locale/ru_RU';

// Style
import './App.css';

// Context
import { Web3Provider } from './utils/Web3Context';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Home from './pages/Home';
import Registration from './pages/Registration';
import Profile from './pages/Profile';
import BuySell from './pages/BuySell';
import Transfer from './pages/Transfer';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ element, isRegistered }) => {
  return isRegistered ? element : <Navigate to="/registration" />;
};

function App() {
  return (
    <ConfigProvider locale={ruRU} theme={{
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 8,
      },
    }}>
      <Web3Provider>
        <Router>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="registration" element={<Registration />} />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute 
                    element={<Profile />} 
                    isRegistered={true} // This will be dynamic with context
                  />
                } 
              />
              <Route 
                path="buy-sell" 
                element={
                  <ProtectedRoute 
                    element={<BuySell />} 
                    isRegistered={true} // This will be dynamic with context
                  />
                } 
              />
              <Route 
                path="transfer" 
                element={
                  <ProtectedRoute 
                    element={<Transfer />} 
                    isRegistered={true} // This will be dynamic with context
                  />
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </Web3Provider>
    </ConfigProvider>
  );
}

export default App;
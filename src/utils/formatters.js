import { ethers } from 'ethers';

/**
 * Форматирует адрес Ethereum, отображая только начало и конец
 * @param {string} address - Полный адрес Ethereum
 * @param {number} startChars - Количество символов в начале (по умолчанию 6)
 * @param {number} endChars - Количество символов в конце (по умолчанию 4)
 * @returns {string} Отформатированный адрес
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Форматирует токены из wei (наименьшие единицы) в читаемый формат
 * @param {string|number|ethers.BigNumber} amount - Количество в wei
 * @param {number} decimals - Количество десятичных знаков (по умолчанию 18 для ETH/большинства ERC-20)
 * @param {number} displayDecimals - Количество десятичных знаков для отображения
 * @returns {string} Отформатированное значение
 */
export const formatTokenAmount = (amount, decimals = 18, displayDecimals = 2) => {
  if (!amount) return '0';
  
  try {
    const formatted = ethers.utils.formatUnits(amount, decimals);
    const number = parseFloat(formatted);
    return number.toFixed(displayDecimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

/**
 * Форматирует временную метку в читаемый формат даты и времени
 * @param {number} timestamp - Временная метка в миллисекундах
 * @returns {string} Отформатированная дата и время
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

/**
 * Форматирует ошибку из транзакции Ethereum в читаемый вид
 * @param {Error} error - Объект ошибки
 * @returns {string} Сообщение об ошибке
 */
export const formatError = (error) => {
  if (!error) return '';
  
  // Пытаемся извлечь полезную информацию из объекта ошибки
  if (error.reason) {
    return error.reason;
  }
  
  if (error.message) {
    // Некоторые распространенные ошибки MetaMask/Ethereum
    if (error.message.includes('user rejected transaction')) {
      return 'Транзакция отклонена пользователем';
    }
    
    if (error.message.includes('insufficient funds')) {
      return 'Недостаточно средств для выполнения транзакции';
    }
    
    return error.message;
  }
  
  return 'Произошла неизвестная ошибка';
};
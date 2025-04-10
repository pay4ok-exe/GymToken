// Адреса контрактов в тестовой сети Sepolia
// Заменить после деплоя контрактов!

const contractAddresses = {
    // Тестовая сеть Sepolia
    sepolia: {
      userProfile: "0x...", // Заменить после деплоя
      gymCoin: "0x..."      // Заменить после деплоя
    },
    
    // Локальная сеть hardhat (для тестирования)
    localhost: {
      userProfile: "0x...", // Заменить после локального деплоя
      gymCoin: "0x..."      // Заменить после локального деплоя
    }
  };
  
  export default contractAddresses;
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../utils/contractAddresses';

/**
 * Хук для работы с Ethereum контрактами
 * @param {Object} artifact - JSON артефакт контракта (ABI)
 * @param {string} contractType - Тип контракта ('userProfile' или 'gymCoin')
 * @param {Object} signerOrProvider - Signer или Provider из ethers.js
 * @returns {Object} Интерфейс для взаимодействия с контрактом
 */
export const useContract = (
  artifact,
  contractType,
  signerOrProvider
) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initContract = useCallback(async () => {
    if (!artifact || !contractType || !signerOrProvider) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Определяем сеть
      let networkName = 'localhost';
      
      if (signerOrProvider.provider) {
        const network = await signerOrProvider.provider.getNetwork();
        if (network.name === 'sepolia') {
          networkName = 'sepolia';
        }
      }
      
      // Получаем адрес контракта для нужной сети
      const address = contractAddresses[networkName][contractType];
      
      if (!address || address === '0x...') {
        throw new Error('Адрес контракта не настроен для этой сети');
      }
      
      // Создаем экземпляр контракта
      const contract = new ethers.Contract(
        address,
        artifact.abi,
        signerOrProvider
      );
      
      setContract(contract);
      setLoading(false);
      
      return contract;
    } catch (err) {
      console.error('Error initializing contract:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [artifact, contractType, signerOrProvider]);

  useEffect(() => {
    initContract();
  }, [initContract]);

  return { contract, loading, error, initContract };
};

export default useContract;
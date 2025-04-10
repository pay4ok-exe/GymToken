const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GymCoin Contract", function() {
  let GymCoin;
  let gymCoin;
  let owner;
  let user1;
  let user2;
  let initialSupply;
  let sellRate;
  let buyRate;
  
  beforeEach(async function() {
    // Получение аккаунтов для тестирования
    [owner, user1, user2] = await ethers.getSigners();
    
    // Инициализация параметров
    initialSupply = ethers.utils.parseEther("1000000"); // 1,000,000 токенов
    sellRate = ethers.utils.parseEther("0.001");       // 1 GC = 0.001 ETH (продажа пользователям)
    buyRate = ethers.utils.parseEther("0.0008");       // 1 GC = 0.0008 ETH (покупка у пользователей)
    
    // Деплой контракта GymCoin
    const GymCoinFactory = await ethers.getContractFactory("GymCoin");
    gymCoin = await GymCoinFactory.deploy(initialSupply, sellRate, buyRate);
    await gymCoin.deployed();
    
    // Пополнение контракта ETH для функций покупки
    await owner.sendTransaction({
      to: gymCoin.address,
      value: ethers.utils.parseEther("10") // 10 ETH
    });
  });

  describe("Инициализация", function() {
    it("Должна корректно инициализировать контракт", async function() {
      // Проверка имени и символа токена
      expect(await gymCoin.name()).to.equal("Gym Coin");
      expect(await gymCoin.symbol()).to.equal("GC");
      
      // Проверка начальных курсов
      const rates = await gymCoin.getRates();
      expect(rates.sellRate).to.equal(sellRate);
      expect(rates.buyRate).to.equal(buyRate);
      
      // Проверка начального баланса владельца
      expect(await gymCoin.balanceOf(owner.address)).to.equal(initialSupply);
    });
  });

  describe("Функция покупки токенов", function() {
    it("Должна позволять пользователям покупать токены", async function() {
      const gcAmount = ethers.utils.parseEther("100"); // 100 GC
      const ethRequired = gcAmount.mul(sellRate).div(ethers.utils.parseEther("1")); // ETH требуемый
      
      // Покупка токенов
      await gymCoin.connect(user1).buy(gcAmount, { value: ethRequired });
      
      // Проверка баланса пользователя
      expect(await gymCoin.balanceOf(user1.address)).to.equal(gcAmount);
      
      // Проверка баланса владельца
      expect(await gymCoin.balanceOf(owner.address)).to.equal(initialSupply.sub(gcAmount));
    });
    
    it("Должна возвращать ошибку при недостаточном ETH", async function() {
      const gcAmount = ethers.utils.parseEther("100"); // 100 GC
      const ethRequired = gcAmount.mul(sellRate).div(ethers.utils.parseEther("1")); // ETH требуемый
      const insufficientEth = ethRequired.sub(1); // Недостаточно ETH
      
      // Покупка токенов с недостаточным ETH должна вернуть ошибку
      await expect(
        gymCoin.connect(user1).buy(gcAmount, { value: insufficientEth })
      ).to.be.revertedWith("Not enough ETH sent");
    });
    
    it("Должна возвращать ошибку при недостаточном балансе владельца", async function() {
      const gcAmount = initialSupply.add(1); // Больше чем у владельца
      const ethRequired = gcAmount.mul(sellRate).div(ethers.utils.parseEther("1")); // ETH требуемый
      
      // Покупка токенов больше, чем есть у владельца, должна вернуть ошибку
      await expect(
        gymCoin.connect(user1).buy(gcAmount, { value: ethRequired })
      ).to.be.revertedWith("Not enough tokens available");
    });
  });

  describe("Функция продажи токенов", function() {
    beforeEach(async function() {
      // Предварительная покупка токенов пользователем
      const gcAmount = ethers.utils.parseEther("100"); // 100 GC
      const ethRequired = gcAmount.mul(sellRate).div(ethers.utils.parseEther("1"));
      await gymCoin.connect(user1).buy(gcAmount, { value: ethRequired });
    });
    
    it("Должна позволять пользователям продавать токены", async function() {
      const gcAmount = ethers.utils.parseEther("50"); // 50 GC
      const ethToReturn = gcAmount.mul(buyRate).div(ethers.utils.parseEther("1"));
      
      // Запоминаем баланс ETH до продажи
      const ethBalanceBefore = await ethers.provider.getBalance(user1.address);
      
      // Продажа токенов
      const tx = await gymCoin.connect(user1).sell(gcAmount);
      const receipt = await tx.wait();
      
      // Расчет потраченного газа
      const gasUsed = receipt.gasUsed;
      const gasPrice = tx.gasPrice;
      const gasCost = gasUsed.mul(gasPrice);
      
      // Проверка баланса токенов пользователя
      expect(await gymCoin.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("50")); // 100 - 50 = 50
      
      // Проверка баланса ETH пользователя (с учетом стоимости газа)
      const ethBalanceAfter = await ethers.provider.getBalance(user1.address);
      expect(ethBalanceAfter.add(gasCost).sub(ethBalanceBefore)).to.equal(ethToReturn);
      
      // Проверка баланса владельца
      expect(await gymCoin.balanceOf(owner.address)).to.equal(
        initialSupply.sub(ethers.utils.parseEther("50")) // Исходный - 100 + 50 = Исходный - 50
      );
    });
    
    it("Должна возвращать ошибку при недостаточном балансе токенов", async function() {
      const gcAmount = ethers.utils.parseEther("150"); // Больше, чем есть у пользователя (100)
      
      // Продажа токенов больше, чем есть, должна вернуть ошибку
      await expect(
        gymCoin.connect(user1).sell(gcAmount)
      ).to.be.revertedWith("Not enough tokens");
    });
  });

  describe("Функция перевода токенов", function() {
    beforeEach(async function() {
      // Предварительная покупка токенов пользователем
      const gcAmount = ethers.utils.parseEther("100"); // 100 GC
      const ethRequired = gcAmount.mul(sellRate).div(ethers.utils.parseEther("1"));
      await gymCoin.connect(user1).buy(gcAmount, { value: ethRequired });
    });
    
    it("Должна позволять пользователям переводить токены", async function() {
      const gcAmount = ethers.utils.parseEther("30"); // 30 GC
      
      // Перевод токенов от user1 к user2
      await gymCoin.connect(user1).transfer(user2.address, gcAmount);
      
      // Проверка балансов
      expect(await gymCoin.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("70")); // 100 - 30 = 70
      expect(await gymCoin.balanceOf(user2.address)).to.equal(gcAmount);
    });
  });

  describe("Функция установки курсов", function() {
    it("Должна позволять владельцу изменять курсы", async function() {
      const newSellRate = ethers.utils.parseEther("0.002");
      const newBuyRate = ethers.utils.parseEther("0.0015");
      
      // Изменение курсов
      await gymCoin.setRates(newSellRate, newBuyRate);
      
      // Проверка новых курсов
      const rates = await gymCoin.getRates();
      expect(rates.sellRate).to.equal(newSellRate);
      expect(rates.buyRate).to.equal(newBuyRate);
    });
    
    it("Должна возвращать ошибку, если не владелец пытается изменить курсы", async function() {
      const newSellRate = ethers.utils.parseEther("0.002");
      const newBuyRate = ethers.utils.parseEther("0.0015");
      
      // Попытка изменения курсов не владельцем должна вернуть ошибку
      await expect(
        gymCoin.connect(user1).setRates(newSellRate, newBuyRate)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Должна возвращать ошибку при неверных значениях курсов", async function() {
      // Попытка установить отрицательный/нулевой курс
      await expect(
        gymCoin.setRates(0, ethers.utils.parseEther("0.0015"))
      ).to.be.revertedWith("Sell rate must be positive");
      
      await expect(
        gymCoin.setRates(ethers.utils.parseEther("0.002"), 0)
      ).to.be.revertedWith("Buy rate must be positive");
      
      // Попытка установить курс покупки выше курса продажи
      await expect(
        gymCoin.setRates(ethers.utils.parseEther("0.001"), ethers.utils.parseEther("0.002"))
      ).to.be.revertedWith("Buy rate should be less or equal to sell rate");
    });
  });
});
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserProfile Contract", function() {
  let UserProfile;
  let userProfile;
  let owner;
  let user1;
  let user2;
  
  beforeEach(async function() {
    // Получение аккаунтов для тестирования
    [owner, user1, user2] = await ethers.getSigners();
    
    // Деплой контракта UserProfile
    const UserProfileFactory = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfileFactory.deploy();
    await userProfile.deployed();
  });

  describe("Функция регистрации пользователя", function() {
    it("Должна регистрировать нового пользователя", async function() {
      // Регистрация нового пользователя
      const tx = await userProfile.connect(user1).registerUser("testUser", "test@example.com");
      
      // Проверяем, что событие было эмитировано с правильными параметрами
      await expect(tx)
        .to.emit(userProfile, "UserRegistered")
        .withArgs(user1.address, "testUser", "test@example.com");
      
      // Проверяем, что пользователь существует
      expect(await userProfile.userExists(user1.address)).to.equal(true);
    });
    
    it("Должна возвращать ошибку при повторной регистрации", async function() {
      // Первая регистрация - должна пройти успешно
      await userProfile.connect(user1).registerUser("testUser", "test@example.com");
      
      // Повторная регистрация - должна вернуть ошибку
      await expect(
        userProfile.connect(user1).registerUser("anotherName", "another@example.com")
      ).to.be.revertedWith("User already registered");
    });
  });

  describe("Функция получения информации о пользователе", function() {
    it("Должна возвращать правильную информацию о пользователе", async function() {
      // Регистрация пользователя
      await userProfile.connect(user1).registerUser("testUser", "test@example.com");
      
      // Получение информации о пользователе
      const userInfo = await userProfile.getUserByAddress(user1.address);
      
      // Проверка информации
      expect(userInfo.username).to.equal("testUser");
      expect(userInfo.email).to.equal("test@example.com");
      expect(userInfo.userAddress).to.equal(user1.address);
      expect(userInfo.exists).to.equal(true);
    });
    
    it("Должна возвращать пустую информацию для незарегистрированного пользователя", async function() {
      // Получение информации о незарегистрированном пользователе
      const userInfo = await userProfile.getUserByAddress(user2.address);
      
      // Проверка информации
      expect(userInfo.username).to.equal("");
      expect(userInfo.email).to.equal("");
      expect(userInfo.userAddress).to.equal(ethers.constants.AddressZero);
      expect(userInfo.exists).to.equal(false);
    });
  });

  describe("Функция проверки существования пользователя", function() {
    it("Должна возвращать true для зарегистрированного пользователя", async function() {
      // Регистрация пользователя
      await userProfile.connect(user1).registerUser("testUser", "test@example.com");
      
      // Проверка существования
      expect(await userProfile.userExists(user1.address)).to.equal(true);
    });
    
    it("Должна возвращать false для незарегистрированного пользователя", async function() {
      // Проверка существования
      expect(await userProfile.userExists(user2.address)).to.equal(false);
    });
  });
});
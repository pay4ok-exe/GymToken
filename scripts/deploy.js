const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  // Получение аккаунтов
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy UserProfile contract
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.deployed();
  console.log("UserProfile deployed to:", userProfile.address);
  
  // Deploy GymCoin contract
  // Initial supply: 1,000,000 tokens with 18 decimals
  // Sell rate: 0.001 ETH per token (users buy at this rate)
  // Buy rate: 0.0008 ETH per token (users sell at this rate)
  const initialSupply = ethers.utils.parseEther("1000000");
  const sellRate = ethers.utils.parseEther("0.001");
  const buyRate = ethers.utils.parseEther("0.0008");
  
  const GymCoin = await ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(initialSupply, sellRate, buyRate);
  await gymCoin.deployed();
  console.log("GymCoin deployed to:", gymCoin.address);
  
  // Verify contracts on Etherscan (for Sepolia network)
  if (network.name === "sepolia") {
    console.log("Waiting for block confirmations...");
    // Wait for 6 block confirmations
    await userProfile.deployTransaction.wait(6);
    await gymCoin.deployTransaction.wait(6);
    
    // Verify UserProfile
    await hre.run("verify:verify", {
      address: userProfile.address,
      constructorArguments: [],
    });
    
    // Verify GymCoin
    await hre.run("verify:verify", {
      address: gymCoin.address,
      constructorArguments: [initialSupply, sellRate, buyRate],
    });
  }
  
  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
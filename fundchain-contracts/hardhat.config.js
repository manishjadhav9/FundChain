require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY",
      accounts: ["0x1234567890123456789012345678901234567890123456789012345678901234"],
      chainId: 11155111,
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY",
      accounts: ["0x1234567890123456789012345678901234567890123456789012345678901234"],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: "YOUR_ETHERSCAN_API_KEY",
  },
};

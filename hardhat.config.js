/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  defaultNetwork: "",
  networks: {
    hardhat: {
    },
    bsc: {
      url: "",
      accounts: ['']
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

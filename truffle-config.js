process.env.TS_NODE_FILES = "true";
require("ts-node/register/transpile-only");
require("dotenv").config();
// Fix Typescript callsite reporting
Object.defineProperty(Error, "prepareStackTrace", { writable: false });

const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "";
const fs = require("fs");

// INFURA Setup - see validate/README.validate.md for more info
let infuraKey = "none";
try {
  infuraKey = fs.readFileSync("./validate/apikey.infura", "utf8");
} catch (err) {
  console.log(
    "No Infura access token detected. Unit tests will still work.  See ./validate/README.validate.md for more details."
  );
}

module.exports = {
  compilers: {
    solc: {
      version: "0.6.8",
    },
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
    },
    local_testnet: {
      host: "ganache",
      port: 8545,
      network_id: "*", // Match any network id
    },
    // INFURA Setup
    infura_rinkeby: {
      provider() {
        return new HDWalletProvider(
          mnemonic,
          "https://rinkeby.infura.io/v3/" + infuraKey
        );
      },
      network_id: 4,
    },
    // INFURA Setup
    infura_mainnet: {
      provider() {
        return new HDWalletProvider(
          mnemonic,
          "https://mainnet.infura.io/v3/" + infuraKey
        );
      },
      network_id: 1,
      gasPrice: 40000000000,
    },
  },
  mocha: {
    timeout: 10000, // prevents tests from failing when pc is under heavy load
    /*
     * To disable the spreadsheet verification tool ensure that
     * the reporter is set to 'Spec' by commenting/uncommenting the lines below.
     */
    reporter: "Spec",
    // reporter: './verification/verification_reporter.js',
  },
  plugins: ["solidity-coverage", "truffle-plugin-verify"],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API,
  },
};

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const POLYGONSCAN_API_KEY  = process.env.POLYGONSCAN_API_KEY || "";

const accounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Polygon Amoy testnet — free POL from faucet
    "polygon-amoy": {
      url: "https://rpc-amoy.polygon.technology/",
      chainId: 80002,
      accounts,
    },
    // Polygon mainnet — real USDC, real POL
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      chainId: 137,
      accounts,
    },
  },

  etherscan: {
    apiKey: {
      polygon:     POLYGONSCAN_API_KEY,
      polygonAmoy: POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL:     "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};

export default config;

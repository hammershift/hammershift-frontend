import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy VelocityMarkets to Polygon Amoy (testnet) or Polygon mainnet.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network polygon-amoy
 *   npx hardhat run scripts/deploy.ts --network polygon
 *
 * Required env vars in .env:
 *   DEPLOYER_PRIVATE_KEY=0x...
 *   POLYGONSCAN_API_KEY=...    (for verification)
 *   POLYGON_RPC_URL=...        (mainnet only, optional — defaults to polygon-rpc.com)
 */

const POLYGON_MAINNET_USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"; // native USDC on Polygon

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Velocity Markets Deployment`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Network:  ${network.name} (chainId: ${chainId})`);
  console.log(`  Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`  Balance:  ${ethers.formatEther(balance)} POL`);
  console.log(`${"=".repeat(60)}\n`);

  if (balance === 0n) {
    throw new Error("Deployer has 0 POL. Fund the wallet first.");
  }

  let usdcAddress: string;
  let mockUsdcAddress: string | null = null;

  if (chainId === 80002n) {
    // ── Polygon Amoy testnet ───────────────────────────────────────────────
    console.log("Testnet detected — deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    mockUsdcAddress = await mockUsdc.getAddress();
    usdcAddress = mockUsdcAddress;
    console.log(`  MockUSDC: ${mockUsdcAddress}`);
    console.log(`  (Users can call faucet() to get test USDC)`);

  } else if (chainId === 137n) {
    // ── Polygon mainnet ────────────────────────────────────────────────────
    usdcAddress = POLYGON_MAINNET_USDC;
    console.log(`Using mainnet USDC: ${usdcAddress}`);

  } else {
    throw new Error(`Unsupported chainId ${chainId}. Use polygon-amoy or polygon.`);
  }

  // ── Deploy VelocityMarkets ─────────────────────────────────────────────
  console.log(`\nDeploying VelocityMarkets...`);
  const VelocityMarkets = await ethers.getContractFactory("VelocityMarkets");
  const contract = await VelocityMarkets.deploy(usdcAddress);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`  VelocityMarkets: ${contractAddress}`);

  // ── Save deployment record ─────────────────────────────────────────────
  const deployment = {
    network: network.name,
    chainId: chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      VelocityMarkets: contractAddress,
      USDC: usdcAddress,
      MockUSDC: mockUsdcAddress,
    },
  };

  const outputDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, `${chainId}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(deployment, null, 2));

  // ── Print next steps ───────────────────────────────────────────────────
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Deployment complete!`);
  console.log(`${"=".repeat(60)}`);
  console.log(`\n  Add to Amplify environment variables:`);
  console.log(`  VELOCITY_MARKETS_CONTRACT=${contractAddress}`);
  console.log(`  VELOCITY_MARKETS_USDC=${usdcAddress}`);
  console.log(`  VELOCITY_MARKETS_CHAIN_ID=${chainId}`);
  console.log(`  DEPLOYER_ADDRESS=${deployer.address}`);

  if (chainId === 137n) {
    console.log(`\n  Verify on Polygonscan:`);
    console.log(`  npx hardhat verify --network polygon ${contractAddress} "${usdcAddress}"`);
    if (mockUsdcAddress) {
      console.log(`  npx hardhat verify --network polygon ${mockUsdcAddress}`);
    }
  } else {
    console.log(`\n  Verify on Amoy:`);
    console.log(`  npx hardhat verify --network polygon-amoy ${contractAddress} "${usdcAddress}"`);
    if (mockUsdcAddress) {
      console.log(`  npx hardhat verify --network polygon-amoy ${mockUsdcAddress}`);
    }
  }

  console.log(`\n  Deployment saved to: ${outputFile}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});

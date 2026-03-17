import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

/**
 * Generates a new deployer wallet and saves the private key to .env
 * Run once: npx ts-node scripts/generate-wallet.ts
 */

const wallet = ethers.Wallet.createRandom();

console.log("\n=== New Deployer Wallet Generated ===");
console.log(`Address:     ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);
console.log("\nFund this address with POL before deploying:");
console.log(`  Testnet (Amoy): https://faucet.polygon.technology/ — get free POL`);
console.log(`  Mainnet: Send ~0.5 POL to ${wallet.address}`);
console.log("\nSaving to .env...");

const envPath = path.join(__dirname, "../.env");
const envLine = `DEPLOYER_PRIVATE_KEY=${wallet.privateKey}\nDEPLOYER_ADDRESS=${wallet.address}\n`;

if (fs.existsSync(envPath)) {
  const existing = fs.readFileSync(envPath, "utf8");
  if (existing.includes("DEPLOYER_PRIVATE_KEY")) {
    console.log(".env already has DEPLOYER_PRIVATE_KEY — not overwriting.");
    console.log("Delete it manually if you want a new wallet.");
  } else {
    fs.appendFileSync(envPath, "\n" + envLine);
    console.log("Appended to .env");
  }
} else {
  fs.writeFileSync(envPath, envLine);
  console.log(".env created");
}

console.log("\n⚠️  KEEP YOUR PRIVATE KEY SAFE. Never commit .env to git.\n");

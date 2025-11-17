# FundChain Smart Contract Deployment

**Deployment Date:** October 16, 2025

## 🚀 Deployed Contracts

### FundFactory Contract
- **Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Network:** Hardhat Local (localhost:8545)
- **Chain ID:** 31337 (0x7a69)
- **Deployer:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### Test Campaign
- **Address:** `0xa16E02E87b7454126E5E10d957A927A7F5B5d2be`
- **Title:** Test Medical Campaign
- **Type:** MEDICAL
- **Target Amount:** 1.0 ETH
- **Status:** VERIFIED ✅
- **Owner:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## 📝 Test Accounts

### Account #0 (Deployer)
- **Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Balance:** 10000 ETH

### Account #1
- **Address:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Private Key:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Balance:** 10000 ETH

## 🔧 MetaMask Configuration

To connect MetaMask to your local Hardhat network:

| Field | Value |
|-------|-------|
| **Network name** | `Localhost` |
| **RPC URL** | `http://127.0.0.1:8545` |
| **Chain ID** | `31337` |
| **Currency symbol** | `ETH` |

## 📦 Updated Files

1. **`fundchain-frontend/lib/contracts.js`**
   - Updated `FUND_FACTORY_ADDRESS` to new deployment address

2. **`fundchain-contracts/scripts/test-get-all-campaigns.js`**
   - Updated contract address for testing

## ✅ Verification

Run this command to verify deployment:
```bash
cd fundchain-contracts
npx hardhat run scripts/test-get-all-campaigns.js --network localhost
```

Expected output:
- ✅ 1 campaign found
- ✅ 1 verified campaign
- ✅ Campaign visible in frontend

## 🌐 Services Running

1. **Hardhat Node:** `http://127.0.0.1:8545` ✅
2. **IPFS Node:** `http://127.0.0.1:5001` (API), `http://127.0.0.1:8080` (Gateway) ✅
3. **Next.js Frontend:** `http://localhost:3000` (run `npm run dev` in fundchain-frontend)

## 🔄 To Restart Everything

```bash
# 1. Kill existing processes
pkill -f "hardhat node"
lsof -ti:8545 | xargs kill -9

# 2. Clean and recompile
cd fundchain-contracts
npx hardhat clean
npx hardhat compile

# 3. Start Hardhat node (in background)
npx hardhat node &

# 4. Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# 5. Update contract address in fundchain-frontend/lib/contracts.js

# 6. Start frontend
cd ../fundchain-frontend
npm run dev
```

## 📌 Important Notes

- ⚠️ This is a **local development deployment**
- All data will be lost when Hardhat node restarts
- Private keys are publicly known - **NEVER use on mainnet**
- Keep Hardhat node running while developing
- Import Account #0 into MetaMask for testing

---

**Last Updated:** October 16, 2025 at 10:24 PM IST

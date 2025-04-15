# 🚀 FundChain – OneStop DeFi Funding Platform (Web2 + Web3 Hybrid)

> FundChain is a **transparent crowdfunding platform** that blends traditional web tech with blockchain-backed campaign tracking. It serves as a **universal, one-stop funding ecosystem** bringing together **NGOs, Temples, Government bodies, and Individuals** for secure, traceable, and collaborative fundraising.

---

## 🎯 Vision – OneStop Funding Application

FundChain aims to become the **single gateway for all types of funding**, built with trust, transparency, and simplicity at its core.

### Supported Campaign Types:
- 🏥 Medical emergencies and healthcare needs  
- 🛕 Religious fundraising (Temples, Churches, Mosques)  
- 🫶 NGO-driven social causes  
- 🏛️ Government-endorsed public programs  
- 🎓 Personal development & education support  

With blockchain-enabled campaign verification and Web2-friendly UX, **everyone can donate with confidence** — no crypto required.

---

## 🔐 Authentication & Payments

| Feature        | Tech Used                                     |
|----------------|-----------------------------------------------|
| Login System   | Email/Password or Google Login (e.g., Firebase Auth / Supabase) |
| Payments       | Razorpay (or Stripe, Paytm, etc.)             |
| Wallet Login   | ❌ Not required                                |
| Blockchain     | Read-only smart contract interactions for campaign data |

---

## 🧠 Smart Contract Integration

Although the platform does **not use crypto payments**, it **leverages smart contracts** for:

- 📜 Transparent storage of campaign metadata  
- ✅ Ownership validation and status tracking  
- ⏱️ Milestone-based progress control  

> Smart contracts ensure campaign integrity, while Razorpay handles traditional transactions.

---

## 🧩 Feature Breakdown

| Feature                        | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| 👥 User Login                 | Register/login using email or Google OAuth                                  |
| 📦 Campaign Creation         | Start a new fundraising campaign (title, description, image, amount, etc.)  |
| 💳 Payment Integration        | Secure Razorpay-based donation system                                       |
| ⏱️ Milestone Tracking        | Show campaign progress and how funds are being used                         |
| 🔒 Admin Campaign Verification| Admin verifies authenticity of NGOs, Temples, or Government campaigns       |
| 📜 Donor Receipts             | Email-based receipts with transaction info                                  |
| 📈 Dashboard & Analytics      | View created campaigns, donations, and progress tracking                    |
| 💬 Collaborator Integration   | Collaborations with verified bodies (NGO, Temple, Gov, etc.)                |

---

## 🧭 Page / Component Structure (Frontend)


---

## 🔗 Routes Summary

| Route                  | Purpose                              |
|------------------------|--------------------------------------|
| `/`                    | Homepage with featured campaigns     |
| `/create`              | Start a new campaign                 |
| `/campaign/:id`        | View campaign details + donate       |
| `/dashboard`           | User dashboard for created/donated campaigns |
| `/admin`               | Admin dashboard for verification     |
| `/login`, `/register`  | User authentication                  |
| `/discover`            | Browse and filter all campaigns      |

---

## 🛠️ Tech Stack

| Layer         | Tech Choices                            |
|---------------|------------------------------------------|
| Frontend      | React + TypeScript + Tailwind CSS        |
| Backend       | Node.js / Express / Supabase             |
| Authentication| Firebase Auth / Supabase / Auth0         |
| Database      | MongoDB / PostgreSQL                     |
| Payments      | Razorpay (or Stripe, Paytm, etc.)        |
| Blockchain    | Solidity + Hardhat (for campaign contracts) |
| Storage       | IPFS / Cloudinary for campaign media     |

---

## 💡 Smart Contract Overview

> Refer to the `/contracts/` folder for Solidity source code.

- `FundFactory.sol`: Factory pattern to deploy new campaigns  
- `FundCampaign.sol`: Each campaign is an instance with:
  - Target amount
  - Milestones
  - Deadline
  - Organizer details
  - Status (Open/Closed/Verified)

These contracts are called only from backend/admin actions or for display purposes in frontend.

---

## 📊 Suggested V2 Features

- 🔔 Email alerts for milestone changes and donation success  
- 🧾 PDF receipts with donation breakdown  
- 🆔 NGO verification via Aadhaar or external APIs  
- 📊 Live analytics (most donated campaigns, verified bodies, etc.)  
- 🎯 Personalized recommendations for donors  
- 📦 Donation tracking by cause type or geography  

---

## 🤝 Contributions & Community

Have ideas? Open an issue or fork and contribute! Let's build a trustworthy funding ecosystem together.

---

## 📄 License

MIT License © 2025 [Manish Jadhav](https://github.com/manishjadhav9)


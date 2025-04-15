
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


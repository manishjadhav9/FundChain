# 🧪 Razorpay Integration Checklist

## ✅ Pre-Testing Setup

### 1. Environment Variables
- [ ] NEXT_PUBLIC_RAZORPAY_KEY_ID is set in .env.local
- [ ] RAZORPAY_KEY_SECRET is set in .env.local
- [ ] Values match your Razorpay dashboard test keys

### 2. Dependencies
- [ ] razorpay package is installed (npm install razorpay)
- [ ] No dependency conflicts in package.json

### 3. API Routes
- [ ] /api/razorpay/create-order/route.ts exists and working
- [ ] /api/razorpay/verify-payment/route.ts exists and working
- [ ] Both routes handle errors properly

## 🧪 Testing Steps

### Step 1: Start Development Server
```bash
cd fundchain-frontend
npm run dev
```

### Step 2: Test Razorpay Loading
1. Go to: http://localhost:3000/test-payment
2. Check Razorpay status indicator
3. Should show "READY" if no ad blocker
4. Should show "BLOCKED" if ad blocker active

### Step 3: Test Payment Flow
1. Enter amount (e.g., ₹100)
2. Click "Test Payment Gateway"
3. Razorpay modal should open
4. Use test card: 4111 1111 1111 1111
5. Complete payment
6. Should show success with payment details

### Step 4: Test Campaign Donation
1. Go to: http://localhost:3000/campaigns/help-sarthak-get-home
2. Click "Donate Now"
3. Enter amount and donate
4. Should work same as test page

## 🔍 Expected Results

### ✅ Success Indicators
- Razorpay SDK loads without errors
- Payment modal opens correctly
- Test payments process successfully
- Payment verification completes
- Transaction hash is generated
- Campaign progress updates

### ❌ Failure Indicators
- "ERR_BLOCKED_BY_CLIENT" in console
- "Payment gateway blocked" messages
- API route errors (500/404)
- Signature verification failures

## 🛠️ Troubleshooting

### If Razorpay is Blocked:
1. Disable ad blocker for localhost
2. Use incognito/private browsing mode
3. Try different browser (Chrome, Firefox)
4. Check browser extensions

### If API Routes Fail:
1. Check server console for errors
2. Verify environment variables
3. Ensure razorpay package is installed
4. Check API route file paths

### If Payment Verification Fails:
1. Check Razorpay key secret in .env.local
2. Verify signature generation logic
3. Check server logs for errors
4. Ensure order creation works

## 📱 Test Cards

### Successful Payments:
- 4111 1111 1111 1111 (Visa)
- 5555 5555 5555 4444 (Mastercard)
- 4000 0000 0000 0002 (Visa Debit)

### Failed Payments (for testing):
- 4000 0000 0000 0119 (Processing error)
- 4000 0000 0000 0101 (Declined)

### Test Details:
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Name: Any name

## 🎯 Success Criteria

- [ ] No console errors during SDK loading
- [ ] Payment modal opens without issues
- [ ] Test payments complete successfully
- [ ] Payment verification works correctly
- [ ] Campaign donations update progress
- [ ] Blockchain transaction simulation works
- [ ] User receives clear success/error messages

## 🚀 Go-Live Checklist

When ready for production:
- [ ] Replace test keys with live keys
- [ ] Test with real small amounts
- [ ] Set up webhook endpoints
- [ ] Configure proper error handling
- [ ] Add payment confirmation emails
- [ ] Set up transaction logging
- [ ] Test on multiple devices/browsers

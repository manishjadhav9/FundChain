# 🔧 Payment Error Troubleshooting Guide

## ❌ **Error: "Failed to create order"**

This error occurs when the server-side Razorpay order creation API fails. Here's how to diagnose and fix it:

## 🔍 **Diagnosis Steps**

### **Step 1: Check Server Logs**
1. Open terminal and go to your project:
   ```bash
   cd /home/adwait/FundChain/fundchain-frontend
   ```

2. Start the development server and watch for errors:
   ```bash
   pnpm run dev
   ```

3. Look for these error messages in the console:
   - `❌ NEXT_PUBLIC_RAZORPAY_KEY_ID is not set`
   - `❌ RAZORPAY_KEY_SECRET is not set`
   - `❌ Failed to initialize Razorpay`
   - `❌ Error creating Razorpay order`

### **Step 2: Test Environment Variables**
Run the environment test script:
```bash
node test-env-vars.js
```

Expected output:
```
✅ .env.local file exists
✅ NEXT_PUBLIC_RAZORPAY_KEY_ID: Present
✅ RAZORPAY_KEY_SECRET: Present
```

### **Step 3: Test API Directly**
Test the API endpoint directly:
```bash
node test-api-direct.js
```

This will tell you if the server-side API is working.

## 🛠️ **Common Fixes**

### **Fix 1: Missing Environment Variables**

If environment variables are missing:

1. **Copy the example file:**
   ```bash
   cp fundchain-frontend/.env.example fundchain-frontend/.env.local
   ```

2. **Edit .env.local and ensure these lines exist:**
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RJuwxk8NAGp7Dc
   RAZORPAY_KEY_SECRET=HS05RbxkPCgFoXE10NO27psh
   ```

3. **Restart the development server:**
   ```bash
   cd fundchain-frontend && pnpm run dev
   ```

### **Fix 2: Razorpay Package Issues**

If the Razorpay package is not working:

1. **Reinstall the package:**
   ```bash
   cd fundchain-frontend
   npm uninstall razorpay
   npm install razorpay --legacy-peer-deps
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   pnpm run dev
   ```

### **Fix 3: API Route Issues**

If the API route is not working:

1. **Check if the file exists:**
   ```bash
   ls -la fundchain-frontend/app/api/razorpay/create-order/route.ts
   ```

2. **If missing, the file should be created at:**
   `/home/adwait/FundChain/fundchain-frontend/app/api/razorpay/create-order/route.ts`

3. **Restart the server after any API changes**

### **Fix 4: Network/Firewall Issues**

If you're on a corporate network:

1. **Check if Razorpay APIs are accessible:**
   ```bash
   curl -I https://api.razorpay.com
   ```

2. **If blocked, try using a VPN or different network**

## 🔄 **Fallback Solution**

If the server-side API continues to fail, the app now includes a **fallback method** that works without server-side order creation:

### **How the Fallback Works:**
1. If `processDonation()` fails with an order creation error
2. The app automatically tries `processDonationFallback()`
3. This method uses direct Razorpay integration without server orders
4. Payments still work, but without server-side verification

### **Fallback Indicators:**
- Console message: `⚠️ Server-side payment failed, trying fallback method`
- Console message: `🔄 Using fallback payment method...`
- Success message: `Donation successful! (Fallback mode)`

## 🧪 **Testing Steps**

### **Test 1: Environment Variables**
```bash
node test-env-vars.js
```

### **Test 2: API Endpoint**
```bash
# Start server in one terminal
cd fundchain-frontend && pnpm run dev

# Test API in another terminal
node test-api-direct.js
```

### **Test 3: Frontend Payment**
1. Go to: http://localhost:3000/campaigns/help-sarthak-get-home
2. Click "Donate Now"
3. Enter amount (e.g., 100)
4. Click "Donate ₹100"
5. Check browser console for error messages

### **Test 4: Fallback Payment**
1. If server-side fails, you should see fallback messages
2. Payment gateway should still open
3. Test payment should complete successfully

## 🎯 **Expected Behavior**

### **✅ Success (Server-side):**
```
💰 Processing donation of ₹100 for campaign: help sarthak get home
🔄 Creating payment order...
✅ Payment order created: order_xyz123
🚀 Opening Razorpay payment gateway with order: order_xyz123
💰 Razorpay payment successful: {...}
✅ Payment verified successfully: {...}
```

### **✅ Success (Fallback):**
```
💰 Processing donation of ₹100 for campaign: help sarthak get home
⚠️ Server-side payment failed, trying fallback method: Failed to create order
🔄 Using fallback payment method...
💰 Processing fallback donation of ₹100 for campaign: help sarthak get home
🚀 Opening Razorpay payment gateway (fallback mode)...
💰 Razorpay payment successful: {...}
✅ Fallback payment processing complete: {...}
```

## 🆘 **Still Having Issues?**

### **Check These:**

1. **Server Console:** Look for detailed error messages
2. **Browser Console:** Check for JavaScript errors
3. **Network Tab:** See if API requests are failing
4. **Environment:** Ensure .env.local is properly configured
5. **Permissions:** Check file permissions on API routes

### **Get Help:**

1. **Copy the exact error message** from browser console
2. **Check server terminal** for detailed error logs
3. **Run diagnostic scripts** to identify the issue
4. **Try fallback mode** if server-side continues to fail

### **Quick Debug Commands:**
```bash
# Check if server is running
curl http://localhost:3000/api/razorpay/create-order

# Check environment variables
node test-env-vars.js

# Test API directly
node test-api-direct.js

# Check file permissions
ls -la fundchain-frontend/app/api/razorpay/create-order/
```

## 🎉 **Success Indicators**

When everything is working correctly:
- ✅ No console errors during payment
- ✅ Payment gateway opens smoothly
- ✅ Test payments complete successfully
- ✅ Campaign progress updates immediately
- ✅ Success message with transaction details

The fallback system ensures that even if server-side order creation fails, users can still make donations successfully!

#!/usr/bin/env node

/**
 * Test script to check environment variables
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Environment Variables Test');
console.log('=============================\n');

// Check .env.local file
const envFile = path.join(__dirname, 'fundchain-frontend', '.env.local');

console.log('1️⃣ Checking .env.local file...');
console.log('File path:', envFile);

if (fs.existsSync(envFile)) {
  console.log('✅ .env.local file exists');
  
  const content = fs.readFileSync(envFile, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log('\n📋 Environment variables found:');
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      const maskedValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
      console.log(`  ${key}=${maskedValue}`);
    }
  });
  
  // Check specific Razorpay variables
  console.log('\n🔍 Razorpay variables check:');
  
  const hasKeyId = content.includes('NEXT_PUBLIC_RAZORPAY_KEY_ID');
  const hasKeySecret = content.includes('RAZORPAY_KEY_SECRET');
  
  console.log(`  NEXT_PUBLIC_RAZORPAY_KEY_ID: ${hasKeyId ? '✅ Present' : '❌ Missing'}`);
  console.log(`  RAZORPAY_KEY_SECRET: ${hasKeySecret ? '✅ Present' : '❌ Missing'}`);
  
  if (!hasKeyId || !hasKeySecret) {
    console.log('\n⚠️ Missing Razorpay environment variables!');
    console.log('\n🔧 To fix this:');
    console.log('1. Open fundchain-frontend/.env.local');
    console.log('2. Add these lines:');
    console.log('   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RJuwxk8NAGp7Dc');
    console.log('   RAZORPAY_KEY_SECRET=HS05RbxkPCgFoXE10NO27psh');
    console.log('3. Save the file and restart the server');
  }
  
} else {
  console.log('❌ .env.local file not found');
  console.log('\n🔧 To fix this:');
  console.log('1. Copy .env.example to .env.local:');
  console.log('   cp fundchain-frontend/.env.example fundchain-frontend/.env.local');
  console.log('2. Edit .env.local and ensure Razorpay keys are set');
}

// Check .env.example for reference
const envExampleFile = path.join(__dirname, 'fundchain-frontend', '.env.example');

console.log('\n2️⃣ Checking .env.example for reference...');

if (fs.existsSync(envExampleFile)) {
  console.log('✅ .env.example file exists');
  
  const content = fs.readFileSync(envExampleFile, 'utf8');
  
  if (content.includes('NEXT_PUBLIC_RAZORPAY_KEY_ID')) {
    console.log('✅ Contains Razorpay key ID template');
  }
  
  if (content.includes('RAZORPAY_KEY_SECRET')) {
    console.log('✅ Contains Razorpay key secret template');
  }
  
} else {
  console.log('❌ .env.example file not found');
}

console.log('\n3️⃣ Quick Fix Commands:');
console.log('=====================');
console.log('# If .env.local doesn\'t exist:');
console.log('cp fundchain-frontend/.env.example fundchain-frontend/.env.local');
console.log('');
console.log('# Add Razorpay keys to .env.local:');
console.log('echo "NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RJuwxk8NAGp7Dc" >> fundchain-frontend/.env.local');
console.log('echo "RAZORPAY_KEY_SECRET=HS05RbxkPCgFoXE10NO27psh" >> fundchain-frontend/.env.local');
console.log('');
console.log('# Restart development server:');
console.log('cd fundchain-frontend && pnpm run dev');

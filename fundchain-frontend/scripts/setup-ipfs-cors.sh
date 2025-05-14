#!/bin/bash

# Script to configure CORS for IPFS

echo "==== FundChain IPFS CORS Setup Tool ===="
echo "This script will configure CORS settings for your local IPFS node."
echo "These settings are required for the FundChain application to interact with IPFS."
echo ""

# Check if IPFS is installed
if ! command -v ipfs &> /dev/null; then
    echo "❌ IPFS is not installed or not in your PATH."
    echo "Please install IPFS first: https://docs.ipfs.tech/install/command-line/"
    exit 1
fi

# Check if IPFS daemon is running
ipfs_running=false
if ipfs id &> /dev/null; then
    ipfs_running=true
    echo "✅ IPFS daemon is running"
else
    echo "⚠️ IPFS daemon is not running. Some commands may fail."
    echo "You can start it with: ipfs daemon"
fi

echo ""
echo "Configuring CORS settings..."

# Set CORS headers
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
echo "✅ Set Access-Control-Allow-Origin: *"

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST", "PUT", "DELETE", "OPTIONS"]'
echo "✅ Set Access-Control-Allow-Methods"

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "X-Requested-With", "Range", "Content-Type"]'
echo "✅ Set Access-Control-Allow-Headers"

ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location", "WWW-Authenticate"]'
echo "✅ Set Access-Control-Expose-Headers"

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
echo "✅ Set Access-Control-Allow-Credentials"

echo ""
echo "CORS configuration complete!"
echo ""

if [ "$ipfs_running" = true ]; then
    echo "⚠️ Important: You need to restart the IPFS daemon for changes to take effect."
    echo "Run: ipfs shutdown"
    echo "Then: ipfs daemon"
fi

echo ""
echo "To verify CORS settings, open in your browser:"
echo "http://localhost:3000/ipfs-direct-test.html"
echo ""
echo "==== Configuration Complete ====" 
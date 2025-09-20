#!/bin/bash

# FundChain IPFS Startup Script
# This script ensures IPFS daemon is running for your application

echo "🚀 Starting IPFS for FundChain..."

# Check if IPFS daemon is already running
if curl -s -X POST http://127.0.0.1:5001/api/v0/id > /dev/null 2>&1; then
    echo "✅ IPFS daemon is already running"
    echo "📊 Node info:"
    curl -s -X POST http://127.0.0.1:5001/api/v0/id | jq -r '.ID' | head -c 20
    echo "..."
else
    echo "🔄 Starting IPFS daemon..."
    
    # Kill any existing IPFS processes
    pkill -f "ipfs daemon" 2>/dev/null || true
    
    # Start IPFS daemon in background
    nohup ipfs daemon --enable-gc > /tmp/ipfs.log 2>&1 &
    
    # Wait for daemon to start
    echo "⏳ Waiting for IPFS to start..."
    for i in {1..10}; do
        if curl -s -X POST http://127.0.0.1:5001/api/v0/id > /dev/null 2>&1; then
            echo "✅ IPFS daemon started successfully"
            break
        fi
        sleep 1
        echo -n "."
    done
    
    if ! curl -s -X POST http://127.0.0.1:5001/api/v0/id > /dev/null 2>&1; then
        echo "❌ Failed to start IPFS daemon"
        echo "📋 Check logs: tail -f /tmp/ipfs.log"
        exit 1
    fi
fi

echo ""
echo "🎯 IPFS Status:"
echo "==============="
echo "API:     http://127.0.0.1:5001"
echo "Gateway: http://127.0.0.1:8080"
echo "Web UI:  http://127.0.0.1:5001/webui"

echo ""
echo "📋 Test URLs (should work in browser):"
echo "======================================"
echo "Document: http://127.0.0.1:8080/ipfs/QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep"
echo "Image:    http://127.0.0.1:8080/ipfs/QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk"

echo ""
echo "✅ IPFS is ready for FundChain!"
echo "💡 Start your Next.js app: cd fundchain-frontend && npm run dev"

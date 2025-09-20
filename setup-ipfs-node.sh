#!/bin/bash

# IPFS Node Setup Script for FundChain
echo "🚀 Setting up IPFS node for FundChain..."

# Check if IPFS is installed
if ! command -v ipfs &> /dev/null; then
    echo "📦 Installing IPFS..."
    
    # Download and install IPFS
    wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz
    tar -xvzf kubo_v0.24.0_linux-amd64.tar.gz
    cd kubo
    sudo bash install.sh
    cd ..
    rm -rf kubo kubo_v0.24.0_linux-amd64.tar.gz
    
    echo "✅ IPFS installed successfully"
else
    echo "✅ IPFS already installed"
fi

# Initialize IPFS repository if not exists
if [ ! -d ~/.ipfs ]; then
    echo "🔧 Initializing IPFS repository..."
    ipfs init
    echo "✅ IPFS repository initialized"
else
    echo "✅ IPFS repository already exists"
fi

# Configure IPFS for web development
echo "⚙️ Configuring IPFS for web development..."

# Enable CORS for web applications
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:3000", "https://localhost:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'

# Set gateway configuration
ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Methods '["GET"]'

# Configure addresses
ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
ipfs config Addresses.Gateway /ip4/127.0.0.1/tcp/8080

# Enable experimental features for better performance
ipfs config --json Experimental.FilestoreEnabled true
ipfs config --json Experimental.UrlstoreEnabled true

echo "✅ IPFS configured for web development"

# Create systemd service for auto-start
echo "🔧 Creating IPFS systemd service..."

sudo tee /etc/systemd/system/ipfs.service > /dev/null <<EOF
[Unit]
Description=IPFS daemon
After=network.target

[Service]
Type=notify
User=$USER
Environment=IPFS_PATH=$HOME/.ipfs
ExecStart=/usr/local/bin/ipfs daemon --enable-gc
Restart=on-failure
RestartSec=10
KillSignal=SIGINT

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable ipfs
sudo systemctl start ipfs

echo "✅ IPFS service created and started"

# Wait for daemon to start
sleep 5

# Test IPFS connection
echo "🧪 Testing IPFS connection..."
if ipfs id > /dev/null 2>&1; then
    echo "✅ IPFS daemon is running"
    ipfs id
else
    echo "❌ IPFS daemon failed to start"
    exit 1
fi

echo ""
echo "🎉 IPFS setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Your IPFS node is running on:"
echo "   - API: http://127.0.0.1:5001"
echo "   - Gateway: http://127.0.0.1:8080"
echo ""
echo "2. To check status: systemctl status ipfs"
echo "3. To view logs: journalctl -u ipfs -f"
echo "4. To stop: sudo systemctl stop ipfs"
echo "5. To restart: sudo systemctl restart ipfs"
echo ""
echo "🔗 Web UI available at: http://127.0.0.1:5001/webui"

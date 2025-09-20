# 📌 IPFS Pinning Setup Guide for FundChain

This guide will help you set up IPFS pinning to ensure your campaign documents and images are always accessible.

## 🚀 Quick Setup Options

### Option 1: Local IPFS Node (Recommended for Development)

1. **Install and Setup IPFS Node:**
   ```bash
   # Make the setup script executable
   chmod +x setup-ipfs-node.sh
   
   # Run the setup script
   ./setup-ipfs-node.sh
   ```

2. **Verify IPFS is Running:**
   ```bash
   # Check IPFS status
   systemctl status ipfs
   
   # Test IPFS API
   curl http://127.0.0.1:5001/api/v0/id
   
   # Test IPFS Gateway
   curl http://127.0.0.1:8080/ipfs/QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vfbqCZ
   ```

3. **Pin Existing Content:**
   ```bash
   # Pin a specific hash
   ipfs pin add QmYourHashHere
   
   # List pinned content
   ipfs pin ls
   
   # Check pin status
   ipfs pin ls QmYourHashHere
   ```

### Option 2: Pinning Services (Recommended for Production)

#### A. Pinata (Popular Choice)

1. **Sign up at [Pinata.cloud](https://pinata.cloud)**
2. **Get API Keys:**
   - Go to API Keys section
   - Create new API key with pinning permissions
   - Copy API Key and Secret Key

3. **Add to Environment Variables:**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_PINATA_API_KEY=your_api_key_here
   NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret_key_here
   ```

#### B. Web3.Storage (Free Option)

1. **Sign up at [Web3.Storage](https://web3.storage)**
2. **Get API Token:**
   - Go to Account section
   - Create new API token
   - Copy the token

3. **Add to Environment Variables:**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_here
   ```

#### C. NFT.Storage (Free for NFTs)

1. **Sign up at [NFT.Storage](https://nft.storage)**
2. **Get API Token:**
   - Go to API Keys section
   - Create new API key
   - Copy the token

3. **Add to Environment Variables:**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_NFT_STORAGE_TOKEN=your_token_here
   ```

## 🔧 Using the Enhanced IPFS System

### Upload with Pinning

```javascript
import { uploadAndPinFile } from '@/lib/ipfs-pinning';

// Upload to local IPFS with pinning
const hash = await uploadAndPinFile(file, { 
  pinningService: 'LOCAL' 
});

// Upload to Pinata
const hash = await uploadAndPinFile(file, { 
  pinningService: 'PINATA',
  metadata: { campaignId: 'campaign-123' }
});

// Auto-select best available service
const hash = await uploadAndPinFile(file, { 
  pinningService: 'AUTO' 
});
```

### Pin Existing Content

```javascript
import { pinExistingHash, bulkPinHashes } from '@/lib/ipfs-pinning';

// Pin a single hash
await pinExistingHash('QmYourHashHere', 'LOCAL');

// Pin multiple hashes
const results = await bulkPinHashes([
  'QmHash1',
  'QmHash2',
  'QmHash3'
], 'PINATA');
```

### Check Pin Status

```javascript
import { isHashPinned } from '@/lib/ipfs-pinning';

const isPinned = await isHashPinned('QmYourHashHere');
console.log('Is pinned:', isPinned);
```

## 🛠️ Manual IPFS Commands

### Basic IPFS Operations

```bash
# Add and pin a file
ipfs add --pin=true your-file.pdf

# Pin an existing hash
ipfs pin add QmYourHashHere

# Unpin a hash
ipfs pin rm QmYourHashHere

# List all pinned content
ipfs pin ls --type=recursive

# Check if specific hash is pinned
ipfs pin ls QmYourHashHere

# Get file from IPFS
ipfs get QmYourHashHere

# View file content
ipfs cat QmYourHashHere
```

### Advanced IPFS Operations

```bash
# Pin with custom name
ipfs pin add --name="Campaign Document" QmYourHashHere

# Pin from URL
ipfs pin add --name="Remote File" $(ipfs add --only-hash --quiet https://example.com/file.pdf)

# Garbage collection (remove unpinned content)
ipfs repo gc

# Check repository status
ipfs repo stat

# List connected peers
ipfs swarm peers

# Bootstrap to ensure connectivity
ipfs bootstrap add /dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. "Document not accessible via any IPFS gateway"

**Causes:**
- Content not pinned anywhere
- Network connectivity issues
- IPFS node not running
- Invalid hash

**Solutions:**
```bash
# Check if IPFS daemon is running
ipfs id

# Try to pin the content locally
ipfs pin add QmYourHashHere

# Check if hash exists on network
ipfs dht findprovs QmYourHashHere

# Test gateway access
curl -I https://gateway.ipfs.io/ipfs/QmYourHashHere
```

#### 2. "IPFS daemon not running"

**Solutions:**
```bash
# Start IPFS daemon
ipfs daemon

# Or use systemd service
sudo systemctl start ipfs
sudo systemctl enable ipfs

# Check logs
journalctl -u ipfs -f
```

#### 3. "CORS errors in browser"

**Solutions:**
```bash
# Configure CORS for local development
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

# Restart IPFS daemon
sudo systemctl restart ipfs
```

#### 4. "Pinning service authentication failed"

**Solutions:**
- Verify API keys in `.env.local`
- Check API key permissions
- Ensure environment variables are loaded
- Test API keys with curl:

```bash
# Test Pinata API
curl -X GET https://api.pinata.cloud/data/testAuthentication \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY"

# Test Web3.Storage API
curl -X GET https://api.web3.storage/user/uploads \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Monitoring and Maintenance

### Check Pin Status

```bash
# List all pins with sizes
ipfs pin ls --type=recursive | head -10

# Check total pinned size
ipfs repo stat

# Find largest pinned items
ipfs pin ls --type=recursive --size | sort -nr | head -10
```

### Cleanup Unpinned Content

```bash
# Remove unpinned content to free space
ipfs repo gc

# Check space before and after
ipfs repo stat
```

### Backup Pin List

```bash
# Export pin list
ipfs pin ls --type=recursive > pinned-hashes.txt

# Restore pins from backup
while read hash; do
  ipfs pin add $hash
done < pinned-hashes.txt
```

## 🎯 Best Practices

### For Development
1. **Use Local IPFS Node:** Fast and reliable for testing
2. **Pin Important Content:** Always pin campaign documents and images
3. **Regular Cleanup:** Run `ipfs repo gc` periodically
4. **Monitor Storage:** Check `ipfs repo stat` regularly

### For Production
1. **Use Pinning Services:** More reliable than local nodes
2. **Multiple Providers:** Use 2-3 pinning services for redundancy
3. **Monitor Costs:** Track usage on paid services
4. **Backup Strategies:** Keep lists of important hashes
5. **CDN Integration:** Use IPFS gateways with CDN for better performance

### For Campaign Documents
1. **Pin Immediately:** Pin documents as soon as they're uploaded
2. **Verify Accessibility:** Test document access after pinning
3. **Multiple Gateways:** Use multiple gateways for fallback
4. **Metadata:** Add meaningful metadata to pinned content
5. **Retention Policy:** Keep important documents pinned permanently

## 🚀 Next Steps

1. **Choose Your Setup:** Local IPFS node or pinning service
2. **Configure Environment:** Add API keys to `.env.local`
3. **Test Upload:** Try uploading a test document
4. **Verify Pinning:** Check that content is properly pinned
5. **Monitor Access:** Ensure documents are accessible via gateways

Your FundChain application now has robust IPFS pinning support that will ensure campaign documents and images are always accessible!

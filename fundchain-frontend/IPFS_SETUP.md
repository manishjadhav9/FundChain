# IPFS Setup for FundChain

This guide will help you properly configure IPFS for use with FundChain.

## Prerequisites

1. Install IPFS Desktop or IPFS CLI from [IPFS Installation Guide](https://docs.ipfs.tech/install/)
2. Start your IPFS node

## Quick Setup

### Windows

1. Open PowerShell as Administrator
2. Navigate to your project directory
3. Run the setup script:

```powershell
cd fundchain-frontend
.\scripts\setup-ipfs-cors.ps1
```

### Mac/Linux

1. Open Terminal
2. Navigate to your project directory
3. Run the setup script:

```bash
cd fundchain-frontend
chmod +x scripts/setup-ipfs-cors.sh
./scripts/setup-ipfs-cors.sh
```

## Manual Configuration

If the scripts don't work for you, you can manually configure IPFS CORS settings with these commands:

```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST", "PUT", "DELETE", "OPTIONS"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "X-Requested-With", "Range", "Content-Type"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location", "WWW-Authenticate"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
```

**Important**: After setting CORS, restart your IPFS node:

```bash
ipfs shutdown
ipfs daemon
```

## Testing Your Setup

We've included a special test page to verify your IPFS setup:

1. Start your Next.js development server: `npm run dev`
2. Visit [http://localhost:3000/ipfs-direct-test.html](http://localhost:3000/ipfs-direct-test.html)
3. The test page will show if your IPFS node is accessible and if uploads work

## Troubleshooting

### "Failed to fetch" Error

This usually means one of the following:

1. **IPFS daemon isn't running** - Start it with `ipfs daemon`
2. **CORS is not properly configured** - Run the setup script again
3. **Firewall blocking access** - Check your firewall settings for port 5001

### "CORS header missing" Error

This is a browser security error. You need to:

1. Configure CORS headers as shown above
2. Restart your IPFS daemon
3. Try again

### Upload works in test page but not in app

If the direct test page works but the app doesn't:

1. Clear your browser cache
2. Refresh the page
3. Check browser console for specific errors

## Additional Resources

- [IPFS Documentation](https://docs.ipfs.tech/)
- [IPFS HTTP API Reference](https://docs.ipfs.tech/reference/http/api/)
- [IPFS CORS Configuration](https://docs.ipfs.tech/how-to/configure-node/#cors) 
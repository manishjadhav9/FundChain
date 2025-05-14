# IPFS Setup Guide for FundChain

This guide provides instructions for setting up and configuring IPFS to work with the FundChain application.

## Prerequisites

1. [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/) or [IPFS CLI](https://docs.ipfs.tech/install/command-line/)
2. Node.js and npm (already installed for the project)

## Installation

### Option 1: Install IPFS Desktop (Recommended)

1. Download IPFS Desktop from the [official website](https://docs.ipfs.tech/install/ipfs-desktop/)
2. Follow the installation instructions for your OS
3. Launch IPFS Desktop

### Option 2: Install IPFS CLI

```bash
# Download the installer script
wget -q https://dist.ipfs.tech/kubo/v0.20.0/install.sh -O install.sh

# Make the script executable
chmod +x install.sh

# Run the installer
./install.sh

# Initialize your IPFS node
ipfs init

# Start the IPFS daemon
ipfs daemon
```

## Configuration

For our FundChain application to communicate with the IPFS node, we need to configure CORS settings. This is **critical** for allowing uploads from our web application.

### Configure CORS Settings

With IPFS Desktop running or while the IPFS daemon is running via CLI, open a terminal and run:

```bash
# Allow all origins (for development)
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
```

### Restart IPFS

After configuring CORS settings, restart your IPFS node:

- **IPFS Desktop**: Click on "Restart" in the app interface
- **IPFS CLI**: Press `Ctrl+C` to stop the daemon, then run `ipfs daemon` again

## Testing Your IPFS Setup

1. Make sure IPFS is running
2. Go to the test page at `/ipfs-test` in your FundChain application
3. Click "Check IPFS Connection" to verify your connection
4. Test file and JSON uploads

## Troubleshooting

### "Failed to fetch" Error

This typically indicates one of the following issues:

1. **IPFS daemon is not running** - Ensure your IPFS node is active
2. **CORS is not configured properly** - Double-check your CORS settings using the commands above
3. **Wrong API endpoint** - Verify the API endpoint in `lib/ipfs.js` matches your IPFS configuration (default is `http://127.0.0.1:5001/api/v0`)

### "TypeError: Failed to fetch" Error

This usually indicates a network issue or CORS problem:

1. Check that your IPFS API is accessible by visiting `http://127.0.0.1:5001/api/v0/id` in your browser
2. Verify CORS settings as mentioned above
3. Restart your IPFS daemon after changing settings

### Check IPFS API Address

If you've customized your IPFS installation, check the API address:

```bash
ipfs config Addresses.API
```

Update the `IPFS_API_URL` in `lib/ipfs.js` if it's different from the default.

## Resources

- [IPFS Documentation](https://docs.ipfs.tech/)
- [IPFS HTTP API Reference](https://docs.ipfs.tech/reference/http/api/)
- [IPFS CORS Configuration Guide](https://docs.ipfs.tech/how-to/configure-node/#cors)

## Integration with FundChain

Our FundChain application uses IPFS for:

1. Storing campaign images
2. Storing campaign documentation
3. Storing metadata for campaigns and milestones

The integration is handled through the `lib/ipfs.js` utility module, which provides functions for uploading files and JSON data to IPFS. 
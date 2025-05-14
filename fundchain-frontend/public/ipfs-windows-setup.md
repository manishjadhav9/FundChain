# IPFS Windows Configuration Steps

Since you're using IPFS Desktop, follow these steps to configure CORS:

## Open IPFS Desktop Settings

1. Open IPFS Desktop application
2. Click on the gear icon (⚙️) to open Settings
3. Go to **Advanced** tab
4. Look for **IPFS Config**

## Edit CORS Settings

In the IPFS Config editor, locate the `API.HTTPHeaders` section and add/update the following:

```json
"API": {
  "HTTPHeaders": {
    "Access-Control-Allow-Origin": [
      "*"
    ],
    "Access-Control-Allow-Methods": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    "Access-Control-Allow-Headers": [
      "Authorization",
      "X-Requested-With",
      "Range",
      "Content-Type"
    ],
    "Access-Control-Expose-Headers": [
      "Location",
      "WWW-Authenticate"
    ],
    "Access-Control-Allow-Credentials": [
      "true"
    ]
  }
}
```

## Restart IPFS

After saving the configuration:

1. Click on the **Restart** button in IPFS Desktop
2. Wait for IPFS to restart completely

## Test Your Configuration

1. Start your Next.js development server: `npm run dev`
2. Open your browser and navigate to: [http://localhost:3000/ipfs-direct-test.html](http://localhost:3000/ipfs-direct-test.html)
3. Try uploading a file to see if it works correctly

If you still encounter issues, make sure your IPFS Desktop is completely restarted and try again. 
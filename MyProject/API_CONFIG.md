# API Configuration Guide

## Issue: Network Error During Registration

If you encounter network errors, it's usually because the frontend cannot connect to the backend server. Please follow these steps to check:

## Solution

### 1. Ensure Backend Service is Running

Run in the `server` directory:

```bash
cd server
npm install
npm run dev
```

The backend should display: `API server listening on http://0.0.0.0:4000`

### 2. Configure Frontend API Address

Configure the API address according to your access method:

#### Method 1: Local Access (Recommended for Development)

If both frontend and backend are running on the same machine, no additional configuration is needed. Default uses:
```
http://localhost:4000/api
```

#### Method 2: Local Network Access

If accessing via local network IP (e.g., `192.168.99.187:5173`), you need to create a `.env.local` file:

**Create `.env.local` file in the project root directory:**

```env
# Replace localhost with your actual IP address
VITE_API_BASE_URL=http://192.168.99.187:4000/api
```

**Important Notes:**
- Replace `192.168.99.187` with your actual IP address
- Ensure the backend is also running on port 4000 of the same machine
- Port 4000 must match the backend configuration

### 3. Check Firewall

Ensure the firewall allows:
- Backend port: 4000
- Frontend port: 5173

### 4. Verify Connection

Access the backend health check endpoint:
- Local: http://localhost:4000/
- Local Network: http://192.168.99.187:4000/

If you see `{"status":"ok"}`, the backend is running normally.

## Quick Fix Steps

1. **Check if Backend is Running**
   ```bash
   # In server directory
   npm run dev
   ```

2. **Get Local IP Address**
   - Windows: `ipconfig` to view IPv4 address
   - Mac/Linux: `ifconfig` or `ip addr`

3. **Create `.env.local` File** (Only needed for local network access)
   ```env
   VITE_API_BASE_URL=http://YOUR_IP_ADDRESS:4000/api
   ```

4. **Restart Frontend Development Server**
   ```bash
   # In project root directory
   npm run dev
   ```

## Configuration Examples

### Local Development (Same Machine)
No configuration needed, uses default values.

### Local Network Development (Different Devices)
`.env.local` content:
```env
VITE_API_BASE_URL=http://192.168.1.100:4000/api
```

### Production Environment
`.env.production` content:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Common Errors

- **Network Error**: Backend not started or API address misconfigured
- **ERR_CONNECTION_REFUSED**: Backend not started or port is occupied
- **CORS Error**: Backend CORS configuration issue (configured by default, usually won't occur)

## Need Help?

If the problem persists, please check:
1. Backend console for error messages
2. Browser Developer Tools (F12) Network tab
3. Firewall and antivirus settings


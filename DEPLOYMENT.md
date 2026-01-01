# PhiSeal Vercel Deployment Instructions

## Current Status

✅ GitHub repository: `btisler-DS/PhiSealCode` - **LIVE**
✅ API code ready in `/api` directory
✅ Anthropic API key added to Vercel environment
⏳ Deployment configuration needed

## Issue

Vercel is auto-detecting the project as Next.js and trying to build it, but this is a **serverless functions only** project (no frontend framework at root level).

## Solution: Configure via Vercel Dashboard

### Step 1: Access Project Settings

1. Go to https://vercel.com/hdt-2-quantum-inquiry/phi-seal-code
2. Click **Settings** tab
3. Go to **General** section

### Step 2: Configure Framework

1. Find **Framework Preset** setting
2. Change from "Next.js" (auto-detected) to **"Other"**
3. Save changes

### Step 3: Configure Build Settings

1. In Settings, go to **Build & Development Settings**
2. Set the following:

   - **Framework Preset**: Other
   - **Build Command**: Leave empty or set to `echo "No build needed"`
   - **Output Directory**: `.` (dot)
   - **Install Command**: `npm install`
   - **Root Directory**: `.` (leave as root)

3. Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. **OR** simply run from your terminal:
   ```bash
   cd D:\PhiSealCode
   vercel --prod --yes
   ```

### Step 5: Test API Endpoints

Once deployed successfully, you'll get a URL like:
```
https://phi-seal-code.vercel.app
```

Test the endpoints:

**1. Health Check:**
```bash
curl https://phi-seal-code.vercel.app/api/manifests
```

Expected: `{"success":true,"manifests":[],"count":0}`

**2. Document Analysis (with test file):**
```bash
curl -X POST https://phi-seal-code.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "file": "base64_encoded_content_here",
    "fileName": "test.pdf",
    "fileType": "pdf",
    "intent": "analysis"
  }'
```

---

## Alternative: Manual Deployment via Vercel UI

If CLI deployment continues to fail:

1. Go to https://vercel.com/new
2. Import from GitHub: `btisler-DS/PhiSealCode`
3. **IMPORTANT**: Override these settings:
   - Framework Preset: **Other**
   - Root Directory: `.` (root)
   - Build Command: `npm run build` (will echo message)
   - Output Directory: `.`
4. Add Environment Variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `[Your Anthropic API key]`
5. Click **Deploy**

---

## Project Structure

```
PhiSealCode/
├── api/
│   ├── analyze.ts          # POST /api/analyze
│   └── manifests.ts        # GET/POST/DELETE /api/manifests
├── instructions/
│   └── MASTER.md           # HDT² system prompt
├── phiseal/                # Expo mobile app (not deployed to Vercel)
├── package.json            # API dependencies
└── vercel.json             # Serverless config
```

Only `/api` directory is deployed as serverless functions.
The `/phiseal` directory contains the mobile app (deployed separately via Expo).

---

## Once Deployed

### Update Mobile App

1. Get your deployment URL (e.g., `https://phi-seal-code.vercel.app`)

2. Update mobile app API configuration:
   ```bash
   cd phiseal
   echo "EXPO_PUBLIC_API_URL=https://phi-seal-code.vercel.app" > .env
   ```

3. Restart Expo:
   ```bash
   npx expo start
   ```

### Test Full Pipeline

1. Run mobile app: `npx expo start`
2. Select intent (Analysis/Review/Audit)
3. Upload a test document from `test-documents/`
4. Verify analysis results
5. Check manifest export

---

## Troubleshooting

### If deployment still fails with "No Next.js detected"

Check Vercel project settings:
- Framework must be "Other"
- No "next" in package.json (correct)
- vercel.json only contains `functions` config

### If API endpoints return 404

- Verify files are in `/api` directory at root level
- Check deployment logs for errors
- Ensure TypeScript files are being compiled

### If API returns 500 errors

- Check Environment Variables include `ANTHROPIC_API_KEY`
- Check function logs in Vercel dashboard
- Verify dependencies installed correctly

---

## API Documentation

See `README.md` for complete API documentation.

**Endpoints:**
- `POST /api/analyze` - Analyze document
- `POST /api/manifests` - Store manifest
- `GET /api/manifests?id={id}` - Get specific manifest
- `GET /api/manifests` - Get all manifests
- `DELETE /api/manifests?id={id}` - Delete manifest

---

## Environment Variables

Required in Vercel:
```
ANTHROPIC_API_KEY=[Your Anthropic API key]
```

Already configured ✅ (via Vercel CLI earlier)

---

## Next Steps After Deployment

1. Test API endpoints
2. Update mobile app with production URL
3. Test full analysis pipeline
4. Optional: Upgrade manifest storage from in-memory to Vercel KV
5. Optional: Add monitoring/analytics

---

**Generated with Claude Code**

# Render Deployment - Root Directory Issue

## Problem
Error: `Root directory "Dockerfile" does not exist`

## Root Cause
Render has either:
1. **Wrong Root Directory set** - Pointing to `backend/` or `frontend/` instead of `.` (current root)
2. **Still using cached build context from old config**
3. **Service pointing to wrong branch or commit**

## Solution: Fix Render Settings

### Step 1: Go to Service Settings
- https://dashboard.render.com
- Click your service: `dealpilot-backend`
- Click **Settings** (bottom right)

### Step 2: Verify Root Directory
Look for a field called **"Root Directory"** or **"Build Context"**

**Change to:** `.` (single dot = current directory/root)

NOT: `backend/` or `/backend` or empty

### Step 3: Verify Branch
Make sure **Branch** is set to: `main`

### Step 4: Verify Dockerfile Path
Make sure **Dockerfile Path** is set to: `Dockerfile`

### Step 5: Save and Deploy
- Click **Save**
- Go to **Deployments** → **Manual Deploy**
- Select commit: `07ac686`
- Click **Deploy**

---

## Alternative: Delete and Recreate

If settings are unclear, delete and start fresh:

1. **Settings** → **Delete Service**
2. **Confirm deletion**
3. Wait 1 minute
4. **New Web Service** → Connect GitHub
5. **Carefully fill in:**
   - Root Directory: `.` (or leave empty if not shown)
   - Dockerfile Path: `Dockerfile`
   - Branch: `main`

---

## Verify on GitHub

Files ARE on GitHub:
- https://github.com/maaz-ahmad-63/DealPilot-CRM-Backend/blob/main/Dockerfile

Command to check locally:
```bash
git ls-files | grep -i dockerfile
# Should show: Dockerfile
```

---

The code is fine. Render's configuration is the issue.

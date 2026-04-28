# Backend URL Update - April 28, 2026

**Updated Backend URL:**
```
https://dealpilot-crm-backend.onrender.com
```

**Previous URL (Deprecated):**
```
https://dealpilot-backend.onrender.com
```

## Changes Made:
- Updated `frontend/.env` with new Render backend URL
- New URL is: `https://dealpilot-crm-backend.onrender.com/api`

## Next Steps:
1. **Manual Vercel Redeploy Required**
   - Go to https://vercel.com/dashboard
   - Click "dealpilot-frontend" project
   - Click Deployments
   - Click ⋮ menu → Redeploy
   - Wait 2-3 minutes

2. **Test Demo Login**
   - URL: https://dealpilot-frontend.vercel.app/
   - Email: demo@example.com
   - Password: demo123

## Status:
- ✅ Backend running at https://dealpilot-crm-backend.onrender.com
- ✅ MongoDB connected
- ✅ Demo user exists
- ⏳ Frontend needs redeploy to use new backend URL

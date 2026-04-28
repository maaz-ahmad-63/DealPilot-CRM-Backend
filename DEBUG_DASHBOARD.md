# Debug Checklist for Dashboard Not Rendering

## Steps to diagnose:

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Log in with demo credentials** (demo@example.com / demo123)
4. **Look for RED error messages** (not yellow warnings)

## Expected sequence:
- ✅ Login button click
- ✅ "🔐 Attempting login..." message
- ✅ Backend responds with token
- ✅ "✅ Login successful" message
- ✅ Redirect to /dashboard
- ✅ Dashboard renders with data

## Common issues to look for:

### Error Type 1: Module import errors
- Look for "Cannot find module" or "Failed to resolve"
- Usually in red text
- Fix: Run `npm install` in frontend folder

### Error Type 2: CRMContext not initialized  
- Look for "Cannot read property of undefined"
- Related to `dashboardStats` or `deals`
- Fix: Check if CRMProvider wraps the component

### Error Type 3: State not updating
- Login succeeds but page doesn't redirect
- Token not persisting in localStorage
- Fix: Clear localStorage and try again

## Quick fix if dashboard won't load:

1. **Clear browser cache**: F12 → Application → Storage → Clear All
2. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Try in Incognito mode**: Ctrl+Shift+N (new private window)
4. **Check if localStorage is enabled** in browser

## If still stuck:

1. Take screenshot of console errors
2. Note exact error message
3. Share the error details


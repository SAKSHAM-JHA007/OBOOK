# OBOOK Authentication Bug Fixes

## Issues Found & Fixed

### ✅ Issue 1: Signup Not Sending Confirm Password
**Problem:** The signup form was validating `confirmPassword` on the frontend but NOT sending it to the server. The server expects `confirmPassword` in the request body.

**Location:** `public/signup.js` line 41-44

**Fix:** Added `confirmPassword` to the form payload:
```javascript
const formPayload = {
    username: signupUsername.value.trim(),
    email: signupEmail.value.trim(),
    password: signupPassword.value,
    confirmPassword: signupConfirmPassword.value  // ← ADDED THIS
};
```

---

### ✅ Issue 2: Missing Logout Endpoint
**Problem:** The feed page calls `POST /logout` but the endpoint didn't exist.

**Location:** `server.js`

**Fix:** Added logout endpoint that destroys the session:
```javascript
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to logout." });
        }
        res.clearCookie("connect.sid");
        return res.json({ success: true, message: "Logged out successfully." });
    });
});
```

---

### ✅ Issue 3: Missing Feed API Endpoints
**Problem:** The feed.html JavaScript calls `/api/posts` endpoints but they didn't exist.

**Location:** `server.js`

**Fix:** Added 4 new API endpoints:

1. **POST /api/posts** - Create a new post
2. **GET /api/posts** - Retrieve posts list
3. **POST /api/posts/:postId/like** - Like a post
4. **POST /api/posts/:postId/bookmark** - Bookmark a post

---

## Testing the Fixes

### Option 1: Run PowerShell Test Script (Windows)
```powershell
cd C:\Users\shado\Desktop\omi P3
.\test-auth.ps1
```

This will:
- ✓ Check if server is running
- ✓ Test signup with a new user
- ✓ Test login with that user
- ✓ Test posts API

### Option 2: Manual Testing

**1. Test Signup:**
```
POST http://localhost:3000/signup
Content-Type: application/json

{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "TestPassword123",
  "confirmPassword": "TestPassword123"
}
```

Expected Response:
```json
{
  "success": true,
  "redirect": "/thankyou.html"
}
```

**2. Test Login:**
```
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPassword123"
}
```

Expected Response:
```json
{
  "success": true,
  "redirect": "/feed.html",
  "message": "Logged in successfully."
}
```

**3. Test Posts API:**
```
GET http://localhost:3000/api/posts
```

Expected Response: Array of posts

---

## Updated Files

1. **public/signup.js** - Now sends `confirmPassword` to server
2. **server.js** - Added `/logout` endpoint and `/api/posts/*` endpoints

---

## Troubleshooting

If you still see errors:

### "Unable to create account"
- Check if passwords match
- Check if email is already registered
- Check server console for errors

### "Unable to login"  
- Verify account exists (try signing up first)
- Check if password is correct
- Check server is running on port 3000

### Server won't start
- Make sure all dependencies are installed: `npm install`
- Check if port 3000 is already in use
- Check if users.db exists in the project root

---

## Files Structure
```
omi P3/
├── server.js          ← Backend API server
├── users.db          ← SQLite database (auto-created)
├── test-auth.ps1     ← PowerShell test script
├── public/
│   ├── index.html    ← Landing page with login modal
│   ├── signup.html   ← Signup page
│   ├── login.html    ← Login page
│   ├── feed.html     ← Social feed (requires login)
│   ├── signup.js     ← Fixed: Now sends confirmPassword
│   ├── feed.js       ← Uses new /api/posts endpoints
│   └── [other files]
└── users.sql         ← Database schema
```

---

## Next Steps

1. Run `npm start` to start the server
2. Open `http://localhost:3000` in your browser
3. Test signup → login → feed flow
4. Use test-auth.ps1 script to verify all endpoints work

All authentication should now work correctly! 🎉

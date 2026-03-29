# Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (already connected)

## Installation Steps

1. **Navigate to the app directory**

   ```bash
   cd my-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Go to `http://localhost:3000`
   - You'll be automatically redirected to the login page

## Database Connection

✅ **Already configured in `.env.local`:**

- User database: `userDB` (for storing user credentials with hashed passwords)
- Updates database: `updates` (for storing real-time updates)
- MongoDB Atlas connection is ready to use

## First Time Usage

1. **Create an account**
   - Click "Create Account" on the login page
   - Enter username, email, and password (min 6 chars)
   - Password is automatically hashed with bcryptjs (10 salt rounds)

2. **Log in**
   - Use the credentials you just created

3. **Create an update**
   - In the dashboard, fill in title and content
   - Click "Create Update"
   - All users can see your update in real-time

## Testing Multiple Users

To test real-time updates with multiple users:

1. Open the app in two different browsers or incognito windows
2. Log in with different accounts in each
3. Create updates in one and see them appear instantly in the other

## Key Features

✨ **Authentication**

- Secure login/registration
- Password hashing with bcryptjs
- JWT token-based sessions (7-day expiry)

🔄 **Real-Time Updates**

- Instant UI updates across all users
- No page refresh needed
- Changes appear immediately

💾 **Database**

- Users stored with hashed passwords in `userDB`
- Updates stored in `updates` collection
- MongoDB Atlas for reliable persistence

## Troubleshooting

### Dependencies not installing?

```bash
npm install --legacy-peer-deps
```

### MongoDB connection failing?

- Check internet connection
- Verify MongoDB Atlas is accessible
- Check IP whitelist in MongoDB Atlas

### Changes not showing?

- Clear browser cache
- Try incognito/private window
- Check browser console for errors

## Default Test Credentials

You can create your own account, or if you have test users set up, use those.

## Production Deployment

Before deploying to production:

1. Change JWT_SECRET in environment variables
2. Update MongoDB password if needed
3. Set NODE_ENV=production
4. Run `npm run build` to verify build succeeds

---

For full documentation, see `REAL_TIME_APP_README.md`

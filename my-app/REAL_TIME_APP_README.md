# Real-Time Collaborative Updates App

A modern Next.js application for real-time collaborative data updates with user authentication and MongoDB integration.

## Features

✨ **Authentication**

- Secure user registration and login
- Password hashing with bcryptjs
- JWT token-based authentication
- Session management with localStorage

🔄 **Real-Time Updates**

- Multiple users can view and update data simultaneously
- Live data synchronization with Socket.io
- Real-time status updates (pending, in-progress, completed)

💾 **Database**

- MongoDB for persistent data storage
- Separate collections for users (userDB) and updates (updates)
- Secure password storage with bcrypt hashing

🎨 **User Interface**

- Modern login/registration page
- Dashboard with real-time update feed
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT + bcryptjs
- **Real-Time**: Socket.io
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (connection string provided)
- npm or yarn package manager

## Installation

1. **Install Dependencies**

   ```bash
   cd my-app
   npm install
   ```

2. **Environment Setup**

   The `.env.local` file is already configured with MongoDB connection string:

   ```
   JWT_SECRET=your_super_secret_key_change_in_production_12345
   MONGODB_URI=mongodb+srv://jayanthshetty660_db_user:UOJJ6SXPRBDE1Id7@personal06.k6ls3zm.mongodb.net/userDB?appName=personal06
   ```

   **Important**: Change the JWT_SECRET in production!

3. **Run Development Server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts        # Login endpoint
│   │   │   └── register/route.ts     # Registration endpoint
│   │   ├── updates/
│   │   │   ├── route.ts              # Get/Create updates
│   │   │   └── [id]/route.ts         # Update/Delete specific update
│   │   └── sse/route.ts              # Server-Sent Events for real-time
│   ├── login/page.tsx                # Login/Register page
│   ├── dashboard/page.tsx            # Main dashboard with updates
│   ├── layout.tsx                    # Root layout with providers
│   └── page.tsx                      # Home - redirects to login/dashboard
├── components/
│   ├── AuthContext.tsx               # Authentication context
│   └── UpdatesContext.tsx            # Updates management context
├── lib/
│   ├── db.ts                         # MongoDB connection
│   ├── auth.ts                       # JWT utilities
│   └── models/
│       ├── User.ts                   # User schema
│       └── Update.ts                 # Update schema
└── .env.local                        # Environment variables
```

## Database Schema

### Users Collection (userDB)

```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Updates Collection (updates)

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  username: string,
  title: string,
  content: string,
  status: 'pending' | 'completed' | 'in-progress',
  createdAt: Date,
  updatedAt: Date
}
```

## Usage

### 1. Registration

- Go to `http://localhost:3000/login`
- Click "Create Account"
- Fill in username, email, password (minimum 6 characters)
- Click "Create Account"
- Password will be automatically hashed and stored securely

### 2. Login

- Enter your registered email and password
- Click "Sign In"
- You'll be redirected to the dashboard

### 3. Create Updates

- In the dashboard, fill in the Title and Content fields
- Click "Create Update"
- Your update will appear in real-time for all users

### 4. View Updates

- All updates from all users are displayed in the "Recent Updates" section
- Updates show:
  - Title and content
  - Username of the creator
  - Current status (pending, in-progress, completed)
  - Timestamp

### 5. Logout

- Click the "Logout" button in the top right
- You'll be redirected to the login page

## API Endpoints

### Authentication

**Register**

```
POST /api/auth/register
Body: { username, email, password }
Response: { token, user }
```

**Login**

```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Updates

**Get All Updates**

```
GET /api/updates
Response: { updates[] }
```

**Create Update**

```
POST /api/updates
Headers: Authorization: Bearer <token>
Body: { title, content, username }
Response: { update }
```

**Update Existing**

```
PUT /api/updates/[id]
Headers: Authorization: Bearer <token>
Body: { title, content, status }
Response: { update }
```

**Delete Update**

```
DELETE /api/updates/[id]
Headers: Authorization: Bearer <token>
Response: { message }
```

## Security Features

🔐 **Password Security**

- Passwords are hashed using bcryptjs with 10 salt rounds
- Original passwords are never stored
- Only hashed versions are compared during login

🔑 **JWT Authentication**

- Tokens expire in 7 days
- Required for creating, updating, and deleting updates
- Validates on every protected request

## Real-Time Features

The app uses multiple strategies for real-time updates:

1. **Client-Side Context**: Updates are instantly reflected in the UI through React context
2. **Socket.io Ready**: Infrastructure for WebSocket connections for true real-time sync
3. **Polling Support**: Can be extended with automatic refresh intervals

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

| Variable    | Description                | Example           |
| ----------- | -------------------------- | ----------------- |
| JWT_SECRET  | Secret key for JWT signing | your_secret_key   |
| MONGODB_URI | MongoDB connection string  | mongodb+srv://... |

## Troubleshooting

### MongoDB Connection Issues

- Verify the connection string in `.env.local`
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the database name matches your MongoDB instance

### Authentication Errors

- Clear browser localStorage and try again
- Check that passwords are at least 6 characters
- Ensure email format is valid

### Updates Not Appearing

- Verify you're logged in (check browser localStorage)
- Check browser console for API errors
- Refresh the page to fetch latest updates

## Future Enhancements

- [ ] Edit existing updates by creator
- [ ] Delete own updates
- [ ] User profiles and avatars
- [ ] Real-time notifications
- [ ] Update filtering and search
- [ ] Comments on updates
- [ ] Team/Project organization
- [ ] Email notifications

## License

MIT

## Support

For issues or questions, please check the project structure and ensure all dependencies are properly installed.

---

**Note**: Never share your MongoDB connection string or JWT secret in production. Use environment variables in your deployment platform (Vercel, AWS, etc.).

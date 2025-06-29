# Render Deployment Guide for Chat App Backend

## Prerequisites
- GitHub account
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account (for database)

## Step 1: Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/chat_app?retryWrites=true&w=majority`)

## Step 2: Deploy Backend to Render

### Option A: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Sign up/Login to Render**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

4. **Configure the Service**
   - **Name**: `chat-app-backend` (or any name you prefer)
   - **Root Directory**: `server` (important!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid if needed)

5. **Add Environment Variables**
   Click "Environment" tab and add:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_app?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=10000
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### Option B: Deploy using Render CLI
```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Deploy
render deploy
```

## Step 3: Get Your Backend URL

After deployment, Render will provide you with a URL like:
```
https://your-app-name.onrender.com
```

**Save this URL** - you'll need it for your frontend deployment!

## Step 4: Test Your Backend

1. **Test the API endpoints:**
   ```bash
   # Test health check
   curl https://your-app-name.onrender.com/api/users
   
   # Test registration
   curl -X POST https://your-app-name.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

2. **Check logs in Render dashboard** if there are any issues

## Step 5: Configure CORS (if needed)

Your server should already have CORS configured, but if you get CORS errors, make sure your `server.js` includes:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

## Environment Variables Reference

### Required Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_app
JWT_SECRET=your_jwt_secret_key_here
PORT=10000
```

### Optional Variables:
```
NODE_ENV=production
```

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that `package.json` has correct scripts
   - Ensure all dependencies are listed
   - Check Render logs for specific errors

2. **Database Connection Fails**
   - Verify MongoDB Atlas connection string
   - Check if IP whitelist includes Render's IPs
   - Ensure database user has correct permissions

3. **Socket.IO Not Working**
   - Render supports WebSockets, but check if your client is connecting to the right URL
   - Verify the backend URL in your frontend environment variables

4. **App Crashes**
   - Check Render logs for error messages
   - Ensure all environment variables are set
   - Verify the start command is correct

### Render CLI Commands:
```bash
# View logs
render logs

# Check status
render status

# Redeploy
render deploy

# Open in browser
render open
```

## Cost
- **Render Free Tier**: 
  - 750 hours/month (enough for most projects)
  - Sleeps after 15 minutes of inactivity
  - Wakes up on first request (may take 30-60 seconds)
- **Paid Plans**: Start at $7/month for always-on service

## Next Steps

Once your backend is deployed and working:

1. **Deploy your frontend** (Next.js) to Vercel, Netlify, or Railway
2. **Update frontend environment variables** with your Render backend URL
3. **Test the full application**

## Support
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app) 
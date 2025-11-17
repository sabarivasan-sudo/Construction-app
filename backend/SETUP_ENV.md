# Setup .env File

## ✅ Your MongoDB Connection String is Ready!

Your connection string has been configured with:
- **Username:** sabarivasan_db_user
- **Password:** Sabari1234
- **Cluster:** const.zwclarg.mongodb.net
- **Database:** construction_management

## 📝 Create .env File

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create .env file:**
   - **Windows:** Create a new file named `.env` in the `backend` folder
   - **Mac/Linux:** Run: `touch .env`

3. **Copy this content into .env file:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://sabarivasan_db_user:Sabari1234@const.zwclarg.mongodb.net/construction_management?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. **Save the file**

## 🚀 Next Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Look for this message:**
   ```
   MongoDB Connected: const-shard-00-00.zwclarg.mongodb.net
   Server running in development mode on port 5000
   ```

## ✅ Success!

If you see "MongoDB Connected", your connection is working!

## 🔒 Security Note

- The `.env` file is already in `.gitignore` (won't be committed to Git)
- Change `JWT_SECRET` to a random string in production
- Never share your `.env` file or commit it to version control


# Construction Management Backend API

RESTful API backend for the Construction Management Application built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication**: JWT-based authentication with role-based access control
- **Dashboard**: Real-time statistics and activity feed
- **Projects**: Full CRUD operations for project management
- **Tasks**: Task management with assignment and tracking
- **Issues**: Issue tracking and resolution
- **Attendance**: Daily attendance tracking
- **Inventory**: Material stock management
- **Site Transfer**: Material transfer between sites
- **Consumption**: Material consumption tracking
- **Petty Cash**: Expense and income management
- **Resources**: Labour, machinery, and subcontractor management
- **Users**: User management with roles
- **Activities**: System-wide activity logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🔧 Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/construction_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

3. Start MongoDB (if running locally):
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services panel
```

4. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics (Protected)

### Projects
- `GET /api/projects` - Get all projects (Protected)
- `GET /api/projects/:id` - Get single project (Protected)
- `POST /api/projects` - Create project (Protected)
- `PUT /api/projects/:id` - Update project (Protected)
- `DELETE /api/projects/:id` - Delete project (Protected)

### Tasks
- `GET /api/tasks` - Get all tasks (Protected)
- `GET /api/tasks/:id` - Get single task (Protected)
- `POST /api/tasks` - Create task (Protected)
- `PUT /api/tasks/:id` - Update task (Protected)
- `DELETE /api/tasks/:id` - Delete task (Protected)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📝 Example API Calls

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "123456",
    "role": "manager"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "123456"
  }'
```

### Get Dashboard (with token)
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer <your_token>"
```

## 🗄️ Database Models

- **User**: User accounts with roles
- **Project**: Construction projects
- **Task**: Project tasks
- **Issue**: Issues and defects
- **Attendance**: Daily attendance records
- **Material**: Material inventory
- **SiteTransfer**: Material transfers
- **Consumption**: Material consumption
- **PettyCash**: Petty cash transactions
- **Resource**: Labour, machinery, subcontractors
- **Activity**: System activity log
- **Role**: Role definitions with permissions

## 🛠️ Development

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data (if seed script exists)

## 📦 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── dashboardController.js
│   ├── projectController.js
│   └── taskController.js
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Task.js
│   └── ...
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── projectRoutes.js
│   └── index.js
├── server.js                # Express app entry point
├── package.json
└── .env                     # Environment variables
```

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use strong passwords
- Enable HTTPS in production
- Implement rate limiting
- Validate and sanitize all inputs
- Use environment variables for sensitive data

## 📄 License

ISC


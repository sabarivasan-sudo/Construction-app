# Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and update:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A random secret key for JWT tokens
   - `FRONTEND_URL` - Your frontend URL (default: http://localhost:5173)

3. **Start MongoDB**
   - Local MongoDB: Make sure MongoDB is running
   - MongoDB Atlas: Use your connection string in `.env`

4. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```
   This creates demo accounts:
   - Admin: admin@demo.com / 123456
   - Manager: manager@demo.com / 123456
   - Employee: employee@demo.com / 123456

5. **Start Server**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

## API Base URL
```
http://localhost:5000/api
```

## Testing with Demo Accounts

The seed script creates these accounts that match your frontend login page:
- **Admin**: admin@demo.com / 123456
- **Manager**: manager@demo.com / 123456  
- **Employee**: employee@demo.com / 123456

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user (requires token)

### Dashboard
- `GET /api/dashboard` - Get dashboard stats (requires token)

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (query: ?project=id&status=pending)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Issues
- `GET /api/issues` - List issues
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue

### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Create attendance
- `PUT /api/attendance/:id` - Update attendance

### Materials
- `GET /api/materials` - List materials
- `POST /api/materials` - Create material
- `PUT /api/materials/:id` - Update material

### Petty Cash
- `GET /api/petty-cash` - List transactions
- `POST /api/petty-cash` - Create transaction

### Users
- `GET /api/users` - List users (admin/manager only)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user

## Frontend Integration

Update your frontend to use the API:

1. Create an API service file (e.g., `src/services/api.js`):
```javascript
const API_URL = 'http://localhost:5000/api'

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
    return response.json()
  },
  
  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  
  // Dashboard
  getDashboard() {
    return this.request('/dashboard')
  },
  
  // Projects
  getProjects() {
    return this.request('/projects')
  },
  
  // ... add more methods as needed
}
```

2. Update Login page to call API:
```javascript
const handleLogin = async (e) => {
  e.preventDefault()
  try {
    const response = await api.login(email, password)
    if (response.success) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      navigate('/')
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

3. Update Dashboard to fetch data:
```javascript
useEffect(() => {
  const fetchDashboard = async () => {
    const data = await api.getDashboard()
    // Update state with data.data
  }
  fetchDashboard()
}, [])
```

## Troubleshooting

**MongoDB Connection Error**
- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

**Port Already in Use**
- Change `PORT` in `.env` file
- Or kill process using port 5000

**JWT Token Errors**
- Make sure `JWT_SECRET` is set in `.env`
- Clear localStorage and login again

**CORS Errors**
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Restart the server after changing `.env`


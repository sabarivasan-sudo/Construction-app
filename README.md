# Construction Management Application

A modern, fully responsive Construction Management Application with a premium UI design, smooth animations, and comprehensive project management features.

## 🎨 Features

- **Fully Responsive Design**: Optimized for mobile, tablet, and desktop
- **Modern UI**: Clean, minimal, and professional design with Material Design principles
- **Smooth Animations**: Framer Motion powered animations throughout
- **Comprehensive Modules**: 
  - Projects Management
  - Tasks Tracking
  - Issues & Defects
  - Attendance Management
  - Materials Inventory
  - Site Transfer
  - Material Consumption
  - Petty Cash Management
  - Resources (Labour, Machinery, Subcontractors)
  - User Management
  - Roles & Permissions
  - Reports (Daily, Weekly, Monthly, Overall)
  - Settings

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 Color Palette

- **Primary**: #1A73E8 (Construction Blue)
- **Secondary**: #F9A825 (Yellow Accent)
- **Dark Grey**: #263238
- **Light Grey**: #ECEFF1
- **Background**: #F5F7FA
- **Success**: #43A047
- **Danger**: #E53935

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (Bottom navigation)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (Sidebar navigation)

## 🛠️ Tech Stack

- **React 18**: UI library
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Recharts**: Charts and graphs
- **React Icons**: Icon library
- **Vite**: Build tool

## 📂 Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout wrapper
│   ├── Sidebar.jsx         # Desktop sidebar navigation
│   ├── Header.jsx          # Top header with search
│   ├── BottomNav.jsx       # Mobile bottom navigation
│   ├── StatCard.jsx        # Reusable stat card component
│   └── ProgressCircle.jsx  # Animated progress circle
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   ├── Projects.jsx       # Projects management
│   ├── Tasks.jsx          # Tasks tracking
│   ├── Issues.jsx         # Issues & defects
│   ├── Attendance.jsx     # Attendance management
│   ├── Inventory.jsx      # Materials inventory
│   ├── SiteTransfer.jsx   # Site transfer
│   ├── Consumption.jsx    # Material consumption
│   ├── PettyCash.jsx      # Petty cash
│   ├── Resources.jsx      # Resources management
│   ├── Users.jsx          # User management
│   ├── RolesPermissions.jsx # Roles & permissions
│   ├── Reports.jsx        # Reports
│   └── Settings.jsx       # Settings
├── App.jsx                 # Main app component with routes
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## ✨ Key Features

### Animations
- Sidebar slide-in/out animation
- Card hover scale effects (1.03x)
- Smooth fade-in on page load
- Animated progress bars and counters
- Floating micro-interactions

### Responsive Design
- Mobile-first approach
- Bottom navigation for mobile devices
- Collapsible sidebar for desktop
- Responsive tables (collapse to cards on mobile)
- Fully responsive charts

### Dashboard Widgets
- Project progress with animated circular charts
- Daily attendance counter
- Material stock levels (bar charts)
- Active tasks list with animations
- Pending issues tracker
- Petty cash expenses summary
- Live site activity feed

## 🎯 Design Principles

- **Clean & Minimal**: Uncluttered interface with plenty of white space
- **High Contrast**: Easy to read and accessible
- **Professional**: Business-appropriate design
- **Modern**: Contemporary UI patterns and components
- **Eye-catching**: Attractive color combinations without being noisy

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!


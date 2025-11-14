import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Issues from './pages/Issues'
import Attendance from './pages/Attendance'
import Inventory from './pages/Inventory'
import SiteTransfer from './pages/SiteTransfer'
import Consumption from './pages/Consumption'
import PettyCash from './pages/PettyCash'
import Resources from './pages/Resources'
import Users from './pages/Users'
import RolesPermissions from './pages/RolesPermissions'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/site-transfer" element={<SiteTransfer />} />
        <Route path="/consumption" element={<Consumption />} />
        <Route path="/petty-cash" element={<PettyCash />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/users" element={<Users />} />
        <Route path="/roles-permissions" element={<RolesPermissions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App


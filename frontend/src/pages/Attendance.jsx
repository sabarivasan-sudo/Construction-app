import { motion } from 'framer-motion'
import { FiUsers, FiCheckCircle, FiXCircle, FiClock, FiCalendar } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Attendance = () => {
  const todayStats = {
    present: 145,
    absent: 12,
    late: 8,
    total: 165,
  }

  const weeklyData = [
    { day: 'Mon', present: 150, absent: 15 },
    { day: 'Tue', present: 148, absent: 17 },
    { day: 'Wed', present: 152, absent: 13 },
    { day: 'Thu', present: 145, absent: 20 },
    { day: 'Fri', present: 147, absent: 18 },
    { day: 'Sat', present: 140, absent: 25 },
    { day: 'Sun', present: 0, absent: 0 },
  ]

  const recentAttendance = [
    { id: 1, name: 'John Doe', role: 'Site Engineer', checkIn: '08:00 AM', checkOut: '06:00 PM', status: 'present' },
    { id: 2, name: 'Jane Smith', role: 'Foreman', checkIn: '08:15 AM', checkOut: '-', status: 'present' },
    { id: 3, name: 'Mike Johnson', role: 'Laborer', checkIn: '08:30 AM', checkOut: '05:45 PM', status: 'late' },
    { id: 4, name: 'Sarah Williams', role: 'Supervisor', checkIn: '-', checkOut: '-', status: 'absent' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Attendance</h1>
        <p className="text-gray-500">Track daily attendance and workforce management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <FiCheckCircle className="w-8 h-8 text-success" />
            <span className="text-2xl font-bold text-dark">{todayStats.present}</span>
          </div>
          <p className="text-sm text-gray-500">Present Today</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <FiXCircle className="w-8 h-8 text-danger" />
            <span className="text-2xl font-bold text-dark">{todayStats.absent}</span>
          </div>
          <p className="text-sm text-gray-500">Absent Today</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <FiClock className="w-8 h-8 text-secondary" />
            <span className="text-2xl font-bold text-dark">{todayStats.late}</span>
          </div>
          <p className="text-sm text-gray-500">Late Arrivals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <FiUsers className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-dark">{todayStats.total}</span>
          </div>
          <p className="text-sm text-gray-500">Total Workers</p>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark">Weekly Attendance</h2>
          <FiCalendar className="w-6 h-6 text-primary" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="day" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #F3F4F6',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="present" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="absent" fill="#EF4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Attendance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <h2 className="text-xl font-bold text-dark mb-4">Recent Attendance</h2>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Check In</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Check Out</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((attendance, index) => (
                <motion.tr
                  key={attendance.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="border-b border-light hover:bg-light/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-dark">{attendance.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{attendance.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{attendance.checkIn}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{attendance.checkOut}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      attendance.status === 'present' ? 'bg-success/10 text-success' :
                      attendance.status === 'late' ? 'bg-secondary/10 text-secondary' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {attendance.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {recentAttendance.map((attendance, index) => (
            <motion.div
              key={attendance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="border border-light rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-dark">{attendance.name}</h3>
                  <p className="text-sm text-gray-500">{attendance.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  attendance.status === 'present' ? 'bg-success/10 text-success' :
                  attendance.status === 'late' ? 'bg-secondary/10 text-secondary' :
                  'bg-danger/10 text-danger'
                }`}>
                  {attendance.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Check In:</span>
                  <span className="ml-2 text-dark font-medium">{attendance.checkIn}</span>
                </div>
                <div>
                  <span className="text-gray-500">Check Out:</span>
                  <span className="ml-2 text-dark font-medium">{attendance.checkOut}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Attendance


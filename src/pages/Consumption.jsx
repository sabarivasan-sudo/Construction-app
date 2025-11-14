import { motion } from 'framer-motion'
import { FiPlus, FiShoppingCart, FiTrendingDown } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Consumption = () => {
  const consumptionData = [
    { material: 'Cement', consumed: 120, unit: 'bags', project: 'Building A' },
    { material: 'Steel', consumed: 8, unit: 'tons', project: 'Building B' },
    { material: 'Bricks', consumed: 5000, unit: 'pieces', project: 'Building A' },
    { material: 'Sand', consumed: 15, unit: 'cubic meters', project: 'Building C' },
  ]

  const chartData = [
    { name: 'Mon', cement: 20, steel: 1.5, bricks: 800 },
    { name: 'Tue', cement: 25, steel: 2, bricks: 1000 },
    { name: 'Wed', cement: 18, steel: 1.2, bricks: 750 },
    { name: 'Thu', cement: 22, steel: 1.8, bricks: 900 },
    { name: 'Fri', cement: 20, steel: 1.5, bricks: 850 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Material Consumption</h1>
          <p className="text-gray-500">Track material usage across projects</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>Record Consumption</span>
        </button>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark">Weekly Consumption</h2>
          <FiTrendingDown className="w-6 h-6 text-primary" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #F3F4F6',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="cement" fill="#6366F1" radius={[8, 8, 0, 0]} />
            <Bar dataKey="steel" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="bricks" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Consumption List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consumptionData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-soft card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FiShoppingCart className="w-6 h-6 text-primary" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-dark mb-4">{item.material}</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Consumed</span>
                <span className="text-2xl font-bold text-dark">
                  {item.consumed} {item.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Project</span>
                <span className="text-sm font-medium text-dark">{item.project}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Consumption


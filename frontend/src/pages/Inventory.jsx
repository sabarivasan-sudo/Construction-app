import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiPackage, FiAlertTriangle } from 'react-icons/fi'

const Inventory = () => {
  const materials = [
    {
      id: 1,
      name: 'Cement (50kg bags)',
      category: 'Building Materials',
      currentStock: 850,
      minStock: 500,
      unit: 'bags',
      location: 'Warehouse A',
      lastUpdated: '2024-04-14',
    },
    {
      id: 2,
      name: 'Steel Bars (12mm)',
      category: 'Steel',
      currentStock: 120,
      minStock: 200,
      unit: 'tons',
      location: 'Warehouse B',
      lastUpdated: '2024-04-13',
    },
    {
      id: 3,
      name: 'Bricks',
      category: 'Building Materials',
      currentStock: 15000,
      minStock: 10000,
      unit: 'pieces',
      location: 'Site Storage',
      lastUpdated: '2024-04-14',
    },
    {
      id: 4,
      name: 'Sand',
      category: 'Aggregates',
      currentStock: 45,
      minStock: 50,
      unit: 'cubic meters',
      location: 'Warehouse A',
      lastUpdated: '2024-04-12',
    },
  ]

  const getStockStatus = (current, min) => {
    if (current < min) return { status: 'low', color: 'bg-danger/10 text-danger' }
    if (current < min * 1.5) return { status: 'medium', color: 'bg-secondary/10 text-secondary' }
    return { status: 'good', color: 'bg-success/10 text-success' }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Materials Inventory</h1>
          <p className="text-gray-500">Manage construction materials and stock levels</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>Add Material</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search materials..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material, index) => {
          const stockStatus = getStockStatus(material.currentStock, material.minStock)
          const stockPercentage = (material.currentStock / (material.minStock * 2)) * 100

          return (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-soft card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FiPackage className="w-6 h-6 text-primary" />
                </div>
                {stockStatus.status === 'low' && (
                  <FiAlertTriangle className="w-6 h-6 text-danger" />
                )}
              </div>

              <h3 className="text-xl font-bold text-dark mb-1">{material.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{material.category}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Stock</span>
                  <span className="text-lg font-bold text-dark">
                    {material.currentStock} {material.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Min. Required</span>
                  <span className="text-sm text-gray-600">{material.minStock} {material.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="text-sm text-gray-600">{material.location}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-dark">Stock Level</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.status}
                  </span>
                </div>
                <div className="w-full bg-light rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`h-2 rounded-full ${
                      stockStatus.status === 'low' ? 'bg-danger' :
                      stockStatus.status === 'medium' ? 'bg-secondary' :
                      'bg-success'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-light">
                <p className="text-xs text-gray-400">Last updated: {material.lastUpdated}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default Inventory


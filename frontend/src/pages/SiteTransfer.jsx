import { motion } from 'framer-motion'
import { FiPlus, FiTruck, FiArrowRight, FiCalendar } from 'react-icons/fi'

const SiteTransfer = () => {
  const transfers = [
    {
      id: 1,
      material: 'Cement (50kg bags)',
      quantity: 100,
      from: 'Warehouse A',
      to: 'Site A',
      date: '2024-04-14',
      status: 'completed',
      transporter: 'Truck #1234',
    },
    {
      id: 2,
      material: 'Steel Bars (12mm)',
      quantity: 5,
      from: 'Warehouse B',
      to: 'Site B',
      date: '2024-04-15',
      status: 'in-transit',
      transporter: 'Truck #5678',
    },
    {
      id: 3,
      material: 'Bricks',
      quantity: 5000,
      from: 'Warehouse A',
      to: 'Site C',
      date: '2024-04-16',
      status: 'pending',
      transporter: 'Truck #9012',
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success'
      case 'in-transit':
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-secondary/10 text-secondary'
    }
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
          <h1 className="text-3xl font-bold text-dark mb-2">Site Transfer</h1>
          <p className="text-gray-500">Track material transfers between sites and warehouses</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {transfers.map((transfer, index) => (
          <motion.div
            key={transfer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-soft card-hover"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiTruck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-dark mb-2">{transfer.material}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-medium text-dark">{transfer.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">{transfer.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-dark">{transfer.from}</p>
                    <p className="text-xs text-gray-500">From</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-primary mx-2" />
                  <div>
                    <p className="text-sm font-medium text-dark">{transfer.to}</p>
                    <p className="text-xs text-gray-500">To</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Transporter</p>
                    <p className="text-sm font-medium text-dark">{transfer.transporter}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(transfer.status)}`}>
                    {transfer.status}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default SiteTransfer


import { motion } from 'framer-motion'
import { FiPlus, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PettyCash = () => {
  const transactions = [
    {
      id: 1,
      description: 'Site refreshments',
      amount: 500,
      category: 'Miscellaneous',
      date: '2024-04-14',
      type: 'expense',
    },
    {
      id: 2,
      description: 'Transportation charges',
      amount: 1200,
      category: 'Transport',
      date: '2024-04-13',
      type: 'expense',
    },
    {
      id: 3,
      description: 'Cash replenishment',
      amount: 10000,
      category: 'Replenishment',
      date: '2024-04-12',
      type: 'income',
    },
    {
      id: 4,
      description: 'Emergency supplies',
      amount: 800,
      category: 'Supplies',
      date: '2024-04-11',
      type: 'expense',
    },
  ]

  const expenseData = [
    { day: 'Mon', amount: 1200 },
    { day: 'Tue', amount: 1900 },
    { day: 'Wed', amount: 3000 },
    { day: 'Thu', amount: 2800 },
    { day: 'Fri', amount: 1890 },
  ]

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Petty Cash</h1>
          <p className="text-gray-500">Manage small cash transactions and expenses</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <FiTrendingUp className="w-8 h-8 text-success" />
            <span className="text-2xl font-bold text-dark">₹{totalIncome.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-500">Total Income</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <FiTrendingDown className="w-8 h-8 text-danger" />
            <span className="text-2xl font-bold text-dark">₹{totalExpenses.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-500">Total Expenses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <FiDollarSign className="w-8 h-8 text-primary" />
            <span className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
              ₹{balance.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-500">Current Balance</p>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <h2 className="text-xl font-bold text-dark mb-4">Weekly Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={expenseData}>
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
            <Line type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <h2 className="text-xl font-bold text-dark mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between p-4 border border-light rounded-xl hover:shadow-medium transition-shadow"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-dark mb-1">{transaction.description}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{transaction.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  transaction.type === 'income' ? 'text-success' : 'text-danger'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 capitalize">{transaction.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PettyCash


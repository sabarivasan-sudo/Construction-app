import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FiPlus, FiDollarSign, FiTrendingUp, FiTrendingDown, FiX, FiCalendar,
  FiEdit2, FiTrash2, FiMoreVertical, FiBriefcase, FiTag, FiFileText
} from 'react-icons/fi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const PettyCash = () => {
  const [transactions, setTransactions] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deletingTransaction, setDeletingTransaction] = useState(null)
  const [expenseData, setExpenseData] = useState([])
  const [totals, setTotals] = useState({
    expenses: 0,
    income: 0,
    balance: 0
  })
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    project: '',
    amount: '',
    type: 'expense',
    category: 'miscellaneous',
    description: '',
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Fetch data
  useEffect(() => {
    fetchTransactions()
    fetchProjects()
    fetchWeeklyData()
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/petty-cash`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.data || [])
        setTotals(data.totals || { expenses: 0, income: 0, balance: 0 })
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch transactions' }))
        showToast(errorData.message || 'Failed to fetch transactions', 'error')
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      showToast('Error fetching transactions', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/projects`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchWeeklyData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/petty-cash/weekly`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExpenseData(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error)
    }
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const resetForm = () => {
    setFormData({
      project: '',
      amount: '',
      type: 'expense',
      category: 'miscellaneous',
      description: '',
      receiptNumber: '',
      date: new Date().toISOString().split('T')[0]
    })
    setEditingTransaction(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0
      }

      const url = editingTransaction 
        ? `${API_URL}/petty-cash/${editingTransaction._id || editingTransaction.id}`
        : `${API_URL}/petty-cash`
      
      const method = editingTransaction ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        showToast(
          editingTransaction ? 'Transaction updated successfully' : 'Transaction recorded successfully',
          'success'
        )
        setShowModal(false)
        resetForm()
        fetchTransactions()
        fetchWeeklyData()
      } else {
        showToast(data.message || 'Failed to save transaction', 'error')
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
      showToast('Error saving transaction', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (transaction) => {
    setOpenMenuId(null)
    setEditingTransaction(transaction)
    setFormData({
      project: typeof transaction.project === 'object' ? transaction.project._id : transaction.project || '',
      amount: transaction.amount?.toString() || '',
      type: transaction.type || 'expense',
      category: transaction.category || 'miscellaneous',
      description: transaction.description || '',
      receiptNumber: transaction.receiptNumber || '',
      date: transaction.date 
        ? new Date(transaction.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingTransaction) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/petty-cash/${deletingTransaction._id || deletingTransaction.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Transaction deleted successfully', 'success')
        setDeletingTransaction(null)
        fetchTransactions()
        fetchWeeklyData()
      } else {
        showToast(data.message || 'Failed to delete transaction', 'error')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      showToast('Error deleting transaction', 'error')
    }
  }

  const getCategoryName = (category) => {
    const categories = {
      transport: 'Transport',
      food: 'Food',
      supplies: 'Supplies',
      miscellaneous: 'Miscellaneous',
      other: 'Other'
    }
    return categories[category] || category
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Petty Cash</h1>
          <p className="text-gray-500">Manage small cash transactions and expenses</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
        >
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
            <FiTrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-dark">₹{totals.income.toLocaleString()}</span>
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
            <FiTrendingDown className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-dark">₹{totals.expenses.toLocaleString()}</span>
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
            <FiDollarSign className="w-8 h-8 text-[#6B4EFF]" />
            <span className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{totals.balance.toLocaleString()}
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
              formatter={(value) => `₹${value.toLocaleString()}`}
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
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => {
              const project = typeof transaction.project === 'object' ? transaction.project : null
              return (
                <motion.div
                  key={transaction._id || transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-medium transition-shadow relative group"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark mb-1">{transaction.description}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{getCategoryName(transaction.category)}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                      {project && (
                        <>
                          <span>•</span>
                          <span>{project.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{transaction.type}</p>
                    </div>
                    <div className="relative menu-container">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === (transaction._id || transaction.id) ? null : (transaction._id || transaction.id))}
                        className="p-2 rounded-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      {openMenuId === (transaction._id || transaction.id) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              handleEdit(transaction)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-dark hover:bg-gray-50 transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setDeletingTransaction(transaction)
                              setOpenMenuId(null)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Transaction Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-dark">
                      {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage small cash transactions and expenses</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Transaction Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'expense' })}
                          className={`px-4 py-3 rounded-xl border-2 transition-all ${
                            formData.type === 'expense'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <FiTrendingDown className="w-5 h-5 mx-auto mb-1" />
                          <span className="font-semibold">Expense</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'income' })}
                          className={`px-4 py-3 rounded-xl border-2 transition-all ${
                            formData.type === 'income'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <FiTrendingUp className="w-5 h-5 mx-auto mb-1" />
                          <span className="font-semibold">Income</span>
                        </button>
                      </div>
                    </div>

                    {/* Project */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        >
                          <option value="">Select Project</option>
                          {projects.map(project => (
                            <option key={project._id || project.id} value={project._id || project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Amount and Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        >
                          <option value="transport">Transport</option>
                          <option value="food">Food</option>
                          <option value="supplies">Supplies</option>
                          <option value="miscellaneous">Miscellaneous</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiFileText className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          placeholder="Enter transaction description..."
                          rows={3}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    {/* Receipt Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt Number
                      </label>
                      <input
                        type="text"
                        value={formData.receiptNumber}
                        onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                        placeholder="Optional receipt number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 rounded-xl bg-[#6B4EFF] text-white hover:bg-[#5a3fe6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {submitting ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingTransaction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setDeletingTransaction(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-dark mb-2">Delete Transaction</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setDeletingTransaction(null)}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <Toast toasts={toasts} removeToast={removeToast} />
      )}
    </div>
  )
}

export default PettyCash

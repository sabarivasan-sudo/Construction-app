import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from 'react-icons/fi'

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`min-w-[320px] max-w-md rounded-2xl shadow-2xl p-4 flex items-start gap-3 ${
              toast.type === 'success' ? 'bg-green-50 border border-green-200' :
              toast.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className={`flex-shrink-0 mt-0.5 ${
              toast.type === 'success' ? 'text-green-600' :
              toast.type === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {toast.type === 'success' && <FiCheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <FiXCircle className="w-5 h-5" />}
              {toast.type === 'info' && <FiAlertCircle className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                toast.type === 'success' ? 'text-green-800' :
                toast.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ${
                toast.type === 'success' ? 'hover:text-green-600' :
                toast.type === 'error' ? 'hover:text-red-600' :
                'hover:text-blue-600'
              }`}
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Toast


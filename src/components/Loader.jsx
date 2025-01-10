import React from 'react'
import { motion } from 'framer-motion'

const Loader = () => {
  return (
    <div>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
        >
            <motion.div
                className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-200 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
            ></motion.div>
            <motion.div
                className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-200 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            ></motion.div>
            <motion.div
                className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-200 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            ></motion.div>
        </motion.div>
    </div>
  )
}

export default Loader
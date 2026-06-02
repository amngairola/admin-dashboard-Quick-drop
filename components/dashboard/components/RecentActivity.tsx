'use client'

import { motion } from 'framer-motion'
import { Check, AlertCircle, Clock } from 'lucide-react'

interface Activity {
  id: string
  type: 'completed' | 'pending' | 'alert'
  title: string
  description: string
  time: string
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'completed',
    title: 'New booking',
    description: 'User@example.com',
    time: '2 min ago',
  },
  {
    id: '2',
    type: 'pending',
    title: 'Driver verification',
    description: 'John Doe - Pending',
    time: '15 min ago',
  },
  {
    id: '3',
    type: 'completed',
    title: 'Payment received',
    description: '$250.00 from booking',
    time: '45 min ago',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Low driver availability',
    description: 'Only 5 drivers online',
    time: '1 hour ago',
  },
]

export default function RecentActivity() {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest updates</p>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer group"
          >
            <div className="mt-1 flex-shrink-0 p-2 bg-secondary rounded-lg">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {activity.time}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ x: 4 }}
        className="w-full mt-4 py-2 text-sm font-medium text-accent hover:bg-secondary rounded-lg transition-colors"
      >
        View all activity →
      </motion.button>
    </div>
  )
}

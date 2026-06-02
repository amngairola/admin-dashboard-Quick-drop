'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: string
}

export default function StatsCard({ title, value, change, icon: Icon, color }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
      className="bg-card border border-border rounded-xl p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <h3 className="text-3xl font-bold mb-3">{value}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-accent">{change}</span>
            <TrendingUp className="w-3 h-3 text-accent" />
          </div>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

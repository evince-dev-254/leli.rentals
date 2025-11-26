import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    subtitle?: string
}

export default function StatsCard({ title, value, icon: Icon, trend, subtitle }: StatsCardProps) {
    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white mb-2">{value}</p>
                    {subtitle && (
                        <p className="text-white/60 text-xs">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`inline-flex items-center gap-1 text-xs font-medium mt-2 px-2 py-1 rounded-full ${trend.isPositive
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    )
}

"use client"

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CouponTimerProps {
    expiryDate: string | Date
    className?: string
}

interface TimeRemaining {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export function CouponTimer({ expiryDate, className = '' }: CouponTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date().getTime()
            const expiry = new Date(expiryDate).getTime()
            const difference = expiry - now

            if (difference <= 0) {
                setIsExpired(true)
                return null
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            return { days, hours, minutes, seconds }
        }

        // Initial calculation
        const initial = calculateTimeRemaining()
        setTimeRemaining(initial)

        // Update every second
        const interval = setInterval(() => {
            const time = calculateTimeRemaining()
            setTimeRemaining(time)
        }, 1000)

        return () => clearInterval(interval)
    }, [expiryDate])

    if (isExpired) {
        return (
            <div className={`flex items-center gap-2 text-red-600 font-semibold ${className}`}>
                <Clock className="h-4 w-4" />
                <span>Expired</span>
            </div>
        )
    }

    if (!timeRemaining) {
        return null
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="font-mono font-semibold text-orange-600">
                {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                {String(timeRemaining.hours).padStart(2, '0')}h{' '}
                {String(timeRemaining.minutes).padStart(2, '0')}m{' '}
                {String(timeRemaining.seconds).padStart(2, '0')}s
            </span>
        </div>
    )
}

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
    rating: number
    maxRating?: number
    size?: number
    interactive?: boolean
    onRatingChange?: (rating: number) => void
    className?: string
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 20,
    interactive = false,
    onRatingChange,
    className
}: StarRatingProps) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {Array.from({ length: maxRating }).map((_, index) => {
                const value = index + 1
                const isFilled = value <= rating

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onRatingChange?.(value)}
                        className={cn(
                            "transition-colors focus:outline-none",
                            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
                        )}
                    >
                        <Star
                            size={size}
                            className={cn(
                                "transition-all",
                                isFilled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-100 text-gray-300"
                            )}
                        />
                    </button>
                )
            })}
        </div>
    )
}

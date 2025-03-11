"use client"

import { useState, useEffect } from "react"
import { ClockIcon } from "lucide-react"

export function Clock() {
    const [time, setTime] = useState<string>("")

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const timeString = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            })
            setTime(timeString)
        }

        // Update immediately
        updateTime()

        // Update every second
        const interval = setInterval(updateTime, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md text-sm font-medium">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span>{time}</span>
        </div>
    )
}


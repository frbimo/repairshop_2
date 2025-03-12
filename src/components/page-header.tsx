import type React from "react"
import { Clock } from "@/components/clock"

interface PageHeaderProps {
    title: string
    children?: React.ReactNode
}

export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="flex items-center gap-4">
                {children}
                {/* <Clock /> */}
            </div>
        </div>
    )
}


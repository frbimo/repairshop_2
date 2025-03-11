import React from "react"

interface PageContainerProps {
    children: React.ReactNode
    className?: string
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
    return (
        <div className={`container py-8 px-6 ${className}`}>
            {children}
        </div>
    )
}

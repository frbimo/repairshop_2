"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth, type User, type rolePermissions } from "@/lib/auth"
import { Loader2 } from "lucide-react"

// Create context
type AuthContextType = {
    user: User | null
    isAdmin: boolean
    hasPermission: (permission: keyof typeof rolePermissions.admin) => boolean
    isLoading: boolean
    login: (email: string, password: string) => User | null
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize auth from localStorage
    useEffect(() => {
        auth.initFromStorage()
        const currentUser = auth.getCurrentUser()
        setUser(currentUser)
        setIsLoading(false)

        // Redirect to login if not authenticated and not already on login page
        if (!currentUser && pathname !== "/login") {
            router.push("/login")
        }
    }, [router, pathname])

    // Login function
    const login = (email: string, password: string) => {
        const user = auth.login(email)
        setUser(user)
        return user
    }

    // Logout function
    const logout = () => {
        auth.logout()
        setUser(null)
        router.push("/login")
    }

    // Check if current path requires specific permissions
    useEffect(() => {
        if (!isLoading && user) {
            // Check if trying to access admin-only pages
            if (pathname === "/admin/roles" && !auth.hasPermission("canManageRoles")) {
                router.push("/")
            }

            // Check if trying to access inventory management
            if (
                (pathname === "/inventory/search" || pathname === "/inventory//purchase/new") &&
                !auth.hasPermission("canManageInventory")
            ) {
                router.push("/")
            }

            // Check if trying to access analytics
            if (pathname === "/analytics" && !auth.hasPermission("canViewAnalytics")) {
                router.push("/")
            }
        }
    }, [pathname, user, isLoading, router])

    // Context value
    const value = {
        user,
        isAdmin: user?.role === "admin",
        hasPermission: (permission: keyof typeof rolePermissions.admin) => auth.hasPermission(permission),
        isLoading,
        login,
        logout,
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}


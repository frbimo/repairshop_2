"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
// import { auth, type User } from "@/lib/auth-controller"
import { auth, type User } from "@/lib/auth"
import { Loader2 } from "lucide-react"

// Create context
type AuthContextType = {
    user: User | null
    isAdmin: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<User | null>
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
        const currentUser = auth.getCurrentUser()
        setUser(
            currentUser
                ? {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    role: currentUser.role,
                    createdAt: new Date(),
                }
                : null,
        )
        setIsLoading(false)

        // Redirect to login if not authenticated and not already on login page
        if (!currentUser && pathname !== "/login") {
            router.push("/login")
        }
    }, [router, pathname])

    // // Login function if using db
    // const login = async (email: string, password: string) => {
    //     const user = await auth.login(email, password)
    //     setUser(user)
    //     return user
    // }

    // DEBUG MODE: Login function 
    const login = (email: string) => {
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

    // Check if current path requires admin role
    useEffect(() => {
        if (!isLoading && user) {
            // Check if trying to access admin-only pages
            if (pathname === "/admin/roles" && user.role !== "admin") {
                router.push("/customer")
            }
        }
    }, [pathname, user, isLoading, router])

    // Context value
    const value = {
        user,
        isAdmin: user?.role === "admin",
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


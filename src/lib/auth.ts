// Simple role-based authentication system
// In a real app, this would be connected to a database and proper authentication

// Types
export type Role = "admin" | "officer"

export type User = {
    id: string
    name: string
    email: string
    role: Role
    createdAt: Date
}

// Mock users database
let users: User[] = [
    {
        id: "user-1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        createdAt: new Date("2023-01-01"),
    },
    {
        id: "user-2",
        name: "Officer User",
        email: "officer@example.com",
        role: "officer",
        createdAt: new Date("2023-01-02"),
    },
]

// Current user (simulating authentication)
let currentUser: User | null = users[0] // Default to admin for development

// Auth functions
export const auth = {
    // Get current user
    getCurrentUser: () => {
        return currentUser
    },

    // Set current user (simulating login)
    login: (email: string) => {
        const user = users.find((u) => u.email === email)
        if (user) {
            currentUser = user
            // Store in localStorage to persist across page refreshes
            if (typeof window !== "undefined") {
                localStorage.setItem("currentUser", JSON.stringify(user))
            }
            return user
        }
        return null
    },

    // Logout
    logout: () => {
        currentUser = null
        if (typeof window !== "undefined") {
            localStorage.removeItem("currentUser")
        }
    },

    // Check if user has a specific role
    hasRole: (role: Role) => {
        return currentUser?.role === role
    },

    // Check if user is admin
    isAdmin: () => {
        return currentUser?.role === "admin"
    },

    // Get all users
    getUsers: () => {
        return [...users]
    },

    // Add user
    addUser: (user: Omit<User, "id" | "createdAt">) => {
        const newUser = {
            ...user,
            id: `user-${users.length + 1}`,
            createdAt: new Date(),
        }
        users.push(newUser)
        return newUser
    },

    // Update user
    updateUser: (id: string, data: Partial<Omit<User, "id" | "createdAt">>) => {
        const index = users.findIndex((u) => u.id === id)
        if (index !== -1) {
            users[index] = {
                ...users[index],
                ...data,
            }
            return users[index]
        }
        return null
    },

    // Delete user
    deleteUser: (id: string) => {
        const initialLength = users.length
        users = users.filter((u) => u.id !== id)
        return initialLength > users.length
    },

    // Initialize from localStorage (for client-side)
    initFromStorage: () => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("currentUser")
            if (storedUser) {
                try {
                    currentUser = JSON.parse(storedUser)
                } catch (e) {
                    console.error("Failed to parse stored user:", e)
                }
            }
        }
    },
}


// Role-based authentication system with separate accounts and roles

import { getRolePermissions } from "./role-definitions"

// Types
// export type Role = "admin" | "inventory_manager" | "service_technician" | "receptionist"

export enum Role {
    Admin = "admin",
    Officer = "officer",
    Technician = "service_technician",
    Manager = "inventory_manager",
    Receptionist = "receptionist"
}

export type User = {
    id: string
    name: string
    email: string
    role: Role
    createdAt: Date
}

// Role permissions mapping
export const rolePermissions = {
    admin: {
        canManageUsers: true,
        canManageRoles: true,
        canViewAnalytics: true,
        canManageInventory: true,
        canCreatePurchase: true,
        canManageService: true,
        canViewDashboard: true,
        canConvertEstimation: true,
    },
    inventory_manager: {
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: true,
        canManageInventory: true,
        canCreatePurchase: true,
        canManageService: false,
        canViewDashboard: true,
        canConvertEstimation: false,
    },
    service_technician: {
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: false,
        canManageInventory: false,
        canCreatePurchase: false,
        canManageService: true,
        canViewDashboard: true,
        canConvertEstimation: true,
    },
    receptionist: {
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: false,
        canManageInventory: false,
        canCreatePurchase: false,
        canManageService: true,
        canViewDashboard: false,
        canConvertEstimation: false,
    },
}

// Mock users database
let users: User[] = [
    {
        id: "user-1",
        name: "Admin User",
        email: "admin@example.com",
        role: Role.Admin,
        createdAt: new Date("2023-01-01"),
    },
    {
        id: "user-2",
        name: "Inventory Manager",
        email: "inventory@example.com",
        role: Role.Manager,
        createdAt: new Date("2023-01-02"),
    },
    {
        id: "user-3",
        name: "Service Technician",
        email: "service@example.com",
        role: Role.Technician,
        createdAt: new Date("2023-01-03"),
    },
    {
        id: "user-4",
        name: "Receptionist",
        email: "reception@example.com",
        role: Role.Receptionist,
        createdAt: new Date("2023-01-04"),
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

    // Check if user has a specific permission
    hasPermission: (permission: keyof typeof rolePermissions.admin) => {
        if (!currentUser) return false

        return getRolePermissions(currentUser.role) == permission
    },

    // Get all users
    getUsers: () => {
        return [...users]
    },

    // Get all available roles
    getRoles: (): Role[] => {
        return [Role.Admin, Role.Manager, Role.Officer, Role.Receptionist, Role.Technician]
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


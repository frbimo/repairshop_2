import { get, post, setAuth, clearAuth, getUser, type AuthUser, put, del } from "./api-client"

// Types
export type Role = "admin" | "officer"

export type User = {
    id: number
    name: string
    email: string
    role: Role
    createdAt: Date
}

export type LoginResponse = {
    user: AuthUser
    token: string
}

// Auth controller
export const auth = {
    // Get current user
    getCurrentUser: (): AuthUser | null => {
        return getUser()
    },

    // Login
    login: async (email: string, password: string): Promise<User | null> => {
        const response = await post<LoginResponse>("/auth/login", { email, password })

        if (response.success && response.data) {
            setAuth(response.data.token, response.data.user)
            return {
                ...response.data.user,
                createdAt: new Date(),
            }
        }

        return null
    },

    // Logout
    logout: (): void => {
        clearAuth()
    },

    // Check if user has a specific role
    hasRole: (role: Role): boolean => {
        const user = getUser()
        return user?.role === role
    },

    // Check if user is admin
    isAdmin: (): boolean => {
        const user = getUser()
        return user?.role === "admin"
    },

    // Get all users (admin only)
    getUsers: async (): Promise<User[]> => {
        const response = await get<User[]>("/users")
        return response.success && response.data ? response.data : []
    },

    // Add user (admin only)
    addUser: async (user: Omit<User, "id" | "createdAt">): Promise<User | null> => {
        const response = await post<User>("/users", user)
        return response.success && response.data ? response.data : null
    },

    // Update user (admin only)
    updateUser: async (id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> => {
        const response = await put<User>(`/users/${id}`, data)
        return response.success && response.data ? response.data : null
    },

    // Delete user (admin only)
    deleteUser: async (id: string): Promise<boolean> => {
        const response = await del<{ success: boolean }>(`/users/${id}`)
        return response.success
    },

    // Initialize from localStorage (for client-side)
    initFromStorage: (): void => {
        // This is handled automatically by getUser() in api-client.ts
    },
}


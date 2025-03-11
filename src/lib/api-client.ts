// Base API client for making authenticated requests to the backend

// API base URL - should be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Token storage keys
const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

// Types
export type ApiResponse<T> = {
    success: boolean
    data?: T
    error?: string
}

export type AuthUser = {
    id: number
    name: string
    email: string
    role: "admin" | "officer"
}

// Helper function to get stored token
export const getToken = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
}

// Helper function to get stored user
export const getUser = (): AuthUser | null => {
    if (typeof window === "undefined") return null
    const userJson = localStorage.getItem(USER_KEY)
    return userJson ? JSON.parse(userJson) : null
}

// Helper function to set auth data
export const setAuth = (token: string, user: AuthUser): void => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Helper function to clear auth data
export const clearAuth = (): void => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

// Check if we're using the mock database
const useMockDb = () => {
    return typeof window !== "undefined"
        ? window.process?.env?.NEXT_PUBLIC_USE_MOCK_DB === "true"
        : process.env.USE_MOCK_DB === "true"
}

// Base request function with authentication
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
)
    : Promise<ApiResponse<T>> => {
    try {
        const token = getToken()
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        })

        const data = await response.json()

        if (!response.ok) {
            // Handle unauthorized errors (expired token, etc.)
            if (response.status === 401 || response.status === 403) {
                clearAuth()
                // Redirect to login if we're in a browser context
                if (typeof window !== "undefined") {
                    window.location.href = "/login"
                }
            }

            return {
                success: false,
                error: data.error || `Request failed with status ${response.status}`,
            };
        }

        return {
            success: true,
            data: data as T,
        };
    } catch (error) {
        console.error("API request error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

// Shorthand methods for common HTTP verbs
export async function get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    // If using mock DB, return success with empty data
    // The actual mock data will be provided by the controller
    if (useMockDb()) {
        return {
            success: true,
            data: {} as T,
            message: "Mock data",
        }
    }

    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return apiRequest<T>(url, { method: "GET" })
}

export const post = <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
};

export const put = <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
};

export const del = <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
};


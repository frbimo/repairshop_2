import { get } from "./api-client"

// Mock data for analytics
const mockAnalyticsData = {
    overview: {
        totalRevenue: 125750.5,
        totalPurchases: 342,
        totalServices: 278,
        totalCustomers: 156,
        inventoryValue: 87500.25,
        inventoryItems: 423,
        revenueGrowth: 12.5,
        serviceGrowth: 8.3,
    },
    sales: {
        revenueByMonth: [
            { month: "Jan", revenue: 8250.75 },
            { month: "Feb", revenue: 9120.3 },
            { month: "Mar", revenue: 10540.8 },
            { month: "Apr", revenue: 9870.45 },
            { month: "May", revenue: 11250.6 },
            { month: "Jun", revenue: 12450.9 },
            { month: "Jul", revenue: 13750.25 },
            { month: "Aug", revenue: 12980.4 },
            { month: "Sep", revenue: 11870.35 },
            { month: "Oct", revenue: 10540.8 },
            { month: "Nov", revenue: 9120.3 },
            { month: "Dec", revenue: 8250.75 },
        ],
        revenueByCategory: [
            { category: "Engine Parts", revenue: 42500.25 },
            { category: "Brake System", revenue: 28750.5 },
            { category: "Electrical", revenue: 18900.75 },
            { category: "Suspension", revenue: 15600.3 },
            { category: "Body Parts", revenue: 12000.45 },
            { category: "Other", revenue: 8000.25 },
        ],
        topSellingItems: [
            { name: "Brake Pads (Front)", sku: "BP-1001", quantity: 145, revenue: 8700.0 },
            { name: "Oil Filter", sku: "OF-2002", quantity: 210, revenue: 6300.0 },
            { name: "Spark Plugs", sku: "SP-3003", quantity: 180, revenue: 5400.0 },
            { name: "Air Filter", sku: "AF-4004", quantity: 160, revenue: 4800.0 },
            { name: "Timing Belt", sku: "TB-5005", quantity: 95, revenue: 4750.0 },
        ],
    },
    inventory: {
        stockByCategory: [
            { category: "Engine Parts", count: 120 },
            { category: "Brake System", count: 85 },
            { category: "Electrical", count: 75 },
            { category: "Suspension", count: 60 },
            { category: "Body Parts", count: 45 },
            { category: "Other", count: 38 },
        ],
        lowStockItems: [
            { name: "Brake Pads (Rear)", sku: "BP-1002", quantity: 5, reorderPoint: 15 },
            { name: "Alternator", sku: "AL-6006", quantity: 3, reorderPoint: 10 },
            { name: "Radiator", sku: "RD-7007", quantity: 4, reorderPoint: 8 },
            { name: "Fuel Pump", sku: "FP-8008", quantity: 2, reorderPoint: 5 },
            { name: "Shock Absorber", sku: "SA-9009", quantity: 6, reorderPoint: 12 },
            { name: "Clutch Kit", sku: "CK-1010", quantity: 3, reorderPoint: 7 },
        ],
        inventoryTurnover: 4.8,
        averageDaysInInventory: 52,
    },
    service: {
        servicesByType: [
            { type: "Regular Maintenance", count: 98 },
            { type: "Brake Service", count: 45 },
            { type: "Engine Repair", count: 35 },
            { type: "Electrical", count: 28 },
            { type: "Suspension", count: 22 },
            { type: "Other", count: 50 },
        ],
        servicesByMonth: [
            { month: "Jan", count: 18 },
            { month: "Feb", count: 20 },
            { month: "Mar", count: 24 },
            { month: "Apr", count: 22 },
            { month: "May", count: 26 },
            { month: "Jun", count: 28 },
            { month: "Jul", count: 32 },
            { month: "Aug", count: 30 },
            { month: "Sep", count: 27 },
            { month: "Oct", count: 24 },
            { month: "Nov", count: 20 },
            { month: "Dec", count: 18 },
        ],
        averageCompletionTime: 3.2,
        customerSatisfaction: 4.5,
    },
}

// Function to get analytics data
export async function getAnalytics(timeRange = "30days") {
    // Check if we're using the mock database
    const useMockDb = process.env.USE_MOCK_DB === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DB === "true"

    if (useMockDb) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Return mock data
        return mockAnalyticsData
    }

    // If not using mock DB, fetch from API
    try {
        const response = await get<any>("/analytics", { timeRange })
        return response.success && response.data ? response.data : mockAnalyticsData
    } catch (error) {
        console.error("Error fetching analytics data:", error)
        // Fallback to mock data if API fails
        return mockAnalyticsData
    }
}

// Get sales data by year
export async function getSalesData(year?: string) {
    // Check if we're using the mock database
    const useMockDb = process.env.USE_MOCK_DB === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DB === "true"

    if (useMockDb) {
        return mockAnalyticsData.sales.revenueByMonth
    }

    try {
        const response = await get<any[]>("/analytics/sales", year ? { year } : undefined)
        return response.success && response.data ? response.data : []
    } catch (error) {
        console.error("Error fetching sales data:", error)
        return []
    }
}

// Get parts sales data
export async function getPartSales() {
    // Check if we're using the mock database
    const useMockDb = process.env.USE_MOCK_DB === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DB === "true"

    if (useMockDb) {
        return mockAnalyticsData.sales.topSellingItems
    }

    try {
        const response = await get<any[]>("/analytics/part-sales")
        return response.success && response.data ? response.data : []
    } catch (error) {
        console.error("Error fetching part sales data:", error)
        return []
    }
}

// Get service statistics
export async function getServiceStats() {
    // Check if we're using the mock database
    const useMockDb = process.env.USE_MOCK_DB === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DB === "true"

    if (useMockDb) {
        return mockAnalyticsData.service.servicesByType
    }

    try {
        const response = await get<any[]>("/analytics/service-stats")
        return response.success && response.data ? response.data : []
    } catch (error) {
        console.error("Error fetching service stats:", error)
        return []
    }
}

// Get inventory value by month
export async function getInventoryValueByMonth() {
    // Check if we're using the mock database
    const useMockDb = process.env.USE_MOCK_DB === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DB === "true"

    if (useMockDb) {
        // Generate mock inventory value data
        return [
            { month: "Jan", value: 75000 },
            { month: "Feb", value: 78500 },
            { month: "Mar", value: 82000 },
            { month: "Apr", value: 79500 },
            { month: "May", value: 83000 },
            { month: "Jun", value: 85500 },
            { month: "Jul", value: 87500 },
            { month: "Aug", value: 86000 },
            { month: "Sep", value: 84500 },
            { month: "Oct", value: 82000 },
            { month: "Nov", value: 80000 },
            { month: "Dec", value: 78000 },
        ]
    }

    try {
        const response = await get<any[]>("/analytics/inventory-value")
        return response.success && response.data ? response.data : []
    } catch (error) {
        console.error("Error fetching inventory value data:", error)
        return []
    }
}

// Get top selling parts
export async function getTopSellingParts(limit = 5) {
    // Check if we're using the mock database
    const useMockDb = process.env.USE_MOCK_DB === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DB === "true"

    if (useMockDb) {
        return mockAnalyticsData.sales.topSellingItems.slice(0, limit)
    }

    try {
        const response = await get<any[]>("/analytics/top-selling-parts", { limit: limit.toString() })
        return response.success && response.data ? response.data : []
    } catch (error) {
        console.error("Error fetching top selling parts:", error)
        return []
    }
}

// Get low stock parts
export async function getLowStockParts(threshold = 10) {
    // Check if we're using the mock database
    const useMockDb = process.env.USE_MOCK_DB === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DB === "true"

    if (useMockDb) {
        return mockAnalyticsData.inventory.lowStockItems
    }

    try {
        const response = await get<any[]>("/analytics/low-stock-parts", { threshold: threshold.toString() })
        return response.success && response.data ? response.data : []
    } catch (error) {
        console.error("Error fetching low stock parts:", error)
        return []
    }
}


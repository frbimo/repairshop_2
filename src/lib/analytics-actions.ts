"use server"

import { getAnalytics } from "./analytics-controller"

export async function getAnalyticsData(timeRange: string, startDate?: string, endDate?: string) {
    // Set environment variable for mock DB in server action
    process.env.USE_MOCK_DB = process.env.USE_MOCK_DB || "true"

    try {
        const analyticsData = await getAnalytics(timeRange)

        // Process the data for the frontend
        // This would normally filter by date range, but we're using mock data

        // Create a formatted response with all the data needed by the frontend
        return {
            overview: analyticsData.overview,
            revenueTrend: {
                labels: analyticsData.sales.revenueByMonth.map((item) => item.month),
                data: analyticsData.sales.revenueByMonth.map((item) => item.revenue),
            },
            serviceDistribution: {
                labels: analyticsData.service.servicesByType.map((item) => item.type),
                data: analyticsData.service.servicesByType.map((item) => item.count),
            },
            salesByCategory: {
                labels: analyticsData.sales.revenueByCategory.map((item) => item.category),
                data: analyticsData.sales.revenueByCategory.map((item) => item.revenue),
            },
            stockLevelTrend: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: [120, 125, 130, 128, 135, 140, 142, 138, 135, 130, 125, 120],
            },
            inventoryByCategory: {
                labels: analyticsData.inventory.stockByCategory.map((item) => item.category),
                data: analyticsData.inventory.stockByCategory.map((item) => item.count),
            },
            serviceTrend: {
                labels: analyticsData.service.servicesByMonth.map((item) => item.month),
                data: analyticsData.service.servicesByMonth.map((item) => item.count),
            },
            serviceStatusDistribution: {
                labels: ["Pending", "In Progress", "Completed"],
                data: [25, 35, 40],
            },
            sales: analyticsData.sales,
            inventory: analyticsData.inventory,
            services: {
                totalServices: analyticsData.overview.totalServices,
                averageValue: 350.75,
                completionRate: 85,
            },
            topServiceTypes: [
                { name: "Regular Maintenance", count: 98, averageDuration: 2.5, averageRevenue: 250.5 },
                { name: "Brake Service", count: 45, averageDuration: 3.2, averageRevenue: 450.75 },
                { name: "Engine Repair", count: 35, averageDuration: 5.5, averageRevenue: 850.25 },
                { name: "Electrical", count: 28, averageDuration: 4.0, averageRevenue: 350.0 },
                { name: "Suspension", count: 22, averageDuration: 4.8, averageRevenue: 550.5 },
            ],
            lowStockItems: analyticsData.inventory.lowStockItems,
            topSellingItems: analyticsData.sales.topSellingItems,
            recentTransactions: [
                {
                    date: new Date("2023-11-15"),
                    type: "purchase",
                    description: "Brake Pads Inventory",
                    status: "completed",
                    amount: 1250.5,
                },
                {
                    date: new Date("2023-11-14"),
                    type: "service",
                    description: "Engine Repair - Toyota Camry",
                    status: "completed",
                    amount: 850.75,
                },
                {
                    date: new Date("2023-11-13"),
                    type: "purchase",
                    description: "Oil Filters Bulk Order",
                    status: "pending",
                    amount: 750.25,
                },
                {
                    date: new Date("2023-11-12"),
                    type: "service",
                    description: "Brake Service - Honda Civic",
                    status: "in_progress",
                    amount: 450.0,
                },
                {
                    date: new Date("2023-11-11"),
                    type: "purchase",
                    description: "Spark Plugs Inventory",
                    status: "completed",
                    amount: 550.5,
                },
                {
                    date: new Date("2023-11-10"),
                    type: "service",
                    description: "Regular Maintenance - Ford F-150",
                    status: "completed",
                    amount: 350.25,
                },
            ],
        }
    } catch (error) {
        console.error("Error in getAnalyticsData:", error)
        return null
    }
}


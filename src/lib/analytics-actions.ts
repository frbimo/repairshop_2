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
        interface RevenueTrend {
            labels: string[];
            data: number[];
        }

        interface ServiceDistribution {
            labels: string[];
            data: number[];
        }

        interface SalesByCategory {
            labels: string[];
            data: number[];
        }

        interface StockLevelTrend {
            labels: string[];
            data: number[];
        }

        interface InventoryByCategory {
            labels: string[];
            data: number[];
        }

        interface ServiceTrend {
            labels: string[];
            data: number[];
        }

        interface ServiceStatusDistribution {
            labels: string[];
            data: number[];
        }

        interface TopServiceType {
            name: string;
            count: number;
            averageDuration: number;
            averageRevenue: number;
        }

        interface RecentTransaction {
            date: Date;
            type: string;
            description: string;
            status: string;
            amount: number;
        }

        interface AnalyticsData {
            overview: any;
            revenueTrend: RevenueTrend;
            serviceDistribution: ServiceDistribution;
            salesByCategory: SalesByCategory;
            stockLevelTrend: StockLevelTrend;
            inventoryByCategory: InventoryByCategory;
            serviceTrend: ServiceTrend;
            serviceStatusDistribution: ServiceStatusDistribution;
            sales: any;
            inventory: any;
            services: {
                totalServices: number;
                averageValue: number;
                completionRate: number;
            };
            topServiceTypes: TopServiceType[];
            lowStockItems: any;
            topSellingItems: any;
            recentTransactions: RecentTransaction[];
        }

        const response: AnalyticsData = {
            overview: analyticsData.overview,
            revenueTrend: {
                labels: analyticsData.sales.revenueByMonth.map((item: { month: string; }) => item.month),
                data: analyticsData.sales.revenueByMonth.map((item: { revenue: number; }) => item.revenue),
            },
            serviceDistribution: {
                labels: analyticsData.service.servicesByType.map((item: { type: string; }) => item.type),
                data: analyticsData.service.servicesByType.map((item: { count: number; }) => item.count),
            },
            salesByCategory: {
                labels: analyticsData.sales.revenueByCategory.map((item: { category: string; }) => item.category),
                data: analyticsData.sales.revenueByCategory.map((item: { revenue: number; }) => item.revenue),
            },
            stockLevelTrend: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: [120, 125, 130, 128, 135, 140, 142, 138, 135, 130, 125, 120],
            },
            inventoryByCategory: {
                labels: analyticsData.inventory.stockByCategory.map((item: { category: string; }) => item.category),
                data: analyticsData.inventory.stockByCategory.map((item: { count: number; }) => item.count),
            },
            serviceTrend: {
                labels: analyticsData.service.servicesByMonth.map((item: { month: string; }) => item.month),
                data: analyticsData.service.servicesByMonth.map((item: { count: number; }) => item.count),
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

        return response
    } catch (error) {
        console.error("Error in getAnalyticsData:", error)
        return null
    }
}


"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import type { z } from "zod"

// Type definitions
export type CompatibilityCar = {
    brand: string
    model: string
    year: number
}

export type SparePartItem = {
    id: string
    sku: string
    name: string
    price: number
    stock: number
    compatibilityCars: CompatibilityCar[]
    createdAt: Date
}

export type PurchaseReceipt = {
    id: string
    invoice: string
    retailName: string
    itemIds: string[]
    createdAt: Date
}

// Server actions
export async function createPurchaseReceipt(data: z.infer<any>) {
    try {
        // Create spare part items first
        const createdItemIds: string[] = []

        for (const item of data.items) {
            // Validate each car compatibility entry for this item
            for (const car of item.compatibilityCars) {
                const isValidBrand = await db.car.isValidBrand(car.brand)
                if (!isValidBrand) {
                    return {
                        success: false,
                        error: `Invalid brand: ${car.brand}`,
                    }
                }

                const isValidModel = await db.car.isValidModel(car.brand, car.model)
                if (!isValidModel) {
                    return {
                        success: false,
                        error: `Invalid model: ${car.model} for brand: ${car.brand}`,
                    }
                }
            }

            // Create the spare part item
            const newItem = await db.sparePartItem.create({
                data: {
                    sku: item.sku,
                    name: item.name,
                    price: item.price,
                    stock: item.stock,
                    compatibilityCars: item.compatibilityCars,
                },
            })

            createdItemIds.push(newItem.id)
        }

        // Create the purchase receipt with references to the items
        await db.purchaseReceipt.create({
            data: {
                invoice: data.invoice,
                retailName: data.retailName,
                itemIds: createdItemIds,
            },
        })

        revalidatePath("/dashboard")
        revalidatePath("/inventory/manage")
        return { success: true }
    } catch (error) {
        console.error("Failed to create purchase receipt:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create purchase receipt",
        }
    }
}

export async function getDashboardStats() {
    try {
        const totalCost = await getTotalCostByPeriod("monthly")
        const totalInventoryCost = await getTotalInventoryCost("monthly")
        const agingStock = await getAgingStock(12)

        return {
            totalCost,
            totalInventoryCost,
            agingStock,
        }
    } catch (error) {
        console.error("Failed to get dashboard stats:", error)
        return {
            totalCost: 0,
            totalInventoryCost: 0,
            agingStock: [],
        }
    }
}

export async function getTotalCostByPeriod(period: "daily" | "monthly" | "yearly") {
    try {
        // Get all receipts for the period
        const receipts = await db.purchaseReceipt.findMany({
            where: {
                createdAt: getPeriodDateFilter(period),
            },
            include: {
                items: true,
            },
        })

        // Calculate total cost
        let total = 0
        for (const receipt of receipts) {
            for (const item of receipt.items) {
                total += item.price * item.stock
            }
        }

        return total
    } catch (error) {
        console.error("Failed to get total cost:", error)
        return 0
    }
}

export async function getTotalInventoryCost(period: "daily" | "monthly" | "yearly") {
    try {
        // Get all spare part items
        const items = await db.sparePartItem.findMany()

        // Calculate total inventory cost
        let total = 0
        for (const item of items) {
            total += item.price * item.stock
        }

        return total
    } catch (error) {
        console.error("Failed to get total inventory cost:", error)
        return 0
    }
}

// Add this function to generate fake aging stock data
export async function getAgingStock(months: number) {
    try {
        // Generate fake aging stock data
        const agingItems = [
            {
                id: "aging-1",
                invoice: "INV-1001",
                retailName: "AutoZone",
                price: 45.99,
                stock: 8,
                createdAt: new Date(new Date().setMonth(new Date().getMonth() - 14)),
                compatibilityCars: [
                    { brand: "Toyota", model: "Corolla", year: 2018 },
                    { brand: "Honda", model: "Civic", year: 2019 },
                ],
            },
            {
                id: "aging-2",
                invoice: "INV-1002",
                retailName: "O'Reilly Auto Parts",
                price: 29.99,
                stock: 12,
                createdAt: new Date(new Date().setMonth(new Date().getMonth() - 12)),
                compatibilityCars: [
                    { brand: "Ford", model: "F-150", year: 2017 },
                    { brand: "Chevrolet", model: "Silverado", year: 2018 },
                ],
            },
            {
                id: "aging-3",
                invoice: "INV-1003",
                retailName: "NAPA Auto Parts",
                price: 89.99,
                stock: 5,
                createdAt: new Date(new Date().setMonth(new Date().getMonth() - 10)),
                compatibilityCars: [
                    { brand: "BMW", model: "3 Series", year: 2019 },
                    { brand: "Mercedes", model: "C-Class", year: 2020 },
                ],
            },
            {
                id: "aging-4",
                invoice: "INV-1004",
                retailName: "Advance Auto Parts",
                price: 19.99,
                stock: 15,
                createdAt: new Date(new Date().setMonth(new Date().getMonth() - 8)),
                compatibilityCars: [
                    { brand: "Nissan", model: "Altima", year: 2018 },
                    { brand: "Toyota", model: "Camry", year: 2019 },
                ],
            },
            {
                id: "aging-5",
                invoice: "INV-1005",
                retailName: "AutoZone",
                price: 129.99,
                stock: 3,
                createdAt: new Date(new Date().setMonth(new Date().getMonth() - 7)),
                compatibilityCars: [
                    { brand: "Honda", model: "Accord", year: 2020 },
                    { brand: "Toyota", model: "RAV4", year: 2019 },
                ],
            },
        ]

        // Filter items by age
        const filteredItems = agingItems.filter((item) => {
            const itemDate = new Date(item.createdAt)
            const thresholdDate = new Date()
            thresholdDate.setMonth(thresholdDate.getMonth() - months)
            return itemDate < thresholdDate
        })

        return filteredItems
    } catch (error) {
        console.error("Failed to get aging stock:", error)
        return []
    }
}

export async function getStockById(id: string) {
    try {
        // In a real app, this would query the database for a specific stock item
        const item = await db.sparePartItem.findById(id)
        return item
    } catch (error) {
        console.error("Failed to get stock by ID:", error)
        return null
    }
}

// Helper function to get date filter based on period
function getPeriodDateFilter(period: "daily" | "monthly" | "yearly") {
    const date = new Date()

    switch (period) {
        case "daily":
            date.setHours(0, 0, 0, 0)
            return { gte: date }
        case "monthly":
            date.setDate(1)
            date.setHours(0, 0, 0, 0)
            return { gte: date }
        case "yearly":
            date.setMonth(0, 1)
            date.setHours(0, 0, 0, 0)
            return { gte: date }
    }
}

// Car data actions
export async function getCarBrands() {
    return await db.car.getBrands()
}

export async function getCarModelsByBrand(brand: string) {
    return await db.car.getModelsByBrand(brand)
}

export async function validateCarBrand(brand: string) {
    return await db.car.isValidBrand(brand)
}

export async function validateCarModel(brand: string, model: string) {
    return await db.car.isValidModel(brand, model)
}

// Analytics data actions
export async function getInventoryValueByCategory() {
    try {
        const items = await db.sparePartItem.findMany()

        // Group items by category (using first word of name as category)
        const categories: Record<string, { count: number; value: number }> = {}

        for (const item of items) {
            const category = item.name.split(" ")[0]
            if (!categories[category]) {
                categories[category] = { count: 0, value: 0 }
            }

            categories[category].count += 1
            categories[category].value += item.price * item.stock
        }

        return Object.entries(categories).map(([name, data]) => ({
            name,
            count: data.count,
            value: data.value,
        }))
    } catch (error) {
        console.error("Failed to get inventory value by category:", error)
        return []
    }
}

export async function getInventoryTrends() {
    try {
        // Get all purchase receipts
        const receipts = await db.purchaseReceipt.findMany({
            include: {
                items: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        })

        // Group by month
        const monthlyData: Record<string, { month: string; count: number; value: number }> = {}

        for (const receipt of receipts) {
            const date = receipt.createdAt
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            const monthLabel = date.toLocaleString("default", { month: "short", year: "numeric" })

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthLabel, count: 0, value: 0 }
            }

            for (const item of receipt.items) {
                monthlyData[monthKey].count += 1
                monthlyData[monthKey].value += item.price * item.stock
            }
        }

        return Object.values(monthlyData)
    } catch (error) {
        console.error("Failed to get inventory trends:", error)
        return []
    }
}

export async function getTopSellingItems() {
    try {
        // In a real app, this would query sales data
        // For this mock, we'll use the stock level as a proxy for popularity (lower stock = more sales)
        const items = await db.sparePartItem.findMany()

        // Sort by stock (ascending) and take top 10
        return items
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 10)
            .map((item) => ({
                name: item.name,
                sku: item.sku,
                stock: item.stock,
                value: item.price * item.stock,
            }))
    } catch (error) {
        console.error("Failed to get top selling items:", error)
        return []
    }
}

export async function getCompatibilityStats() {
    try {
        const items = await db.sparePartItem.findMany()

        // Count items by car brand
        const brandStats: Record<string, number> = {}

        for (const item of items) {
            for (const car of item.compatibilityCars) {
                if (!brandStats[car.brand]) {
                    brandStats[car.brand] = 0
                }

                brandStats[car.brand] += 1
            }
        }

        return Object.entries(brandStats)
            .map(([brand, count]) => ({ brand, count }))
            .sort((a, b) => b.count - a.count)
    } catch (error) {
        console.error("Failed to get compatibility stats:", error)
        return []
    }
}

// Add this new server action to fetch existing spare part items
export async function getExistingSparePartItems() {
    try {
        const items = await db.sparePartItem.findMany()

        // Return only the necessary fields for recommendations
        return items.map((item) => ({
            sku: item.sku,
            name: item.name,
        }))
    } catch (error) {
        console.error("Failed to get existing spare part items:", error)
        return []
    }
}


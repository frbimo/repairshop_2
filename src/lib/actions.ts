"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import type { z } from "zod"

// Type definitions
export type CompatibilityCar = {
    brand: string
    model: string
    yearFrom: number
    yearTo: number
}

export type PurchaseReceipt = {
    id: string
    invoiceNumber: string
    vendorName: string
    purchaseDate: string
    notes?: string
    items: PurchaseItem[]
}

export type PurchaseItem = {
    sku: string
    name: string
    description?: string
    quantity: number
    unitPrice: number
    compatibilityCars?: CompatibilityCar[]
}

// Server actions
export async function createPurchaseReceipt(data: z.infer<any>) {
    try {
        // In a real app, this would save to a database
        await db.purchaseReceipt.create({
            data: {
                ...data,
                createdAt: new Date(),
            },
        })

        revalidatePath("/dashboard")
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
        // In a real app, this would query the database
        // For now, return fake data based on the period
        const receipts = await db.purchaseReceipt.findMany({
            where: {
                createdAt: getPeriodDateFilter(period),
            },
        })

        return receipts.reduce((total, receipt) => total + (receipt as any).price, 0)
    } catch (error) {
        console.error("Failed to get total cost:", error)
        return 0
    }
}

export async function getTotalInventoryCost(period: "daily" | "monthly" | "yearly") {
    try {
        // In a real app, this would query the database
        // For now, return fake data based on the period
        const receipts = await db.purchaseReceipt.findMany({
            where: {
                createdAt: getPeriodDateFilter(period),
            },
        })

        return receipts.reduce((total, receipt) => total + (receipt as any).price * (receipt as any).stock, 0)
    } catch (error) {
        console.error("Failed to get total inventory cost:", error)
        return 0
    }
}

export async function getAgingStock(months: number) {
    try {
        // Calculate the date that is 'months' ago from now
        const date = new Date()
        date.setMonth(date.getMonth() - months)

        // Get all receipts older than the specified months
        const receipts = await db.purchaseReceipt.findMany({
            where: {
                createdAt: {
                    lt: date, // Less than (older than) the calculated date
                },
            },
            orderBy: {
                createdAt: "asc", // Oldest first
            },
        })

        return receipts
    } catch (error) {
        console.error("Failed to get aging stock:", error)
        return []
    }
}

export async function getStockById(id: string) {
    try {
        // In a real app, this would query the database for a specific stock item
        const stock = await db.purchaseReceipt.findById(id)
        return stock
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

export async function getExistingParts() {
    try {
        // In a real app, this would query the database for existing parts
        const parts = await db.purchaseReceipt.findMany()
        return parts.map((part) => ({ sku: part.invoiceNumber, name: part.vendorName }))
    } catch (error) {
        console.error("Failed to get existing parts:", error)
        return []
    }
}


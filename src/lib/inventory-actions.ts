"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"

export async function getAllInventoryItems() {
    try {
        const items = await db.purchaseReceipt.findMany()
        return items
    } catch (error) {
        console.error("Failed to get inventory items:", error)
        return []
    }
}

export async function searchInventoryItems(searchType: string, searchTerm: string) {
    try {
        const items = await db.purchaseReceipt.findMany()

        // Filter items based on search type and term
        return items.filter((item) => {
            switch (searchType) {
                case "sku":
                    return item.invoice.toLowerCase().includes(searchTerm.toLowerCase())
                case "name":
                    // For demo purposes, we'll just check if any car brand or model contains the search term
                    return item.compatibilityCars.some(
                        (car) =>
                            car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            car.model.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                case "retailName":
                    return item.retailName.toLowerCase().includes(searchTerm.toLowerCase())
                default:
                    return true
            }
        })
    } catch (error) {
        console.error("Failed to search inventory items:", error)
        return []
    }
}

export async function updateInventoryItem(data: any) {
    try {
        const { id, ...updateData } = data

        // Update the item in the database
        const updatedItem = await db.purchaseReceipt.update(id, updateData)

        if (!updatedItem) {
            return {
                success: false,
                error: "Item not found",
            }
        }

        revalidatePath("/inventory/search")
        revalidatePath("/dashboard")

        return {
            success: true,
            item: updatedItem,
        }
    } catch (error) {
        console.error("Failed to update inventory item:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update inventory item",
        }
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        // Delete the item from the database
        const success = await db.purchaseReceipt.delete(id)

        if (!success) {
            return {
                success: false,
                error: "Item not found",
            }
        }

        revalidatePath("/inventory/search")
        revalidatePath("/dashboard")

        return {
            success: true,
        }
    } catch (error) {
        console.error("Failed to delete inventory item:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete inventory item",
        }
    }
}

export async function createPurchaseReceipt(data: any) {
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


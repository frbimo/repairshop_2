"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"

export async function getAllInventoryItems() {
    try {
        const detailReceipt = await db.purchaseReceipt.findMany()
        // Add default values for missing properties
        return detailReceipt.map((purchaseItems) => ({
            ...purchaseItems,
            items: purchaseItems.items.map((item) => ({ // Iterate over the nested 'items' array
                ...item,
                price: item.price || Math.floor(Math.random() * 100) + 10, // Random price between 10 and 110
                stock: item.stock || Math.floor(Math.random() * 20) + 1, // Random stock between 1 and 20
                compatibilityCars: item.compatibilityCars || [
                    {
                        brand: "Toyota",
                        model: "Corolla",
                        year: 2020,
                    },
                    {
                        brand: "Honda",
                        model: "Civic",
                        year: 2019,
                    },
                ],
            })),
        }))
    } catch (error) {
        console.error("Failed to get inventory items:", error)
        return []
    }
}

export async function searchInventoryItems(searchType: string, searchTerm: string) {
    try {
        const detailReceipt = await db.purchaseReceipt.findMany()

        // Add default values for missing properties
        const processedItems = detailReceipt.map((purchaseItems) => ({
            ...purchaseItems,
            items: purchaseItems.items.map((item) => ({ // Iterate over the nested 'items' array
                ...item,
                price: item.price || Math.floor(Math.random() * 100) + 10, // Random price between 10 and 110
                stock: item.stock || Math.floor(Math.random() * 20) + 1, // Random stock between 1 and 20
                compatibilityCars: item.compatibilityCars || [
                    {
                        brand: "Toyota",
                        model: "Corolla",
                        year: 2020,
                    },
                    {
                        brand: "Honda",
                        model: "Civic",
                        year: 2019,
                    },
                ],
            })),
        }))
        // Filter items based on search type and term
        return processedItems.filter((item) => {
            switch (searchType) {
                case "sku":
                    return item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
                case "name":
                    // For demo purposes, we'll just check if any car brand or model contains the search term
                    return item.items.some((nestedItem) =>
                        nestedItem.compatibilityCars.some(
                            (car) =>
                                car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                car.model.toLowerCase().includes(searchTerm.toLowerCase()),
                        )
                    )
                case "retailName":
                    return item.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
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

        revalidatePath("/inventory/manage")
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

        revalidatePath("/inventory/manage")
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


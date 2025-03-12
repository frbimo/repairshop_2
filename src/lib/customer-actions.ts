"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import type { z } from "zod"

// Type definitions
export type Customer = {
    id: string
    name: string
    email: string
    phone: string
    address: string
    vehicles: Vehicle[]
}

export type Vehicle = {
    id: string
    customerId?: string
    make: string
    model: string
    year: number
    licensePlate: string
    color: string
    vin?: string
    mileage: number
}

export type ServiceType = {
    name: string
    description?: string
}

export type Part = {
    id: string
    name: string
    price: number
    stock: number
    quantity?: number
}

export type Service = {
    id: string
    customerId: string
    vehicleId: string
    description: string
    estimatedCompletionDate: Date
    status: "pending" | "in_progress" | "completed"
    serviceTypes: ServiceType[]
    parts: Part[]
    isWorkOrder: boolean
    estimationId?: string
    workOrderId?: string
    createdAt: Date
    updatedAt: Date
}

export type ServicePart = {
    id: string
    serviceId: string
    partId: string
    quantity: number
}

// Server actions
export async function getCustomers() {
    try {
        return await db.customer.findMany()
    } catch (error) {
        console.error("Failed to get customers:", error)
        return []
    }
}

export async function getCustomerById(id: string) {
    try {
        console.log("getCustomerById", id)
        return await db.customer.findById(id)
    } catch (error) {
        console.error(`Failed to get customer with ID ${id}:`, error)
        return null
    }
}

export async function updateCustomerDetails(id: string, data: z.infer<any>) {
    try {
        const updatedCustomer = await db.customer.update(id, data)

        if (!updatedCustomer) {
            return {
                success: false,
                error: "Customer not found",
            }
        }

        revalidatePath("/services")
        return {
            success: true,
            customerId: updatedCustomer.id,
        }
    } catch (error) {
        console.error("Failed to update customer details:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update customer details",
        }
    }
}

export async function saveCustomerDetails(data: z.infer<any>) {
    try {
        const customer = await db.customer.create({
            data,
        })

        revalidatePath("/services")
        return {
            success: true,
            customerId: customer.id,
        }
    } catch (error) {
        console.error("Failed to save customer details:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to save customer details",
        }
    }
}

export async function saveVehicleDetails(customerId: string, data: z.infer<any>) {
    try {
        const vehicle = await db.vehicle.create({
            data: {
                ...data,
                customerId,
            },
        })

        revalidatePath("/services")
        return {
            success: true,
            vehicleId: vehicle.id,
        }
    } catch (error) {
        console.error("Failed to save vehicle details:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to save vehicle details",
        }
    }
}

export async function saveServiceDetails(customerId: string, vehicleId: string, data: z.infer<any>) {
    try {
        // Generate an estimation ID
        const estimationId = `EST-${Date.now().toString().slice(-5)}`

        const service = await db.service.create({
            data: {
                customerId,
                vehicleId,
                description: data.description,
                serviceTypes: data.serviceTypes,
                parts: data.parts.map((part: any) => {
                    const partData = db.part.findById(part.partId)
                    return {
                        id: part.partId,
                        name: partData ? partData.name : "Unknown Part",
                        price: partData ? partData.price : 0,
                        quantity: part.quantity,
                    }
                }),
                estimatedCompletionDate: new Date(data.estimatedCompletionDate),
                status: "pending",
                isWorkOrder: false,
                estimationId: estimationId,
            },
        })

        // Update inventory (reduce stock)
        for (const part of data.parts) {
            await db.part.updateStock(part.partId, -part.quantity)
        }

        revalidatePath("/services")
        revalidatePath("/services/estimations")
        return { success: true }
    } catch (error) {
        console.error("Failed to save service details:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to save service details",
        }
    }
}

export async function updateServiceDetails(serviceId: string, data: z.infer<any>) {
    try {
        // Get the current service to compare parts
        const currentService = await db.service.findById(serviceId, {
            include: {
                parts: true,
            },
        })

        if (!currentService) {
            return {
                success: false,
                error: "Service not found",
            }
        }

        // Update the service
        await db.service.update({
            id: serviceId,
            data: {
                description: data.description,
                serviceTypes: data.serviceTypes,
                estimatedCompletionDate: new Date(data.estimatedCompletionDate),
                status: data.status,
            },
        })

        // Handle parts updates
        // 1. First, return all current parts to inventory
        for (const part of currentService.parts) {
            await db.part.updateStock(part.id, part.quantity)
        }

        // 2. Update with new parts
        const updatedParts = data.parts.map((part: any) => {
            const partData = db.part.findById(part.partId)
            return {
                id: part.partId,
                name: partData ? partData.name : "Unknown Part",
                price: partData ? partData.price : 0,
                quantity: part.quantity,
            }
        })

        // 3. Update the service with new parts
        await db.service.update({
            id: serviceId,
            data: {
                parts: updatedParts,
            },
        })

        // 4. Update inventory (reduce stock for new parts)
        for (const part of data.parts) {
            await db.part.updateStock(part.partId, -part.quantity)
        }

        revalidatePath("/services")
        revalidatePath(`/services/${serviceId}`)
        revalidatePath("/services/estimations")
        revalidatePath("/services/workorders")

        return { success: true }
    } catch (error) {
        console.error("Failed to update service details:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update service details",
        }
    }
}

export async function getServiceDetails(serviceId: string) {
    try {
        return await db.service.findById(serviceId, {
            include: {
                customer: true,
                vehicle: true,
            },
        })
    } catch (error) {
        console.error("Failed to get service details:", error)
        return null
    }
}

export async function getCustomerAndVehicleDetails(customerId: string, vehicleId: string) {
    try {
        const customer = await db.customer.findById(customerId)
        const vehicle = await db.vehicle.findById(vehicleId)
        console.log("b.customer.", customerId)
        console.log("b.vehicle.", vehicleId)
        console.log("b.customer.findById", customer)
        console.log("b.vehicle.findById", vehicle)
        return { customer, vehicle }
    } catch (error) {
        console.error("Failed to get customer and vehicle details:", error)
        return { customer: null, vehicle: null }
    }
}

export async function getAvailableParts() {
    try {
        return await db.part.findMany({
            where: {
                stock: {
                    gt: 0,
                },
            },
        })
    } catch (error) {
        console.error("Failed to get available parts:", error)
        return []
    }
}

export async function getEstimations() {
    try {
        return await db.service.findMany({
            where: {
                isWorkOrder: false,
            },
            include: {
                customer: true,
                vehicle: true,
            },
        })
    } catch (error) {
        console.error("Failed to get estimations:", error)
        return []
    }
}

export async function getWorkOrders() {
    try {
        return await db.service.findMany({
            where: {
                isWorkOrder: true,
            },
            include: {
                customer: true,
                vehicle: true,
            },
        })
    } catch (error) {
        console.error("Failed to get work orders:", error)
        return []
    }
}

export async function convertToWorkOrder(serviceId: string) {
    try {
        const result = await db.service.convertToWorkOrder(serviceId)

        if (!result) {
            return {
                success: false,
                error: "Service not found or already a work order",
            }
        }

        revalidatePath("/services")
        revalidatePath("/services/estimations")
        revalidatePath("/services/workorders")

        return result
    } catch (error) {
        console.error("Failed to convert to work order:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to convert to work order",
        }
    }
}


"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { generateRandomId } from "@/lib/qr-utils"

// Type definitions
export type Customer = {
    id: string
    name: string
    email: string
    phone: string
    address: string
    createdAt: Date
}

export type Vehicle = {
    id: string
    customerId: string
    make: string
    model: string
    year: number
    licensePlate: string
    color: string
    vin?: string
    mileage: number
    createdAt: Date
}

export type ServiceType = {
    name: string
    description?: string
}

export type Service = {
    id: string
    customerId: string
    vehicleId: string
    description: string
    estimatedCompletionDate: Date
    status: "pending" | "in_progress" | "completed"
    serviceTypes: ServiceType[]
    parts: ServicePart[]
    createdAt: Date
    estimationId?: string
    workOrderId?: string
    isWorkOrder?: boolean
}

export type ServicePart = {
    id: string
    serviceId: string
    partId: string
    quantity: number
}

export type Part = {
    id: string
    name: string
    price: number
    stock: number
}

// Server actions
export async function saveCustomerDetails(data: any) {
    try {
        const customer = await db.customer.create({
            data: {
                ...data,
                createdAt: new Date(),
            },
        })

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

export async function saveVehicleDetails(customerId: string, data: any) {
    try {
        const vehicle = await db.vehicle.create({
            data: {
                ...data,
                customerId,
                createdAt: new Date(),
            },
        })

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

export async function saveServiceDetails(customerId: string, vehicleId: string, data: any) {
    try {
        // Generate an estimation ID
        const estimationId = generateRandomId("EST")

        const service = await db.service.create({
            data: {
                customerId,
                vehicleId,
                description: data.description,
                serviceTypes: data.serviceTypes,
                estimatedCompletionDate: new Date(data.estimatedCompletionDate),
                status: "pending",
                createdAt: new Date(),
                estimationId: estimationId,
                isWorkOrder: false,
            },
        })

        // Add parts to the service
        if (data.parts && data.parts.length > 0) {
            for (const part of data.parts) {
                await db.servicePart.create({
                    data: {
                        serviceId: service.id,
                        partId: part.partId,
                        quantity: part.quantity,
                    },
                })

                // Update inventory (reduce stock)
                await db.part.updateStock(part.partId, -part.quantity)
            }
        }

        revalidatePath("/customer")
        return { success: true }
    } catch (error) {
        console.error("Failed to save service details:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to save service details",
        }
    }
}

export async function updateServiceDetails(serviceId: string, data: any) {
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

        // 2. Remove all current parts
        await db.servicePart.deleteByServiceId(serviceId)

        // 3. Add new parts
        if (data.parts && data.parts.length > 0) {
            for (const part of data.parts) {
                await db.servicePart.create({
                    data: {
                        serviceId: serviceId,
                        partId: part.partId,
                        quantity: part.quantity,
                    },
                })

                // Update inventory (reduce stock)
                await db.part.updateStock(part.partId, -part.quantity)
            }
        }

        revalidatePath("/customer")
        revalidatePath(`/customer/${serviceId}`)

        return { success: true }
    } catch (error) {
        console.error("Failed to update service details:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update service details",
        }
    }
}

export async function getServicesInProgress() {
    try {
        const services = await db.service.findMany({
            include: {
                customer: true,
                vehicle: true,
            },
        })

        return services
    } catch (error) {
        console.error("Failed to get services in progress:", error)
        return []
    }
}

export async function getEstimations() {
    try {
        const services = await db.service.findMany({
            where: {
                isWorkOrder: false,
            },
            include: {
                customer: true,
                vehicle: true,
            },
        })

        return services
    } catch (error) {
        console.error("Failed to get estimations:", error)
        return []
    }
}

export async function getWorkOrders() {
    try {
        const services = await db.service.findMany({
            where: {
                isWorkOrder: true,
            },
            include: {
                customer: true,
                vehicle: true,
            },
        })

        return services
    } catch (error) {
        console.error("Failed to get work orders:", error)
        return []
    }
}

export async function convertToWorkOrder(serviceId: string) {
    try {
        // Get the current service
        const service = await db.service.findById(serviceId, {
            include: {
                customer: true,
                vehicle: true,
                parts: true,
            },
        })

        if (!service) {
            return {
                success: false,
                error: "Service not found",
            }
        }

        // Generate a work order ID
        const workOrderId = generateRandomId("WO")

        // Update the service to be a work order
        await db.service.update({
            id: serviceId,
            data: {
                isWorkOrder: true,
                workOrderId: workOrderId,
                status: "in_progress", // Automatically set to in_progress when converted
            },
        })

        revalidatePath("/customer")
        return {
            success: true,
            workOrderId,
        }
    } catch (error) {
        console.error("Failed to convert to work order:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to convert to work order",
        }
    }
}

export async function getServiceDetails(id: string) {
    try {
        const service = await db.service.findById(id, {
            include: {
                customer: true,
                vehicle: true,
                parts: true,
            },
        })

        return service
    } catch (error) {
        console.error("Failed to get service details:", error)
        return null
    }
}

export async function getCustomerAndVehicleDetails(customerId: string, vehicleId: string) {
    try {
        const customer = await db.customer.findById(customerId)
        const vehicle = await db.vehicle.findById(vehicleId)

        return { customer, vehicle }
    } catch (error) {
        console.error("Failed to get customer and vehicle details:", error)
        return { customer: null, vehicle: null }
    }
}

export async function getAvailableParts() {
    try {
        const parts = await db.part.findMany({
            where: {
                stock: {
                    gt: 0,
                },
            },
        })

        return parts
    } catch (error) {
        console.error("Failed to get available parts:", error)
        return []
    }
}


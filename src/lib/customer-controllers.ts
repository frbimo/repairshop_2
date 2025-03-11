import { get, post, put } from "./api-client"

// Types
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
    name?: string
    price?: number
}

export type Part = {
    id: string
    name: string
    price: number
    stock: number
}

// Customer controller
export async function saveCustomerDetails(data: Omit<Customer, "id" | "createdAt">) {
    const response = await post<{ customerId: string }>("/customers", data)

    if (response.success && response.data) {
        return {
            success: true,
            customerId: response.data.customerId,
        }
    }

    return {
        success: false,
        error: response.error || "Failed to save customer details",
    }
}

export async function saveVehicleDetails(customerId: string, data: Omit<Vehicle, "id" | "customerId" | "createdAt">) {
    const response = await post<{ vehicleId: string }>("/vehicles", {
        ...data,
        customerId,
    })

    if (response.success && response.data) {
        return {
            success: true,
            vehicleId: response.data.vehicleId,
        }
    }

    return {
        success: false,
        error: response.error || "Failed to save vehicle details",
    }
}

export async function saveServiceDetails(
    customerId: string,
    vehicleId: string,
    data: {
        description: string
        estimatedCompletionDate: string
        serviceTypes: ServiceType[]
        parts: { partId: string; quantity: number }[]
    },
) {
    const response = await post<{ serviceId: string }>("/services", {
        customerId,
        vehicleId,
        ...data,
        isWorkOrder: false,
    })

    if (response.success) {
        return { success: true }
    }

    return {
        success: false,
        error: response.error || "Failed to save service details",
    }
}

export async function updateServiceDetails(serviceId: string, data: any) {
    const response = await put<{ message: string }>(`/services/${serviceId}`, data)

    if (response.success) {
        return { success: true }
    }

    return {
        success: false,
        error: response.error || "Failed to update service details",
    }
}

export async function getServicesInProgress() {
    const response = await get<Service[]>("/services", { status: "in_progress" })
    return response.success && response.data ? response.data : []
}

export async function getEstimations() {
    const response = await get<Service[]>("/services", { type: "estimation" })
    return response.success && response.data ? response.data : []
}

export async function getWorkOrders() {
    const response = await get<Service[]>("/services", { type: "workOrder" })
    return response.success && response.data ? response.data : []
}

export async function convertToWorkOrder(serviceId: string) {
    const response = await post<{ success: boolean; workOrderId: string }>(`/services/${serviceId}/convert-to-work-order`)

    if (response.success && response.data) {
        return {
            success: true,
            workOrderId: response.data.workOrderId,
        }
    }

    return {
        success: false,
        error: response.error || "Failed to convert to work order",
    }
}

export async function getServiceDetails(id: string) {
    const response = await get<Service>(`/services/${id}`)
    return response.success && response.data ? response.data : null
}

export async function getCustomerAndVehicleDetails(customerId: string, vehicleId: string) {
    const customerResponse = await get<Customer>(`/customers/${customerId}`)
    const vehicleResponse = await get<Vehicle>(`/vehicles/${vehicleId}`)

    return {
        customer: customerResponse.success && customerResponse.data ? customerResponse.data : null,
        vehicle: vehicleResponse.success && vehicleResponse.data ? vehicleResponse.data : null,
    }
}

export async function getAvailableParts() {
    const response = await get<Part[]>("/parts", { inStock: "true" })
    return response.success && response.data ? response.data : []
}


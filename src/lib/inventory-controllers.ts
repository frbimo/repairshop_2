import { get, post, put, del } from "./api-client"

// Types
export type CompatibilityCar = {
    brand: string
    model: string
    year: number
}

export type PurchaseReceipt = {
    id: string
    invoice: string
    price: number
    compatibilityCars: CompatibilityCar[]
    stock: number
    retailName: string
    createdAt: Date
}

// Inventory controller
export async function createPurchaseReceipt(data: any) {
    // Transform data to match backend API
    const transformedData = {
        invoiceNumber: data.invoice,
        retailerId: await getOrCreateRetailer(data.retailName),
        totalAmount: data.price * data.stock,
        items: [
            {
                partId: await getOrCreatePart(data.invoice, data.price),
                quantity: data.stock,
                unitPrice: data.price,
            },
        ],
    }

    // Add compatibility data
    if (data.compatibilityCars && data.compatibilityCars.length > 0) {
        await addCompatibilityData(transformedData.items[0].partId, data.compatibilityCars)
    }

    const response = await post<{ receiptId: string }>("/purchases", transformedData)

    if (response.success) {
        return { success: true }
    }

    return {
        success: false,
        error: response.error || "Failed to create purchase receipt",
    }
}

// Helper function to get or create retailer
async function getOrCreateRetailer(name: string): Promise<string> {
    // First try to find existing retailer
    const searchResponse = await get<any[]>("/retailers", { name })

    if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        return searchResponse.data[0].id
    }

    // Create new retailer if not found
    const createResponse = await post<{ retailerId: string }>("/retailers", { name })

    if (createResponse.success && createResponse.data) {
        return createResponse.data.retailerId
    }

    throw new Error("Failed to get or create retailer")
}

// Helper function to get or create part
async function getOrCreatePart(sku: string, price: number): Promise<string> {
    // First try to find existing part
    const searchResponse = await get<any[]>("/parts", { sku })

    if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        return searchResponse.data[0].id
    }

    // Create new part if not found
    const createResponse = await post<{ partId: string }>("/parts", {
        sku,
        name: `Part ${sku}`,
        price,
        currentStock: 0,
    })

    if (createResponse.success && createResponse.data) {
        return createResponse.data.partId
    }

    throw new Error("Failed to get or create part")
}

// Helper function to add compatibility data
async function addCompatibilityData(partId: string, compatibilityCars: CompatibilityCar[]): Promise<void> {
    for (const car of compatibilityCars) {
        // Get brand ID
        const brandId = await getOrCreateBrand(car.brand)

        // Get model ID
        const modelId = await getOrCreateModel(brandId, car.model)

        // Add compatibility
        await post("/part-compatibility", {
            partId,
            brandId,
            modelId,
            yearFrom: car.year,
            yearTo: car.year,
        })
    }
}

// Helper function to get or create brand
async function getOrCreateBrand(name: string): Promise<string> {
    // First try to find existing brand
    const searchResponse = await get<any[]>("/car-brands", { name })

    if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        return searchResponse.data[0].brand_id
    }

    // Create new brand if not found
    const createResponse = await post<{ brandId: string }>("/car-brands", { name })

    if (createResponse.success && createResponse.data) {
        return createResponse.data.brandId
    }

    throw new Error("Failed to get or create brand")
}

// Helper function to get or create model
async function getOrCreateModel(brandId: string, name: string): Promise<string> {
    // First try to find existing model
    const searchResponse = await get<any[]>(`/car-models/${brandId}`)

    if (searchResponse.success && searchResponse.data) {
        const existingModel = searchResponse.data.find((model) => model.model_name === name)
        if (existingModel) {
            return existingModel.model_id
        }
    }

    // Create new model if not found
    const createResponse = await post<{ modelId: string }>("/car-models", {
        brandId,
        name,
    })

    if (createResponse.success && createResponse.data) {
        return createResponse.data.modelId
    }

    throw new Error("Failed to get or create model")
}

export async function getDashboardStats() {
    const response = await get<{
        totalCost: number
        totalInventoryValue: number
        serviceStats: {
            pending: number
            inProgress: number
            completed: number
        }
    }>("/dashboard/stats")

    if (response.success && response.data) {
        return {
            totalCost: response.data.totalCost,
            totalInventoryCost: response.data.totalInventoryValue,
            agingStock: await getAgingStock(12), // Default to 12 months
        }
    }

    return {
        totalCost: 0,
        totalInventoryCost: 0,
        agingStock: [],
    }
}

export async function getTotalCostByPeriod(period: "daily" | "monthly" | "yearly") {
    const response = await get<{ totalCost: number }>("/dashboard/stats", { period })
    return response.success && response.data ? response.data.totalCost : 0
}

export async function getTotalInventoryCost(period: "daily" | "monthly" | "yearly") {
    const response = await get<{ totalInventoryValue: number }>("/dashboard/stats", { period })
    return response.success && response.data ? response.data.totalInventoryValue : 0
}

export async function getAgingStock(months: number) {
    const response = await get<PurchaseReceipt[]>("/dashboard/aging-stock", { months: months.toString() })
    return response.success && response.data ? response.data : []
}

export async function getStockById(id: string) {
    const response = await get<PurchaseReceipt>(`/purchases/${id}`)
    return response.success && response.data ? response.data : null
}

export async function getAllInventoryItems() {
    const response = await get<PurchaseReceipt[]>("/purchases")
    return response.success && response.data ? response.data : []
}

export async function searchInventoryItems(searchType: string, searchTerm: string) {
    const response = await get<PurchaseReceipt[]>("/purchases", {
        searchType,
        searchTerm,
    })
    return response.success && response.data ? response.data : []
}

export async function updateInventoryItem(data: any) {
    const response = await put<{ message: string }>(`/purchases/${data.id}`, data)

    if (response.success) {
        return { success: true }
    }

    return {
        success: false,
        error: response.error || "Failed to update inventory item",
    }
}

export async function deleteInventoryItem(id: string) {
    const response = await del<{ message: string }>(`/purchases/${id}`)

    if (response.success) {
        return { success: true }
    }

    return {
        success: false,
        error: response.error || "Failed to delete inventory item",
    }
}

// Car data actions
export async function getCarBrands() {
    const response = await get<{ brand_id: string; brand_name: string }[]>("/car-brands")
    return response.success && response.data ? response.data.map((brand) => brand.brand_name) : []
}

export async function getCarModelsByBrand(brand: string) {
    // First get brand ID
    const brandsResponse = await get<{ brand_id: string; brand_name: string }[]>("/car-brands")

    if (!brandsResponse.success || !brandsResponse.data) {
        return []
    }

    const brandObj = brandsResponse.data.find((b) => b.brand_name === brand)
    if (!brandObj) {
        return []
    }

    // Then get models for this brand
    const modelsResponse = await get<{ model_id: string; model_name: string }[]>(`/car-models/${brandObj.brand_id}`)

    return modelsResponse.success && modelsResponse.data ? modelsResponse.data.map((model) => model.model_name) : []
}

export async function validateCarBrand(brand: string) {
    const brands = await getCarBrands()
    return brands.includes(brand) || brand.trim().length > 0
}

export async function validateCarModel(brand: string, model: string) {
    if (!brand || !model) return false

    const models = await getCarModelsByBrand(brand)
    return models.includes(model) || model.trim().length > 0
}


// Update the database model to support the new purchase receipt structure

// Add these imports at the top of the file
import type { Customer, Vehicle, Service, ServicePart, Part } from "./customer-actions"

// This is a mock database implementation
// In a real app, you would use a real database like Prisma with PostgreSQL

import type { PurchaseReceipt, SparePartItem, CompatibilityCar } from "./actions"
import { generateId } from "./actions"
// Car brands and models database
export const carDatabase = {
    brands: [
        "Toyota",
        "Honda",
        "Ford",
        "BMW",
        "Mercedes",
        "Audi",
        "Volkswagen",
        "Nissan",
        "Hyundai",
        "Kia",
        "Chevrolet",
        "Mazda",
        "Subaru",
        "Lexus",
    ],
    models: {
        Toyota: ["Corolla", "Camry", "RAV4", "Highlander", "Tacoma", "Prius", "4Runner", "Sienna"],
        Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "HR-V", "Ridgeline"],
        Ford: ["F-150", "Escape", "Explorer", "Mustang", "Edge", "Ranger", "Bronco"],
        BMW: ["3 Series", "5 Series", "X3", "X5", "7 Series", "X1", "X7"],
        Mercedes: ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "A-Class", "GLA"],
        Audi: ["A4", "Q5", "A6", "Q7", "A3", "Q3", "e-tron"],
        Volkswagen: ["Golf", "Jetta", "Tiguan", "Atlas", "Passat", "ID.4", "Taos"],
        Nissan: ["Altima", "Rogue", "Sentra", "Pathfinder", "Murano", "Frontier"],
        Hyundai: ["Elantra", "Tucson", "Santa Fe", "Sonata", "Kona", "Palisade"],
        Kia: ["Forte", "Sportage", "Sorento", "Telluride", "Soul", "Seltos"],
        Chevrolet: ["Silverado", "Equinox", "Tahoe", "Malibu", "Traverse", "Suburban"],
        Mazda: ["CX-5", "Mazda3", "CX-9", "CX-30", "Mazda6", "MX-5 Miata"],
        Subaru: ["Outback", "Forester", "Crosstrek", "Impreza", "Ascent", "Legacy"],
        Lexus: ["RX", "ES", "NX", "GX", "IS", "UX", "LX"],
    },
    isValidBrand: (brand: string): boolean => {
        // For custom brands, we'll accept any non-empty string
        return brand.trim().length > 0
    },
    isValidModel: function (brand: string, model: string): boolean {
        // If the brand is in our database, check if the model is valid for that brand
        if (this.brands.includes(brand)) {
            return this.models[brand as keyof typeof this.models]?.includes(model) || false
        }
        // For custom brands, accept any non-empty model
        return model.trim().length > 0
    },
    getModelsByBrand: function (brand: string): string[] {
        // If the brand is in our database, return its models
        if (this.brands.includes(brand)) {
            return this.models[brand as keyof typeof this.models] || []
        }
        // For custom brands, return an empty array
        return []
    },
}

// Generate some fake data for spare part items
const generateFakeSparePartItems = async (): Promise<SparePartItem[]> => {
    const items: SparePartItem[] = []

    // Generate 50 fake spare part items
    for (let i = 1; i <= 50; i++) {
        const sku = `SKU-${1000 + i}`
        const name = [
            "Oil Filter",
            "Air Filter",
            "Fuel Filter",
            "Brake Pad",
            "Brake Rotor",
            "Spark Plug",
            "Ignition Coil",
            "Alternator",
            "Starter Motor",
            "Water Pump",
            "Radiator",
            "Thermostat",
            "Timing Belt",
            "Serpentine Belt",
            "Battery",
            "Shock Absorber",
            "Strut Assembly",
            "Control Arm",
            "Tie Rod End",
            "Ball Joint",
        ][Math.floor(Math.random() * 20)]

        const price = Math.floor(Math.random() * 500) + 50 // $50-$550
        const stock = Math.floor(Math.random() * 20) + 1 // 1-20

        const compatibilityCars: CompatibilityCar[] = []
        const numCars = Math.floor(Math.random() * 3) + 1 // 1-3 cars
        const id = await generateId();
        for (let j = 0; j < numCars; j++) {
            const brandIndex = Math.floor(Math.random() * carDatabase.brands.length)
            const brand = carDatabase.brands[brandIndex]
            const models = carDatabase.models[brand as keyof typeof carDatabase.models]
            const modelIndex = Math.floor(Math.random() * models.length)
            const year = 2015 + Math.floor(Math.random() * 9) // 2015-2023

            compatibilityCars.push({
                id,
                brand,
                model: models[modelIndex],
                year,
            })
        }

        items.push({
            id: `item-${i}`,
            sku,
            name: `${name} ${i}`,
            price,
            stock,
            compatibilityCars,
            createdAt: new Date(),
            description: ""
        })
    }

    return items
}

// Generate fake purchase receipts
const generateFakePurchaseReceipts = (sparePartItems: SparePartItem[]): PurchaseReceipt[] => {
    const receipts: PurchaseReceipt[] = []

    // Generate 20 fake purchase receipts
    for (let i = 1; i <= 20; i++) {
        const purchaseDate = new Date()
        purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 365)) // Random date within the last year

        // Randomly select 1-5 spare part items for this receipt
        const numItems = Math.floor(Math.random() * 5) + 1
        const items: SparePartItem[] = []

        for (let j = 0; j < numItems; j++) {
            const randomIndex = Math.floor(Math.random() * sparePartItems.length)
            const item = sparePartItems[randomIndex]
            // Avoid duplicates
            if (!items.includes(item)) {
                items.push(item)
            }
        }

        receipts.push({
            id: `rec-${i}`,
            invoiceNumber: `INV-${1000 + i}`,
            vendorName: ["AutoZone", "O'Reilly Auto Parts", "Advance Auto Parts", "NAPA Auto Parts"][
                Math.floor(Math.random() * 4)
            ],
            items,
            purchaseDate,
            totalCost: 0
        })
    }

    return receipts
}

// Generate mock customers
const generateMockCustomers = (): Customer[] => {
    return [
        {
            id: "cust-1",
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "(555) 123-4567",
            address: "123 Main St, Anytown, USA",
            vehicles: [
                {
                    id: "veh-1",
                    make: "Toyota",
                    model: "Camry",
                    year: 2018,
                    licensePlate: "ABC123",
                    color: "Silver",
                    vin: "1HGCM82633A123456",
                    mileage: 45000,
                },
                {
                    id: "veh-2",
                    make: "Honda",
                    model: "Civic",
                    year: 2020,
                    licensePlate: "XYZ789",
                    color: "Blue",
                    vin: "2HGFC2F52LH123456",
                    mileage: 15000,
                },
            ],
        },
        {
            id: "cust-2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "(555) 987-6543",
            address: "456 Oak Ave, Somewhere, USA",
            vehicles: [
                {
                    id: "veh-3",
                    make: "Ford",
                    model: "F-150",
                    year: 2019,
                    licensePlate: "DEF456",
                    color: "Black",
                    vin: "1FTEW1EP5JFA12345",
                    mileage: 30000,
                },
            ],
        },
        {
            id: "cust-3",
            name: "Bob Johnson",
            email: "bob.johnson@example.com",
            phone: "(555) 456-7890",
            address: "789 Pine St, Nowhere, USA",
            vehicles: [
                {
                    id: "veh-4",
                    make: "Chevrolet",
                    model: "Silverado",
                    year: 2017,
                    licensePlate: "GHI789",
                    color: "Red",
                    vin: "3GCUKREC7HG123456",
                    mileage: 60000,
                },
                {
                    id: "veh-5",
                    make: "BMW",
                    model: "X5",
                    year: 2021,
                    licensePlate: "JKL012",
                    color: "White",
                    vin: "5UXCR6C51L9B12345",
                    mileage: 5000,
                },
            ],
        },
    ]
}

// Generate mock estimations
const generateMockEstimations = (): Service[] => {
    return [
        {
            id: "est-1",
            customerId: "cust-1",
            vehicleId: "veh-1",
            description: "Customer reported issues with brakes and engine noise.",
            estimatedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            status: "pending",
            serviceTypes: [
                {
                    name: "brake_service",
                    description: "Replace brake pads and check rotors",
                },
                {
                    name: "diagnostic",
                    description: "Diagnose engine noise",
                },
            ],
            parts: [
                {
                    id: "part-1",
                    stock: 10,
                    name: "Brake Pads (Front)",
                    price: 89.99,
                    quantity: 1,
                },
                {
                    id: "part-2",
                    name: "Brake Fluid",
                    stock: 10,
                    price: 19.99,
                    quantity: 1,
                },
            ],
            isWorkOrder: false,
            estimationId: "EST-12345",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            updatedAt: new Date(),
        },
        {
            id: "est-2",
            customerId: "cust-2",
            vehicleId: "veh-3",
            description: "Regular maintenance and oil change.",
            estimatedCompletionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            status: "pending",
            serviceTypes: [
                {
                    name: "oil_change",
                    description: "Change oil and filter",
                },
                {
                    name: "maintenance",
                    description: "Regular maintenance check",
                },
            ],
            parts: [
                {
                    id: "part-3",
                    name: "Oil Filter",
                    price: 9.99,
                    stock: 10,
                    quantity: 1,
                },
                {
                    id: "part-4",
                    name: "Engine Oil (5W-30)",
                    price: 29.99,
                    quantity: 1,
                    stock: 10,
                },
            ],
            isWorkOrder: false,
            estimationId: "EST-12346",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            updatedAt: new Date(),
        },
        {
            id: "est-3",
            customerId: "cust-3",
            vehicleId: "veh-4",
            description: "Transmission issues and fluid leak.",
            estimatedCompletionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            status: "pending",
            serviceTypes: [
                {
                    name: "transmission",
                    description: "Check transmission and fix fluid leak",
                },
            ],
            parts: [
                {
                    id: "part-5",
                    name: "Transmission Fluid",
                    price: 49.99,
                    stock: 10,
                    quantity: 1,
                },
            ],
            isWorkOrder: false,
            estimationId: "EST-12347",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            updatedAt: new Date(),
        },
    ]
}

// Generate mock work orders
const generateMockWorkOrders = (): Service[] => {
    return [
        {
            id: "work-1",
            customerId: "cust-1",
            vehicleId: "veh-2",
            description: "Oil change and tire rotation.",
            estimatedCompletionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            status: "in_progress",
            serviceTypes: [
                {
                    name: "oil_change",
                    description: "Change oil and filter",
                },
                {
                    name: "tire_rotation",
                    description: "Rotate tires",
                },
            ],
            parts: [
                {
                    id: "part-3",
                    name: "Oil Filter",
                    price: 9.99,
                    quantity: 1,
                    stock: 10,
                },
                {
                    id: "part-4",
                    name: "Engine Oil (5W-30)",
                    stock: 10,
                    price: 29.99,
                    quantity: 1,
                },
            ],
            isWorkOrder: true,
            workOrderId: "WO-12345",
            estimationId: "EST-11111",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            updatedAt: new Date(),
        },
        {
            id: "work-2",
            customerId: "cust-2",
            vehicleId: "veh-3",
            description: "Brake pad replacement.",
            estimatedCompletionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (past due)
            status: "completed",
            serviceTypes: [
                {
                    name: "brake_service",
                    description: "Replace brake pads",
                },
            ],
            parts: [
                {
                    id: "part-1",
                    name: "Brake Pads (Front)",
                    price: 89.99,
                    quantity: 1,
                    stock: 10,
                },
            ],
            isWorkOrder: true,
            workOrderId: "WO-12346",
            estimationId: "EST-22222",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            updatedAt: new Date(),
        },
        {
            id: "work-3",
            customerId: "cust-3",
            vehicleId: "veh-5",
            description: "Check engine light diagnosis.",
            estimatedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            status: "in_progress",
            serviceTypes: [
                {
                    name: "diagnostic",
                    description: "Diagnose check engine light",
                },
            ],
            parts: [],
            isWorkOrder: true,
            workOrderId: "WO-12347",
            estimationId: "EST-33333",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            updatedAt: new Date(),
        },
    ]
}

// Generate mock parts
const generateMockParts = (): Part[] => {
    return [
        {
            id: "part-1",
            name: "Brake Pads (Front)",
            price: 89.99,
            stock: 10,
        },
        {
            id: "part-2",
            name: "Brake Fluid",
            price: 19.99,
            stock: 20,
        },
        {
            id: "part-3",
            name: "Oil Filter",
            price: 9.99,
            stock: 15,
        },
        {
            id: "part-4",
            name: "Engine Oil (5W-30)",
            price: 29.99,
            stock: 25,
        },
        {
            id: "part-5",
            name: "Air Filter",
            price: 14.99,
            stock: 12,
        },
        {
            id: "part-6",
            name: "Spark Plugs (Set of 4)",
            price: 39.99,
            stock: 8,
        },
        {
            id: "part-7",
            name: "Wiper Blades",
            price: 24.99,
            stock: 18,
        },
        {
            id: "part-8",
            name: "Battery",
            price: 129.99,
            stock: 5,
        },
    ]
}

// Fake database with in-memory storage
class Database {
    private sparePartItems: SparePartItem[] = []
    private purchaseReceipts: PurchaseReceipt[] = []

    constructor() {
        this.initializeDatabase()
    }

    private async initializeDatabase() {
        this.sparePartItems = await generateFakeSparePartItems()
        this.purchaseReceipts = generateFakePurchaseReceipts(this.sparePartItems)
    }

    // Add these new properties
    private customers: Customer[] = generateMockCustomers()
    private vehicles: Vehicle[] = []
    private services: Service[] = [...generateMockEstimations(), ...generateMockWorkOrders()]
    private serviceParts: ServicePart[] = []
    private parts: Part[] = generateMockParts()

    // Spare Part Item model
    sparePartItem = {
        create: async ({ data }: { data: Omit<SparePartItem, "id" | "createdAt"> }) => {
            const newItem = {
                ...data,
                id: `item-${this.sparePartItems.length + 1}`,
                createdAt: new Date(),
            } as SparePartItem

            this.sparePartItems.push(newItem)
            return newItem
        },

        findById: async (id: string) => {
            return this.sparePartItems.find((item) => item.id === id) || null
        },

        findByIds: async (ids: string[]) => {
            return this.sparePartItems.filter((item) => ids.includes(item.id))
        },

        findMany: async () => {
            return [...this.sparePartItems]
        },

        update: async (id: string, data: Partial<SparePartItem>) => {
            const index = this.sparePartItems.findIndex((item) => item.id === id)
            if (index === -1) return null

            this.sparePartItems[index] = {
                ...this.sparePartItems[index],
                ...data,
            }

            return this.sparePartItems[index]
        },

        updateStock: async (id: string, change: number) => {
            const item = this.sparePartItems.find((item) => item.id === id)
            if (item) {
                item.stock += change
                if (item.stock < 0) item.stock = 0
            }
            return item || null
        },

        delete: async (id: string) => {
            const initialLength = this.sparePartItems.length
            this.sparePartItems = this.sparePartItems.filter((item) => item.id !== id)
            return initialLength > this.sparePartItems.length
        },
    }

    // Purchase Receipt model
    purchaseReceipt = {
        create: async ({ data }: { data: Omit<PurchaseReceipt, "id" | "createdAt"> }) => {
            const newReceipt = {
                ...data,
                id: `rec-${this.purchaseReceipts.length + 1}`,
                createdAt: new Date(),
            } as PurchaseReceipt

            this.purchaseReceipts.push(newReceipt)
            return newReceipt
        },

        findMany: async ({
            where,
            orderBy,
            include,
        }: {
            where?: { createdAt?: { gte?: Date; lt?: Date } }
            orderBy?: { createdAt?: "asc" | "desc" }
            include?: { items?: boolean }
        } = {}) => {
            let results = [...this.purchaseReceipts]

            // Filter by date if specified
            if (where?.createdAt?.gte) {
                results = results.filter((receipt) => where.createdAt && receipt.purchaseDate >= where.createdAt.gte!)
            }

            if (where?.createdAt?.lt) {
                results = results.filter((receipt) => where.createdAt && receipt.purchaseDate < where.createdAt.lt!)
            }

            // Sort if specified
            if (orderBy?.createdAt) {
                results.sort((a, b) => {
                    if (orderBy.createdAt === "asc") {
                        return a.purchaseDate.getTime() - b.purchaseDate.getTime()
                    } else {
                        return b.purchaseDate.getTime() - a.purchaseDate.getTime()
                    }
                })
            }

            // Include related items if requested
            if (include?.items) {
                return Promise.all(
                    results.map(async (receipt) => {
                        const items = await this.sparePartItem.findByIds(receipt.items.map(item => item.id))
                        return {
                            ...receipt,
                            items,
                        }
                    }),
                )
            }

            return results
        },

        findById: async (id: string, { include }: { include?: { items?: boolean } } = {}) => {
            const receipt = this.purchaseReceipts.find((receipt) => receipt.id === id)
            if (!receipt) return null

            if (include?.items) {
                const items = await this.sparePartItem.findByIds(receipt.items.map(item => item.id))
                return {
                    ...receipt,
                    items,
                }
            }

            return receipt
        },

        update: async (id: string, data: Partial<PurchaseReceipt>) => {
            const index = this.purchaseReceipts.findIndex((receipt) => receipt.id === id)
            if (index === -1) return null

            this.purchaseReceipts[index] = {
                ...this.purchaseReceipts[index],
                ...data,
            }

            return this.purchaseReceipts[index]
        },

        delete: async (id: string) => {
            const initialLength = this.purchaseReceipts.length
            this.purchaseReceipts = this.purchaseReceipts.filter((receipt) => receipt.id !== id)
            return initialLength > this.purchaseReceipts.length
        },
    }

    // Customer model
    customer = {
        create: async ({ data }: { data: Omit<Customer, "id" | "vehicles"> }) => {
            const newCustomer = {
                ...data,
                id: `cust-${this.customers.length + 1}`,
                vehicles: [],
            } as Customer

            this.customers.push(newCustomer)
            return newCustomer
        },

        findById: async (id: string) => {
            return this.customers.find((customer) => customer.id === id) || null
        },

        findMany: async () => {
            return [...this.customers]
        },

        update: async (id: string, data: Partial<Omit<Customer, "id" | "vehicles">>) => {
            const index = this.customers.findIndex((customer) => customer.id === id)
            if (index === -1) return null

            this.customers[index] = {
                ...this.customers[index],
                ...data,
            }

            return this.customers[index]
        },

        delete: async (id: string) => {
            const initialLength = this.customers.length
            this.customers = this.customers.filter((customer) => customer.id !== id)
            return initialLength > this.customers.length
        },
    }

    // Vehicle model
    vehicle = {
        create: async ({ data }: { data: Omit<Vehicle, "id"> }) => {
            const newVehicle = {
                ...data,
                id: `veh-${Date.now()}`,
            } as Vehicle

            // Add vehicle to customer
            const customerIndex = this.customers.findIndex((customer) => customer.id === data.customerId)
            if (customerIndex !== -1) {
                this.customers[customerIndex].vehicles.push(newVehicle)
            }

            return newVehicle
        },

        findById: async (id: string) => {
            for (const customer of this.customers) {
                const vehicle = customer.vehicles.find((v) => v.id === id)
                if (vehicle) return vehicle
            }
            return null
        },

        findByCustomerId: async (customerId: string) => {
            const customer = this.customers.find((c) => c.id === customerId)
            return customer ? customer.vehicles : []
        },

        update: async (id: string, data: Partial<Omit<Vehicle, "id">>) => {
            for (const customer of this.customers) {
                const vehicleIndex = customer.vehicles.findIndex((v) => v.id === id)
                if (vehicleIndex !== -1) {
                    customer.vehicles[vehicleIndex] = {
                        ...customer.vehicles[vehicleIndex],
                        ...data,
                    }
                    return customer.vehicles[vehicleIndex]
                }
            }
            return null
        },

        delete: async (id: string) => {
            for (const customer of this.customers) {
                const initialLength = customer.vehicles.length
                customer.vehicles = customer.vehicles.filter((v) => v.id !== id)
                if (initialLength > customer.vehicles.length) {
                    return true
                }
            }
            return false
        },
    }

    // Service model
    service = {
        create: async ({ data }: { data: Omit<Service, "id" | "createdAt" | "updatedAt"> }) => {
            const isWorkOrder = data.isWorkOrder || false
            const prefix = isWorkOrder ? "work" : "est"
            const newService = {
                ...data,
                id: `${prefix}-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as Service

            this.services.push(newService)
            return newService
        },

        update: async ({ id, data }: { id: string; data: Partial<Service> }) => {
            const serviceIndex = this.services.findIndex((service) => service.id === id)
            if (serviceIndex === -1) return null

            this.services[serviceIndex] = {
                ...this.services[serviceIndex],
                ...data,
                updatedAt: new Date(),
            }

            return this.services[serviceIndex]
        },

        findMany: async ({
            include,
            where,
        }: {
            include?: { customer?: boolean; vehicle?: boolean }
            where?: { isWorkOrder?: boolean }
        } = {}) => {
            let results = [...this.services]

            if (where?.isWorkOrder !== undefined) {
                results = results.filter((service) => service.isWorkOrder === where.isWorkOrder)
            }

            const mappedResults = results.map((service) => {
                const result: any = { ...service }

                if (include?.customer) {
                    result.customer = this.customers.find((customer) => customer.id === service.customerId) || null
                }

                if (include?.vehicle) {
                    for (const customer of this.customers) {
                        const vehicle = customer.vehicles.find((v) => v.id === service.vehicleId)
                        if (vehicle) {
                            result.vehicle = vehicle
                            break
                        }
                    }
                }

                return result
            })

            return mappedResults
        },

        findById: async (
            id: string,
            { include }: { include?: { customer?: boolean; vehicle?: boolean; parts?: boolean } } = {},
        ) => {
            const service = this.services.find((service) => service.id === id)
            if (!service) return null

            const result: any = { ...service }

            if (include?.customer) {
                result.customer = this.customers.find((customer) => customer.id === service.customerId) || null
            }

            if (include?.vehicle) {
                for (const customer of this.customers) {
                    const vehicle = customer.vehicles.find((v) => v.id === service.vehicleId)
                    if (vehicle) {
                        result.vehicle = vehicle
                        break
                    }
                }
            }

            return result
        },

        convertToWorkOrder: async (id: string) => {
            const serviceIndex = this.services.findIndex((service) => service.id === id)
            if (serviceIndex === -1) return null

            const service = this.services[serviceIndex]
            if (service.isWorkOrder) return null

            const workOrderId = `WO-${Date.now().toString().slice(-5)}`

            this.services[serviceIndex] = {
                ...service,
                isWorkOrder: true,
                workOrderId,
                status: "in_progress",
                updatedAt: new Date(),
            }

            return {
                success: true,
                workOrderId,
            }
        },

        delete: async (id: string) => {
            const initialLength = this.services.length
            this.services = this.services.filter((service) => service.id !== id)
            return initialLength > this.services.length
        },
    }

    // Service Part model
    servicePart = {
        create: async ({ data }: { data: Omit<ServicePart, "id"> }) => {
            const newServicePart = {
                ...data,
                id: `sp-${this.serviceParts.length + 1}`,
            } as ServicePart

            this.serviceParts.push(newServicePart)
            return newServicePart
        },

        deleteByServiceId: async (serviceId: string) => {
            this.serviceParts = this.serviceParts.filter((sp) => sp.serviceId !== serviceId)
            return true
        },
    }

    // Part model
    part = {
        findMany: async ({ where }: { where?: { stock?: { gt?: number } } } = {}) => {
            let results = [...this.parts]

            if (where?.stock?.gt !== undefined) {
                results = results.filter((part) => where?.stock?.gt !== undefined && part.stock > where.stock.gt)
            }

            return results
        },

        findById: async (id: string) => {
            return this.parts.find((part) => part.id === id) || null
        },

        updateStock: async (id: string, change: number) => {
            const part = this.parts.find((part) => part.id === id)
            if (part) {
                part.stock += change
                if (part.stock < 0) part.stock = 0
            }
            return part || null
        },
    }

    // Car database methods
    car = {
        getBrands: async () => {
            return carDatabase.brands
        },

        getModelsByBrand: async (brand: string) => {
            return carDatabase.getModelsByBrand(brand)
        },

        isValidBrand: async (brand: string) => {
            return carDatabase.isValidBrand(brand)
        },

        isValidModel: async (brand: string, model: string) => {
            return carDatabase.isValidModel(brand, model)
        },
    }
}

// Export the database instance
export const db = new Database()


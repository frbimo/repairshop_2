// Update the existing db.ts file to include customer-related models

// Add these imports at the top of the file
import type { Customer, Vehicle, Service, ServicePart, Part } from "./customer-actions"

// This is a mock database implementation
// In a real app, you would use a real database like Prisma with PostgreSQL

import type { PurchaseReceipt } from "./actions"

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
        Toyota: ["86", "Agya", "Alphard", "Avanza", "BZ4X", "C-HR", "Calya", "Camry", "Corolla", "Corolla Altis", "Corolla Cross", "Crown", "Estima", "Etios", "Etios Valco", "FJ Cruiser", "Fortuner", "GR 86", "GR Corolla", "GR Supra", "GR Yaris", "GranAce", "Harrier", "Hiace", "Hilux", "Hilux Rangga", "IST", "Kijang", "Kijang Innova", "Kijang Innova Zenix", "Land Cruiser", "Land Cruiser Cygnus", "Land Cruiser Prado", "Limo", "Markx", "NAV1", "Previa", "RAV4", "Raize", "Rush", "Sienta", "Soluna", "Starlet", "Vellfire", "Veloz", "Vios", "Voxy", "Yaris", "Yaris Cross", "Prius", "4Runner", "Sienna"],
        Opel: ["Blazer"],
        Honda: ["Accord", "BR-V", "Brio", "Civic", "CR-V", "CR-Z", "City", "Elysion", "Freed", "HR-V", "Jazz", "Mobilio", "Odyssey", "Prelude", "WR-V"],
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

// Generate some fake data
const generateFakeData = (): PurchaseReceipt[] => {
    const data: PurchaseReceipt[] = []

    // Generate 20 fake purchase receipts
    for (let i = 1; i <= 20; i++) {
        const createdAt = new Date()
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365)) // Random date within the last year

        const compatibilityCars = []
        const numCars = Math.floor(Math.random() * 3) + 1 // 1-3 cars

        for (let j = 0; j < numCars; j++) {
            const brandIndex = Math.floor(Math.random() * carDatabase.brands.length)
            const brand = carDatabase.brands[brandIndex]
            const models = carDatabase.models[brand as keyof typeof carDatabase.models]
            const modelIndex = Math.floor(Math.random() * models.length)
            const year = 2015 + Math.floor(Math.random() * 9) // 2015-2023

            compatibilityCars.push({
                brand,
                model: models[modelIndex],
                year,
            })
        }

        data.push({
            id: `rec-${i}`,
            invoice: `INV-${1000 + i}`,
            price: Math.floor(Math.random() * 500) + 50, // $50-$550
            stock: Math.floor(Math.random() * 20) + 1, // 1-20
            retailName: ["AutoZone", "O'Reilly Auto Parts", "Advance Auto Parts", "NAPA Auto Parts"][
                Math.floor(Math.random() * 4)
            ],
            compatibilityCars,
            createdAt,
        })
    }

    return data
}

// Fake database with in-memory storage
class Database {
    // Existing code...
    private purchaseReceipts: PurchaseReceipt[] = generateFakeData()

    // Add these new properties
    private customers: Customer[] = []
    private vehicles: Vehicle[] = []
    private services: Service[] = []
    private serviceParts: ServicePart[] = []
    private parts: Part[] = generateFakeParts()

    // Customer model
    customer = {
        create: async ({ data }: { data: Omit<Customer, "id" | "createdAt"> }) => {
            const newCustomer = {
                ...data,
                id: `cust-${this.customers.length + 1}`,
                createdAt: new Date(),
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
    }

    // Vehicle model
    vehicle = {
        create: async ({ data }: { data: Omit<Vehicle, "id" | "createdAt"> }) => {
            const newVehicle = {
                ...data,
                id: `veh-${this.vehicles.length + 1}`,
                createdAt: new Date(),
            } as Vehicle

            this.vehicles.push(newVehicle)
            return newVehicle
        },

        findById: async (id: string) => {
            return this.vehicles.find((vehicle) => vehicle.id === id) || null
        },

        findByCustomerId: async (customerId: string) => {
            return this.vehicles.filter((vehicle) => vehicle.customerId === customerId)
        },
    }

    // Service model
    service = {
        create: async ({ data }: { data: Omit<Service, "id" | "parts" | "createdAt"> }) => {
            const newService = {
                ...data,
                id: `serv-${this.services.length + 1}`,
                parts: [],
                createdAt: new Date(),
                estimationId: data.estimationId || null,
                workOrderId: data.workOrderId || null,
                isWorkOrder: data.isWorkOrder || false,
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
                    result.vehicle = this.vehicles.find((vehicle) => vehicle.id === service.vehicleId) || null
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
                result.vehicle = this.vehicles.find((vehicle) => vehicle.id === service.vehicleId) || null
            }

            if (include?.parts) {
                const serviceParts = this.serviceParts.filter((sp) => sp.serviceId === service.id)
                result.parts = serviceParts.map((sp) => {
                    const part = this.parts.find((p) => p.id === sp.partId)
                    return {
                        id: sp.id,
                        name: part?.name || "Unknown Part",
                        price: part?.price || 0,
                        quantity: sp.quantity,
                    }
                })
            }

            return result
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
                results = results.filter((part) => part.stock > where.stock.gt)
            }

            return results
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

    purchaseReceipt = {
        create: async ({ data }: { data: Omit<PurchaseReceipt, "id"> }) => {
            const newReceipt = {
                ...data,
                id: `rec-${this.purchaseReceipts.length + 1}`,
            } as PurchaseReceipt

            this.purchaseReceipts.push(newReceipt)
            return newReceipt
        },

        findMany: async ({
            where,
            orderBy,
        }: {
            where?: { createdAt?: { gte?: Date; lt?: Date } }
            orderBy?: { createdAt?: "asc" | "desc" }
        } = {}) => {
            let results = [...this.purchaseReceipts]

            // Filter by date if specified
            if (where?.createdAt?.gte) {
                results = results.filter((receipt) => receipt.createdAt >= where.createdAt.gte!)
            }

            if (where?.createdAt?.lt) {
                results = results.filter((receipt) => receipt.createdAt < where.createdAt.lt!)
            }

            // Sort if specified
            if (orderBy?.createdAt) {
                results.sort((a, b) => {
                    if (orderBy.createdAt === "asc") {
                        return a.createdAt.getTime() - b.createdAt.getTime()
                    } else {
                        return b.createdAt.getTime() - a.createdAt.getTime()
                    }
                })
            }

            return results
        },

        findById: async (id: string) => {
            return this.purchaseReceipts.find((receipt) => receipt.id === id) || null
        },

        update: async (id: string, data: any) => {
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

// Generate fake parts data
function generateFakeParts(): Part[] {
    const parts: Part[] = [
        { id: "part-1", name: "Oil Filter", price: 12.99, stock: 25 },
        { id: "part-2", name: "Air Filter", price: 19.99, stock: 18 },
        { id: "part-3", name: "Brake Pads (Front)", price: 45.99, stock: 12 },
        { id: "part-4", name: "Brake Pads (Rear)", price: 39.99, stock: 15 },
        { id: "part-5", name: "Spark Plugs (Set of 4)", price: 29.99, stock: 20 },
        { id: "part-6", name: "Wiper Blades", price: 24.99, stock: 30 },
        { id: "part-7", name: "Battery", price: 129.99, stock: 8 },
        { id: "part-8", name: "Alternator", price: 189.99, stock: 5 },
        { id: "part-9", name: "Radiator", price: 159.99, stock: 7 },
        { id: "part-10", name: "Timing Belt Kit", price: 89.99, stock: 10 },
        { id: "part-11", name: "Water Pump", price: 49.99, stock: 12 },
        { id: "part-12", name: "Thermostat", price: 19.99, stock: 22 },
        { id: "part-13", name: "Fuel Pump", price: 129.99, stock: 6 },
        { id: "part-14", name: "Oxygen Sensor", price: 59.99, stock: 14 },
        { id: "part-15", name: "Transmission Fluid (1 Quart)", price: 9.99, stock: 40 },
    ]

    return parts
}

// Export the database instance
export const db = new Database()


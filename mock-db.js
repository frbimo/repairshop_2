// Mock database implementation for debugging and development
const { v4: uuidv4 } = require("uuid")

class MockDatabase {
    constructor() {
        // Initialize with some sample data

        // Define available roles (fixed options)
        this.roles = [
            { role_id: 1, name: "admin", description: "Full access to all system features" },
            { role_id: 2, name: "officer", description: "Limited access to non-administrative features" },
            { role_id: 3, name: "inventory_manager", description: "Access to inventory-related features only" },
            { role_id: 4, name: "service_manager", description: "Access to service-related features only" },
        ]

        // User accounts with role assignments
        this.users = [
            {
                user_id: 1,
                name: "Admin User",
                email: "admin@example.com",
                password_hash: "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // admin123
                role_id: 1, // admin
                created_at: new Date("2023-01-01"),
            },
            {
                user_id: 2,
                name: "Officer User",
                email: "officer@example.com",
                password_hash: "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // admin123
                role_id: 2, // officer
                created_at: new Date("2023-01-02"),
            },
            {
                user_id: 3,
                name: "Inventory Manager",
                email: "inventory@example.com",
                password_hash: "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // admin123
                role_id: 3, // inventory_manager
                created_at: new Date("2023-01-03"),
            },
            {
                user_id: 4,
                name: "Service Manager",
                email: "service@example.com",
                password_hash: "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // admin123
                role_id: 4, // service_manager
                created_at: new Date("2023-01-04"),
            },
        ]

        // Rest of your mock database code
        this.customers = [
            {
                customer_id: 1,
                name: "John Doe",
                email: "john@example.com",
                phone: "(123) 456-7890",
                address: "123 Main St, Anytown, USA",
                created_at: new Date("2023-02-01"),
            },
            {
                customer_id: 2,
                name: "Jane Smith",
                email: "jane@example.com",
                phone: "(987) 654-3210",
                address: "456 Oak Ave, Somewhere, USA",
                created_at: new Date("2023-02-15"),
            },
        ]

        this.vehicles = [
            {
                vehicle_id: 1,
                customer_id: 1,
                make: "Toyota",
                model: "Camry",
                year: 2020,
                license_plate: "ABC123",
                color: "Blue",
                vin: "JT2BF22K1W0123456",
                mileage: 25000,
                created_at: new Date("2023-02-01"),
            },
            {
                vehicle_id: 2,
                customer_id: 2,
                make: "Honda",
                model: "Civic",
                year: 2019,
                license_plate: "XYZ789",
                color: "Red",
                vin: "JHMEH9694PS012345",
                mileage: 35000,
                created_at: new Date("2023-02-15"),
            },
        ]

        this.retailers = [
            {
                retailer_id: 1,
                name: "AutoZone",
                contact_info: "contact@autozone.com",
                created_at: new Date("2023-01-15"),
            },
            {
                retailer_id: 2,
                name: "O'Reilly Auto Parts",
                contact_info: "contact@oreillyauto.com",
                created_at: new Date("2023-01-20"),
            },
        ]

        this.parts = [
            {
                part_id: 1,
                sku: "OIL-FILTER-001",
                name: "Oil Filter",
                description: "High quality oil filter for Toyota vehicles",
                price: 12.99,
                current_stock: 25,
                created_at: new Date("2023-01-25"),
                updated_at: new Date("2023-01-25"),
            },
            {
                part_id: 2,
                sku: "BRAKE-PAD-001",
                name: "Brake Pads (Front)",
                description: "Premium brake pads for Honda vehicles",
                price: 45.99,
                current_stock: 15,
                created_at: new Date("2023-01-26"),
                updated_at: new Date("2023-01-26"),
            },
        ]

        this.purchase_receipts = [
            {
                receipt_id: 1,
                invoice_number: "INV-001",
                retailer_id: 1,
                total_amount: 324.75,
                purchase_date: new Date("2023-03-01"),
                created_by: 1,
            },
            {
                receipt_id: 2,
                invoice_number: "INV-002",
                retailer_id: 2,
                total_amount: 689.5,
                purchase_date: new Date("2023-03-15"),
                created_by: 2,
            },
        ]

        this.purchase_details = [
            {
                detail_id: 1,
                receipt_id: 1,
                part_id: 1,
                quantity: 10,
                unit_price: 12.99,
            },
            {
                detail_id: 2,
                receipt_id: 1,
                part_id: 2,
                quantity: 5,
                unit_price: 45.99,
            },
        ]

        this.car_brands = [
            { brand_id: 1, brand_name: "Toyota" },
            { brand_id: 2, brand_name: "Honda" },
            { brand_id: 3, brand_name: "Ford" },
            { brand_id: 4, brand_name: "BMW" },
            { brand_id: 5, brand_name: "Mercedes" },
        ]

        this.car_models = [
            { model_id: 1, brand_id: 1, model_name: "Camry" },
            { model_id: 2, brand_id: 1, model_name: "Corolla" },
            { model_id: 3, brand_id: 2, model_name: "Civic" },
            { model_id: 4, brand_id: 2, model_name: "Accord" },
            { model_id: 5, brand_id: 3, model_name: "F-150" },
            { model_id: 6, brand_id: 3, model_name: "Mustang" },
        ]

        this.part_compatibility = [
            {
                compatibility_id: 1,
                part_id: 1,
                brand_id: 1,
                model_id: 1,
                year_from: 2018,
                year_to: 2023,
            },
            {
                compatibility_id: 2,
                part_id: 1,
                brand_id: 1,
                model_id: 2,
                year_from: 2018,
                year_to: 2023,
            },
            {
                compatibility_id: 3,
                part_id: 2,
                brand_id: 2,
                model_id: 3,
                year_from: 2017,
                year_to: 2022,
            },
        ]

        this.service_types = [
            { service_type_id: 1, name: "oil_change", description: "Regular oil and filter change service" },
            { service_type_id: 2, name: "brake_service", description: "Brake pad replacement and system check" },
            { service_type_id: 3, name: "tire_replacement", description: "Tire replacement and balancing" },
            { service_type_id: 4, name: "engine_repair", description: "Engine diagnostics and repair" },
        ]

        this.services = [
            {
                service_id: 1,
                customer_id: 1,
                vehicle_id: 1,
                description: "Regular maintenance service",
                estimated_completion_date: new Date("2023-04-05"),
                status: "completed",
                estimation_id: "EST-20230401-001",
                work_order_id: "WO-20230401-001",
                is_work_order: true,
                created_by: 1,
                created_at: new Date("2023-04-01"),
                updated_at: new Date("2023-04-05"),
            },
            {
                service_id: 2,
                customer_id: 2,
                vehicle_id: 2,
                description: "Brake system inspection and repair",
                estimated_completion_date: new Date("2023-04-20"),
                status: "in_progress",
                estimation_id: "EST-20230415-001",
                work_order_id: "WO-20230415-001",
                is_work_order: true,
                created_by: 2,
                created_at: new Date("2023-04-15"),
                updated_at: new Date("2023-04-15"),
            },
            {
                service_id: 3,
                customer_id: 1,
                vehicle_id: 1,
                description: "Engine check and tune-up",
                estimated_completion_date: new Date("2023-05-10"),
                status: "pending",
                estimation_id: "EST-20230501-001",
                work_order_id: null,
                is_work_order: false,
                created_by: 1,
                created_at: new Date("2023-05-01"),
                updated_at: new Date("2023-05-01"),
            },
        ]

        this.service_service_types = [
            { id: 1, service_id: 1, service_type_id: 1, description: "Full synthetic oil change" },
            { id: 2, service_id: 2, service_type_id: 2, description: "Front brake pads replacement" },
            { id: 3, service_id: 3, service_type_id: 4, description: "Engine diagnostics and tune-up" },
        ]

        this.service_parts = [
            { service_part_id: 1, service_id: 1, part_id: 1, quantity: 1 },
            { service_part_id: 2, service_id: 2, part_id: 2, quantity: 2 },
        ]

        // Analytics data for mock purposes
        this.sales_data = [
            { month: "January", year: 2023, revenue: 12500, cost: 8200, profit: 4300, parts_sold: 48 },
            { month: "February", year: 2023, revenue: 13200, cost: 8800, profit: 4400, parts_sold: 52 },
            { month: "March", year: 2023, revenue: 15600, cost: 9900, profit: 5700, parts_sold: 63 },
            { month: "April", year: 2023, revenue: 14800, cost: 9200, profit: 5600, parts_sold: 58 },
            { month: "May", year: 2023, revenue: 16500, cost: 10300, profit: 6200, parts_sold: 67 },
            { month: "June", year: 2023, revenue: 18200, cost: 11600, profit: 6600, parts_sold: 72 },
            { month: "July", year: 2023, revenue: 17900, cost: 11200, profit: 6700, parts_sold: 69 },
            { month: "August", year: 2023, revenue: 19500, cost: 12300, profit: 7200, parts_sold: 78 },
            { month: "September", year: 2023, revenue: 20100, cost: 12800, profit: 7300, parts_sold: 83 },
            { month: "October", year: 2023, revenue: 21200, cost: 13500, profit: 7700, parts_sold: 89 },
            { month: "November", year: 2023, revenue: 19800, cost: 12500, profit: 7300, parts_sold: 76 },
            { month: "December", year: 2023, revenue: 22500, cost: 14200, profit: 8300, parts_sold: 93 },
        ]

        this.part_sales = [
            { part_id: 1, year: 2023, units_sold: 120, revenue: 1558.8 },
            { part_id: 2, year: 2023, units_sold: 85, revenue: 3909.15 },
            { part_id: 3, year: 2023, units_sold: 95, revenue: 2849.05 },
        ]

        this.service_stats = [
            { service_type_id: 1, count: 78, revenue: 3900 },
            { service_type_id: 2, count: 45, revenue: 6750 },
            { service_type_id: 3, count: 32, revenue: 6400 },
            { service_type_id: 4, count: 26, revenue: 7800 },
        ]

        // Set next IDs for auto-increment
        this.nextIds = {
            role_id: this.roles.length + 1,
            user_id: this.users.length + 1,
            customer_id: 3,
            vehicle_id: 3,
            retailer_id: 3,
            part_id: 3,
            receipt_id: 3,
            detail_id: 3,
            brand_id: 6,
            model_id: 7,
            compatibility_id: 4,
            service_type_id: 5,
            service_id: 4,
            service_service_type_id: 4,
            service_part_id: 3,
            vendor_id: 3,
            item_id: 5,
        }
    }

    // Helper method to find by ID
    findById(collection, idField, id) {
        return this[collection].find((item) => item[idField] === id)
    }

    // Helper method to find all matching a condition
    findAll(collection, condition = null) {
        if (!condition) {
            return [...this[collection]]
        }
        return this[collection].filter((item) => {
            for (const [key, value] of Object.entries(condition)) {
                if (item[key] !== value) {
                    return false
                }
            }
            return true
        })
    }

    // Helper method to insert a new record
    insert(collection, idField, data) {
        const id = this.nextIds[idField]++
        const newItem = { ...data, [idField]: id }
        this[collection].push(newItem)
        return newItem
    }

    // Helper method to update a record
    update(collection, idField, id, data) {
        const index = this[collection].findIndex((item) => item[idField] === id)
        if (index === -1) {
            return null
        }
        this[collection][index] = { ...this[collection][index], ...data }
        return this[collection][index]
    }

    // Helper method to delete a record
    delete(collection, idField, id) {
        const initialLength = this[collection].length
        this[collection] = this[collection].filter((item) => item[idField] !== id)
        return initialLength > this[collection].length
    }

    // Role methods
    async getRoles() {
        return this.findAll("roles")
    }

    async getRoleById(id) {
        return this.findById("roles", "role_id", id)
    }

    async getRoleByName(name) {
        return this.roles.find((role) => role.name === name)
    }

    // User methods
    async getUsers() {
        return this.findAll("users").map((user) => {
            const role = this.findById("roles", "role_id", user.role_id)
            return {
                ...user,
                role_name: role ? role.name : "unknown",
            }
        })
    }

    async getUserById(id) {
        const user = this.findById("users", "user_id", id)
        if (!user) return null

        const role = this.findById("roles", "role_id", user.role_id)
        return {
            ...user,
            role_name: role ? role.name : "unknown",
        }
    }

    async getUserByEmail(email) {
        const user = this.users.find((user) => user.email === email)
        if (!user) return null

        const role = this.findById("roles", "role_id", user.role_id)
        return {
            ...user,
            role_name: role ? role.name : "unknown",
        }
    }

    async createUser(userData) {
        return this.insert("users", "user_id", userData)
    }

    async updateUser(id, userData) {
        return this.update("users", "user_id", id, userData)
    }

    async deleteUser(id) {
        return this.delete("users", "user_id", id)
    }

    // Customer methods
    async getCustomers(search = null) {
        if (!search) {
            return this.findAll("customers")
        }

        const searchLower = search.toLowerCase()
        return this.customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(searchLower) ||
                customer.email.toLowerCase().includes(searchLower) ||
                customer.phone.includes(search),
        )
    }

    async getCustomerById(id) {
        return this.findById("customers", "customer_id", id)
    }

    async createCustomer(customerData) {
        return this.insert("customers", "customer_id", {
            ...customerData,
            created_at: new Date(),
        })
    }

    async updateCustomer(id, customerData) {
        return this.update("customers", "customer_id", id, customerData)
    }

    // Vehicle methods
    async getVehicles(filters = {}) {
        let vehicles = this.findAll("vehicles")

        if (filters.licensePlate) {
            const searchLower = filters.licensePlate.toLowerCase()
            vehicles = vehicles.filter((v) => v.license_plate.toLowerCase().includes(searchLower))
        }

        if (filters.customerId) {
            vehicles = vehicles.filter((v) => v.customer_id === Number.parseInt(filters.customerId))
        }

        // Add customer info to each vehicle
        return vehicles.map((vehicle) => {
            const customer = this.findById("customers", "customer_id", vehicle.customer_id)
            return {
                ...vehicle,
                customer_name: customer ? customer.name : "Unknown",
                customer_phone: customer ? customer.phone : "Unknown",
            }
        })
    }

    async getVehicleById(id) {
        return this.findById("vehicles", "vehicle_id", id)
    }

    async createVehicle(vehicleData) {
        return this.insert("vehicles", "vehicle_id", {
            ...vehicleData,
            created_at: new Date(),
        })
    }

    // Parts methods
    async getParts(filters = {}) {
        let parts = this.findAll("parts")

        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            parts = parts.filter(
                (p) => p.sku.toLowerCase().includes(searchLower) || p.name.toLowerCase().includes(searchLower),
            )
        }

        if (filters.inStock === "true") {
            parts = parts.filter((p) => p.current_stock > 0)
        }

        return parts
    }

    async getPartById(id) {
        return this.findById("parts", "part_id", id)
    }

    async createPart(partData) {
        return this.insert("parts", "part_id", {
            ...partData,
            created_at: new Date(),
            updated_at: new Date(),
        })
    }

    async updatePartStock(id, change) {
        const part = this.findById("parts", "part_id", id)
        if (!part) return null

        part.current_stock += change
        if (part.current_stock < 0) part.current_stock = 0
        part.updated_at = new Date()

        return part
    }

    // Purchase methods
    async getPurchases(filters = {}) {
        let purchases = this.findAll("purchase_receipts")

        if (filters.startDate && filters.endDate) {
            purchases = purchases.filter(
                (p) => p.purchase_date >= new Date(filters.startDate) && p.purchase_date <= new Date(filters.endDate),
            )
        }

        // Add retailer and user info
        return purchases.map((purchase) => {
            const retailer = this.findById("retailers", "retailer_id", purchase.retailer_id)
            const user = this.findById("users", "user_id", purchase.created_by)

            // Get purchase details
            const details = this.findAll("purchase_details", { receipt_id: purchase.receipt_id }).map((detail) => {
                const part = this.findById("parts", "part_id", detail.part_id)
                return {
                    ...detail,
                    part_name: part ? part.name : "Unknown",
                    sku: part ? part.sku : "Unknown",
                }
            })

            return {
                ...purchase,
                retailer_name: retailer ? retailer.name : "Unknown",
                created_by_name: user ? user.name : "Unknown",
                items: details,
            }
        })
    }

    async getPurchaseById(id) {
        return this.findById("purchase_receipts", "receipt_id", id)
    }

    async createPurchase(purchaseData) {
        const { invoiceNumber, retailerId, totalAmount, createdBy, items } = purchaseData

        // Create purchase receipt
        const receipt = this.insert("purchase_receipts", "receipt_id", {
            invoice_number: invoiceNumber,
            retailer_id: retailerId,
            total_amount: totalAmount,
            purchase_date: new Date(),
            created_by: createdBy,
        })

        // Add purchase details
        if (items && items.length > 0) {
            for (const item of items) {
                this.insert("purchase_details", "detail_id", {
                    receipt_id: receipt.receipt_id,
                    part_id: item.partId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                })

                // Update part stock
                await this.updatePartStock(item.partId, item.quantity)
            }
        }

        return receipt
    }

    // Car data methods
    async getCarBrands() {
        return this.findAll("car_brands")
    }

    async getCarModelsByBrand(brandId) {
        return this.findAll("car_models", { brand_id: Number.parseInt(brandId) })
    }

    async createCarBrand(name) {
        return this.insert("car_brands", "brand_id", { brand_name: name })
    }

    async createCarModel(brandId, name) {
        return this.insert("car_models", "model_id", {
            brand_id: Number.parseInt(brandId),
            model_name: name,
        })
    }

    // Service methods
    async getServices(filters = {}) {
        let services = this.findAll("services")

        if (filters.type === "estimation") {
            services = services.filter((s) => s.is_work_order === false)
        } else if (filters.type === "workOrder") {
            services = services.filter((s) => s.is_work_order === true)
        }

        if (filters.status) {
            services = services.filter((s) => s.status === filters.status)
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            services = services.filter((s) => {
                const vehicle = this.findById("vehicles", "vehicle_id", s.vehicle_id)
                const customer = this.findById("customers", "customer_id", s.customer_id)

                return (
                    (vehicle && vehicle.license_plate.toLowerCase().includes(searchLower)) ||
                    (s.estimation_id && s.estimation_id.toLowerCase().includes(searchLower)) ||
                    (s.work_order_id && s.work_order_id.toLowerCase().includes(searchLower)) ||
                    (customer && customer.name.toLowerCase().includes(searchLower))
                )
            })
        }

        // Add customer and vehicle info
        return services.map((service) => {
            const customer = this.findById("customers", "customer_id", service.customer_id)
            const vehicle = this.findById("vehicles", "vehicle_id", service.vehicle_id)

            return {
                ...service,
                customer_name: customer ? customer.name : "Unknown",
                customer_phone: customer ? customer.phone : "Unknown",
                make: vehicle ? vehicle.make : "Unknown",
                model: vehicle ? vehicle.model : "Unknown",
                year: vehicle ? vehicle.year : "Unknown",
                license_plate: vehicle ? vehicle.license_plate : "Unknown",
            }
        })
    }

    async getServiceById(id) {
        const service = this.findById("services", "service_id", id)
        if (!service) return null

        const customer = this.findById("customers", "customer_id", service.customer_id)
        const vehicle = this.findById("vehicles", "vehicle_id", service.vehicle_id)

        // Get service types
        const serviceTypeLinks = this.findAll("service_service_types", { service_id: service.service_id })
        const serviceTypes = serviceTypeLinks.map((link) => {
            const serviceType = this.findById("service_types", "service_type_id", link.service_type_id)
            return {
                name: serviceType ? serviceType.name : "Unknown",
                description: link.description,
            }
        })

        // Get service parts
        const serviceParts = this.findAll("service_parts", { service_id: service.service_id }).map((sp) => {
            const part = this.findById("parts", "part_id", sp.part_id)
            return {
                id: sp.service_part_id,
                part_id: sp.part_id,
                quantity: sp.quantity,
                name: part ? part.name : "Unknown",
                sku: part ? part.sku : "Unknown",
                price: part ? part.price : 0,
            }
        })

        return {
            ...service,
            customer: customer
                ? {
                    id: customer.customer_id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                }
                : null,
            vehicle: vehicle
                ? {
                    id: vehicle.vehicle_id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    licensePlate: vehicle.license_plate,
                    color: vehicle.color,
                    vin: vehicle.vin,
                    mileage: vehicle.mileage,
                }
                : null,
            serviceTypes,
            parts: serviceParts,
        }
    }

    async createService(serviceData) {
        const { customerId, vehicleId, description, estimatedCompletionDate, status, serviceTypes, parts, isWorkOrder } =
            serviceData

        // Generate IDs
        const estimationId = isWorkOrder
            ? null
            : `EST-${Date.now()}-${Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0")}`
        const workOrderId = isWorkOrder
            ? `WO-${Date.now()}-${Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0")}`
            : null

        // Create service
        const service = this.insert("services", "service_id", {
            customer_id: customerId,
            vehicle_id: vehicleId,
            description,
            estimated_completion_date: new Date(estimatedCompletionDate),
            status: isWorkOrder ? "in_progress" : "pending",
            estimation_id: estimationId,
            work_order_id: workOrderId,
            is_work_order: isWorkOrder ? 1 : 0,
            created_by: 1, // Default to first user
            created_at: new Date(),
            updated_at: new Date(),
        })

        // Add service types
        if (serviceTypes && serviceTypes.length > 0) {
            for (const serviceType of serviceTypes) {
                // Get or create service type
                let serviceTypeId
                const existingType = this.service_types.find((st) => st.name === serviceType.name)

                if (existingType) {
                    serviceTypeId = existingType.service_type_id
                } else {
                    const newType = this.insert("service_types", "service_type_id", {
                        name: serviceType.name,
                        description: serviceType.description || null,
                    })
                    serviceTypeId = newType.service_type_id
                }

                // Link service type to service
                this.insert("service_service_types", "id", {
                    service_id: service.service_id,
                    service_type_id: serviceTypeId,
                    description: serviceType.description || null,
                })
            }
        }

        // Add parts
        if (parts && parts.length > 0) {
            for (const part of parts) {
                // Add service part
                this.insert("service_parts", "service_part_id", {
                    service_id: service.service_id,
                    part_id: part.partId,
                    quantity: part.quantity,
                })

                // Update inventory
                await this.updatePartStock(part.partId, -part.quantity)
            }
        }

        return service
    }

    async updateService(id, serviceData) {
        const { description, estimatedCompletionDate, status, serviceTypes, parts } = serviceData

        // Update service
        const service = this.update("services", "service_id", id, {
            description,
            estimated_completion_date: new Date(estimatedCompletionDate),
            status,
            updated_at: new Date(),
        })

        if (!service) return null

        // Update service types
        if (serviceTypes) {
            // Delete existing service types
            this.service_service_types = this.service_service_types.filter((sst) => sst.service_id !== id)

            // Add new service types
            for (const serviceType of serviceTypes) {
                // Get or create service type
                let serviceTypeId
                const existingType = this.service_types.find((st) => st.name === serviceType.name)

                if (existingType) {
                    serviceTypeId = existingType.service_type_id
                } else {
                    const newType = this.insert("service_types", "service_type_id", {
                        name: serviceType.name,
                        description: serviceType.description || null,
                    })
                    serviceTypeId = newType.service_type_id
                }

                // Link service type to service
                this.insert("service_service_types", "id", {
                    service_id: id,
                    service_type_id: serviceTypeId,
                    description: serviceType.description || null,
                })
            }
        }

        // Update parts
        if (parts) {
            // Get current parts to return to inventory
            const currentParts = this.findAll("service_parts", { service_id: id })

            // Return parts to inventory
            for (const part of currentParts) {
                await this.updatePartStock(part.part_id, part.quantity)
            }

            // Delete existing parts
            this.service_parts = this.service_parts.filter((sp) => sp.service_id !== id)

            // Add new parts
            for (const part of parts) {
                // Add service part
                this.insert("service_parts", "service_part_id", {
                    service_id: id,
                    part_id: part.partId,
                    quantity: part.quantity,
                })

                // Update inventory
                await this.updatePartStock(part.partId, -part.quantity)
            }
        }

        return service
    }

    async convertToWorkOrder(id) {
        const service = this.findById("services", "service_id", id)
        if (!service) return null

        if (service.is_work_order === 1) {
            return { error: "Service is already a work order" }
        }

        // Generate work order ID
        const workOrderId = `WO-${Date.now()}-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`

        // Update service
        this.update("services", "service_id", id, {
            is_work_order: 1,
            work_order_id: workOrderId,
            status: "in_progress",
            updated_at: new Date(),
        })

        return {
            success: true,
            workOrderId,
        }
    }

    // Dashboard methods
    async getDashboardStats(period = null) {
        let dateFilter = () => true

        if (period) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            if (period === "daily") {
                dateFilter = (date) => date >= today
            } else if (period === "monthly") {
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                dateFilter = (date) => date >= firstDayOfMonth
            } else if (period === "yearly") {
                const firstDayOfYear = new Date(now.getFullYear(), 0, 1)
                dateFilter = (date) => date >= firstDayOfYear
            }
        }

        // Calculate total purchase cost
        const filteredPurchases = this.purchase_receipts.filter((p) => dateFilter(p.purchase_date))
        const totalCost = filteredPurchases.reduce((sum, p) => sum + p.total_amount, 0)

        // Calculate total inventory value
        const totalInventoryValue = this.parts.reduce((sum, p) => sum + p.price * p.current_stock, 0)

        // Count services by status
        const pendingCount = this.services.filter((s) => s.status === "pending").length
        const inProgressCount = this.services.filter((s) => s.status === "in_progress").length
        const completedCount = this.services.filter((s) => s.status === "completed").length

        return {
            totalCost,
            totalInventoryValue,
            serviceStats: {
                pending: pendingCount,
                inProgress: inProgressCount,
                completed: completedCount,
            },
        }
    }

    async getAgingStock(months = 1) {
        // Calculate date that is 'months' ago
        const cutoffDate = new Date()
        cutoffDate.setMonth(cutoffDate.getMonth() - months)

        // Get parts with purchase date older than cutoff
        const agingStock = []

        for (const part of this.parts) {
            if (part.current_stock <= 0) continue

            // Find purchase details for this part
            const purchaseDetails = this.purchase_details.filter((pd) => pd.part_id === part.part_id)

            for (const detail of purchaseDetails) {
                const receipt = this.findById("purchase_receipts", "receipt_id", detail.receipt_id)

                if (receipt && receipt.purchase_date < cutoffDate) {
                    // Get compatibility info
                    const compatibility = this.part_compatibility
                        .filter((pc) => pc.part_id === part.part_id)
                        .map((pc) => {
                            const brand = this.findById("car_brands", "brand_id", pc.brand_id)
                            const model = this.findById("car_models", "model_id", pc.model_id)

                            return {
                                brand_name: brand ? brand.brand_name : "Unknown",
                                model_name: model ? model.model_name : "Unknown",
                                year_from: pc.year_from,
                                year_to: pc.year_to,
                            }
                        })

                    agingStock.push({
                        ...part,
                        receipt_id: receipt.receipt_id,
                        purchase_date: receipt.purchase_date,
                        compatibility,
                    })

                    break // Only add once per part
                }
            }
        }

        return agingStock
    }
}

module.exports = MockDatabase

// This is a mock implementation of the database for development and testing
// It will be used when USE_MOCK_DB environment variable is set to true

const mockDb = {
    // Mock data storage
    users: [
        { id: "1", username: "admin", password: "admin123", name: "Admin User", role: "admin" },
        { id: "2", username: "officer", password: "officer123", name: "Officer User", role: "officer" },
    ],
    roles: [
        { id: "admin", name: "Administrator", permissions: ["all"] },
        { id: "officer", name: "Service Officer", permissions: ["read:all", "write:customer", "write:inventory"] },
    ],
    customers: [],
    vehicles: [],
    services: [],
    inventory: [],
    purchaseReceipts: [],

    // Mock inventory methods
    inventory: {
        getParts: async () => {
            // Return mock parts data
            return [
                { id: "brake-pad-001", sku: "BP001", name: "Brake Pad - Standard" },
                { id: "brake-pad-002", sku: "BP002", name: "Brake Pad - Premium" },
                { id: "oil-filter-001", sku: "OF001", name: "Oil Filter - Standard" },
                { id: "oil-filter-002", sku: "OF002", name: "Oil Filter - Premium" },
                { id: "air-filter-001", sku: "AF001", name: "Air Filter - Standard" },
                { id: "air-filter-002", sku: "AF002", name: "Air Filter - Premium" },
                { id: "spark-plug-001", sku: "SP001", name: "Spark Plug - Standard" },
                { id: "spark-plug-002", sku: "SP002", name: "Spark Plug - Iridium" },
                { id: "battery-001", sku: "BT001", name: "Car Battery - 45Ah" },
                { id: "battery-002", sku: "BT002", name: "Car Battery - 60Ah" },
                { id: "alternator-001", sku: "AL001", name: "Alternator - Standard" },
                { id: "alternator-002", sku: "AL002", name: "Alternator - High Output" },
                { id: "radiator-001", sku: "RD001", name: "Radiator - Aluminum" },
                { id: "radiator-002", sku: "RD002", name: "Radiator - Copper/Brass" },
                { id: "water-pump-001", sku: "WP001", name: "Water Pump - Standard" },
                { id: "timing-belt-001", sku: "TB001", name: "Timing Belt - Standard" },
                { id: "fuel-pump-001", sku: "FP001", name: "Fuel Pump - Electric" },
                { id: "shock-absorber-001", sku: "SA001", name: "Shock Absorber - Front" },
                { id: "shock-absorber-002", sku: "SA002", name: "Shock Absorber - Rear" },
                { id: "clutch-kit-001", sku: "CK001", name: "Clutch Kit - Standard" },
                { id: "headlight-001", sku: "HL001", name: "Headlight - Halogen" },
                { id: "headlight-002", sku: "HL002", name: "Headlight - LED" },
                { id: "tail-light-001", sku: "TL001", name: "Tail Light - Standard" },
                { id: "windshield-wiper-001", sku: "WW001", name: 'Windshield Wiper - 18"' },
                { id: "windshield-wiper-002", sku: "WW002", name: 'Windshield Wiper - 20"' },
            ]
        },
        findById: async (id) => {
            // Simulate finding a part by ID
            const parts = await mockDb.inventory.getParts()
            return parts.find((part) => part.id === id) || null
        },
        create: async (data) => {
            // Simulate creating a new part
            const newPart = {
                id: `part-${Date.now()}`,
                ...data,
                createdAt: new Date(),
            }
            mockDb.inventory.push(newPart)
            return newPart
        },
        update: async (id, data) => {
            // Simulate updating a part
            const index = mockDb.inventory.findIndex((item) => item.id === id)
            if (index === -1) return null

            mockDb.inventory[index] = {
                ...mockDb.inventory[index],
                ...data,
                updatedAt: new Date(),
            }

            return mockDb.inventory[index]
        },
        delete: async (id) => {
            // Simulate deleting a part
            const index = mockDb.inventory.findIndex((item) => item.id === id)
            if (index === -1) return false

            mockDb.inventory.splice(index, 1)
            return true
        },
    },

    // Mock purchase receipt methods
    purchaseReceipt: {
        create: async (data) => {
            // Simulate creating a new purchase receipt
            const newReceipt = {
                id: `receipt-${Date.now()}`,
                ...data,
                createdAt: new Date(),
            }
            mockDb.purchaseReceipts.push(newReceipt)

            // Also add items to inventory
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item) => {
                    mockDb.inventory.push({
                        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        sku: item.sku,
                        name: item.name,
                        description: item.description || "",
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        purchaseDate: data.purchaseDate,
                        vendorName: data.vendorName,
                        compatibleCars: item.compatibleCars || [],
                        createdAt: new Date(),
                    })
                })
            }

            return newReceipt
        },
        findMany: async (query = {}) => {
            // Simulate querying purchase receipts
            return mockDb.purchaseReceipts
        },
        findById: async (id) => {
            // Simulate finding a receipt by ID
            return mockDb.purchaseReceipts.find((receipt) => receipt.id === id) || null
        },
    },

    // Mock car data methods
    car: {
        getBrands: async () => {
            return ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Hyundai"]
        },
        getModelsByBrand: async (brand) => {
            const models = {
                Toyota: ["Corolla", "Camry", "RAV4", "Highlander", "Tacoma"],
                Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey"],
                Ford: ["F-150", "Escape", "Explorer", "Mustang", "Focus"],
                Chevrolet: ["Silverado", "Equinox", "Malibu", "Tahoe", "Suburban"],
                Nissan: ["Altima", "Rogue", "Sentra", "Pathfinder", "Frontier"],
                BMW: ["3 Series", "5 Series", "X3", "X5", "7 Series"],
                "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE", "S-Class"],
                Audi: ["A4", "A6", "Q5", "Q7", "A8"],
                Volkswagen: ["Jetta", "Passat", "Tiguan", "Atlas", "Golf"],
                Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade"],
            }

            return models[brand] || []
        },
        isValidBrand: async (brand) => {
            const brands = await mockDb.car.getBrands()
            return brands.includes(brand)
        },
        isValidModel: async (brand, model) => {
            const models = await mockDb.car.getModelsByBrand(brand)
            return models.includes(model)
        },
    },

    // Other mock methods as needed...
}

module.exports = mockDb


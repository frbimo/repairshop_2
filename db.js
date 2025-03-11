// DEBUG: disable below
// const mysql = require("mysql2/promise")
// require("dotenv").config()

// // Database connection configuration
// const dbConfig = {
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "password",
//     database: process.env.DB_NAME || "auto_repair_system",
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// }

// // Create a pool that can be used throughout the application
// const pool = mysql.createPool(dbConfig)

// // Test database connection
// async function testConnection() {
//     try {
//         const connection = await pool.getConnection()
//         console.log("Database connection successful")
//         connection.release()
//         return true
//     } catch (error) {
//         console.error("Database connection failed:", error)
//         return false
//     }
// }

// module.exports = {
//     pool,
//     testConnection,
// }

/* DEBUG: below this line should be disabled if in prod.*/
const mysql = require("mysql2/promise")
const MockDatabase = require("./mock-db")
require("dotenv").config()

// Check if mock database should be used
const useMockDb = process.env.USE_MOCK_DB === "true"

// Create mock database instance
const mockDb = new MockDatabase()

// Database connection configuration for real database
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "auto_repair_system",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}

// Create a pool that can be used throughout the application
const pool = useMockDb ? null : mysql.createPool(dbConfig)

// Test database connection
async function testConnection() {
    if (useMockDb) {
        console.log("Using mock database for debugging")
        return true
    }

    try {
        const connection = await pool.getConnection()
        console.log("Database connection successful")
        connection.release()
        return true
    } catch (error) {
        console.error("Database connection failed:", error)
        return false
    }
}

// Database interface that works with both real and mock database
const db = {
    // User methods
    async getUsers() {
        if (useMockDb) {
            return mockDb.getUsers()
        }

        const [rows] = await pool.query("SELECT user_id, name, email, role, created_at FROM users")
        return rows
    },

    async getUserById(id) {
        if (useMockDb) {
            return mockDb.getUserById(id)
        }

        const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id])
        return rows.length > 0 ? rows[0] : null
    },

    async getUserByEmail(email) {
        if (useMockDb) {
            return mockDb.getUserByEmail(email)
        }

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
        return rows.length > 0 ? rows[0] : null
    },

    async createUser(userData) {
        if (useMockDb) {
            return mockDb.createUser(userData)
        }

        const [result] = await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [
            userData.name,
            userData.email,
            userData.password_hash,
            userData.role,
        ])

        return { ...userData, user_id: result.insertId }
    },

    async updateUser(id, userData) {
        if (useMockDb) {
            return mockDb.updateUser(id, userData)
        }

        // Build update query
        let updateQuery = "UPDATE users SET "
        const updateValues = []

        if (userData.name) {
            updateQuery += "name = ?, "
            updateValues.push(userData.name)
        }

        if (userData.email) {
            updateQuery += "email = ?, "
            updateValues.push(userData.email)
        }

        if (userData.password_hash) {
            updateQuery += "password_hash = ?, "
            updateValues.push(userData.password_hash)
        }

        if (userData.role) {
            updateQuery += "role = ?, "
            updateValues.push(userData.role)
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2)

        // Add WHERE clause
        updateQuery += " WHERE user_id = ?"
        updateValues.push(id)

        // Execute update
        await pool.query(updateQuery, updateValues)

        // Get updated user
        return this.getUserById(id)
    },

    async deleteUser(id) {
        if (useMockDb) {
            return mockDb.deleteUser(id)
        }

        const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [id])
        return result.affectedRows > 0
    },

    // Customer methods
    async getCustomers(search = null) {
        if (useMockDb) {
            return mockDb.getCustomers(search)
        }

        let query = "SELECT * FROM customers"
        const queryParams = []

        if (search) {
            query += " WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?"
            const searchTerm = `%${search}%`
            queryParams.push(searchTerm, searchTerm, searchTerm)
        }

        query += " ORDER BY name"
        const [rows] = await pool.query(query, queryParams)

        return rows
    },

    async getCustomerById(id) {
        if (useMockDb) {
            return mockDb.getCustomerById(id)
        }

        const [rows] = await pool.query("SELECT * FROM customers WHERE customer_id = ?", [id])
        return rows.length > 0 ? rows[0] : null
    },

    async createCustomer(customerData) {
        if (useMockDb) {
            return mockDb.createCustomer(customerData)
        }

        const [result] = await pool.query("INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)", [
            customerData.name,
            customerData.email,
            customerData.phone,
            customerData.address,
        ])

        return { ...customerData, customer_id: result.insertId }
    },

    // Vehicle methods
    async getVehicles(filters = {}) {
        if (useMockDb) {
            return mockDb.getVehicles(filters)
        }

        let query = `
      SELECT v.*, c.name as customer_name, c.phone as customer_phone
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.customer_id
    `
        const queryParams = []

        if (filters.licensePlate) {
            query += " WHERE v.license_plate LIKE ?"
            queryParams.push(`%${filters.licensePlate}%`)
        } else if (filters.customerId) {
            query += " WHERE v.customer_id = ?"
            queryParams.push(filters.customerId)
        }

        query += " ORDER BY v.created_at DESC"

        const [rows] = await pool.query(query, queryParams)
        return rows
    },

    async createVehicle(vehicleData) {
        if (useMockDb) {
            return mockDb.createVehicle(vehicleData)
        }

        const [result] = await pool.query(
            "INSERT INTO vehicles (customer_id, make, model, year, license_plate, color, vin, mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                vehicleData.customerId,
                vehicleData.make,
                vehicleData.model,
                vehicleData.year,
                vehicleData.licensePlate,
                vehicleData.color,
                vehicleData.vin || null,
                vehicleData.mileage || 0,
            ],
        )

        return { ...vehicleData, vehicle_id: result.insertId }
    },

    // Parts methods
    async getParts(filters = {}) {
        if (useMockDb) {
            return mockDb.getParts(filters)
        }

        let query = "SELECT * FROM parts"
        const queryParams = []

        if (filters.search) {
            query += " WHERE sku LIKE ? OR name LIKE ?"
            const searchTerm = `%${filters.search}%`
            queryParams.push(searchTerm, searchTerm)
        }

        if (filters.inStock === "true") {
            if (queryParams.length > 0) {
                query += " AND current_stock > 0"
            } else {
                query += " WHERE current_stock > 0"
            }
        }

        query += " ORDER BY name"

        const [rows] = await pool.query(query, queryParams)
        return rows
    },

    // Service methods
    async getServices(filters = {}) {
        if (useMockDb) {
            return mockDb.getServices(filters)
        }

        let query = `
      SELECT s.*, c.name as customer_name, c.phone as customer_phone,
             v.make, v.model, v.year, v.license_plate
      FROM services s
      JOIN customers c ON s.customer_id = c.customer_id
      JOIN vehicles v ON s.vehicle_id = v.vehicle_id
    `
        const queryParams = []

        const whereConditions = []

        if (filters.type === "estimation") {
            whereConditions.push("s.is_work_order = 0")
        } else if (filters.type === "workOrder") {
            whereConditions.push("s.is_work_order = 1")
        }

        if (filters.status) {
            whereConditions.push("s.status = ?")
            queryParams.push(filters.status)
        }

        if (filters.search) {
            whereConditions.push(
                "(v.license_plate LIKE ? OR s.estimation_id LIKE ? OR s.work_order_id LIKE ? OR c.name LIKE ?)",
            )
            const searchTerm = `%${filters.search}%`
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
        }

        if (whereConditions.length > 0) {
            query += " WHERE " + whereConditions.join(" AND ")
        }

        query += " ORDER BY s.created_at DESC"

        const [rows] = await pool.query(query, queryParams)
        return rows
    },

    async getServiceById(id) {
        if (useMockDb) {
            return mockDb.getServiceById(id)
        }

        // Get service details with customer and vehicle info
        const [serviceRows] = await pool.query(
            `SELECT s.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address,
              v.make, v.model, v.year, v.license_plate, v.color, v.vin, v.mileage
       FROM services s
       JOIN customers c ON s.customer_id = c.customer_id
       JOIN vehicles v ON s.vehicle_id = v.vehicle_id
       WHERE s.service_id = ?`,
            [id],
        )

        if (serviceRows.length === 0) {
            return null
        }

        const service = serviceRows[0]

        // Get service types
        const [serviceTypeRows] = await pool.query(
            `SELECT st.name, sst.description
       FROM service_service_types sst
       JOIN service_types st ON sst.service_type_id = st.service_type_id
       WHERE sst.service_id = ?`,
            [id],
        )

        // Get service parts
        const [servicePartRows] = await pool.query(
            `SELECT sp.*, p.name as part_name, p.sku, p.price
       FROM service_parts sp
       JOIN parts p ON sp.part_id = p.part_id
       WHERE sp.service_id = ?`,
            [id],
        )

        // Build response
        return {
            ...service,
            serviceTypes: serviceTypeRows,
            parts: servicePartRows,
            customer: {
                id: service.customer_id,
                name: service.customer_name,
                email: service.customer_email,
                phone: service.customer_phone,
                address: service.customer_address,
            },
            vehicle: {
                id: service.vehicle_id,
                make: service.make,
                model: service.model,
                year: service.year,
                licensePlate: service.license_plate,
                color: service.color,
                vin: service.vin,
                mileage: service.mileage,
            },
        }
    },

    // Dashboard methods
    async getDashboardStats(period = null) {
        if (useMockDb) {
            return mockDb.getDashboardStats(period)
        }

        let dateFilter = ""

        if (period === "daily") {
            dateFilter = "DATE(created_at) = CURDATE()"
        } else if (period === "monthly") {
            dateFilter = "YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())"
        } else if (period === "yearly") {
            dateFilter = "YEAR(created_at) = YEAR(CURDATE())"
        } else {
            // Default to all time
            dateFilter = "1=1"
        }

        // Get total purchase cost
        const [totalCostRows] = await pool.query(
            `SELECT SUM(total_amount) as total_cost FROM purchase_receipts WHERE ${dateFilter}`,
        )

        // Get total inventory value
        const [totalInventoryRows] = await pool.query("SELECT SUM(current_stock * price) as total_value FROM parts")

        // Get service counts by status
        const [servicesRows] = await pool.query("SELECT status, COUNT(*) as count FROM services GROUP BY status")

        return {
            totalCost: totalCostRows[0].total_cost || 0,
            totalInventoryValue: totalInventoryRows[0].total_value || 0,
            serviceStats: {
                pending: servicesRows.find((row) => row.status === "pending")?.count || 0,
                inProgress: servicesRows.find((row) => row.status === "in_progress")?.count || 0,
                completed: servicesRows.find((row) => row.status === "completed")?.count || 0,
            },
        }
    },

    // Add more methods as needed to match your API requirements
}

module.exports = {
    pool,
    testConnection,
    db,
    useMockDb,
}


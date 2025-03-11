const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "auto_repair_system",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) return res.status(401).json({ error: "Unauthorized" })

    jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden" })
        req.user = user
        next()
    })
}

// Admin role check middleware
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    } else {
        res.status(403).json({ error: "Admin access required" })
    }
}

// ======== Auth Routes ========
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const [rows] = await pool.query("SELECT user_id, name, email, password_hash, role FROM users WHERE email = ?", [
            email,
        ])

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        const user = rows[0]
        const passwordMatch = await bcrypt.compare(password, user.password_hash)

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "24h" },
        )

        res.json({
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// ======== User Management Routes ========
app.get("/api/users", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT user_id, name, email, role, created_at FROM users")
        res.json(rows)
    } catch (error) {
        console.error("Error fetching users:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/users", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        // Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" })
        }

        // Check if email already exists
        const [existingUsers] = await pool.query("SELECT email FROM users WHERE email = ?", [email])
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "Email already exists" })
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Insert user
        const [result] = await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [
            name,
            email,
            passwordHash,
            role,
        ])

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role,
        })
    } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.put("/api/users/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, password, role } = req.body

        // Get current user data
        const [users] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id])
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" })
        }

        // Check email uniqueness if changing email
        if (email && email !== users[0].email) {
            const [existingUsers] = await pool.query("SELECT email FROM users WHERE email = ? AND user_id != ?", [email, id])
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: "Email already exists" })
            }
        }

        // Build update query
        let updateQuery = "UPDATE users SET "
        const updateValues = []

        if (name) {
            updateQuery += "name = ?, "
            updateValues.push(name)
        }

        if (email) {
            updateQuery += "email = ?, "
            updateValues.push(email)
        }

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10)
            updateQuery += "password_hash = ?, "
            updateValues.push(passwordHash)
        }

        if (role) {
            updateQuery += "role = ?, "
            updateValues.push(role)
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2)

        // Add WHERE clause
        updateQuery += " WHERE user_id = ?"
        updateValues.push(id)

        // Execute update
        await pool.query(updateQuery, updateValues)

        res.json({ message: "User updated successfully" })
    } catch (error) {
        console.error("Error updating user:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.delete("/api/users/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params

        // Check if user exists
        const [users] = await pool.query("SELECT user_id FROM users WHERE user_id = ?", [id])
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" })
        }

        // Prevent deleting your own account
        if (Number.parseInt(id) === req.user.id) {
            return res.status(400).json({ error: "Cannot delete your own account" })
        }

        // Delete user
        await pool.query("DELETE FROM users WHERE user_id = ?", [id])

        res.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Error deleting user:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// ======== Car Data Routes ========
app.get("/api/car-brands", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT brand_id, brand_name FROM car_brands ORDER BY brand_name")
        res.json(rows)
    } catch (error) {
        console.error("Error fetching car brands:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/car-models/:brandId", async (req, res) => {
    try {
        const { brandId } = req.params
        const [rows] = await pool.query(
            "SELECT model_id, model_name FROM car_models WHERE brand_id = ? ORDER BY model_name",
            [brandId],
        )
        res.json(rows)
    } catch (error) {
        console.error("Error fetching car models:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// ======== Customer Routes ========
app.get("/api/customers", authenticateToken, async (req, res) => {
    try {
        const { search } = req.query
        let query = "SELECT * FROM customers"
        const queryParams = []

        if (search) {
            query += " WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?"
            const searchTerm = `%${search}%`
            queryParams.push(searchTerm, searchTerm, searchTerm)
        }

        query += " ORDER BY name"
        const [rows] = await pool.query(query, queryParams)

        res.json(rows)
    } catch (error) {
        console.error("Error fetching customers:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/customers/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params

        // Get customer details
        const [customerRows] = await pool.query("SELECT * FROM customers WHERE customer_id = ?", [id])

        if (customerRows.length === 0) {
            return res.status(404).json({ error: "Customer not found" })
        }

        // Get customer's vehicles
        const [vehicleRows] = await pool.query("SELECT * FROM vehicles WHERE customer_id = ?", [id])

        // Get customer's services
        const [serviceRows] = await pool.query(
            `SELECT s.*, v.make, v.model, v.year, v.license_plate 
       FROM services s 
       JOIN vehicles v ON s.vehicle_id = v.vehicle_id 
       WHERE s.customer_id = ?
       ORDER BY s.created_at DESC`,
            [id],
        )

        res.json({
            customer: customerRows[0],
            vehicles: vehicleRows,
            services: serviceRows,
        })
    } catch (error) {
        console.error("Error fetching customer details:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/customers", authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body

        // Validate input
        if (!name || !email || !phone || !address) {
            return res.status(400).json({ error: "All fields are required" })
        }

        // Insert customer
        const [result] = await pool.query("INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)", [
            name,
            email,
            phone,
            address,
        ])

        res.status(201).json({
            customerId: result.insertId,
            name,
            email,
            phone,
            address,
        })
    } catch (error) {
        console.error("Error creating customer:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.put("/api/customers/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, phone, address } = req.body

        // Validate input
        if (!name || !email || !phone || !address) {
            return res.status(400).json({ error: "All fields are required" })
        }

        // Check if customer exists
        const [customers] = await pool.query("SELECT customer_id FROM customers WHERE customer_id = ?", [id])
        if (customers.length === 0) {
            return res.status(404).json({ error: "Customer not found" })
        }

        // Update customer
        await pool.query("UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE customer_id = ?", [
            name,
            email,
            phone,
            address,
            id,
        ])

        res.json({ message: "Customer updated successfully" })
    } catch (error) {
        console.error("Error updating customer:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// ======== Vehicle Routes ========
app.post("/api/vehicles", authenticateToken, async (req, res) => {
    try {
        const { customerId, make, model, year, licensePlate, color, vin, mileage } = req.body

        // Validate input
        if (!customerId || !make || !model || !year || !licensePlate || !color) {
            return res.status(400).json({ error: "Required fields are missing" })
        }

        // Check if license plate already exists
        const [existingVehicles] = await pool.query("SELECT vehicle_id FROM vehicles WHERE license_plate = ?", [
            licensePlate,
        ])
        if (existingVehicles.length > 0) {
            return res.status(400).json({ error: "License plate already exists" })
        }

        // Insert vehicle
        const [result] = await pool.query(
            "INSERT INTO vehicles (customer_id, make, model, year, license_plate, color, vin, mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [customerId, make, model, year, licensePlate, color, vin || null, mileage || 0],
        )

        res.status(201).json({
            vehicleId: result.insertId,
            customerId,
            make,
            model,
            year,
            licensePlate,
            color,
            vin,
            mileage,
        })
    } catch (error) {
        console.error("Error creating vehicle:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/vehicles", authenticateToken, async (req, res) => {
    try {
        const { licensePlate, customerId } = req.query

        let query = `
      SELECT v.*, c.name as customer_name, c.phone as customer_phone
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.customer_id
    `
        const queryParams = []

        if (licensePlate) {
            query += " WHERE v.license_plate LIKE ?"
            queryParams.push(`%${licensePlate}%`)
        } else if (customerId) {
            query += " WHERE v.customer_id = ?"
            queryParams.push(customerId)
        }

        query += " ORDER BY v.created_at DESC"

        const [rows] = await pool.query(query, queryParams)
        res.json(rows)
    } catch (error) {
        console.error("Error fetching vehicles:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// ======== Inventory/Parts Routes ========
app.get("/api/parts", authenticateToken, async (req, res) => {
    try {
        const { search, inStock } = req.query

        let query = "SELECT * FROM parts"
        const queryParams = []

        if (search) {
            query += " WHERE sku LIKE ? OR name LIKE ?"
            const searchTerm = `%${search}%`
            queryParams.push(searchTerm, searchTerm)
        }

        if (inStock === "true") {
            if (queryParams.length > 0) {
                query += " AND current_stock > 0"
            } else {
                query += " WHERE current_stock > 0"
            }
        }

        query += " ORDER BY name"

        const [rows] = await pool.query(query, queryParams)
        res.json(rows)
    } catch (error) {
        console.error("Error fetching parts:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/parts", authenticateToken, async (req, res) => {
    try {
        const { sku, name, description, price, currentStock } = req.body

        // Validate input
        if (!sku || !name || !price) {
            return res.status(400).json({ error: "Required fields are missing" })
        }

        // Check if SKU already exists
        const [existingParts] = await pool.query("SELECT part_id FROM parts WHERE sku = ?", [sku])
        if (existingParts.length > 0) {
            return res.status(400).json({ error: "SKU already exists" })
        }

        // Insert part
        const [result] = await pool.query(
            "INSERT INTO parts (sku, name, description, price, current_stock) VALUES (?, ?, ?, ?, ?)",
            [sku, name, description || null, price, currentStock || 0],
        )

        res.status(201).json({
            partId: result.insertId,
            sku,
            name,
            description,
            price,
            currentStock: currentStock || 0,
        })
    } catch (error) {
        console.error("Error creating part:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// ======== Purchase Routes ========
app.post("/api/purchases", authenticateToken, async (req, res) => {
    const connection = await pool.getConnection()

    try {
        const { invoiceNumber, retailerId, items, totalAmount } = req.body

        // Validate input
        if (!invoiceNumber || !retailerId || !items || items.length === 0) {
            return res.status(400).json({ error: "Required fields are missing" })
        }

        // Start transaction
        await connection.beginTransaction()

        // Create purchase receipt
        const [receiptResult] = await connection.query(
            "INSERT INTO purchase_receipts (invoice_number, retailer_id, total_amount, created_by) VALUES (?, ?, ?, ?)",
            [invoiceNumber, retailerId, totalAmount, req.user.id],
        )

        const receiptId = receiptResult.insertId

        // Add purchase details and update inventory
        for (const item of items) {
            const { partId, quantity, unitPrice } = item

            // Add purchase detail
            await connection.query(
                "INSERT INTO purchase_details (receipt_id, part_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                [receiptId, partId, quantity, unitPrice],
            )

            // Update part inventory
            await connection.query("UPDATE parts SET current_stock = current_stock + ? WHERE part_id = ?", [quantity, partId])
        }

        // Commit transaction
        await connection.commit()

        res.status(201).json({
            receiptId,
            invoiceNumber,
            totalAmount,
            items,
        })
    } catch (error) {
        // Rollback on error
        await connection.rollback()
        console.error("Error creating purchase:", error)
        res.status(500).json({ error: "Internal server error" })
    } finally {
        connection.release()
    }
})

app.get("/api/purchases", authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        let query = `
      SELECT pr.*, r.name as retailer_name, u.name as created_by_name
      FROM purchase_receipts pr
      JOIN retailers r ON pr.retailer_id = r.retailer_id
      JOIN users u ON pr.created_by = u.user_id
    `
        const queryParams = []

        if (startDate && endDate) {
            query += " WHERE pr.purchase_date BETWEEN ? AND ?"
            queryParams.push(startDate, endDate)
        }

        query += " ORDER BY pr.purchase_date DESC"

        const [rows] = await pool.query(query, queryParams)

        // Get purchase details for each receipt
        for (const receipt of rows) {
            const [detailRows] = await pool.query(
                `SELECT pd.*, p.name as part_name, p.sku 
         FROM purchase_details pd
         JOIN parts p ON pd.part_id = p.part_id
         WHERE pd.receipt_id = ?`,
                [receipt.receipt_id],
            )

            receipt.items = detailRows
        }

        res.json(rows)
    } catch (error) {
        console.error("Error fetching purchases:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// ======== Service Routes ========
app.post("/api/services", authenticateToken, async (req, res) => {
    const connection = await pool.getConnection()

    try {
        const { customerId, vehicleId, description, estimatedCompletionDate, serviceTypes, parts, isWorkOrder } = req.body

        // Validate input
        if (!customerId || !vehicleId || !description || !estimatedCompletionDate || !serviceTypes) {
            return res.status(400).json({ error: "Required fields are missing" })
        }

        // Start transaction
        await connection.beginTransaction()

        // Generate unique IDs
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

        // Create service record
        const [serviceResult] = await connection.query(
            `INSERT INTO services 
       (customer_id, vehicle_id, description, estimated_completion_date, 
        status, estimation_id, work_order_id, is_work_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerId,
                vehicleId,
                description,
                estimatedCompletionDate,
                isWorkOrder ? "in_progress" : "pending",
                estimationId,
                workOrderId,
                isWorkOrder ? 1 : 0,
                req.user.id,
            ],
        )

        const serviceId = serviceResult.insertId

        // Add service types
        for (const serviceType of serviceTypes) {
            let serviceTypeId

            // Get or create service type
            const [serviceTypeRows] = await connection.query("SELECT service_type_id FROM service_types WHERE name = ?", [
                serviceType.name,
            ])

            if (serviceTypeRows.length > 0) {
                serviceTypeId = serviceTypeRows[0].service_type_id
            } else {
                const [newTypeResult] = await connection.query("INSERT INTO service_types (name, description) VALUES (?, ?)", [
                    serviceType.name,
                    serviceType.description || null,
                ])
                serviceTypeId = newTypeResult.insertId
            }

            // Link service type to service
            await connection.query(
                "INSERT INTO service_service_types (service_id, service_type_id, description) VALUES (?, ?, ?)",
                [serviceId, serviceTypeId, serviceType.description || null],
            )
        }

        // Add parts if provided
        if (parts && parts.length > 0) {
            for (const part of parts) {
                // Add service part
                await connection.query("INSERT INTO service_parts (service_id, part_id, quantity) VALUES (?, ?, ?)", [
                    serviceId,
                    part.partId,
                    part.quantity,
                ])

                // Update inventory (reduce stock)
                await connection.query("UPDATE parts SET current_stock = current_stock - ? WHERE part_id = ?", [
                    part.quantity,
                    part.partId,
                ])
            }
        }

        // Commit transaction
        await connection.commit()

        res.status(201).json({
            serviceId,
            customerId,
            vehicleId,
            description,
            estimatedCompletionDate,
            status: isWorkOrder ? "in_progress" : "pending",
            estimationId,
            workOrderId,
            isWorkOrder: isWorkOrder ? true : false,
        })
    } catch (error) {
        // Rollback on error
        await connection.rollback()
        console.error("Error creating service:", error)
        res.status(500).json({ error: "Internal server error" })
    } finally {
        connection.release()
    }
})

app.get("/api/services", authenticateToken, async (req, res) => {
    try {
        const { type, status, search } = req.query

        let query = `
      SELECT s.*, c.name as customer_name, c.phone as customer_phone,
             v.make, v.model, v.year, v.license_plate
      FROM services s
      JOIN customers c ON s.customer_id = c.customer_id
      JOIN vehicles v ON s.vehicle_id = v.vehicle_id
    `
        const queryParams = []

        const whereConditions = []

        if (type === "estimation") {
            whereConditions.push("s.is_work_order = 0")
        } else if (type === "workOrder") {
            whereConditions.push("s.is_work_order = 1")
        }

        if (status) {
            whereConditions.push("s.status = ?")
            queryParams.push(status)
        }

        if (search) {
            whereConditions.push(
                "(v.license_plate LIKE ? OR s.estimation_id LIKE ? OR s.work_order_id LIKE ? OR c.name LIKE ?)",
            )
            const searchTerm = `%${search}%`
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
        }

        if (whereConditions.length > 0) {
            query += " WHERE " + whereConditions.join(" AND ")
        }

        query += " ORDER BY s.created_at DESC"

        const [rows] = await pool.query(query, queryParams)
        res.json(rows)
    } catch (error) {
        console.error("Error fetching services:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/services/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params

        // Get service details
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
            return res.status(404).json({ error: "Service not found" })
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
        const response = {
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

        // Remove redundant fields
        delete response.customer_name
        delete response.customer_email
        delete response.customer_phone
        delete response.customer_address
        delete response.make
        delete response.model
        delete response.year
        delete response.license_plate
        delete response.color
        delete response.vin
        delete response.mileage

        res.json(response)
    } catch (error) {
        console.error("Error fetching service details:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.put("/api/services/:id", authenticateToken, async (req, res) => {
    const connection = await pool.getConnection()

    try {
        const { id } = req.params
        const { description, estimatedCompletionDate, status, serviceTypes, parts } = req.body

        // Check for admin role if it's a work order
        const [serviceCheck] = await pool.query("SELECT is_work_order FROM services WHERE service_id = ?", [id])

        if (serviceCheck.length === 0) {
            return res.status(404).json({ error: "Service not found" })
        }

        const isWorkOrder = serviceCheck[0].is_work_order === 1

        if (isWorkOrder && req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin access required to edit work orders" })
        }

        // Start transaction
        await connection.beginTransaction()

        // Update service
        await connection.query(
            "UPDATE services SET description = ?, estimated_completion_date = ?, status = ? WHERE service_id = ?",
            [description, estimatedCompletionDate, status, id],
        )

        // Update service types
        if (serviceTypes) {
            // Delete existing service types
            await connection.query("DELETE FROM service_service_types WHERE service_id = ?", [id])

            // Add new service types
            for (const serviceType of serviceTypes) {
                let serviceTypeId

                // Get or create service type
                const [serviceTypeRows] = await connection.query("SELECT service_type_id FROM service_types WHERE name = ?", [
                    serviceType.name,
                ])

                if (serviceTypeRows.length > 0) {
                    serviceTypeId = serviceTypeRows[0].service_type_id
                } else {
                    const [newTypeResult] = await connection.query(
                        "INSERT INTO service_types (name, description) VALUES (?, ?)",
                        [serviceType.name, serviceType.description || null],
                    )
                    serviceTypeId = newTypeResult.insertId
                }

                // Link service type to service
                await connection.query(
                    "INSERT INTO service_service_types (service_id, service_type_id, description) VALUES (?, ?, ?)",
                    [id, serviceTypeId, serviceType.description || null],
                )
            }
        }

        // Update parts
        if (parts) {
            // Get current parts to return to inventory
            const [currentParts] = await connection.query(
                "SELECT part_id, quantity FROM service_parts WHERE service_id = ?",
                [id],
            )

            // Return parts to inventory
            for (const part of currentParts) {
                await connection.query("UPDATE parts SET current_stock = current_stock + ? WHERE part_id = ?", [
                    part.quantity,
                    part.part_id,
                ])
            }

            // Delete existing parts
            await connection.query("DELETE FROM service_parts WHERE service_id = ?", [id])

            // Add new parts
            for (const part of parts) {
                // Add service part
                await connection.query("INSERT INTO service_parts (service_id, part_id, quantity) VALUES (?, ?, ?)", [
                    id,
                    part.partId,
                    part.quantity,
                ])

                // Update inventory (reduce stock)
                await connection.query("UPDATE parts SET current_stock = current_stock - ? WHERE part_id = ?", [
                    part.quantity,
                    part.partId,
                ])
            }
        }

        // Commit transaction
        await connection.commit()

        res.json({ message: "Service updated successfully" })
    } catch (error) {
        // Rollback on error
        await connection.rollback()
        console.error("Error updating service:", error)
        res.status(500).json({ error: "Internal server error" })
    } finally {
        connection.release()
    }
})

app.post("/api/services/:id/convert-to-work-order", authenticateToken, async (req, res) => {
    const connection = await pool.getConnection()

    try {
        const { id } = req.params

        // Check if service exists and is an estimation
        const [serviceCheck] = await connection.query(
            "SELECT service_id, is_work_order FROM services WHERE service_id = ?",
            [id],
        )

        if (serviceCheck.length === 0) {
            return res.status(404).json({ error: "Service not found" })
        }

        if (serviceCheck[0].is_work_order === 1) {
            return res.status(400).json({ error: "Service is already a work order" })
        }

        // Start transaction
        await connection.beginTransaction()

        // Generate work order ID
        const workOrderId = `WO-${Date.now()}-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`

        // Update service
        await connection.query(
            'UPDATE services SET is_work_order = 1, work_order_id = ?, status = "in_progress" WHERE service_id = ?',
            [workOrderId, id],
        )

        // Commit transaction
        await connection.commit()

        res.json({
            success: true,
            workOrderId,
        })
    } catch (error) {
        // Rollback on error
        await connection.rollback()
        console.error("Error converting service to work order:", error)
        res.status(500).json({ error: "Internal server error" })
    } finally {
        connection.release()
    }
})

// ======== Dashboard Routes ========
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
        const { period } = req.query
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

        res.json({
            totalCost: totalCostRows[0].total_cost || 0,
            totalInventoryValue: totalInventoryRows[0].total_value || 0,
            serviceStats: {
                pending: servicesRows.find((row) => row.status === "pending")?.count || 0,
                inProgress: servicesRows.find((row) => row.status === "in_progress")?.count || 0,
                completed: servicesRows.find((row) => row.status === "completed")?.count || 0,
            },
        })
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/dashboard/aging-stock", authenticateToken, async (req, res) => {
    try {
        const { months } = req.query
        const monthsAgo = Number.parseInt(months) || 1

        // Calculate date that is 'months' ago
        const cutoffDate = new Date()
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo)

        // Get aging stock
        const [rows] = await pool.query(
            `SELECT p.*, pd.receipt_id, pr.purchase_date
       FROM parts p
       JOIN purchase_details pd ON p.part_id = pd.part_id
       JOIN purchase_receipts pr ON pd.receipt_id = pr.receipt_id
       WHERE p.current_stock > 0 AND pr.purchase_date < ?
       ORDER BY pr.purchase_date ASC`,
            [cutoffDate],
        )

        // For each part, get compatibility
        for (const part of rows) {
            const [compatibilityRows] = await pool.query(
                `SELECT pc.*, cb.brand_name, cm.model_name
         FROM part_compatibility pc
         JOIN car_brands cb ON pc.brand_id = cb.brand_id
         JOIN car_models cm ON pc.model_id = cm.model_id
         WHERE pc.part_id = ?`,
                [part.part_id],
            )

            part.compatibility = compatibilityRows
        }

        res.json(rows)
    } catch (error) {
        console.error("Error fetching aging stock:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


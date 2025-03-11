const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const db = require("./db")
const mockDb = require("./mock-db")
const { authMiddleware, roleMiddleware } = require("./lib/auth-middleware")

// Load environment variables
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const USE_MOCK_DB = process.env.USE_MOCK_DB === "true"

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Database connection
const database = USE_MOCK_DB ? mockDb : db

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" },
    )
}

// Routes

// Auth routes
app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body

        // Find user
        const user = await database.users.findByUsername(username)

        // Check if user exists and password matches
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        // Generate token
        const token = generateToken(user)

        // Return user info and token
        res.json({
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                email: user.email,
            },
            token,
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// User routes
app.get("/api/users", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const users = await database.users.getAll()
        res.json(
            users.map((user) => ({
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                email: user.email,
            })),
        )
    } catch (error) {
        console.error("Error fetching users:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Customer routes
app.get("/api/customers", authMiddleware, async (req, res) => {
    try {
        const customers = await database.customers.getAll()
        res.json(customers)
    } catch (error) {
        console.error("Error fetching customers:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.get("/api/customers/:id", authMiddleware, async (req, res) => {
    try {
        const customer = await database.customers.findById(req.params.id)
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" })
        }
        res.json(customer)
    } catch (error) {
        console.error("Error fetching customer:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.post("/api/customers", authMiddleware, async (req, res) => {
    try {
        const newCustomer = await database.customers.create(req.body)
        res.status(201).json(newCustomer)
    } catch (error) {
        console.error("Error creating customer:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.put("/api/customers/:id", authMiddleware, async (req, res) => {
    try {
        const updatedCustomer = await database.customers.update(req.params.id, req.body)
        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" })
        }
        res.json(updatedCustomer)
    } catch (error) {
        console.error("Error updating customer:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Vehicle routes
app.post("/api/customers/:customerId/vehicles", authMiddleware, async (req, res) => {
    try {
        const newVehicle = await database.customers.addVehicle(req.params.customerId, req.body)
        if (!newVehicle) {
            return res.status(404).json({ message: "Customer not found" })
        }
        res.status(201).json(newVehicle)
    } catch (error) {
        console.error("Error adding vehicle:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Inventory routes
app.get("/api/inventory/items", authMiddleware, async (req, res) => {
    try {
        const items = await database.inventory.getAll()
        res.json(items)
    } catch (error) {
        console.error("Error fetching inventory items:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.get("/api/inventory/items/:id", authMiddleware, async (req, res) => {
    try {
        const item = await database.inventory.findById(req.params.id)
        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }
        res.json(item)
    } catch (error) {
        console.error("Error fetching inventory item:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.post("/api/inventory/items", authMiddleware, roleMiddleware(["admin", "manager"]), async (req, res) => {
    try {
        const newItem = await database.inventory.create(req.body)
        res.status(201).json(newItem)
    } catch (error) {
        console.error("Error creating inventory item:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.put("/api/inventory/items/:id", authMiddleware, roleMiddleware(["admin", "manager"]), async (req, res) => {
    try {
        const updatedItem = await database.inventory.update(req.params.id, req.body)
        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" })
        }
        res.json(updatedItem)
    } catch (error) {
        console.error("Error updating inventory item:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.delete("/api/inventory/items/:id", authMiddleware, roleMiddleware(["admin", "manager"]), async (req, res) => {
    try {
        const deletedItem = await database.inventory.delete(req.params.id)
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" })
        }
        res.json({ message: "Item deleted successfully" })
    } catch (error) {
        console.error("Error deleting inventory item:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Parts endpoint for dropdown suggestions
app.get("/api/inventory/parts", authMiddleware, async (req, res) => {
    try {
        const parts = await database.inventory.getParts()
        res.json(parts)
    } catch (error) {
        console.error("Error fetching parts:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Purchase receipt endpoint
app.post("/api/inventory/purchases", authMiddleware, roleMiddleware(["admin", "manager"]), async (req, res) => {
    try {
        // In a real app, we would create the purchase receipt and update inventory quantities
        // For the mock, we'll just return success
        res.status(201).json({ message: "Purchase receipt created successfully" })
    } catch (error) {
        console.error("Error creating purchase receipt:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Service routes
app.get("/api/services", authMiddleware, async (req, res) => {
    try {
        const services = await database.services.getAll()
        res.json(services)
    } catch (error) {
        console.error("Error fetching services:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Work order routes
app.get("/api/workorders", authMiddleware, async (req, res) => {
    try {
        const workOrders = await database.workOrders.getAll()
        res.json(workOrders)
    } catch (error) {
        console.error("Error fetching work orders:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.post("/api/workorders", authMiddleware, async (req, res) => {
    try {
        const newWorkOrder = await database.workOrders.create(req.body)
        res.status(201).json(newWorkOrder)
    } catch (error) {
        console.error("Error creating work order:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Appointment routes
app.get("/api/appointments", authMiddleware, async (req, res) => {
    try {
        const appointments = await database.appointments.getAll()
        res.json(appointments)
    } catch (error) {
        console.error("Error fetching appointments:", error)
        res.status(500).json({ message: "Server error" })
    }
})

app.post("/api/appointments", authMiddleware, async (req, res) => {
    try {
        const newAppointment = await database.appointments.create(req.body)
        res.status(201).json(newAppointment)
    } catch (error) {
        console.error("Error creating appointment:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Using ${USE_MOCK_DB ? "mock" : "real"} database`)
})


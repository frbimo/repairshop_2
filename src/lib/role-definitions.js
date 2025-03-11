// Define fixed role permissions
const rolePermissions = {
    admin: {
        name: "Administrator",
        description: "Full access to all system features",
        permissions: [
            "manage_users",
            "manage_roles",
            "manage_inventory",
            "manage_customers",
            "manage_services",
            "view_analytics",
            "edit_work_orders",
            "delete_records",
        ],
    },
    manager: {
        name: "Manager",
        description: "Can manage most aspects except user administration",
        permissions: ["manage_inventory", "manage_customers", "manage_services", "view_analytics", "edit_work_orders"],
    },
    inventory_officer: {
        name: "Inventory Officer",
        description: "Manages inventory and purchases",
        permissions: ["manage_inventory", "view_analytics"],
    },
    service_officer: {
        name: "Service Officer",
        description: "Manages customer service and work orders",
        permissions: ["manage_customers", "manage_services", "view_analytics"],
    },
    viewer: {
        name: "Viewer",
        description: "View-only access to system data",
        permissions: ["view_analytics"],
    },
}

// Helper function to check if a role has a specific permission
const hasPermission = (role, permission) => {
    if (!rolePermissions[role]) return false
    return rolePermissions[role].permissions.includes(permission)
}

// Get all available roles
const getAllRoles = () => {
    return Object.keys(rolePermissions).map((roleKey) => ({
        id: roleKey,
        name: rolePermissions[roleKey].name,
        description: rolePermissions[roleKey].description,
    }))
}

// Get permissions for a specific role
const getRolePermissions = (role) => {
    return rolePermissions[role]?.permissions || []
}

module.exports = {
    rolePermissions,
    hasPermission,
    getAllRoles,
    getRolePermissions,
}


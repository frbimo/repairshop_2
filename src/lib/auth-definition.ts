const { hasPermission } = require("./role-definitions")

// Permission-based middleware
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        if (hasPermission(req.user.role, requiredPermission)) {
            next()
        } else {
            res.status(403).json({ error: "You don't have permission to perform this action" })
        }
    }
}

module.exports = {
    checkPermission,
}


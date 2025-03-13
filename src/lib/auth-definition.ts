import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

const { hasPermission } = require("./role-definitions")

// Permission-based middleware
interface User {
    role: string;
}

interface Request {
    user?: User;
}

interface PermissionResponse {
    setStatus: (code: number) => Response;
    json: (body: any) => void;
}

interface NextFunction {
    (): void;
}

const checkPermission = (requiredPermission: string) => {
    return (req: Request, res: NextApiResponse, next: NextFunction) => {
        if (!req.user) {

            return res.status(401).json({ error: "Unauthorized" });
        }

        if (hasPermission(req.user.role, requiredPermission)) {
            next();
        } else {
            res.status(403).json({ error: "You don't have permission to perform this action" });
        }
    };
};

module.exports = {
    checkPermission,
}


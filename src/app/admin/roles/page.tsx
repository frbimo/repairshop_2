"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Trash2, Edit, Shield } from "lucide-react"
import { auth, type User, type Role } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import { formatDate } from "@/lib/utils"

// Mock role definitions until we implement the actual role-definitions.js
const mockRoleDefinitions = {
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
    officer: {
        name: "Officer",
        description: "Limited access to system features",
        permissions: ["manage_inventory", "manage_customers", "manage_services", "view_analytics"],
    },
}

// Mock functions for role definitions
const getAllRoles = () => {
    return Object.keys(mockRoleDefinitions).map((roleKey) => ({
        id: roleKey,
        name: mockRoleDefinitions[roleKey].name,
        description: mockRoleDefinitions[roleKey].description,
    }))
}

const getRolePermissions = (role) => {
    return mockRoleDefinitions[role]?.permissions || []
}

export default function RoleManagementPage() {
    const { isAdmin } = useAuth()
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [availableRoles, setAvailableRoles] = useState<any[]>([])

    // Form state
    const [formName, setFormName] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formRole, setFormRole] = useState<Role>("officer")
    const [formError, setFormError] = useState("")

    // Load users and roles
    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true)
            try {
                // Get users and ensure it's an array
                const allUsers = auth.getUsers() || []
                const response = Array.isArray(allUsers) ? allUsers : []
                // Ensure users is always an array
                setUsers(Array.isArray(response) ? response : [])
            } catch (error) {
                console.error("Error loading users:", error)
                setUsers([])
            } finally {
                setIsLoading(false)
            }
        }

        loadUsers()
    }, [])

    // Handle add user
    const handleAddUser = () => {
        if (!formName || !formEmail) {
            setFormError("Name and email are required")
            return
        }

        // Check if email already exists
        if (users.some((user) => user.email === formEmail)) {
            setFormError("Email already exists")
            return
        }

        try {
            const newUser = auth.addUser({
                name: formName,
                email: formEmail,
                role: formRole,
            })

            setUsers((prev) => (Array.isArray(prev) ? [...prev, newUser] : [newUser]))
            resetForm()
            setIsAddDialogOpen(false)
        } catch (error) {
            console.error("Error adding user:", error)
            setFormError("Failed to add user. Please try again.")
        }
    }

    // Handle edit user
    const handleEditUser = () => {
        if (!selectedUser) return

        if (!formName || !formEmail) {
            setFormError("Name and email are required")
            return
        }

        // Check if email already exists (except for the current user)
        if (users.some((user) => user.email === formEmail && user.id !== selectedUser.id)) {
            setFormError("Email already exists")
            return
        }

        try {
            const updatedUser = auth.updateUser(selectedUser.id, {
                name: formName,
                email: formEmail,
                role: formRole,
            })

            if (updatedUser) {
                setUsers((prev) =>
                    Array.isArray(prev) ? prev.map((user) => (user.id === selectedUser.id ? updatedUser : user)) : [updatedUser],
                )
            }

            resetForm()
            setIsEditDialogOpen(false)
        } catch (error) {
            console.error("Error updating user:", error)
            setFormError("Failed to update user. Please try again.")
        }
    }

    // Handle delete user
    const handleDeleteUser = () => {
        if (!selectedUser) return

        try {
            const success = auth.deleteUser(selectedUser.id)

            if (success) {
                setUsers((prev) => (Array.isArray(prev) ? prev.filter((user) => user.id !== selectedUser.id) : []))
            }

            setIsDeleteDialogOpen(false)
        } catch (error) {
            console.error("Error deleting user:", error)
        }
    }

    // Reset form
    const resetForm = () => {
        setFormName("")
        setFormEmail("")
        setFormRole("officer")
        setFormError("")
    }

    // Open edit dialog
    const openEditDialog = (user: User) => {
        setSelectedUser(user)
        setFormName(user.name)
        setFormEmail(user.email)
        setFormRole(user.role)
        setIsEditDialogOpen(true)
    }

    // Open delete dialog
    const openDeleteDialog = (user: User) => {
        setSelectedUser(user)
        setIsDeleteDialogOpen(true)
    }

    // Get permissions for a role
    const getPermissionBadges = (role: string) => {
        const permissions = getRolePermissions(role)
        return permissions.map((permission, index) => (
            <Badge key={index} variant="outline" className="mr-1 mb-1">
                {permission.replace(/_/g, " ")}
            </Badge>
        ))
    }

    // Render empty state if no users
    const renderEmptyState = () => (
        <div className="text-center py-10">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No users found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new user account.</p>
            <div className="mt-6">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add User
                </Button>
            </div>
        </div>
    )

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Role Management</h1>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : !Array.isArray(users) || users.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!isLoading && users && users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    <Shield className="h-3 w-3 mr-1 inline" />
                                                    {availableRoles.find((r) => r.id === user.role)?.name || user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap">{getPermissionBadges(user.role)}</div>
                                            </TableCell>
                                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive"
                                                        onClick={() => openDeleteDialog(user)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            {isLoading ? "Loading users..." : "No users found"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add User Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Create a new user account with role-based permissions</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="John Doe" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formEmail}
                                onChange={(e) => setFormEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={formRole} onValueChange={(value) => setFormRole(value as Role)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name} - {role.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetForm()
                                setIsAddDialogOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddUser}>Add User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user details and permissions</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input id="edit-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select value={formRole} onValueChange={(value) => setFormRole(value as Role)}>
                                <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name} - {role.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetForm()
                                setIsEditDialogOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEditUser}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="py-4">
                            <p>
                                <strong>Name:</strong> {selectedUser.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {selectedUser.email}
                            </p>
                            <p>
                                <strong>Role:</strong>{" "}
                                {availableRoles.find((r) => r.id === selectedUser.role)?.name || selectedUser.role}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}


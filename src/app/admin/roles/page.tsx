"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Trash2, Edit, ShieldCheck } from "lucide-react"
import { auth, Role, type User, rolePermissions } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import { formatDate } from "@/lib/utils"

export default function RoleManagementPage() {
    const { hasPermission } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isViewPermissionsDialogOpen, setIsViewPermissionsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    // Form state
    const [formName, setFormName] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formRole, setFormRole] = useState<Role>(Role.Receptionist)
    const [formError, setFormError] = useState("")

    // Load users
    useEffect(() => {
        setIsLoading(true)
        const allUsers = auth.getUsers()
        setUsers(allUsers)
        setIsLoading(false)
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

        const newUser = auth.addUser({
            name: formName,
            email: formEmail,
            role: formRole,
        })

        setUsers([...users, newUser])
        resetForm()
        setIsAddDialogOpen(false)
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

        const updatedUser = auth.updateUser(selectedUser.id, {
            name: formName,
            email: formEmail,
            role: formRole,
        })

        if (updatedUser) {
            setUsers(users.map((user) => (user.id === selectedUser.id ? updatedUser : user)))
        }

        resetForm()
        setIsEditDialogOpen(false)
    }

    // Handle delete user
    const handleDeleteUser = () => {
        if (!selectedUser) return

        const success = auth.deleteUser(selectedUser.id)

        if (success) {
            setUsers(users.filter((user) => user.id !== selectedUser.id))
        }

        setIsDeleteDialogOpen(false)
    }

    // Reset form
    const resetForm = () => {
        setFormName("")
        setFormEmail("")
        setFormRole(Role.Receptionist)
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

    // Open view permissions dialog
    const openViewPermissionsDialog = (role: Role) => {
        setSelectedRole(role)
        setIsViewPermissionsDialogOpen(true)
    }

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
                    <CardTitle>User Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {user.role
                                                        .split("_")
                                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(" ")}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => openViewPermissionsDialog(user.role)}
                                                >
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
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
                                ))}
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
                                    {auth.getRoles().map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role
                                                .split("_")
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" ")}
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
                        <DialogDescription>Update user details and role</DialogDescription>
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
                                    {auth.getRoles().map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role
                                                .split("_")
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" ")}
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
                                {selectedUser.role
                                    .split("_")
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
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

            {/* View Permissions Dialog */}
            <Dialog open={isViewPermissionsDialogOpen} onOpenChange={setIsViewPermissionsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Role Permissions</DialogTitle>
                        <DialogDescription>
                            Permissions for the{" "}
                            {selectedRole
                                ?.split("_")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}{" "}
                            role
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRole && (
                        <div className="py-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Permission</TableHead>
                                        <TableHead className="text-right">Access</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(rolePermissions[selectedRole as keyof typeof rolePermissions]).map(([key, value]) => (
                                        <TableRow key={key}>
                                            <TableCell>
                                                {key
                                                    .replace(/([A-Z])/g, " $1")
                                                    .replace(/^./, (str) => str.toUpperCase())
                                                    .replace("Can ", "")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {value ? (
                                                    <span className="text-green-600 font-medium">Allowed</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">Denied</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setIsViewPermissionsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}


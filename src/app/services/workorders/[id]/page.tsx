"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Loader2,
    ArrowLeft,
    Car,
    User,
    Wrench,
    ClockIcon,
    CheckCircle,
    AlertCircle,
    Edit,
    Plus,
    Trash2,
    Printer,
    ArrowRight,
} from "lucide-react"
import { getServiceDetails, updateServiceDetails, getAvailableParts, convertToWorkOrder } from "@/lib/customer-actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PrintLayout } from "@/components/print-layout"
import { useAuth } from "@/components/auth-provider"

// Schema for editing service types
const serviceTypeSchema = z.object({
    name: z.string().min(1, "Service type is required"),
    description: z.string().optional(),
})

// Schema for editing parts
const partSchema = z.object({
    partId: z.string().min(1, "Part is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
})

// Schema for the edit form
const editFormSchema = z.object({
    description: z.string().min(5, "Description must be at least 5 characters"),
    estimatedCompletionDate: z.string().min(1, "Estimated completion date is required"),
    status: z.enum(["pending", "in_progress", "completed"]),
    serviceTypes: z.array(serviceTypeSchema).min(1, "At least one service type is required"),
    parts: z.array(partSchema),
})

type EditFormValues = z.infer<typeof editFormSchema>

export default function ServiceDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const { isAdmin } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [service, setService] = useState<any>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [availableParts, setAvailableParts] = useState<any[]>([])
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
    const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false)
    const [isConverting, setIsConverting] = useState(false)

    const form = useForm<EditFormValues>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            description: "",
            estimatedCompletionDate: "",
            status: "pending" as const,
            serviceTypes: [],
            parts: [],
        },
    })

    useEffect(() => {
        const loadServiceData = async () => {
            setIsLoading(true)
            try {
                const serviceData = await getServiceDetails(params.id)
                setService(serviceData)

                // Load available parts for editing
                const parts = await getAvailableParts()
                setAvailableParts(parts)

                // Set form default values from service data
                if (serviceData) {
                    form.reset({
                        description: serviceData.description,
                        estimatedCompletionDate: new Date(serviceData.estimatedCompletionDate).toISOString().split("T")[0],
                        status: serviceData.status,
                        serviceTypes: serviceData.serviceTypes || [],
                        parts: serviceData.parts.map((part: any) => ({
                            partId: part.id,
                            quantity: part.quantity,
                        })),
                    })
                }
            } catch (error) {
                console.error("Failed to load service data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadServiceData()
    }, [params.id, form])

    const handleBack = () => {
        router.push("/services/estimations")
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <ClockIcon className="h-3 w-3 mr-1" /> Pending
                    </Badge>
                )
            case "in_progress":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        <Wrench className="h-3 w-3 mr-1" /> In Progress
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" /> Completed
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline">
                        <AlertCircle className="h-3 w-3 mr-1" /> Unknown
                    </Badge>
                )
        }
    }

    const addServiceType = () => {
        const currentServiceTypes = form.getValues("serviceTypes")
        form.setValue("serviceTypes", [...currentServiceTypes, { name: "", description: "" }])
    }

    const removeServiceType = (index: number) => {
        const currentServiceTypes = form.getValues("serviceTypes")
        if (currentServiceTypes.length > 1) {
            form.setValue(
                "serviceTypes",
                currentServiceTypes.filter((_, i) => i !== index),
            )
        }
    }

    const addPart = () => {
        const currentParts = form.getValues("parts")
        form.setValue("parts", [...currentParts, { partId: "", quantity: 1 }])
    }

    const removePart = (index: number) => {
        const currentParts = form.getValues("parts")
        form.setValue(
            "parts",
            currentParts.filter((_, i) => i !== index),
        )
    }

    const onSubmit = async (values: EditFormValues) => {
        setIsSubmitting(true)

        try {
            const result = await updateServiceDetails(params.id, values)

            if (result.success) {
                // Refresh service data
                const updatedService = await getServiceDetails(params.id)
                setService(updatedService)
                setIsEditing(false)
            } else {
                console.error("Failed to update service:", result.error)
            }
        } catch (error) {
            console.error("Error updating service:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePrint = () => {
        setIsPrintDialogOpen(true)
    }

    const handleConvertToWorkOrder = () => {
        if (service.isWorkOrder) return
        setIsConvertDialogOpen(true)
    }

    const confirmConvertToWorkOrder = async () => {
        setIsConverting(true)
        try {
            const result = await convertToWorkOrder(service.id)

            if (result.success) {
                // Refresh service data
                const updatedService = await getServiceDetails(params.id)
                setService(updatedService)
                setIsConvertDialogOpen(false)

                // Show success message
                alert(`Successfully converted to Work Order: ${result.workOrderId}`)
            } else {
                console.error("Failed to convert to work order:", result.error)
                alert("Failed to convert to work order. Please try again.")
            }
        } catch (error) {
            console.error("Error converting to work order:", error)
            alert("An error occurred. Please try again.")
        } finally {
            setIsConverting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container py-10">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="container py-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <h1 className="text-3xl font-bold">Service Details</h1>
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-6 text-muted-foreground">Service not found</div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold">{service.isWorkOrder ? "Work Order" : "Estimation"} Details</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>

                    {!service.isWorkOrder && (
                        <Button variant="outline" onClick={handleConvertToWorkOrder}>
                            <ArrowRight className="h-4 w-4 mr-2" /> To Work Order
                        </Button>
                    )}

                    {(isAdmin || !service.isWorkOrder) && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>
                                    {service.isWorkOrder
                                        ? `Work Order ID: ${service.workOrderId}`
                                        : `Estimation ID: ${service.estimationId}`}
                                </CardTitle>
                                <CardDescription>Status: {getStatusBadge(service.status)}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center">
                                        <User className="h-5 w-5 mr-2 text-muted-foreground" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Name</p>
                                            <p className="font-medium">{service.customer.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Contact</p>
                                            <p className="font-medium">{service.customer.phone}</p>
                                            <p className="text-sm">{service.customer.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="text-sm">{service.customer.address}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Vehicle Information */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center">
                                        <Car className="h-5 w-5 mr-2 text-muted-foreground" />
                                        Vehicle Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Vehicle</p>
                                            <p className="font-medium">
                                                {service.vehicle.make} {service.vehicle.model} ({service.vehicle.year})
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">License Plate</p>
                                                <p className="font-medium">{service.vehicle.licensePlate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Color</p>
                                                <p className="font-medium">{service.vehicle.color}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">VIN</p>
                                                <p className="font-medium">{service.vehicle.vin || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Mileage</p>
                                                <p className="font-medium">{service.vehicle.mileage.toLocaleString()} miles</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator />

                        {/* Service Information */}
                        <div>
                            <h3 className="text-lg font-medium mb-3">Service Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Service Date</p>
                                    <p className="font-medium">{formatDate(service.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Estimated Completion</p>
                                    <p className="font-medium">{formatDate(service.estimatedCompletionDate)}</p>
                                </div>
                            </div>

                            {/* Service Types */}
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-2">Service Types</p>
                                {service.serviceTypes && service.serviceTypes.length > 0 ? (
                                    <div className="space-y-2">
                                        {service.serviceTypes.map((type: any, index: number) => (
                                            <div key={index} className="p-3 border rounded-md">
                                                <div className="font-medium">
                                                    {type.name
                                                        .split("_")
                                                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(" ")}
                                                </div>
                                                {type.description && (
                                                    <div className="text-sm text-muted-foreground mt-1">{type.description}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">No service types specified</div>
                                )}
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground">Additional Notes</p>
                                <p className="mt-1">{service.description}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Parts Information */}
                        <div>
                            <h3 className="text-lg font-medium mb-3">Parts Required</h3>
                            {service.parts.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Part Name</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {service.parts.map((part: any) => (
                                            <TableRow key={part.id}>
                                                <TableCell>{part.name}</TableCell>
                                                <TableCell>{part.quantity}</TableCell>
                                                <TableCell>{formatCurrency(part.price)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(part.price * part.quantity)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-4 border rounded-md text-muted-foreground">
                                    No parts required for this service.
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={handleBack} className="w-full">
                            Back to Service Management
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Print Dialog */}
            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Print {service.isWorkOrder ? "Work Order" : "Estimation"}</DialogTitle>
                        <DialogDescription>
                            Preview and print the {service.isWorkOrder ? "work order" : "estimation"} details
                        </DialogDescription>
                    </DialogHeader>

                    <PrintLayout
                        type={service.isWorkOrder ? "workOrder" : "estimation"}
                        id={service.isWorkOrder ? service.workOrderId : service.estimationId}
                        customer={service.customer}
                        vehicle={service.vehicle}
                        serviceTypes={service.serviceTypes || []}
                        parts={service.parts || []}
                        description={service.description}
                        estimatedCompletionDate={service.estimatedCompletionDate}
                        status={service.status}
                        createdAt={service.createdAt}
                    />
                </DialogContent>
            </Dialog>

            {/* Convert to Work Order Dialog */}
            <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Convert to Work Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to convert this estimation to a work order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p>
                            <strong>Estimation ID:</strong> {service.estimationId}
                        </p>
                        <p>
                            <strong>Customer:</strong> {service.customer.name}
                        </p>
                        <p>
                            <strong>License Plate:</strong> {service.vehicle.licensePlate}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)} disabled={isConverting}>
                            Cancel
                        </Button>
                        <Button onClick={confirmConvertToWorkOrder} disabled={isConverting}>
                            {isConverting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Convert to Work Order
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit {service.isWorkOrder ? "Work Order" : "Estimation"}</DialogTitle>
                        <DialogDescription>Update service details, parts, or status</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                            {/* Service Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Service Types */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <FormLabel>Service Types</FormLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={addServiceType}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Service Type
                                    </Button>
                                </div>
                                <FormMessage>{form.formState.errors.serviceTypes?.message}</FormMessage>

                                {form.watch("serviceTypes").map((_, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 border rounded-md mb-4">
                                        <div className="grid grid-cols-1 gap-4 flex-1">
                                            <FormField
                                                control={form.control}
                                                name={`serviceTypes.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Service Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select service type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="oil_change">Oil Change</SelectItem>
                                                                <SelectItem value="brake_service">Brake Service</SelectItem>
                                                                <SelectItem value="tire_replacement">Tire Replacement</SelectItem>
                                                                <SelectItem value="engine_repair">Engine Repair</SelectItem>
                                                                <SelectItem value="transmission">Transmission Service</SelectItem>
                                                                <SelectItem value="electrical">Electrical System</SelectItem>
                                                                <SelectItem value="ac_service">A/C Service</SelectItem>
                                                                <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`serviceTypes.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Service Description (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Brief description of this service" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mt-8"
                                            onClick={() => removeServiceType(index)}
                                            disabled={form.watch("serviceTypes").length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Additional Notes</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Estimated Completion Date */}
                            <FormField
                                control={form.control}
                                name="estimatedCompletionDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Completion Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Parts */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <FormLabel>Required Parts</FormLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={addPart}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Part
                                    </Button>
                                </div>

                                {form.watch("parts").length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Part</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead className="w-[80px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {form.watch("parts").map((_, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`parts.${index}.partId`}
                                                            render={({ field }) => (
                                                                <FormItem className="mb-0">
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select part" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {availableParts.map((part) => (
                                                                                <SelectItem key={part.id} value={part.id}>
                                                                                    {part.name} - {formatCurrency(part.price)}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`parts.${index}.quantity`}
                                                            render={({ field }) => (
                                                                <FormItem className="mb-0">
                                                                    <FormControl>
                                                                        <Input type="number" min="1" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removePart(index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-4 border rounded-md text-muted-foreground">
                                        No parts added. Click "Add Part" to select parts for this service.
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}


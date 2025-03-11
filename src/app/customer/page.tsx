"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Wrench, ClockIcon, CheckCircle, AlertCircle, Search, Printer, ArrowRight } from "lucide-react"
import { getEstimations, getWorkOrders, convertToWorkOrder } from "@/lib/customer-actions"
import { PrintLayout } from "@/components/print-layout"
import { useAuth } from "@/components/auth-provider"

export default function ServiceManagementPage() {
    const router = useRouter()
    const { isAdmin } = useAuth()
    const [activeTab, setActiveTab] = useState("estimation")
    const [isLoading, setIsLoading] = useState(true)
    const [estimations, setEstimations] = useState<any[]>([])
    const [workOrders, setWorkOrders] = useState<any[]>([])
    const [filteredEstimations, setFilteredEstimations] = useState<any[]>([])
    const [filteredWorkOrders, setFilteredWorkOrders] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
    const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<any>(null)
    const [isConverting, setIsConverting] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                const estimationsData = await getEstimations()
                const workOrdersData = await getWorkOrders()

                setEstimations(estimationsData)
                setWorkOrders(workOrdersData)
                setFilteredEstimations(estimationsData)
                setFilteredWorkOrders(workOrdersData)
            } catch (error) {
                console.error("Failed to load data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredEstimations(estimations)
            setFilteredWorkOrders(workOrders)
        } else {
            const filteredEst = estimations.filter(
                (service) =>
                    service.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.estimationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setFilteredEstimations(filteredEst)

            const filteredWO = workOrders.filter(
                (service) =>
                    service.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.workOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setFilteredWorkOrders(filteredWO)
        }
    }, [searchTerm, estimations, workOrders])

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

    const handleRowClick = (id: string) => {
        router.push(`/customer/${id}`)
    }

    const handlePrint = (service: any) => {
        setSelectedService(service)
        setIsPrintDialogOpen(true)
    }

    const handleConvertToWorkOrder = (service: any) => {
        setSelectedService(service)
        setIsConvertDialogOpen(true)
    }

    const confirmConvertToWorkOrder = async () => {
        if (!selectedService) return

        setIsConverting(true)
        try {
            const result = await convertToWorkOrder(selectedService.id)

            if (result.success) {
                // Update the local state
                const updatedService = {
                    ...selectedService,
                    isWorkOrder: true,
                    workOrderId: result.workOrderId,
                    status: "in_progress",
                }

                setWorkOrders([...workOrders, updatedService])
                setEstimations(estimations.filter((est) => est.id !== selectedService.id))

                // Close the dialog
                setIsConvertDialogOpen(false)

                // Show success message or notification
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

    const renderEstimationTable = (services: any[]) => {
        return (
            <>
                {services.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estimation ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>License Plate</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow
                                    key={service.id}
                                    className="hover:bg-muted/50 cursor-pointer"
                                    onClick={() => handleRowClick(service.id)}
                                >
                                    <TableCell className="font-medium">{service.estimationId}</TableCell>
                                    <TableCell>{service.customer.name}</TableCell>
                                    <TableCell
                                        className={
                                            searchTerm && service.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
                                                ? "bg-yellow-50 font-medium"
                                                : ""
                                        }
                                    >
                                        {service.vehicle.licensePlate}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePrint(service)
                                                }}
                                            >
                                                <Printer className="h-4 w-4 mr-1" /> Print
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleConvertToWorkOrder(service)
                                                }}
                                            >
                                                <ArrowRight className="h-4 w-4 mr-1" /> To Work Order
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        {searchTerm
                            ? `No estimations found with license plate or ID containing "${searchTerm}"`
                            : `No estimations found`}
                    </div>
                )}
            </>
        )
    }

    const renderWorkOrderTable = (services: any[]) => {
        return (
            <>
                {services.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Work Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>License Plate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow
                                    key={service.id}
                                    className="hover:bg-muted/50 cursor-pointer"
                                    onClick={() => handleRowClick(service.id)}
                                >
                                    <TableCell className="font-medium">{service.workOrderId}</TableCell>
                                    <TableCell>{service.customer.name}</TableCell>
                                    <TableCell
                                        className={
                                            searchTerm && service.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
                                                ? "bg-yellow-50 font-medium"
                                                : ""
                                        }
                                    >
                                        {service.vehicle.licensePlate}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePrint(service)
                                                }}
                                            >
                                                <Printer className="h-4 w-4 mr-1" /> Print
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        {searchTerm
                            ? `No work orders found with license plate or ID containing "${searchTerm}"`
                            : `No work orders found`}
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Service Management</h1>
                <Link href="/customer/register/customer">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Register New Customer
                    </Button>
                </Link>
            </div>

            <Card className="mb-6">
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Tabs defaultValue="estimation" value={activeTab} onValueChange={setActiveTab}>
                            <div className="flex justify-between items-center mb-4">
                                <TabsList>
                                    <TabsTrigger value="estimation">
                                        Estimation
                                        {estimations.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {estimations.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="workOrder">
                                        Work Order
                                        {workOrders.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {workOrders.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by license plate, ID or customer"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-[300px]"
                                    />
                                </div>
                            </div>

                            <TabsContent value="estimation" className="mt-0">
                                {renderEstimationTable(filteredEstimations)}
                            </TabsContent>

                            <TabsContent value="workOrder" className="mt-0">
                                {renderWorkOrderTable(filteredWorkOrders)}
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">Pending</h3>
                        <p className="text-sm text-muted-foreground mb-2">Vehicles waiting for service</p>
                        <div className="text-3xl font-bold">
                            {[...estimations, ...workOrders].filter((s) => s.status === "pending").length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">In Progress</h3>
                        <p className="text-sm text-muted-foreground mb-2">Vehicles currently being serviced</p>
                        <div className="text-3xl font-bold">
                            {[...estimations, ...workOrders].filter((s) => s.status === "in_progress").length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">Completed</h3>
                        <p className="text-sm text-muted-foreground mb-2">Vehicles with completed service</p>
                        <div className="text-3xl font-bold">
                            {[...estimations, ...workOrders].filter((s) => s.status === "completed").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Print Dialog */}
            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedService?.isWorkOrder ? "Print Work Order" : "Print Estimation"}</DialogTitle>
                        <DialogDescription>
                            Preview and print the {selectedService?.isWorkOrder ? "work order" : "estimation"} details
                        </DialogDescription>
                    </DialogHeader>

                    {selectedService && (
                        <PrintLayout
                            type={selectedService.isWorkOrder ? "workOrder" : "estimation"}
                            id={selectedService.isWorkOrder ? selectedService.workOrderId : selectedService.estimationId}
                            customer={selectedService.customer}
                            vehicle={selectedService.vehicle}
                            serviceTypes={selectedService.serviceTypes || []}
                            parts={selectedService.parts || []}
                            description={selectedService.description}
                            estimatedCompletionDate={selectedService.estimatedCompletionDate}
                            status={selectedService.status}
                            createdAt={selectedService.createdAt}
                        />
                    )}
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

                    {selectedService && (
                        <div className="py-4">
                            <p>
                                <strong>Estimation ID:</strong> {selectedService.estimationId}
                            </p>
                            <p>
                                <strong>Customer:</strong> {selectedService.customer.name}
                            </p>
                            <p>
                                <strong>License Plate:</strong> {selectedService.vehicle.licensePlate}
                            </p>
                        </div>
                    )}

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
        </div>
    )
}


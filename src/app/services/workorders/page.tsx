"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Plus, Printer, Search, Edit, Eye, CheckCircle } from "lucide-react"
import { getWorkOrders } from "@/lib/customer-actions"
import { PrintLayout } from "@/components/print-layout"
import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"
import { formatDate } from "@/lib/utils"

export default function WorkOrdersPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [workOrders, setWorkOrders] = useState<any[]>([])
    const [filteredWorkOrders, setFilteredWorkOrders] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<any>(null)
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
    const [isConverting, setIsConverting] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                const workOrdersData = await getWorkOrders()
                setWorkOrders(workOrdersData)
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
            setFilteredWorkOrders(workOrders)
        } else {
            const filtered = workOrders.filter(
                (service) =>
                    service.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.workOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setFilteredWorkOrders(filtered)
        }
    }, [searchTerm, workOrders])

    const handleViewWorkOrder = (id: string) => {
        router.push(`/services/workorders/${id}`)
    }

    // const handleEditWorkOrder = (id: string) => {
    //     router.push(`/services/workorders/edit/${id}`)
    // }

    const handlePrint = (service: any) => {
        setSelectedService(service)
        setIsPrintDialogOpen(true)
    }

    const handleMoveToInvoice = (service: any) => {
        setSelectedService(service)
        setIsInvoiceDialogOpen(true)
    }

    const confirmMoveToInvoice = async () => {
        if (!selectedService) return

        setIsConverting(true)
        try {
            // In a real app, this would call a server action to convert to invoice
            // For now, we'll just show a success message and redirect
            setTimeout(() => {
                setIsInvoiceDialogOpen(false)
                setIsConverting(false)

                // Remove the work order from the list
                setWorkOrders(workOrders.filter((wo) => wo.id !== selectedService.id))
                setFilteredWorkOrders(filteredWorkOrders.filter((wo) => wo.id !== selectedService.id))

                // Show success message
                alert(`Successfully converted to Invoice: INV-${Date.now().toString().slice(-5)}`)

                // Redirect to invoices page
                router.push("/services/invoices")
            }, 1000)
        } catch (error) {
            console.error("Error converting to invoice:", error)
            setIsConverting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                    </Badge>
                )
            case "in_progress":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        In Progress
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Completed
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    return (
        <PageContainer>
            <PageHeader title="Work Orders">
                {/* <Link href="/services/estimations">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create New Estimation
                    </Button>
                </Link> */}
            </PageHeader>

            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Approved Work Orders</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by license plate, ID or customer"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-[300px]"
                            />
                        </div>
                        <Link href="/services">
                            <Button variant="outline">Customers</Button>
                        </Link>
                        <Link href="/services/estimations">
                            <Button variant="outline">Estimations</Button>
                        </Link>
                        <Link href="/services/invoices">
                            <Button variant="outline">Invoices</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredWorkOrders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Work Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>License Plate</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredWorkOrders.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">{service.workOrderId}</TableCell>
                                        <TableCell>{service.customer?.name}</TableCell>
                                        <TableCell>
                                            {service.vehicle?.make} {service.vehicle?.model} ({service.vehicle?.year})
                                        </TableCell>
                                        <TableCell
                                            className={
                                                searchTerm && service.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ? "bg-yellow-50 font-medium"
                                                    : ""
                                            }
                                        >
                                            {service.vehicle?.licensePlate}
                                        </TableCell>
                                        <TableCell>{formatDate(service.createdAt)}</TableCell>
                                        <TableCell>{getStatusBadge(service.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleViewWorkOrder(service.id)}>
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                                {/* <Button variant="outline" size="sm" onClick={() => handleEditWorkOrder(service.id)}>
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Button> */}
                                                <Button variant="outline" size="sm" onClick={() => handlePrint(service)}>
                                                    <Printer className="h-4 w-4 mr-1" /> Print
                                                </Button>
                                                {service.status === "completed" && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleMoveToInvoice(service)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Complete & Invoice
                                                    </Button>
                                                )}
                                                {service.status !== "completed" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Mark as completed
                                                            const updatedWorkOrders = workOrders.map((wo) => {
                                                                if (wo.id === service.id) {
                                                                    return { ...wo, status: "completed" }
                                                                }
                                                                return wo
                                                            })
                                                            setWorkOrders(updatedWorkOrders)
                                                            setFilteredWorkOrders(
                                                                updatedWorkOrders.filter((wo) =>
                                                                    searchTerm
                                                                        ? wo.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                        wo.workOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                        wo.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                                                                        : true,
                                                                ),
                                                            )
                                                        }}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Mark Completed
                                                    </Button>
                                                )}
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
                                : `No work orders found. Approve an estimation to create a work order.`}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Print Dialog */}
            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Print Work Order</DialogTitle>
                        <DialogDescription>Preview and print the work order details</DialogDescription>
                    </DialogHeader>

                    {selectedService && (
                        <PrintLayout
                            type="workOrder"
                            id={selectedService.workOrderId}
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

            {/* Move to Invoice Dialog */}
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete & Generate Invoice</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to complete this work order and generate an invoice? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedService && (
                        <div className="py-4">
                            <p>
                                <strong>Work Order ID:</strong> {selectedService.workOrderId}
                            </p>
                            <p>
                                <strong>Customer:</strong> {selectedService.customer?.name}
                            </p>
                            <p>
                                <strong>Vehicle:</strong> {selectedService.vehicle?.make} {selectedService.vehicle?.model}
                            </p>
                            <p>
                                <strong>License Plate:</strong> {selectedService.vehicle?.licensePlate}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)} disabled={isConverting}>
                            Cancel
                        </Button>
                        <Button onClick={confirmMoveToInvoice} disabled={isConverting} className="bg-green-600 hover:bg-green-700">
                            {isConverting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete & Generate Invoice
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    )
}


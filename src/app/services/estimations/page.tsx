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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Printer, ArrowRight, Search, Edit, Eye } from "lucide-react"
import { getEstimations, convertToWorkOrder } from "@/lib/customer-actions"
import { PrintLayout } from "@/components/print-layout"
import { useAuth } from "@/components/auth-provider"
import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"
import { formatDate } from "@/lib/utils"

export default function EstimationsPage() {
    const router = useRouter()
    const { hasPermission } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [estimations, setEstimations] = useState<any[]>([])
    const [filteredEstimations, setFilteredEstimations] = useState<any[]>([])
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
                setEstimations(estimationsData)
                setFilteredEstimations(estimationsData)
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
        } else {
            const filtered = estimations.filter(
                (service) =>
                    service.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.estimationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setFilteredEstimations(filtered)
        }
    }, [searchTerm, estimations])

    const handleViewEstimation = (id: string) => {
        router.push(`/services/estimations/${id}`)
    }

    // const handleEditEstimation = (id: string) => {
    //     router.push(`/services/estimations/edit/${id}`)
    // }

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
                setEstimations(estimations.filter((est) => est.id !== selectedService.id))
                setFilteredEstimations(filteredEstimations.filter((est) => est.id !== selectedService.id))

                // Close the dialog
                setIsConvertDialogOpen(false)

                // Show success message or notification
                alert(`Successfully converted to Work Order: ${result.workOrderId}`)

                // Redirect to work orders page
                router.push("/services/workorders")
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

    return (
        <PageContainer>
            <PageHeader title="Estimations">
                {/* <Link href="/services/register/customer">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Register New Customer
                    </Button>
                </Link> */}
            </PageHeader>

            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Estimations</CardTitle>
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
                        {/* <Link href="/services">
                            <Button variant="outline">Customers</Button>
                        </Link> */}
                        <Link href="/services/workorders">
                            <Button variant="outline">Work Orders</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredEstimations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Estimation ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>License Plate</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEstimations.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">{service.estimationId}</TableCell>
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
                                        <TableCell>
                                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                {service.status.charAt(0).toUpperCase() + service.status.slice(1).replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleViewEstimation(service.id)}>
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                                {/* <Button variant="outline" size="sm" onClick={() => handleEditEstimation(service.id)}>
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Button> */}
                                                <Button variant="outline" size="sm" onClick={() => handlePrint(service)}>
                                                    <Printer className="h-4 w-4 mr-1" /> Print
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleConvertToWorkOrder(service)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <ArrowRight className="h-4 w-4 mr-1" /> Approve
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
                                : `No estimations found. Register a new customer to create an estimation.`}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Print Dialog */}
            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Print Estimation</DialogTitle>
                        <DialogDescription>Preview and print the estimation details</DialogDescription>
                    </DialogHeader>

                    {selectedService && (
                        <PrintLayout
                            type="estimation"
                            id={selectedService.estimationId}
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
                        <DialogTitle>Approve Estimation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this estimation and convert it to a work order? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedService && (
                        <div className="py-4">
                            <p>
                                <strong>Estimation ID:</strong> {selectedService.estimationId}
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
                        <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)} disabled={isConverting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmConvertToWorkOrder}
                            disabled={isConverting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Approve & Create Work Order
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    )
}


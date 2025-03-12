"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Search, Printer, FileText, DollarSign } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"
import { formatDate } from "@/lib/utils"

// Mock data for invoices
const mockInvoices = [
    {
        id: "inv-1",
        invoiceId: "INV-12345",
        customerId: "cust-1",
        customerName: "John Doe",
        vehicleMake: "Toyota",
        vehicleModel: "Camry",
        vehicleYear: 2018,
        licensePlate: "ABC123",
        amount: 249.99,
        status: "paid",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
        id: "inv-2",
        invoiceId: "INV-12346",
        customerId: "cust-2",
        customerName: "Jane Smith",
        vehicleMake: "Ford",
        vehicleModel: "F-150",
        vehicleYear: 2019,
        licensePlate: "DEF456",
        amount: 189.5,
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
        id: "inv-3",
        invoiceId: "INV-12347",
        customerId: "cust-3",
        customerName: "Bob Johnson",
        vehicleMake: "BMW",
        vehicleModel: "X5",
        vehicleYear: 2021,
        licensePlate: "JKL012",
        amount: 599.99,
        status: "paid",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
]

export default function InvoicesPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [invoices, setInvoices] = useState<any[]>([])
    const [filteredInvoices, setFilteredInvoices] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

    useEffect(() => {
        // Simulate loading data
        const loadData = async () => {
            setIsLoading(true)
            try {
                // In a real app, this would be an API call
                await new Promise((resolve) => setTimeout(resolve, 800))
                setInvoices(mockInvoices)
                setFilteredInvoices(mockInvoices)
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
            setFilteredInvoices(invoices)
        } else {
            const filtered = invoices.filter(
                (invoice) =>
                    invoice.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    invoice.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setFilteredInvoices(filtered)
        }
    }, [searchTerm, invoices])

    const handlePrint = (invoice: any) => {
        setSelectedInvoice(invoice)
        setIsPrintDialogOpen(true)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Paid
                    </Badge>
                )
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount)
    }

    return (
        <PageContainer>
            <PageHeader title="Invoices">
                <Link href="/services/workorders">
                    <Button>
                        <FileText className="mr-2 h-4 w-4" /> View Work Orders
                    </Button>
                </Link>
            </PageHeader>

            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Customer Invoices</CardTitle>
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
                    ) : filteredInvoices.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>License Plate</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.invoiceId}</TableCell>
                                        <TableCell>{invoice.customerName}</TableCell>
                                        <TableCell>
                                            {invoice.vehicleMake} {invoice.vehicleModel} ({invoice.vehicleYear})
                                        </TableCell>
                                        <TableCell
                                            className={
                                                searchTerm && invoice.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ? "bg-yellow-50 font-medium"
                                                    : ""
                                            }
                                        >
                                            {invoice.licensePlate}
                                        </TableCell>
                                        <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handlePrint(invoice)}>
                                                    <Printer className="h-4 w-4 mr-1" /> Print
                                                </Button>
                                                {invoice.status === "pending" && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => {
                                                            // Mark as paid
                                                            const updatedInvoices = invoices.map((inv) => {
                                                                if (inv.id === invoice.id) {
                                                                    return { ...inv, status: "paid" }
                                                                }
                                                                return inv
                                                            })
                                                            setInvoices(updatedInvoices)
                                                            setFilteredInvoices(
                                                                updatedInvoices.filter((inv) =>
                                                                    searchTerm
                                                                        ? inv.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                        inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                                                                        : true,
                                                                ),
                                                            )
                                                        }}
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-1" /> Mark as Paid
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
                                ? `No invoices found with license plate or ID containing "${searchTerm}"`
                                : `No invoices found. Complete a work order to generate an invoice.`}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Print Dialog */}
            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Print Invoice</DialogTitle>
                        <DialogDescription>Preview and print the invoice details</DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="p-6 border rounded-lg">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold">INVOICE</h2>
                                    <p className="text-gray-500">{selectedInvoice.invoiceId}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold">Auto Parts & Service</h3>
                                    <p>123 Repair Street</p>
                                    <p>Automotive City, AC 12345</p>
                                    <p>Phone: (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="font-bold mb-2">Bill To:</h4>
                                    <p>{selectedInvoice.customerName}</p>
                                    <p>Customer ID: {selectedInvoice.customerId}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-2">Vehicle:</h4>
                                    <p>
                                        {selectedInvoice.vehicleMake} {selectedInvoice.vehicleModel} ({selectedInvoice.vehicleYear})
                                    </p>
                                    <p>License Plate: {selectedInvoice.licensePlate}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-bold mb-2">Invoice Details:</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Date</th>
                                                <th className="px-4 py-2 text-left">Description</th>
                                                <th className="px-4 py-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border-t px-4 py-2">{formatDate(selectedInvoice.createdAt)}</td>
                                                <td className="border-t px-4 py-2">Service and Parts</td>
                                                <td className="border-t px-4 py-2 text-right">{formatCurrency(selectedInvoice.amount)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2} className="border-t px-4 py-2 text-right font-bold">
                                                    Total:
                                                </td>
                                                <td className="border-t px-4 py-2 text-right font-bold">
                                                    {formatCurrency(selectedInvoice.amount)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-bold mb-2">Payment Status:</h4>
                                <p>{getStatusBadge(selectedInvoice.status)}</p>
                            </div>

                            <div className="text-center text-gray-500 text-sm mt-8">
                                <p>Thank you for your business!</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageContainer>
    )
}


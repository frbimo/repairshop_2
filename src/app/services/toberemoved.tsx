// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"
// import { Loader2, Plus, Search, Edit, Eye } from "lucide-react"
// import { getCustomers } from "@/lib/customer-actions"
// import { PageContainer } from "@/components/page-container"
// import { PageHeader } from "@/components/page-header"
// import { Badge } from "@/components/ui/badge"

// export default function CustomerPage() {
//     const router = useRouter()
//     const [isLoading, setIsLoading] = useState(true)
//     const [customers, setCustomers] = useState<any[]>([])
//     const [filteredCustomers, setFilteredCustomers] = useState<any[]>([])
//     const [searchTerm, setSearchTerm] = useState("")

//     useEffect(() => {
//         const loadData = async () => {
//             setIsLoading(true)
//             try {
//                 const customersData = await getCustomers()
//                 setCustomers(customersData)
//                 setFilteredCustomers(customersData)
//             } catch (error) {
//                 console.error("Failed to load data:", error)
//             } finally {
//                 setIsLoading(false)
//             }
//         }

//         loadData()
//     }, [])

//     useEffect(() => {
//         if (searchTerm.trim() === "") {
//             setFilteredCustomers(customers)
//         } else {
//             const filtered = customers.filter(
//                 (customer) =>
//                     customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                     customer.phone.includes(searchTerm) ||
//                     customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                     customer.vehicles.some((vehicle: any) =>
//                         vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()),
//                     ),
//             )
//             setFilteredCustomers(filtered)
//         }
//     }, [searchTerm, customers])

//     const handleViewCustomer = (id: string) => {
//         router.push(`/services/detail/${id}`)
//     }

//     const handleEditCustomer = (id: string) => {
//         router.push(`/services/edit/${id}`)
//     }

//     return (
//         <PageContainer>
//             <PageHeader title="Service Management">
//                 <Link href="/services/register/customer">
//                     <Button>
//                         <Plus className="mr-2 h-4 w-4" /> Register New Customer
//                     </Button>
//                 </Link>
//             </PageHeader>

//             <Card className="mb-6">
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <CardTitle>Customers</CardTitle>
//                     <div className="flex items-center gap-4">
//                         <div className="relative">
//                             <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                             <Input
//                                 placeholder="Search by name, phone, email, or license plate"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="pl-8 w-[300px]"
//                             />
//                         </div>
//                         <Link href="/services/estimations">
//                             <Button variant="outline">Estimations</Button>
//                         </Link>
//                         <Link href="/services/workorders">
//                             <Button variant="outline">Work Orders</Button>
//                         </Link>
//                     </div>
//                 </CardHeader>
//                 <CardContent>
//                     {isLoading ? (
//                         <div className="flex justify-center items-center h-64">
//                             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                         </div>
//                     ) : filteredCustomers.length > 0 ? (
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead>Name</TableHead>
//                                     <TableHead>Status</TableHead>
//                                     <TableHead>Vehicle</TableHead>
//                                     <TableHead>License Plate</TableHead>
//                                     <TableHead className="text-right">Actions</TableHead>
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {filteredCustomers.map((customer) => {
//                                     // Get the first vehicle for display (if any)
//                                     const primaryVehicle = customer.vehicles.length > 0 ? customer.vehicles[0] : null
//                                     // Get the latest service status
//                                     const status = customer.latestServiceStatus || "No Service"

//                                     return (
//                                         <TableRow key={customer.id}>
//                                             <TableCell className="font-medium">{customer.name}</TableCell>
//                                             <TableCell>
//                                                 <Badge
//                                                     variant={
//                                                         status === "Estimation"
//                                                             ? "outline"
//                                                             : status === "Work Order"
//                                                                 ? "secondary"
//                                                                 : status === "Invoice"
//                                                                     ? "default"
//                                                                     : "outline"
//                                                     }
//                                                 >
//                                                     {status}
//                                                 </Badge>
//                                             </TableCell>
//                                             <TableCell>
//                                                 {primaryVehicle
//                                                     ? `${primaryVehicle.make} ${primaryVehicle.model} (${primaryVehicle.year})`
//                                                     : "No vehicle"}
//                                             </TableCell>
//                                             <TableCell>
//                                                 {primaryVehicle ? (
//                                                     <span
//                                                         className={
//                                                             searchTerm && primaryVehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
//                                                                 ? "bg-yellow-50 px-1 rounded"
//                                                                 : ""
//                                                         }
//                                                     >
//                                                         {primaryVehicle.licensePlate}
//                                                     </span>
//                                                 ) : (
//                                                     "N/A"
//                                                 )}
//                                             </TableCell>
//                                             <TableCell className="text-right">
//                                                 <div className="flex justify-end gap-2">
//                                                     <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer.id)}>
//                                                         <Eye className="h-4 w-4 mr-1" /> View
//                                                     </Button>
//                                                     <Button variant="outline" size="sm" onClick={() => handleEditCustomer(customer.id)}>
//                                                         <Edit className="h-4 w-4 mr-1" /> Edit
//                                                     </Button>
//                                                 </div>
//                                             </TableCell>
//                                         </TableRow>
//                                     )
//                                 })}
//                             </TableBody>
//                         </Table>
//                     ) : (
//                         <div className="text-center py-6 text-muted-foreground">
//                             {searchTerm
//                                 ? `No customers found with name, phone, email, or license plate containing "${searchTerm}"`
//                                 : `No customers found`}
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>
//         </PageContainer>
//     )
// }


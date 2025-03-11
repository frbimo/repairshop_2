"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { getAgingStock, getTotalCostByPeriod, getTotalInventoryCost } from "@/lib/actions"
import { formatCurrency, formatDate } from "@/lib/utils"

// Type for sort direction
type SortDirection = "asc" | "desc" | null

// Type for sort field
type SortField = "retailName" | "createdAt" | "stock" | "value" | null

export default function DashboardPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("monthly")
    const [agingFilter, setAgingFilter] = useState<string>("1")
    const [stats, setStats] = useState({
        totalCost: 0,
        totalInventoryCost: 0,
        agingStock: [] as any[],
    })

    // Sorting state
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true)
            try {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 1000))

                const totalCost = await getTotalCostByPeriod(period)
                const totalInventoryCost = await getTotalInventoryCost(period)
                const agingStock = await getAgingStock(Number.parseInt(agingFilter))

                setStats({
                    totalCost,
                    totalInventoryCost,
                    agingStock,
                })
            } catch (error) {
                console.error("Failed to load dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadDashboardData()
    }, [period, agingFilter])

    const handlePeriodChange = (value: string) => {
        setPeriod(value as "daily" | "monthly" | "yearly")
    }

    const handleAgingFilterChange = (value: string) => {
        setAgingFilter(value)
    }

    // Handle sort
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle direction if same field
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else if (sortDirection === "desc") {
                setSortField(null)
                setSortDirection(null)
            } else {
                setSortDirection("asc")
            }
        } else {
            // Set new field and direction
            setSortField(field)
            setSortDirection("asc")
        }
    }

    // Get sort icon
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />
        }

        if (sortDirection === "asc") {
            return <ArrowUp className="ml-2 h-4 w-4" />
        }

        if (sortDirection === "desc") {
            return <ArrowDown className="ml-2 h-4 w-4" />
        }

        return <ArrowUpDown className="ml-2 h-4 w-4" />
    }

    // Sort aging stock
    const sortedAgingStock = useMemo(() => {
        if (!sortField || !sortDirection) {
            return stats.agingStock
        }

        return [...stats.agingStock].sort((a, b) => {
            let comparison = 0

            if (sortField === "retailName") {
                comparison = a.retailName.localeCompare(b.retailName)
            } else if (sortField === "createdAt") {
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            } else if (sortField === "stock") {
                comparison = a.stock - b.stock
            } else if (sortField === "value") {
                const valueA = a.price * a.stock
                const valueB = b.price * b.stock
                comparison = valueA - valueB
            }

            return sortDirection === "asc" ? comparison : -comparison
        })
    }, [stats.agingStock, sortField, sortDirection])

    // Navigate to stock detail page
    const handleRowClick = (stockId: string) => {
        router.push(`/dashboard/stock/${stockId}`)
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
                <Select value={period} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Purchase Cost</CardTitle>
                                <CardDescription>Total cost of purchases ({period})</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{formatCurrency(stats.totalCost)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Total Inventory Cost</CardTitle>
                                <CardDescription>Value of current inventory ({period})</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{formatCurrency(stats.totalInventoryCost)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Aging Stock</CardTitle>
                                    <CardDescription>
                                        Parts older than {agingFilter} {Number.parseInt(agingFilter) === 1 ? "month" : "months"}
                                    </CardDescription>
                                </div>
                                <Select value={agingFilter} onValueChange={handleAgingFilterChange}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Month</SelectItem>
                                        <SelectItem value="3">3 Months</SelectItem>
                                        <SelectItem value="6">6 Months</SelectItem>
                                        <SelectItem value="12">12 Months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sortedAgingStock.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice</TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-medium h-auto hover:bg-transparent"
                                                    onClick={() => handleSort("retailName")}
                                                >
                                                    Retail Name
                                                    {getSortIcon("retailName")}
                                                </Button>
                                            </TableHead>
                                            <TableHead>Compatible With</TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-medium h-auto hover:bg-transparent"
                                                    onClick={() => handleSort("createdAt")}
                                                >
                                                    Purchase Date
                                                    {getSortIcon("createdAt")}
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-medium h-auto hover:bg-transparent"
                                                    onClick={() => handleSort("stock")}
                                                >
                                                    Stock
                                                    {getSortIcon("stock")}
                                                </Button>
                                            </TableHead>
                                            <TableHead className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-medium h-auto hover:bg-transparent ml-auto"
                                                    onClick={() => handleSort("value")}
                                                >
                                                    Value
                                                    {getSortIcon("value")}
                                                </Button>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedAgingStock.map((item) => (
                                            <TableRow
                                                key={item.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleRowClick(item.id)}
                                            >
                                                <TableCell>{item.invoice}</TableCell>
                                                <TableCell>{item.retailName}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.compatibilityCars.slice(0, 2).map((car: any, i: number) => (
                                                            <Badge key={i} variant="outline">
                                                                {car.brand} {car.model} ({car.year})
                                                            </Badge>
                                                        ))}
                                                        {item.compatibilityCars.length > 2 && (
                                                            <Badge variant="outline">+{item.compatibilityCars.length - 2} more</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatDate(item.createdAt)}</TableCell>
                                                <TableCell>{item.stock}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.price * item.stock)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    No aging stock found older than {agingFilter}{" "}
                                    {Number.parseInt(agingFilter) === 1 ? "month" : "months"}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}


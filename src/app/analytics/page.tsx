"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Car,
    Wrench,
    Calendar,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getAnalyticsData } from "@/lib/analytics-actions"

// Import chart components
import { Bar } from "react-chartjs-2"
import { Line } from "react-chartjs-2"
import { Pie } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")
    const [timeRange, setTimeRange] = useState("month")
    const [startDate, setStartDate] = useState(() => {
        const date = new Date()
        date.setMonth(date.getMonth() - 1)
        return date.toISOString().split("T")[0]
    })
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0])
    const [analyticsData, setAnalyticsData] = useState<any>(null)

    useEffect(() => {
        const loadAnalyticsData = async () => {
            setIsLoading(true)
            try {
                const data = await getAnalyticsData(timeRange, startDate, endDate)
                setAnalyticsData(data)
            } catch (error) {
                console.error("Failed to load analytics data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadAnalyticsData()
    }, [timeRange, startDate, endDate])

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value)

        const today = new Date()
        const start = new Date()

        switch (value) {
            case "week":
                start.setDate(today.getDate() - 7)
                break
            case "month":
                start.setMonth(today.getMonth() - 1)
                break
            case "quarter":
                start.setMonth(today.getMonth() - 3)
                break
            case "year":
                start.setFullYear(today.getFullYear() - 1)
                break
            case "custom":
                // Keep current custom dates
                return
        }

        setStartDate(start.toISOString().split("T")[0])
        setEndDate(today.toISOString().split("T")[0])
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last 7 days</SelectItem>
                            <SelectItem value="month">Last 30 days</SelectItem>
                            <SelectItem value="quarter">Last 3 months</SelectItem>
                            <SelectItem value="year">Last 12 months</SelectItem>
                            <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                    </Select>

                    {timeRange === "custom" && (
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-[150px]"
                            />
                            <span className="flex items-center">to</span>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[150px]" />
                        </div>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
                    <TabsTrigger value="services">Service Analysis</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                                        <p className="text-2xl font-bold">{formatCurrency(analyticsData?.overview?.totalRevenue || 0)}</p>
                                    </div>
                                    <div
                                        className={`p-2 rounded-full ${analyticsData?.overview?.revenueChange >= 0 ? "bg-green-100" : "bg-red-100"}`}
                                    >
                                        {analyticsData?.overview?.revenueChange >= 0 ? (
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                </div>
                                <p
                                    className={`text-xs mt-2 ${analyticsData?.overview?.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                    {analyticsData?.overview?.revenueChange >= 0 ? "+" : ""}
                                    {analyticsData?.overview?.revenueChange}% from previous period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Inventory Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(analyticsData?.overview?.inventoryValue || 0)}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Package className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-xs mt-2 text-muted-foreground">
                                    {analyticsData?.overview?.totalItems || 0} items in stock
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Active Services</p>
                                        <p className="text-2xl font-bold">{analyticsData?.overview?.activeServices || 0}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-amber-100">
                                        <Wrench className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                                <p className="text-xs mt-2 text-muted-foreground">
                                    {analyticsData?.overview?.completedServices || 0} completed this period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">New Customers</p>
                                        <p className="text-2xl font-bold">{analyticsData?.overview?.newCustomers || 0}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-purple-100">
                                        <Car className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-xs mt-2 text-muted-foreground">
                                    {analyticsData?.overview?.totalCustomers || 0} total customers
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                                <CardDescription>Revenue over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {analyticsData?.revenueTrend && (
                                    <Line
                                        data={{
                                            labels: analyticsData.revenueTrend.labels,
                                            datasets: [
                                                {
                                                    label: "Revenue",
                                                    data: analyticsData.revenueTrend.data,
                                                    borderColor: "rgb(59, 130, 246)",
                                                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                                                    tension: 0.3,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    ticks: {
                                                        callback: (value) => formatCurrency(Number(value)),
                                                    },
                                                },
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                            },
                                        }}
                                        height={300}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Service Distribution</CardTitle>
                                <CardDescription>Services by type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {analyticsData?.serviceDistribution && (
                                    <Pie
                                        data={{
                                            labels: analyticsData.serviceDistribution.labels,
                                            datasets: [
                                                {
                                                    data: analyticsData.serviceDistribution.data,
                                                    backgroundColor: [
                                                        "rgba(255, 99, 132, 0.7)",
                                                        "rgba(54, 162, 235, 0.7)",
                                                        "rgba(255, 206, 86, 0.7)",
                                                        "rgba(75, 192, 192, 0.7)",
                                                        "rgba(153, 102, 255, 0.7)",
                                                    ],
                                                    borderColor: [
                                                        "rgba(255, 99, 132, 1)",
                                                        "rgba(54, 162, 235, 1)",
                                                        "rgba(255, 206, 86, 1)",
                                                        "rgba(75, 192, 192, 1)",
                                                        "rgba(153, 102, 255, 1)",
                                                    ],
                                                    borderWidth: 1,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: "right",
                                                },
                                            },
                                        }}
                                        height={300}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest purchases and services</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analyticsData?.recentTransactions?.map((transaction: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{formatDate(transaction.date)}</TableCell>
                                            <TableCell>
                                                <Badge variant={transaction.type === "purchase" ? "outline" : "secondary"}>
                                                    {transaction.type === "purchase" ? "Purchase" : "Service"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        transaction.status === "completed"
                                                            ? "default"
                                                            : transaction.status === "pending"
                                                                ? "outline"
                                                                : "secondary"
                                                    }
                                                >
                                                    {transaction.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sales Analysis Tab */}
                <TabsContent value="sales" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Sales</p>
                                        <p className="text-2xl font-bold">{formatCurrency(analyticsData?.sales?.totalSales || 0)}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-green-100">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Average Sale Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(analyticsData?.sales?.averageSale || 0)}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                                        <p className="text-2xl font-bold">{analyticsData?.sales?.totalTransactions || 0}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-purple-100">
                                        <Calendar className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sales by Category</CardTitle>
                            <CardDescription>Revenue breakdown by service category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {analyticsData?.salesByCategory && (
                                <Bar
                                    data={{
                                        labels: analyticsData.salesByCategory.labels,
                                        datasets: [
                                            {
                                                label: "Revenue",
                                                data: analyticsData.salesByCategory.data,
                                                backgroundColor: "rgba(59, 130, 246, 0.7)",
                                                borderColor: "rgb(59, 130, 246)",
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: (value) => formatCurrency(Number(value)),
                                                },
                                            },
                                        },
                                    }}
                                    height={400}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Items</CardTitle>
                            <CardDescription>Most popular parts and services</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Quantity Sold</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analyticsData?.topSellingItems?.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.quantitySold}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Analysis Tab */}
                <TabsContent value="inventory" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(analyticsData?.inventory?.totalValue || 0)}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-green-100">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Low Stock Items</p>
                                        <p className="text-2xl font-bold">{analyticsData?.inventory?.lowStockCount || 0}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-amber-100">
                                        <TrendingDown className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Inventory Turnover</p>
                                        <p className="text-2xl font-bold">{analyticsData?.inventory?.turnoverRate || 0}x</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory by Category</CardTitle>
                                <CardDescription>Value distribution by category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {analyticsData?.inventoryByCategory && (
                                    <Pie
                                        data={{
                                            labels: analyticsData.inventoryByCategory.labels,
                                            datasets: [
                                                {
                                                    data: analyticsData.inventoryByCategory.data,
                                                    backgroundColor: [
                                                        "rgba(255, 99, 132, 0.7)",
                                                        "rgba(54, 162, 235, 0.7)",
                                                        "rgba(255, 206, 86, 0.7)",
                                                        "rgba(75, 192, 192, 0.7)",
                                                        "rgba(153, 102, 255, 0.7)",
                                                    ],
                                                    borderColor: [
                                                        "rgba(255, 99, 132, 1)",
                                                        "rgba(54, 162, 235, 1)",
                                                        "rgba(255, 206, 86, 1)",
                                                        "rgba(75, 192, 192, 1)",
                                                        "rgba(153, 102, 255, 1)",
                                                    ],
                                                    borderWidth: 1,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                        }}
                                        height={300}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Level Trend</CardTitle>
                                <CardDescription>Inventory levels over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {analyticsData?.stockLevelTrend && (
                                    <Line
                                        data={{
                                            labels: analyticsData.stockLevelTrend.labels,
                                            datasets: [
                                                {
                                                    label: "Stock Level",
                                                    data: analyticsData.stockLevelTrend.data,
                                                    borderColor: "rgb(75, 192, 192)",
                                                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                                                    tension: 0.3,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                        }}
                                        height={300}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Low Stock Items</CardTitle>
                            <CardDescription>Items that need to be restocked soon</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Current Stock</TableHead>
                                        <TableHead>Reorder Level</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analyticsData?.lowStockItems?.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.sku}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.currentStock <= item.reorderLevel / 2 ? "destructive" : "outline"}>
                                                    {item.currentStock}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.reorderLevel}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Service Analysis Tab */}
                <TabsContent value="services" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Services</p>
                                        <p className="text-2xl font-bold">{analyticsData?.services?.totalServices || 0}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Wrench className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Average Service Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(analyticsData?.services?.averageValue || 0)}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-green-100">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                                        <p className="text-2xl font-bold">{analyticsData?.services?.completionRate || 0}%</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-purple-100">
                                        <PieChart className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Service Trend</CardTitle>
                            <CardDescription>Number of services over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {analyticsData?.serviceTrend && (
                                <Bar
                                    data={{
                                        labels: analyticsData.serviceTrend.labels,
                                        datasets: [
                                            {
                                                label: "Services",
                                                data: analyticsData.serviceTrend.data,
                                                backgroundColor: "rgba(153, 102, 255, 0.7)",
                                                borderColor: "rgb(153, 102, 255)",
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                    }}
                                    height={400}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Service Status Distribution</CardTitle>
                            <CardDescription>Current service status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            {analyticsData?.serviceStatusDistribution && (
                                <div style={{ width: "50%" }}>
                                    <Pie
                                        data={{
                                            labels: analyticsData.serviceStatusDistribution.labels,
                                            datasets: [
                                                {
                                                    data: analyticsData.serviceStatusDistribution.data,
                                                    backgroundColor: [
                                                        "rgba(255, 206, 86, 0.7)",
                                                        "rgba(54, 162, 235, 0.7)",
                                                        "rgba(75, 192, 192, 0.7)",
                                                    ],
                                                    borderColor: ["rgba(255, 206, 86, 1)", "rgba(54, 162, 235, 1)", "rgba(75, 192, 192, 1)"],
                                                    borderWidth: 1,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: true,
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Service Types</CardTitle>
                            <CardDescription>Most requested service types</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service Type</TableHead>
                                        <TableHead>Count</TableHead>
                                        <TableHead>Average Duration (days)</TableHead>
                                        <TableHead className="text-right">Average Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analyticsData?.topServiceTypes?.map((service: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell>{service.count}</TableCell>
                                            <TableCell>{service.averageDuration}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(service.averageRevenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}


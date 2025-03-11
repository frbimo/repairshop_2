"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Calendar, Store, Tag, Package, DollarSign } from "lucide-react"
import { getStockById } from "@/lib/actions"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function StockDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [stock, setStock] = useState<any>(null)

    useEffect(() => {
        const loadStockData = async () => {
            setIsLoading(true)
            try {
                const stockData = await getStockById(params.id)
                setStock(stockData)
            } catch (error) {
                console.error("Failed to load stock data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadStockData()
    }, [params.id])

    const handleBack = () => {
        router.back()
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

    if (!stock) {
        return (
            <div className="container mx-auto py-10">
                <Button variant="outline" onClick={handleBack} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-6 text-muted-foreground">Stock item not found</div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <Button variant="outline" onClick={handleBack} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Details</CardTitle>
                        <CardDescription>Invoice: {stock.invoice}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Store className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Retail Name</p>
                                        <p className="font-medium">{stock.retailName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Purchase Date</p>
                                        <p className="font-medium">{formatDate(stock.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Tag className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit Price</p>
                                        <p className="font-medium">{formatCurrency(stock.price)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Stock Quantity</p>
                                        <p className="font-medium">{stock.stock} units</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Value</p>
                                        <p className="font-medium">{formatCurrency(stock.price * stock.stock)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium mb-3">Compatible Cars</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stock.compatibilityCars.map((car: any, index: number) => (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Brand:</span>
                                                    <span className="font-medium">{car.brand}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Model:</span>
                                                    <span className="font-medium">{car.model}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Year:</span>
                                                    <span className="font-medium">{car.year}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={handleBack} className="w-full">
                            Back to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}


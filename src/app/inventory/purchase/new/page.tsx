"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Car, Package, Tag, X } from 'lucide-react'
import { createPurchaseReceipt, SparePartItem, generateId } from "@/lib/actions"
import { formatCurrency } from "@/lib/utils"

// // Types
// interface SparePartItem {
//     id: string
//     sku: string
//     name: string
//     quantity: number
//     unitPrice: number
//     description: string
//     compatibility: CompatibleCar[]
// }

interface Car {
    id: string
    brand: string
    model: string
    year: number
}

// Mock car brands and models for the demo
const carBrands = [
    "Toyota", "Honda", "Ford", "Chevrolet", "Nissan",
    "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Hyundai"
];

const carModels: Record<string, string[]> = {
    "Toyota": ["Corolla", "Camry", "RAV4", "Highlander", "Tacoma"],
    "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Odyssey"],
    "Ford": ["F-150", "Escape", "Explorer", "Mustang", "Focus"],
    "Chevrolet": ["Silverado", "Equinox", "Malibu", "Tahoe", "Suburban"],
    "Nissan": ["Altima", "Rogue", "Sentra", "Pathfinder", "Frontier"],
    "BMW": ["3 Series", "5 Series", "X3", "X5", "7 Series"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE", "S-Class"],
    "Audi": ["A4", "A6", "Q5", "Q7", "A8"],
    "Volkswagen": ["Jetta", "Passat", "Tiguan", "Atlas", "Golf"],
    "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade"]
};

export default function NewPurchaseReceiptPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Purchase receipt form state
    const [invoiceNumber, setInvoiceNumber] = useState("")
    const [vendorName, setVendorName] = useState("")
    const [purchaseDate, setPurchaseDate] = useState(new Date())
    const [notes, setNotes] = useState("")
    const [totalCost, setTotalCost] = useState(0)

    // Spare parts items state
    const [items, setItems] = useState<SparePartItem[]>([])

    // Compatibility form state
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)
    const [compatibleBrand, setCompatibleBrand] = useState("")
    const [compatibleModel, setCompatibleModel] = useState("")
    const [compatibleYear, setCompatibleYear] = useState(0)

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.stock * item.price), 0)

    // Add a new spare part item
    const addItem = () => {
        const newItem: SparePartItem = {
            id: "",
            sku: "",
            name: "",
            stock: 1,
            price: 0,
            description: "",
            compatibilityCars: [],
            createdAt: new Date()
        }

        setItems([...items, newItem])
    }

    // Remove a spare part item
    const removeItem = (index: number) => {
        const updatedItems = [...items]
        updatedItems.splice(index, 1)
        setItems(updatedItems)
    }

    // Update a spare part item
    const updateItem = (index: number, field: keyof SparePartItem, value: any) => {
        const updatedItems = [...items]
        updatedItems[index] = { ...updatedItems[index], [field]: value }
        setItems(updatedItems)
    }

    // Add compatible car to an item
    const addCompatibleCar = async (index: number) => {
        if (!compatibleBrand || !compatibleModel || !compatibleYear) return
        const myid = await generateId();
        const newCar: Car = {
            id: myid,
            brand: compatibleBrand,
            model: compatibleModel,
            year: compatibleYear
        }

        const updatedItems = [...items]
        updatedItems[index] = {
            ...updatedItems[index],
            compatibilityCars: [...updatedItems[index].compatibilityCars, newCar]
        }

        setItems(updatedItems)

        // Reset form
        setCompatibleBrand("")
        setCompatibleModel("")
        setCompatibleYear(0)
    }

    // Remove compatible car from an item
    const removeCompatibleCar = (itemIndex: number, carIndex: number) => {
        const updatedItems = [...items]
        const updatedCars = [...updatedItems[itemIndex].compatibilityCars]
        updatedCars.splice(carIndex, 1)
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], compatibilityCars: updatedCars }
        setItems(updatedItems)
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!invoiceNumber || !vendorName || !purchaseDate || items.length === 0) {
            alert("Please fill in all required fields and add at least one item")
            return
        }

        // Validate items
        for (const item of items) {
            if (!item.sku || !item.name || item.stock <= 0 || item.price <= 0) {
                alert("Please fill in all item details correctly")
                return
            }
        }

        setIsSubmitting(true)

        try {
            const id = await generateId();
            await createPurchaseReceipt({
                id,
                // itemIds,
                invoiceNumber,
                vendorName,
                purchaseDate,
                // notes,
                items,
                totalCost,
            })

            router.push("/inventory/search")
        } catch (error) {
            console.error("Error creating purchase receipt:", error)
            alert("Failed to create purchase receipt. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Daftar Suku Cadang Baru</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    {/* Purchase Receipt Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Receipt Pembelian</CardTitle>
                            <CardDescription>Enter the details of the purchase receipt</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="invoice-number">No. Invoice*</Label>
                                    <Input
                                        id="invoice-number"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        placeholder="INV-12345"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="vendor-name">Nama Vendor*</Label>
                                    <Input
                                        id="vendor-name"
                                        value={vendorName}
                                        onChange={(e) => setVendorName(e.target.value)}
                                        placeholder="ABC Auto Parts"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="purchase-date">Tgl. Pembelian *</Label>
                                    <Input
                                        id="purchase-date"
                                        type="date"
                                        value={purchaseDate.toISOString().split('T')[0]}
                                        onChange={(e) => setPurchaseDate(e.target.valueAsDate || new Date())}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Additional notes about this purchase"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Spare Parts Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Item Suku Cadang</CardTitle>
                            <CardDescription>Tambahkan detail suku cadang</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                {items.length === 0 ? (
                                    <div className="text-center py-10 border border-dashed rounded-lg">
                                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-2 text-sm font-semibold text-muted-foreground">Tidak ada item ditambahkan </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Mulai menambahkan.
                                        </p>
                                        <div className="mt-6">
                                            <Button type="button" onClick={addItem}>
                                                <Plus className="h-4 w-4 mr-2" /> Tambah Item
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    items.map((item, index) => (
                                        <Card key={item.id} className="border border-muted">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-lg">Item #{index + 1}</CardTitle>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`sku-${index}`}>SKU *</Label>
                                                        <Input
                                                            id={`sku-${index}`}
                                                            value={item.sku}
                                                            onChange={(e) => updateItem(index, "sku", e.target.value)}
                                                            placeholder="SP12345"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`name-${index}`}>Nama Item*</Label>
                                                        <Input
                                                            id={`name-${index}`}
                                                            value={item.name}
                                                            onChange={(e) => updateItem(index, "name", e.target.value)}
                                                            placeholder="Brake Pad"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                                                        <Input
                                                            id={`quantity-${index}`}
                                                            type="number"
                                                            min="1"
                                                            value={item.stock}
                                                            onChange={(e) => updateItem(index, "stock", parseInt(e.target.value) || 0)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`unit-price-${index}`}>Harga Unit *</Label>
                                                        <Input
                                                            id={`unit-price-${index}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid gap-2 sm:col-span-2">
                                                        <Label htmlFor={`description-${index}`}>Deskripsi</Label>
                                                        <Textarea
                                                            id={`description-${index}`}
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, "description", e.target.value)}
                                                            placeholder="Item description"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>

                                                <Separator className="my-4" />

                                                {/* Compatible Cars Section */}
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <Label className="text-base">Kompatibel Kendaraan</Label>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentItemIndex(currentItemIndex === index ? null : index)}
                                                        >
                                                            {currentItemIndex === index ? "Close" : "Add Compatibility"}
                                                        </Button>
                                                    </div>

                                                    {/* Compatible Cars List */}
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {item.compatibilityCars.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground">Kompatibel kendaraan tidak ditambahkan</p>
                                                        ) : (
                                                            item.compatibilityCars.map((car, carIndex) => (
                                                                <Badge key={car.id} variant="secondary" className="flex items-center gap-1">
                                                                    <Car className="h-3 w-3" />
                                                                    {car.brand} {car.model} ({car.year})
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-4 w-4 p-0 ml-1"
                                                                        onClick={() => removeCompatibleCar(index, carIndex)}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>

                                                    {/* Add Compatible Car Form */}
                                                    {currentItemIndex === index && (
                                                        <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
                                                            <div className="grid gap-4 sm:grid-cols-3">
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`car-brand-${index}`}>Merk</Label>
                                                                    <Select value={compatibleBrand} onValueChange={setCompatibleBrand}>
                                                                        <SelectTrigger id={`car-brand-${index}`}>
                                                                            <SelectValue placeholder="Select brand" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {carBrands.map(brand => (
                                                                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`car-model-${index}`}>Model</Label>
                                                                    <Select
                                                                        value={compatibleModel}
                                                                        onValueChange={setCompatibleModel}
                                                                        disabled={!compatibleBrand}
                                                                    >
                                                                        <SelectTrigger id={`car-model-${index}`}>
                                                                            <SelectValue placeholder="Select model" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {compatibleBrand && carModels[compatibleBrand]?.map(model => (
                                                                                <SelectItem key={model} value={model}>{model}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`car-year-${index}`}>Tahun</Label>
                                                                    <Input
                                                                        id={`car-year-${index}`}
                                                                        value={compatibleYear}
                                                                        onChange={(e) => setCompatibleYear(e.target.valueAsNumber)}
                                                                        placeholder="2023"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                className="w-full"
                                                                onClick={() => addCompatibleCar(index)}
                                                                disabled={!compatibleBrand || !compatibleModel || !compatibleYear}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" /> Tambah Kompatibel kendaraan
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="bg-muted/20 flex justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">SKU: {item.sku || "Not set"}</span>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    Subtotal: {formatCurrency(item.stock * item.price)}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}

                                {items.length > 0 && (
                                    <Button type="button" variant="outline" onClick={addItem}>
                                        <Plus className="h-4 w-4 mr-2" /> Tambah Item Lainnya
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between bg-muted/20">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Items: {items.length}</p>
                            </div>
                            <div className="text-lg font-bold">
                                Total: {formatCurrency(totalAmount)}
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Receipt
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Home, Search, Edit, Trash2, Plus } from "lucide-react"
import {
    getAllInventoryItems,
    searchInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
} from "@/lib/inventory-actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Clock } from "@/components/clock"

const searchFormSchema = z.object({
    searchType: z.enum(["sku", "name", "retailName"]),
    searchTerm: z.string().min(1, "Search term is required"),
})

const editFormSchema = z.object({
    id: z.string(),
    invoice: z.string().min(1, "Invoice number is required"),
    price: z.coerce.number().positive("Price must be positive"),
    stock: z.coerce.number().int().positive("Stock must be a positive integer"),
    retailName: z.string().min(1, "Retail name is required"),
})

type SearchFormValues = z.infer<typeof searchFormSchema>
type EditFormValues = z.infer<typeof editFormSchema>

export default function InventoryManagePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [inventoryItems, setInventoryItems] = useState<any[]>([])
    const [filteredItems, setFilteredItems] = useState<any[]>([])
    const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState<any>(null)

    const searchForm = useForm<SearchFormValues>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            searchType: "name",
            searchTerm: "",
        },
    })

    const editForm = useForm<EditFormValues>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            id: "",
            invoice: "",
            price: 0,
            stock: 0,
            retailName: "",
        },
    })

    useEffect(() => {
        const loadInventoryData = async () => {
            setIsLoading(true)
            try {
                const items = await getAllInventoryItems()
                setInventoryItems(items)
                setFilteredItems(items)

                // Generate initial suggestions based on search type
                updateSearchSuggestions(searchForm.getValues("searchType"), items)
            } catch (error) {
                console.error("Failed to load inventory data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadInventoryData()
    }, [searchForm])

    const updateSearchSuggestions = (searchType: string, items: any[]) => {
        let suggestions: string[] = []

        switch (searchType) {
            case "sku":
                suggestions = [...new Set(items.map((item) => item.invoice))]
                break
            case "name":
                // For parts name, we'll use a placeholder since we don't have actual part names
                suggestions = ["Oil Filter", "Air Filter", "Brake Pads", "Spark Plugs", "Wiper Blades"]
                break
            case "retailName":
                suggestions = [...new Set(items.map((item) => item.retailName))]
                break
        }

        setSearchSuggestions(suggestions)
    }

    const onSearchTypeChange = (value: "sku" | "name" | "retailName") => {
        searchForm.setValue("searchType", value)
        searchForm.setValue("searchTerm", "")
        updateSearchSuggestions(value, inventoryItems)
    }

    const onSearch = async (values: SearchFormValues) => {
        setIsLoading(true)
        try {
            const results = await searchInventoryItems(values.searchType, values.searchTerm)
            setFilteredItems(results)
        } catch (error) {
            console.error("Failed to search inventory:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (item: any) => {
        setCurrentItem(item)
        editForm.reset({
            id: item.id,
            invoice: item.invoice,
            price: item.price,
            stock: item.stock,
            retailName: item.retailName,
        })
        setIsEditDialogOpen(true)
    }

    const handleDelete = (item: any) => {
        setCurrentItem(item)
        setIsDeleteDialogOpen(true)
    }

    const onEditSubmit = async (values: EditFormValues) => {
        try {
            const result = await updateInventoryItem(values)

            if (result.success) {
                // Update the item in the local state
                const updatedItems = inventoryItems.map((item) => (item.id === values.id ? { ...item, ...values } : item))
                setInventoryItems(updatedItems)
                setFilteredItems(filteredItems.map((item) => (item.id === values.id ? { ...item, ...values } : item)))
                setIsEditDialogOpen(false)
            } else {
                console.error("Failed to update item:", result.error)
            }
        } catch (error) {
            console.error("Error updating item:", error)
        }
    }

    const onDeleteConfirm = async () => {
        if (!currentItem) return

        try {
            const result = await deleteInventoryItem(currentItem.id)

            if (result.success) {
                // Remove the item from the local state
                setInventoryItems(inventoryItems.filter((item) => item.id !== currentItem.id))
                setFilteredItems(filteredItems.filter((item) => item.id !== currentItem.id))
                setIsDeleteDialogOpen(false)
            } else {
                console.error("Failed to delete item:", result.error)
            }
        } catch (error) {
            console.error("Error deleting item:", error)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    {/* <Link href="/">
                        <Button variant="outline" size="sm">
                            <Home className="h-4 w-4 mr-2" /> Home
                        </Button>
                    </Link> */}
                    <h1 className="text-3xl font-bold">Pencarian Suku Cadang</h1>
                </div>
                {/* <Clock /> */}
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Search Inventory</CardTitle>
                    <CardDescription>Search for items by SKU, name, or retail name</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...searchForm}>
                        <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="flex gap-2 mb-4">
                                    <Button
                                        type="button"
                                        variant={searchForm.watch("searchType") === "sku" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onSearchTypeChange("sku")}
                                    >
                                        SKU
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={searchForm.watch("searchType") === "name" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onSearchTypeChange("name")}
                                    >
                                        Part Name
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={searchForm.watch("searchType") === "retailName" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onSearchTypeChange("retailName")}
                                    >
                                        Retail Name
                                    </Button>
                                </div>

                                <FormField
                                    control={searchForm.control}
                                    name="searchTerm"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Combobox
                                                        options={searchSuggestions.map((suggestion) => ({ value: suggestion, label: suggestion }))}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder={`Search by ${searchForm.watch("searchType")}`}
                                                        emptyMessage="No suggestions found."
                                                        allowCustomValue={true}
                                                        className="flex-1"
                                                    />
                                                    <Button type="submit">
                                                        <Search className="h-4 w-4 mr-2" /> Search
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Inventory Items</CardTitle>
                        <CardDescription>{filteredItems.length} items found</CardDescription>
                    </div>
                    {/* <Link href="/inventory/purchase/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Add New Item
                        </Button>
                    </Link> */}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Retail Name</TableHead>
                                        <TableHead>Compatible With</TableHead>
                                        <TableHead>Purchase Date</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.invoice}</TableCell>
                                            <TableCell>{item.retailName}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.compatibilityCars?.slice(0, 2).map((car: any, i: number) => (
                                                        <Badge key={i} variant="outline">
                                                            {car.brand} {car.model} ({car.year})
                                                        </Badge>
                                                    ))}
                                                    {item.compatibilityCars?.length > 2 && (
                                                        <Badge variant="outline">+{item.compatibilityCars.length - 2} more</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(item.createdAt)}</TableCell>
                                            <TableCell>{item.stock}</TableCell>
                                            <TableCell>{formatCurrency(item.price)}</TableCell>
                                            <TableCell>{formatCurrency(item.price * item.stock)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(item)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            No inventory items found. Try a different search term.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Inventory Item</DialogTitle>
                        <DialogDescription>Update the details of this inventory item.</DialogDescription>
                    </DialogHeader>

                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="invoice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU / Invoice Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="retailName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Retail Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editForm.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this inventory item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {currentItem && (
                        <div className="py-4">
                            <p>
                                <strong>SKU:</strong> {currentItem.invoice}
                            </p>
                            <p>
                                <strong>Retail Name:</strong> {currentItem.retailName}
                            </p>
                            <p>
                                <strong>Stock:</strong> {currentItem.stock} units
                            </p>
                            <p>
                                <strong>Value:</strong> {formatCurrency(currentItem.price * currentItem.stock)}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={onDeleteConfirm}>
                            Delete Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}


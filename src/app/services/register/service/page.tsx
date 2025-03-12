"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { getAvailableParts, getCustomerAndVehicleDetails, saveServiceDetails } from "@/lib/customer-actions"

const serviceTypeSchema = z.object({
    name: z.string().min(1, "Service type is required"),
    description: z.string().optional(),
})

const formSchema = z.object({
    description: z.string().optional(),
    estimatedCompletionDate: z.string().min(1, "Estimated completion date is required"),
    serviceTypes: z.array(serviceTypeSchema).min(1, "At least one service type is required"),
    parts: z.array(
        z.object({
            partId: z.string().min(1, "Part is required"),
            quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
        }),
    ),
})

type FormValues = z.infer<typeof formSchema>

export default function ServiceRegistrationPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [customerDetails, setCustomerDetails] = useState<any>(null)
    const [vehicleDetails, setVehicleDetails] = useState<any>(null)
    const [availableParts, setAvailableParts] = useState<any[]>([])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
            serviceTypes: [{ name: "", description: "" }],
            parts: [],
        },
    })

    useEffect(() => {
        // Check if we have customer and vehicle IDs from previous steps
        const customerId = sessionStorage.getItem("registrationCustomerId")
        const vehicleId = sessionStorage.getItem("registrationVehicleId")

        if (!customerId || !vehicleId) {
            // If missing IDs, redirect back to customer registration
            router.push("/services/register/customer")
            return
        }

        const loadData = async () => {
            setIsLoading(true)
            try {
                // Load customer and vehicle details
                console.log("getCustomerAndVehicleDetails", customerId, vehicleId)
                const details = await getCustomerAndVehicleDetails(customerId, vehicleId)
                setCustomerDetails(details.customer)
                setVehicleDetails(details.vehicle)

                // Load available parts
                const parts = await getAvailableParts()
                setAvailableParts(parts)
            } catch (error) {
                console.error("Error loading data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [router])

    const addServiceType = () => {
        const currentServiceTypes = form.getValues("serviceTypes")
        form.setValue("serviceTypes", [...currentServiceTypes, { name: "", description: "" }])
    }

    const removeServiceType = (index: number) => {
        const currentServiceTypes = form.getValues("serviceTypes")
        if (currentServiceTypes.length > 1) {
            form.setValue(
                "serviceTypes",
                currentServiceTypes.filter((_, i) => i !== index),
            )
        }
    }

    const addPart = () => {
        const currentParts = form.getValues("parts")
        form.setValue("parts", [...currentParts, { partId: "", quantity: 1 }])
    }

    const removePart = (index: number) => {
        const currentParts = form.getValues("parts")
        form.setValue(
            "parts",
            currentParts.filter((_, i) => i !== index),
        )
    }

    async function onSubmit(values: FormValues) {
        const customerId = sessionStorage.getItem("registrationCustomerId")
        const vehicleId = sessionStorage.getItem("registrationVehicleId")

        if (!customerId || !vehicleId) return

        setIsSubmitting(true)

        try {
            const result = await saveServiceDetails(customerId, vehicleId, values)

            if (result.success) {
                // Clear registration data from session storage
                sessionStorage.removeItem("registrationCustomerId")
                sessionStorage.removeItem("registrationVehicleId")

                // Redirect to customer dashboard
                router.push("/services/estimations")
            } else {
                console.error("Failed to save service details:", result.error)
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error("Error saving service details:", error)
            setIsSubmitting(false)
        }
    }

    const handleBack = () => {
        // Keep the customer ID but clear the vehicle ID
        sessionStorage.removeItem("registrationVehicleId")
        router.push("/services/register/vehicle")
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-end mb-4">
                    {/* <Clock /> */}
                </div>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-end mb-4">
                {/* <Clock /> */}
            </div>

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Service Detail</CardTitle>
                    <CardDescription>Langkah 3 dari 3: Masukan service detail</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Customer and Vehicle Summary */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                                    <p className="text-lg font-semibold">{customerDetails?.name}</p>
                                    <p className="text-sm">{customerDetails?.phone}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Kendaraan</h3>
                                    <p className="text-lg font-semibold">
                                        {vehicleDetails?.make} {vehicleDetails?.model} ({vehicleDetails?.year})
                                    </p>
                                    <p className="text-sm">Plat Nomor: {vehicleDetails?.licensePlate}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-6">
                                {/* Service Types Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <FormLabel>Rincian Servis</FormLabel>
                                        <Button type="button" variant="outline" size="sm" onClick={addServiceType}>
                                            <Plus className="h-4 w-4 mr-1" /> Tambah tipe servis
                                        </Button>
                                    </div>
                                    <FormMessage>{form.formState.errors.serviceTypes?.message}</FormMessage>

                                    {form.watch("serviceTypes").map((_, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 border rounded-md mb-4">
                                            <div className="grid grid-cols-1 gap-4 flex-1">
                                                <FormField
                                                    control={form.control}
                                                    name={`serviceTypes.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Tipe Service</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Pilih tipe service" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="oil_change">Oil Change</SelectItem>
                                                                    <SelectItem value="brake_service">Brake Service</SelectItem>
                                                                    <SelectItem value="tire_replacement">Tire Replacement</SelectItem>
                                                                    <SelectItem value="engine_repair">Engine Repair</SelectItem>
                                                                    <SelectItem value="transmission">Transmission Service</SelectItem>
                                                                    <SelectItem value="electrical">Electrical System</SelectItem>
                                                                    <SelectItem value="ac_service">A/C Service</SelectItem>
                                                                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                                                    <SelectItem value="other">Other</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`serviceTypes.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Penjelasan service (Optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="mt-8"
                                                onClick={() => removeServiceType(index)}
                                                disabled={form.watch("serviceTypes").length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Catatan Tambahan</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder=""
                                                    className="resize-none min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimatedCompletionDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimasi Waktu Selesai</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <FormLabel>Part yang dibutuhkan</FormLabel>
                                        <Button type="button" variant="outline" size="sm" onClick={addPart}>
                                            <Plus className="h-4 w-4 mr-1" /> Tambah Part
                                        </Button>
                                    </div>

                                    {form.watch("parts").length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Part</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead className="w-[80px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {form.watch("parts").map((_, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`parts.${index}.partId`}
                                                                render={({ field }) => (
                                                                    <FormItem className="mb-0">
                                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select part" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                {availableParts.map((part) => (
                                                                                    <SelectItem key={part.id} value={part.id}>
                                                                                        {part.name} - {part.price}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`parts.${index}.quantity`}
                                                                render={({ field }) => (
                                                                    <FormItem className="mb-0">
                                                                        <FormControl>
                                                                            <Input type="number" min="1" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removePart(index)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4 border rounded-md text-muted-foreground">
                                            Tidak ada part. Klik "Tambah Part" untuk memilih part untuk servis ini.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <CardFooter className="flex justify-between mt-6">
                                <Button type="button" variant="outline" onClick={handleBack}>
                                    Kembali
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Registering..." : "Registrasi Selesai"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}


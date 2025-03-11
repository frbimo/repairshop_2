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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { getCarBrands, getCarModelsByBrand } from "@/lib/actions"
import { saveVehicleDetails } from "@/lib/customer-actions"
import { Clock } from "@/components/clock"

const formSchema = z.object({
    make: z.string().min(1, "Vehicle make is required"),
    model: z.string().min(1, "Vehicle model is required"),
    year: z.coerce.number().min(1900, "Year must be after 1900").max(2100, "Year must be before 2100"),
    licensePlate: z.string().min(1, "License plate is required"),
    color: z.string().min(1, "Color is required"),
    vin: z.string().optional(),
    mileage: z.coerce.number().min(0, "Mileage must be positive"),
})

type FormValues = z.infer<typeof formSchema>

export default function VehicleRegistrationPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [carBrands, setCarBrands] = useState<ComboboxOption[]>([])
    const [carModels, setCarModels] = useState<Record<string, ComboboxOption[]>>({})
    const [customerId, setCustomerId] = useState<string | null>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            licensePlate: "",
            color: "",
            vin: "",
            mileage: 0,
        },
    })

    useEffect(() => {
        // Check if we have a customer ID from the previous step
        const storedCustomerId = sessionStorage.getItem("registrationCustomerId")
        if (!storedCustomerId) {
            // If no customer ID, redirect back to customer registration
            router.push("/customer/register/customer")
            return
        }

        setCustomerId(storedCustomerId)

        // Load car brands
        const loadCarBrands = async () => {
            const brands = await getCarBrands()
            setCarBrands(brands.map((brand) => ({ value: brand, label: brand })))
        }

        loadCarBrands()
    }, [router])

    // Load car models when a brand is selected
    const loadCarModels = async (brand: string) => {
        if (!brand || carModels[brand]) return

        const models = await getCarModelsByBrand(brand)
        setCarModels((prev) => ({
            ...prev,
            [brand]: models.map((model) => ({ value: model, label: model })),
        }))
    }

    async function onSubmit(values: FormValues) {
        if (!customerId) return

        setIsSubmitting(true)

        try {
            const result = await saveVehicleDetails(customerId, values)

            if (result.success) {
                // Store vehicle ID for the next step
                sessionStorage.setItem("registrationVehicleId", result.vehicleId)
                router.push("/customer/register/service")
            } else {
                console.error("Failed to save vehicle details:", result.error)
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error("Error saving vehicle details:", error)
            setIsSubmitting(false)
        }
    }

    const handleBack = () => {
        // Clear session storage and go back to first step
        sessionStorage.removeItem("registrationCustomerId")
        router.push("/customer/register/customer")
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-end mb-4">
                <Clock />
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Vehicle Registration</CardTitle>
                    <CardDescription>Step 2 of 3: Enter vehicle details</CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="make"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Make</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    options={carBrands}
                                                    value={field.value}
                                                    onChange={(value) => {
                                                        field.onChange(value)
                                                        // Reset model when make changes
                                                        form.setValue("model", "")
                                                        // Load models for this make
                                                        loadCarModels(value)
                                                    }}
                                                    placeholder="Select or type make"
                                                    emptyMessage="No makes found."
                                                    allowCustomValue={true}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="model"
                                    render={({ field }) => {
                                        const make = form.watch("make")
                                        const modelOptions = carModels[make] || []

                                        return (
                                            <FormItem>
                                                <FormLabel>Model</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={modelOptions}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select or type model"
                                                        emptyMessage={make ? "No models found for this make." : "Select a make first."}
                                                        disabled={!make}
                                                        allowCustomValue={true}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Black" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="licensePlate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>License Plate</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ABC123" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="vin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>VIN (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Vehicle Identification Number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="mileage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mileage</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between">
                            <Button type="button" variant="outline" onClick={handleBack}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Next: Service Details"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}


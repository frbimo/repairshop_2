"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { getCustomerById, updateCustomerDetails } from "@/lib/customer-actions"
import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(5, "Address must be at least 5 characters"),
})

type FormValues = z.infer<typeof formSchema>

export default function EditCustomerPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [customer, setCustomer] = useState<any>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    })

    useEffect(() => {
        const loadCustomerData = async () => {
            setIsLoading(true)
            try {
                const customerData = await getCustomerById(params.id)
                setCustomer(customerData)

                if (customerData) {
                    form.reset({
                        name: customerData.name,
                        email: customerData.email,
                        phone: customerData.phone,
                        address: customerData.address,
                    })
                }
            } catch (error) {
                console.error("Failed to load customer data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadCustomerData()
    }, [params.id, form])

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true)

        try {
            const result = await updateCustomerDetails(params.id, values)

            if (result.success) {
                router.push("/services")
            } else {
                console.error("Failed to update customer details:", result.error)
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error("Error updating customer details:", error)
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </PageContainer>
        )
    }

    if (!customer) {
        return (
            <PageContainer>
                <div className="text-center py-6 text-muted-foreground">Customer not found</div>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <PageHeader title="Edit Customer">
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </PageHeader>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>Edit customer details</CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(123) 456-7890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="123 Main St, City, State, ZIP" className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>

                        <CardFooter className="flex justify-between">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </PageContainer>
    )
}


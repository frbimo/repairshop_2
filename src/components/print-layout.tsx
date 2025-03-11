"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { getQRCodeUrl } from "@/lib/qr-utils"
import { Printer } from "lucide-react"

interface PrintLayoutProps {
    type: "estimation" | "workOrder"
    id: string
    customer: {
        name: string
        phone: string
        email: string
        address: string
    }
    vehicle: {
        make: string
        model: string
        year: number
        licensePlate: string
        color: string
        vin?: string
        mileage: number
    }
    serviceTypes: Array<{
        name: string
        description?: string
    }>
    parts: Array<{
        name: string
        quantity: number
        price: number
    }>
    description: string
    estimatedCompletionDate: Date
    status: string
    createdAt: Date
}

export function PrintLayout({
    type,
    id,
    customer,
    vehicle,
    serviceTypes,
    parts,
    description,
    estimatedCompletionDate,
    status,
    createdAt,
}: PrintLayoutProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const content = printRef.current
        if (!content) return

        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        const printDocument = printWindow.document
        printDocument.write(`
      <html>
        <head>
          <title>${type === "estimation" ? "Estimation" : "Work Order"} - ${id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .company {
              font-size: 24px;
              font-weight: bold;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
              text-align: center;
            }
            .id {
              font-size: 16px;
              margin-bottom: 20px;
              text-align: center;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              margin-bottom: 5px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .qr-code {
              text-align: center;
              margin-top: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <div class="footer">
            <p>Thank you for choosing Stepha Autorepair. We appreciate your business!</p>
            <p>For any questions, please contact us at: (123) 456-7890 or info@stephaautorepair.com</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `)
        printDocument.close()
    }

    return (
        <div>
            <Button onClick={handlePrint} className="mb-4">
                <Printer className="h-4 w-4 mr-2" /> Print {type === "estimation" ? "Estimation" : "Work Order"}
            </Button>

            <div ref={printRef} className="bg-white p-6 border rounded-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Stepha Autorepair</h1>
                        <p className="text-sm text-muted-foreground">123 Main Street, Anytown, USA</p>
                        <p className="text-sm text-muted-foreground">(123) 456-7890</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">{type === "estimation" ? "ESTIMATION" : "WORK ORDER"}</h2>
                        <p className="text-lg font-semibold">{id}</p>
                        <p className="text-sm text-muted-foreground">Date: {formatDate(createdAt)}</p>
                        <p className="text-sm text-muted-foreground">
                            Status: {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Customer Information</h3>
                            <p>
                                <strong>Name:</strong> {customer.name}
                            </p>
                            <p>
                                <strong>Phone:</strong> {customer.phone}
                            </p>
                            <p>
                                <strong>Email:</strong> {customer.email}
                            </p>
                            <p>
                                <strong>Address:</strong> {customer.address}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Vehicle Information</h3>
                            <p>
                                <strong>Vehicle:</strong> {vehicle.make} {vehicle.model} ({vehicle.year})
                            </p>
                            <p>
                                <strong>License Plate:</strong> {vehicle.licensePlate}
                            </p>
                            <p>
                                <strong>Color:</strong> {vehicle.color}
                            </p>
                            <p>
                                <strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} miles
                            </p>
                            {vehicle.vin && (
                                <p>
                                    <strong>VIN:</strong> {vehicle.vin}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Service Information</h3>
                    <p>
                        <strong>Estimated Completion:</strong> {formatDate(estimatedCompletionDate)}
                    </p>

                    <div className="mt-4">
                        <h4 className="font-medium mb-2">Service Types:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            {serviceTypes.map((type, index) => (
                                <li key={index}>
                                    {type.name
                                        .split("_")
                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(" ")}
                                    {type.description && <span className="text-sm text-muted-foreground"> - {type.description}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-medium mb-2">Additional Notes:</h4>
                        <p>{description}</p>
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Parts Required</h3>
                    {parts.length > 0 ? (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border p-2 text-left">Part Name</th>
                                    <th className="border p-2 text-left">Quantity</th>
                                    <th className="border p-2 text-left">Unit Price</th>
                                    <th className="border p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parts.map((part, index) => (
                                    <tr key={index}>
                                        <td className="border p-2">{part.name}</td>
                                        <td className="border p-2">{part.quantity}</td>
                                        <td className="border p-2">${part.price.toFixed(2)}</td>
                                        <td className="border p-2 text-right">${(part.price * part.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold">
                                    <td colSpan={3} className="border p-2 text-right">
                                        Total:
                                    </td>
                                    <td className="border p-2 text-right">
                                        ${parts.reduce((sum, part) => sum + part.price * part.quantity, 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted-foreground">No parts required for this service.</p>
                    )}
                </div>

                <div className="flex justify-center mt-8">
                    <div className="text-center">
                        <img src={getQRCodeUrl(id) || "/placeholder.svg"} alt={`QR Code for ${id}`} className="mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{id}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}


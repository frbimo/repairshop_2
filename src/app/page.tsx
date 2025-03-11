"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "@/components/clock"
import { useAuth } from "@/components/auth-provider"

export default function Home() {
  const { isAdmin } = useAuth()

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Welcome to Stepha Autorepair</h1>
        <Clock />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-2xl">Inventory Management</CardTitle>
            <CardDescription>Manage spare parts inventory and view reports</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-4">
            <p className="text-muted-foreground">
              Track inventory levels, add new purchases, and view detailed reports on your automotive parts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/inventory/purchase/new" className="flex-1">
                <Button className="w-full" variant="default">
                  Add New Purchase
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full" variant="outline">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-2xl">Service Management</CardTitle>
            <CardDescription>Register and manage customer repair services</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-4">
            <p className="text-muted-foreground">
              Register new customers, track vehicle repairs, and manage service requests all in one place.
            </p>
            <Link href="/customer">
              <Button className="w-full" variant="secondary">
                Service Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-2xl">Role Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-4">
              <p className="text-muted-foreground">
                Control access to system features by managing user roles and permissions.
              </p>
              <Link href="/admin/roles">
                <Button className="w-full" variant="default">
                  Manage Roles
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


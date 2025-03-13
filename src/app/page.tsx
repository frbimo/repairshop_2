"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "@/components/clock"
import { useAuth } from "@/components/auth-provider"
import { PageContainer } from "@/components/page-container"
import { Car, Wrench, BarChart3, Package2, Users, ArrowRight } from "lucide-react"

// Define the hasPermission function
// const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
//   return userPermissions?.includes(requiredPermission);
// }

export default function Home() {
  const { hasPermission } = useAuth()

  return (
    <PageContainer>
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <div className="flex flex-col gap-6 py-10 md:py-16">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Stepha Autorepair</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional automotive repair and inventory management system for your business
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {hasPermission("canManageInventory") && (
              <Link href="/dashboard">
                <Button size="lg">
                  View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            {/* {hasPermission(userPermissions, "canManageService") && (
              <Link href="/services">
                <Button size="lg" variant="outline">
                  Service Management <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )} */}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Service Management</CardTitle>
              </div>
              <CardDescription>Register and manage customer repair services</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-4">
              <p className="text-muted-foreground">
                Register new customers, track vehicle repairs, and manage service requests all in one place.
              </p>
              {/* {hasPermission(userPermissions, "canManageService") && (
                <Link href="/services">
                  <Button className="w-full" variant="secondary">
                    Service Dashboard
                  </Button>
                </Link>
              )} */}
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Inventory Management</CardTitle>
              </div>
              <CardDescription>Manage spare parts inventory and view reports</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-4">
              <p className="text-muted-foreground">
                Track inventory levels, add new purchases, and view detailed reports on your automotive parts.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {hasPermission("canCreatePurchase") && (
                  <Link href="/purchase/new" className="flex-1">
                    <Button className="w-full" variant="default">
                      Add New Purchase
                    </Button>
                  </Link>
                )}
                {hasPermission("canViewDashboard") && (
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full" variant="outline">
                      View Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Analytics</CardTitle>
              </div>
              <CardDescription>View detailed analytics and reports</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-4">
              <p className="text-muted-foreground">
                Access comprehensive analytics on inventory, sales, and service performance.
              </p>
              {hasPermission("canViewAnalytics") && (
                <Link href="/analytics">
                  <Button className="w-full" variant="default">
                    View Analytics
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div className="py-8">
          <Card>
            <CardHeader>
              <CardTitle>About Stepha Autorepair</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p>
                Stepha Autorepair is a leading automotive repair shop with over 15 years of experience in the industry.
                We specialize in providing high-quality repair services for all types of vehicles, from routine
                maintenance to complex repairs.
              </p>
              <p>
                Our team of certified technicians is committed to delivering exceptional service and ensuring that your
                vehicle is in top condition. We use state-of-the-art equipment and genuine parts to guarantee the best
                results for your vehicle.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Wrench className="h-8 w-8 text-primary mb-2" />
                  <h3 className="text-lg font-medium">Expert Repairs</h3>
                  <p className="text-sm text-center text-muted-foreground">
                    Certified technicians with years of experience
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Package2 className="h-8 w-8 text-primary mb-2" />
                  <h3 className="text-lg font-medium">Quality Parts</h3>
                  <p className="text-sm text-center text-muted-foreground">
                    We use only genuine and high-quality parts
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <h3 className="text-lg font-medium">Customer Satisfaction</h3>
                  <p className="text-sm text-center text-muted-foreground">
                    Our priority is your satisfaction and safety
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t pt-8 mt-8">
          <p className="text-sm text-muted-foreground">© 2023 Stepha Autorepair. All rights reserved.</p>
          <Clock />
        </div>
      </div>
    </PageContainer>
  )
}


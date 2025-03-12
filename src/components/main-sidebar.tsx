"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { LogOut, Home, Car, UserCog, LayoutDashboard, ChevronDown, BarChart, ShoppingCart } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Clock } from "@/components/clock"
import { hasPermission } from "@/lib/role-definitions"

export function MainSidebar() {
    const pathname = usePathname()
    const { user, isAdmin, logout } = useAuth()
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

    const toggleSubmenu = (id: string) => {
        setOpenSubmenu(openSubmenu === id ? null : id)
    }

    const isInventoryActive =
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/inventory/search" ||
        pathname === "/inventory/purchase/new"


    const canViewAnalytics = user && hasPermission(user.role, "view_analytics")
    const canManageInventory = user && hasPermission(user.role, "manage_inventory")
    const canManageCustomers = user && hasPermission(user.role, "manage_customers")
    const canManageUsers = user && hasPermission(user.role, "manage_users")

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex flex-col items-center gap-2 px-4 py-2">
                    <div className="bg-primary rounded-md p-1 w-8 h-8 flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">SA</span>
                    </div>
                    <div className="font-semibold text-lg">Stepha Autorepair</div>
                    <Clock />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/"}>
                                    <Link href="/">
                                        <Home className="h-4 w-4 mr-2" />
                                        <span>Home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/services" || pathname.startsWith("/services/")}>
                                    <Link href="/services">
                                        <Car className="h-4 w-4 mr-2" />
                                        <span>Service Management</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem> */}

                            {/* <SidebarMenuItem className="group/collapsible"> */}
                            {/* <SidebarMenuButton isActive={isInventoryActive} onClick={() => toggleSubmenu("inventory")}>
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    <span>Inventory</span>
                                    <ChevronDown
                                        className={`ml-auto h-4 w-4 transition-transform ${openSubmenu === "inventory" ? "rotate-180" : ""}`}
                                    />
                                </SidebarMenuButton> */}

                            {/* {openSubmenu === "inventory" && (
                                    <SidebarMenuSub> */}
                            {/* <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={pathname === "/dashboard" || pathname.startsWith("/dashboard/")}
                                            >
                                                <Link href="/dashboard">Dashboard</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild isActive={pathname === "/inventory/search"}>
                                                <Link href="/inventory/search">Management</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem> */}
                            {/* <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild isActive={pathname === "/purchase/new"}>
                                                <Link href="/purchase/new">New Purchase</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem> */}
                            {/* </SidebarMenuSub>
                                )} */}
                            {/* </SidebarMenuItem> */}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Service</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/services/register/")}>
                                    <Link href="/services/register/customer">
                                        <Car className="h-4 w-4 mr-2" />
                                        <span>Registrasi Baru</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/services/estimations/")}>
                                    <Link href="/services/estimations">
                                        <Car className="h-4 w-4 mr-2" />
                                        <span>Estimasi</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/services/workorders/")}>
                                    <Link href="/services/workorders">
                                        <Car className="h-4 w-4 mr-2" />
                                        <span>Work Order</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/services/invoices/")}>
                                    <Link href="/services/invoices">
                                        <Car className="h-4 w-4 mr-2" />
                                        <span>Invoice</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Inventori Suku Cadang</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/inventory/purchase")}>
                                    <Link href="/inventory/purchase/new">
                                        <UserCog className="h-4 w-4 mr-2" />
                                        <span>Daftar Suku Cadang Baru</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/inventory/search")}>
                                    <Link href="/inventory/search">
                                        <UserCog className="h-4 w-4 mr-2" />
                                        <span>Pencarian Suku Cadang</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard")}>
                                    <Link href="/dashboard">
                                        <UserCog className="h-4 w-4 mr-2" />
                                        <span>Laporan Aging Stock</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {isAdmin && (

                    <SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Analytics</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={pathname.startsWith("/analytics")}>
                                            <Link href="/analytics">
                                                <Car className="h-4 w-4 mr-2" />
                                                <span>Analisa</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarGroupLabel>Organisasi</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>

                                    <SidebarMenuButton asChild isActive={pathname === "/admin/roles"}>
                                        <Link href="/admin/roles">
                                            <Car className="h-4 w-4 mr-2" />
                                            <span>Role Management</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                {user && (
                    <div className="p-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.role}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={logout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}


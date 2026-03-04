"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Cog, Building2, MapPin, FolderOpen, Layers, Users, ArrowRight, Tag } from "lucide-react"
import Link from "next/link"

const SETUP_ITEMS = [
  {
    title: "Company Info",
    description: "Store company profile details (name, contact, address, currency, timezone)",
    href: "/setup/company-info",
    icon: Building2,
    color: "blue",
    bgLight: "bg-blue-100",
    bgDark: "dark:bg-blue-900",
    bgHoverLight: "group-hover:bg-blue-200",
    bgHoverDark: "dark:group-hover:bg-blue-800",
    textColor: "text-blue-600 dark:text-blue-400",
    shadowColor: "hover:shadow-blue-500/20",
    btnHover: "group-hover:bg-blue-600",
    descHover: "group-hover:text-blue-500 dark:group-hover:text-blue-400",
    titleHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
  },
  {
    title: "Sites",
    description: "Define main company physical sites and branches where assets are located",
    href: "/setup/sites",
    icon: MapPin,
    color: "green",
    bgLight: "bg-green-100",
    bgDark: "dark:bg-green-900",
    bgHoverLight: "group-hover:bg-green-200",
    bgHoverDark: "dark:group-hover:bg-green-800",
    textColor: "text-green-600 dark:text-green-400",
    shadowColor: "hover:shadow-green-500/20",
    btnHover: "group-hover:bg-green-600",
    descHover: "group-hover:text-green-500 dark:group-hover:text-green-400",
    titleHover: "group-hover:text-green-600 dark:group-hover:text-green-400",
  },
  {
    title: "Locations",
    description: "Define specific areas within sites such as floors, rooms, and storage areas",
    href: "/setup/locations",
    icon: FolderOpen,
    color: "purple",
    bgLight: "bg-purple-100",
    bgDark: "dark:bg-purple-900",
    bgHoverLight: "group-hover:bg-purple-200",
    bgHoverDark: "dark:group-hover:bg-purple-800",
    textColor: "text-purple-600 dark:text-purple-400",
    shadowColor: "hover:shadow-purple-500/20",
    btnHover: "group-hover:bg-purple-600",
    descHover: "group-hover:text-purple-500 dark:group-hover:text-purple-400",
    titleHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
  },
  {
    title: "Categories",
    description: "Group assets into main categories (IT equipment, furniture, vehicles, etc.)",
    href: "/setup/categories",
    icon: Layers,
    color: "orange",
    bgLight: "bg-orange-100",
    bgDark: "dark:bg-orange-900",
    bgHoverLight: "group-hover:bg-orange-200",
    bgHoverDark: "dark:group-hover:bg-orange-800",
    textColor: "text-orange-600 dark:text-orange-400",
    shadowColor: "hover:shadow-orange-500/20",
    btnHover: "group-hover:bg-orange-600",
    descHover: "group-hover:text-orange-500 dark:group-hover:text-orange-400",
    titleHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
  },
  {
    title: "Sub-categories",
    description: "Define more granular classifications for each main asset category",
    href: "/setup/sub-categories",
    icon: Tag,
    color: "pink",
    bgLight: "bg-pink-100",
    bgDark: "dark:bg-pink-900",
    bgHoverLight: "group-hover:bg-pink-200",
    bgHoverDark: "dark:group-hover:bg-pink-800",
    textColor: "text-pink-600 dark:text-pink-400",
    shadowColor: "hover:shadow-pink-500/20",
    btnHover: "group-hover:bg-pink-600",
    descHover: "group-hover:text-pink-500 dark:group-hover:text-pink-400",
    titleHover: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
  },
  {
    title: "Departments",
    description: "Organize assets by company department or business unit",
    href: "/setup/departments",
    icon: Users,
    color: "teal",
    bgLight: "bg-teal-100",
    bgDark: "dark:bg-teal-900",
    bgHoverLight: "group-hover:bg-teal-200",
    bgHoverDark: "dark:group-hover:bg-teal-800",
    textColor: "text-teal-600 dark:text-teal-400",
    shadowColor: "hover:shadow-teal-500/20",
    btnHover: "group-hover:bg-teal-600",
    descHover: "group-hover:text-teal-500 dark:group-hover:text-teal-400",
    titleHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
  },
]

export default function SetupPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Cog className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Setup</h1>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 sm:p-6 md:p-8 pt-0">
          <div className="flex flex-col gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Setup</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Setup</h1>
                <p className="text-muted-foreground">
                  Configuration and customization settings for your asset management system
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SETUP_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.href} className={`group hover:shadow-lg ${item.shadowColor} hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer`}>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${item.bgLight} ${item.bgDark} mr-3 ${item.bgHoverLight} ${item.bgHoverDark} group-hover:scale-110 transition-all duration-300`}>
                        <Icon className={`h-5 w-5 ${item.textColor} transition-colors duration-300`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className={`text-sm font-medium ${item.titleHover} transition-colors duration-300`}>{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-xs text-muted-foreground ${item.descHover} transition-colors duration-300 mb-4`}>
                        {item.description}
                      </p>
                      <Button asChild className={`w-full ${item.btnHover} group-hover:text-white transition-colors duration-300`}>
                        <Link href={item.href}>
                          Configure
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}

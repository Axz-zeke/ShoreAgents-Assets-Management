"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ArrowRight, Database, Layers, Users, UserCheck, Wrench, Shield, FileText } from "lucide-react"
import Link from "next/link"

export default function DatabasesPage() {
  const databaseTables = [
    {
      id: "assets-table",
      title: "Assets Table",
      description: "Configure asset database fields and customize your asset management",
      url: "/setup/databases/assets-table",
      icon: Layers,
    },
    {
      id: "persons-employees",
      title: "Persons/Employees",
      description: "Manage employee and personnel database configuration",
      url: "/setup/databases/persons-employees",
      icon: Users,
    },
    {
      id: "customers-table",
      title: "Customers Table",
      description: "Configure customer database fields and settings",
      url: "/setup/databases/customers-table",
      icon: UserCheck,
    },
    {
      id: "maintenance-table",
      title: "Maintenance Table",
      description: "Set up maintenance tracking and scheduling fields",
      url: "/setup/databases/maintenance-table",
      icon: Wrench,
    },
    {
      id: "warranties-table",
      title: "Warranties Table",
      description: "Configure warranty tracking and management fields",
      url: "/setup/databases/warranties-table",
      icon: Shield,
    },
    {
      id: "contract-table",
      title: "Contract Table",
      description: "Set up contract management and tracking fields",
      url: "/setup/databases/contract-table",
      icon: FileText,
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Databases</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-8 pt-0">
          <div className="flex flex-col gap-6">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild ><Link href="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild ><Link href="/setup">Setup</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Databases</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Databases</h1>
                <p className="text-muted-foreground">
                  Configure database tables and customize field settings for your asset management system
                </p>
              </div>
            </div>

            {/* Database Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {databaseTables.map((table) => (
                <Link key={table.id} href={table.url}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] border-2 hover:border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <table.icon className="h-6 w-6 text-primary" />
                        {table.title}
                      </CardTitle>
                      <CardDescription>
                        {table.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Configure fields and settings
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Configuration
                </CardTitle>
                <CardDescription>
                  Customize your database tables to match your specific asset management needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Standard Fields</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure which standard fields to include in each table and set their requirements.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Custom Fields</h4>
                      <p className="text-sm text-muted-foreground">
                        Add custom fields to extend the functionality of your database tables.
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Note:</strong> Changes to database configurations will affect how data is collected and managed throughout the system. 
                      Make sure to test your configurations before deploying to production.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}





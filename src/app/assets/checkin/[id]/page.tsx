"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useSystemSettings } from "@/contexts/system-settings-context"
import { getAssetById, getAllAssets } from "@/lib/centralized-assets"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ArrowLeft, UserMinus, AlertTriangle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

// Mock asset data (in a real app, this would come from an API)
const mockAssets = [
  {
    id: "AST-001",
    name: "MacBook Pro 16\"",
    category: "IT Equipment",
    location: "New York Office - Floor 2",
    status: "In Use",
    value: 2999.99,
    assignedTo: "John Smith",
    serialNumber: "MBP123456",
    manufacturer: "Apple",
    checkedOutDate: "2024-01-15",
    checkedOutBy: "Admin User",
    purpose: "Work from home",
    department: "IT Department",
  },
  {
    id: "AST-005",
    name: "iPhone 14 Pro",
    category: "IT Equipment",
    location: "Remote - Employee Home",
    status: "In Use",
    value: 999.99,
    assignedTo: "Sarah Johnson",
    serialNumber: "IP789012",
    manufacturer: "Apple",
    checkedOutDate: "2024-02-01",
    checkedOutBy: "Admin User",
    purpose: "Business travel",
    department: "Marketing",
  },
]

// Form validation schema
const checkinFormSchema = z.object({
  condition: z.string().min(1, "Please select the asset condition"),
  location: z.string().min(1, "Please select where to store the asset"),
  notes: z.string().optional(),
})

type CheckinFormValues = z.infer<typeof checkinFormSchema>

// Sample data for dropdowns
const conditions = [
  "Excellent - Like new condition",
  "Good - Minor wear and tear",
  "Fair - Noticeable wear but functional",
  "Poor - Significant damage or issues",
  "Damaged - Requires repair"
]

const locations = [
  "New York Office - Floor 1",
  "New York Office - Floor 2", 
  "New York Office - Floor 3",
  "New York Office - IT Room",
  "New York Office - Storage Room",
  "Chicago Office - Main Floor",
  "Chicago Office - IT Room",
  "Chicago Office - Storage",
  "Warehouse - Section A",
  "Warehouse - Section B"
]

export default function CheckInAssetPage() {
  const { formatDate, formatCurrency } = useSystemSettings()
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Find the asset by ID (in a real app, this would be an API call)
  const asset = mockAssets.find(a => a.id === assetId)

  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinFormSchema),
    defaultValues: {
      condition: "",
      location: "",
      notes: "",
    },
  })

  const onSubmit = async (data: CheckinFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Checkin data:", { assetId, ...data })
      
      // Show success toast notification
      toast.success("Asset checked in successfully!", {
        description: `${asset?.name} has been returned to inventory.`,
        duration: 4000,
      })
      
      // Redirect back to assets list
      router.push("/assets")
    } catch (error) {
      console.error("Error checking in asset:", error)
      toast.error("Failed to check in asset", {
        description: "Please try again or contact support if the issue persists.",
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!asset) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Asset Not Found</h1>
            <p className="text-muted-foreground mb-4">The asset you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push("/assets")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (asset.status !== "In Use") {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Asset Not Checked Out</h1>
            <p className="text-muted-foreground mb-4">
              This asset is currently {asset.status.toLowerCase()} and doesn&apos;t need to be checked in.
            </p>
            <Button onClick={() => router.push("/assets")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    ShoreAgents Assets
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/assets">
                    Assets
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Check In</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.back()}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Check In Asset</h1>
              </div>
              <p className="text-muted-foreground">
                Return this asset back to inventory
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Asset Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Asset Information
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    {asset.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Details of the asset being checked in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Asset ID:</span>
                    <span>{asset.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{asset.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span>{asset.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Current Location:</span>
                    <span className="text-sm">{asset.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Value:</span>
                    <span>{formatCurrency(asset.value)}</span>
                  </div>
                  {asset.serialNumber && (
                    <div className="flex justify-between">
                      <span className="font-medium">Serial Number:</span>
                      <span className="text-sm">{asset.serialNumber}</span>
                    </div>
                  )}
                  {asset.assignedTo && (
                    <div className="flex justify-between">
                      <span className="font-medium">Assigned To:</span>
                      <span>{asset.assignedTo}</span>
                    </div>
                  )}
                  {asset.department && (
                    <div className="flex justify-between">
                      <span className="font-medium">Department:</span>
                      <span>{asset.department}</span>
                    </div>
                  )}
                  {asset.checkedOutDate && (
                    <div className="flex justify-between">
                      <span className="font-medium">Checked Out:</span>
                      <span>{formatDate(asset.checkedOutDate)}</span>
                    </div>
                  )}
                  {asset.purpose && (
                    <div className="flex justify-between">
                      <span className="font-medium">Purpose:</span>
                      <span>{asset.purpose}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Checkin Form */}
            <Card>
              <CardHeader>
                <CardTitle>Return Information</CardTitle>
                <CardDescription>
                  Fill in the return details below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Condition *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditions.map(condition => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Current condition of the asset being returned
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Location *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map(location => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Where the asset will be stored after check-in
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any issues, damages, or observations about the returned asset..."
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Document any issues, damages, or special conditions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          "Checking In..."
                        ) : (
                          <>
                            <UserMinus className="mr-2 h-4 w-4" />
                            Check In Asset
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

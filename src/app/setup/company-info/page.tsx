"use client"
import Link from "next/link"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Folder, Save, Building2, Upload, Image as ImageIcon, Settings, Globe, DollarSign } from "lucide-react"
import { toast } from "sonner"

export default function CompanyInfoPage() {
  const [companyData, setCompanyData] = useState({
    company: "ShoreAgents Assets Inc.",
    organizationType: "",
    country: "United States",
    address: "123 Business Street",
    aptSuite: "",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    timezone: "America/New_York",
    currency: "USD",
    logo: null as File | null,
    logoPreview: null as string | null,
    logoUrl: null as string | null,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  // Fetch company info on mount
  useEffect(() => {
    fetchCompanyInfo()
  }, [])

  const fetchCompanyInfo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/company-info')
      if (response.ok) {
        const data = await response.json()
        setCompanyData({
          company: data.company || "ShoreAgents Assets Inc.",
          organizationType: data.organizationType || "",
          country: data.country || "United States",
          address: data.address || "123 Business Street",
          aptSuite: data.aptSuite || "",
          city: data.city || "New York",
          state: data.state || "NY",
          postalCode: data.postalCode || "10001",
          timezone: data.timezone || "America/New_York",
          currency: data.currency || "USD",
          logo: null,
          logoPreview: data.logoUrl || null,
          logoUrl: data.logoUrl || null,
        })
      }
    } catch (error) {
      console.error('Error fetching company info:', error)
      toast.error("Failed to load company information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const response = await fetch('/api/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: companyData.company,
          organizationType: companyData.organizationType,
          country: companyData.country,
          address: companyData.address,
          aptSuite: companyData.aptSuite,
          city: companyData.city,
          state: companyData.state,
          postalCode: companyData.postalCode,
          timezone: companyData.timezone,
          currency: companyData.currency,
          logoUrl: companyData.logoUrl,
        }),
      })

      if (response.ok) {
        toast.success("Company information saved successfully!")
        setIsEditing(false)
        await fetchCompanyInfo()

        // Trigger sidebar refresh by dispatching custom event
        window.dispatchEvent(new CustomEvent('companyInfoUpdated'))
      } else {
        toast.error("Failed to save company information")
      }
    } catch (error) {
      console.error('Error saving company info:', error)
      toast.error("Failed to save company information")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    try {
      setIsUploadingLogo(true)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompanyData(prev => ({
          ...prev,
          logoPreview: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/company-info/logo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setCompanyData(prev => ({
          ...prev,
          logo: file,
          logoUrl: data.url,
        }))
        toast.success("Logo uploaded successfully!")
      } else {
        toast.error("Failed to upload logo")
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error("Failed to upload logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const removeLogo = async () => {
    try {
      setCompanyData(prev => ({
        ...prev,
        logo: null,
        logoPreview: null,
        logoUrl: null,
      }))
      toast.success("Logo removed successfully!")
    } catch (error) {
      console.error('Error removing logo:', error)
      toast.error("Failed to remove logo")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Dropdown options
  const organizationTypes = [
    "Corporation",
    "LLC",
    "Partnership",
    "Sole Proprietorship",
    "Non-Profit",
    "Government Agency",
    "Educational Institution",
    "Healthcare Organization",
    "Religious Organization",
    "Other"
  ]

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "India",
    "Brazil",
    "Mexico",
    "Philippines",
    "Singapore",
    "South Korea",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Switzerland",
    "Italy",
    "Spain",
    "Other"
  ]

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Phoenix",
    "America/Anchorage",
    "America/Honolulu",
    "America/Toronto",
    "America/Vancouver",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "America/Buenos_Aires",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Amsterdam",
    "Europe/Brussels",
    "Europe/Vienna",
    "Europe/Stockholm",
    "Europe/Oslo",
    "Europe/Copenhagen",
    "Europe/Helsinki",
    "Europe/Warsaw",
    "Europe/Prague",
    "Europe/Athens",
    "Europe/Istanbul",
    "Europe/Moscow",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Singapore",
    "Asia/Seoul",
    "Asia/Bangkok",
    "Asia/Jakarta",
    "Asia/Manila",
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Riyadh",
    "Asia/Tel_Aviv",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Australia/Brisbane",
    "Australia/Perth",
    "Pacific/Auckland",
    "Pacific/Fiji",
    "Pacific/Honolulu",
    "Africa/Cairo",
    "Africa/Johannesburg",
    "Africa/Lagos",
    "Africa/Nairobi"
  ]

  const currencies = [
    "USD", // US Dollar
    "EUR", // Euro
    "GBP", // British Pound
    "JPY", // Japanese Yen
    "CHF", // Swiss Franc
    "CAD", // Canadian Dollar
    "AUD", // Australian Dollar
    "NZD", // New Zealand Dollar
    "CNY", // Chinese Yuan
    "INR", // Indian Rupee
    "KRW", // South Korean Won
    "SGD", // Singapore Dollar
    "HKD", // Hong Kong Dollar
    "MXN", // Mexican Peso
    "BRL", // Brazilian Real
    "ZAR", // South African Rand
    "RUB", // Russian Ruble
    "TRY", // Turkish Lira
    "SEK", // Swedish Krona
    "NOK", // Norwegian Krone
    "DKK", // Danish Krone
    "PLN", // Polish Zloty
    "THB", // Thai Baht
    "IDR", // Indonesian Rupiah
    "MYR", // Malaysian Ringgit
    "PHP", // Philippine Peso
    "AED", // UAE Dirham
    "SAR", // Saudi Riyal
    "ILS", // Israeli Shekel
    "EGP"  // Egyptian Pound
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Company Info.</h1>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 sm:p-6 md:p-8 pt-0">
          <div className="flex flex-col gap-4">
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
                  <BreadcrumbPage>Company Info.</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Company Information</h1>
                <p className="text-muted-foreground">
                  Manage your company profile details and system settings
                </p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="flex items-center gap-2"
                      disabled={isSaving || isLoading}
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Edit Company Info"}
                  </Button>
                )}
              </div>
            </div>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Basic company details and address information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Company Information Section */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-foreground">Company Details</h3>
                    <p className="text-sm text-muted-foreground">Basic company information</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Company */}
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={companyData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter company name"
                      />
                    </div>

                    {/* Organization Type */}
                    <div className="space-y-2">
                      <Label htmlFor="organizationType">Organization Type *</Label>
                      <Select
                        value={companyData.organizationType}
                        onValueChange={(value) => handleInputChange('organizationType', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger id="organizationType">
                          <SelectValue placeholder="Select Organization Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizationTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={companyData.country}
                        onValueChange={(value) => handleInputChange('country', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-foreground">Address Information</h3>
                    <p className="text-sm text-muted-foreground">Company location and address details</p>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={companyData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter street address"
                    />
                  </div>

                  {/* Apt./Suite */}
                  <div className="space-y-2">
                    <Label htmlFor="aptSuite">Apt./Suite</Label>
                    <Input
                      id="aptSuite"
                      value={companyData.aptSuite}
                      onChange={(e) => handleInputChange('aptSuite', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter apartment or suite number"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* City */}
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={companyData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter city"
                      />
                    </div>

                    {/* State */}
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={companyData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter state or province"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={companyData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure timezone and currency settings for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Timezone
                    </Label>
                    <Select
                      value={companyData.timezone}
                      onValueChange={(value) => handleInputChange('timezone', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(timezone => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Set the default timezone for your organization
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Currency
                    </Label>
                    <Select
                      value={companyData.currency}
                      onValueChange={(value) => handleInputChange('currency', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Set the default currency for financial calculations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Company Logo
                </CardTitle>
                <CardDescription>
                  Upload your company logo for branding and identification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  {/* Logo Preview */}
                  <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden bg-muted/20">
                    {companyData.logoPreview ? (
                      <img
                        src={companyData.logoPreview}
                        alt="Company logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No logo</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={!isEditing}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={!isEditing || isUploadingLogo}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploadingLogo ? 'Uploading...' : companyData.logoUrl ? 'Change Logo' : 'Upload Logo'}
                      </Button>

                      {(companyData.logoUrl || companyData.logoPreview) && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={removeLogo}
                          disabled={!isEditing || isUploadingLogo}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Upload a company logo (PNG, JPG, GIF - Max 5MB)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 200x200px or larger. Square aspect ratio works best.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}


"use client"
import Link from "next/link"

import { useState, useEffect, useRef } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { ArrowRight, Plus, Trash2, Save, X, Database, Download, Upload } from "lucide-react"
import { toast } from "sonner"
import AssetFieldManager, { AnyAssetField, StandardAssetField, CustomAssetField } from "@/lib/asset-field-manager"

export default function AssetsTablePage() {
  const [fields, setFields] = useState<AnyAssetField[]>([])
  const [isAddingCustomField, setIsAddingCustomField] = useState(false)
  const [newCustomField, setNewCustomField] = useState<Partial<CustomAssetField>>({
    name: "",
    label: "",
    type: "text",
    dataType: "Text",
    required: false,
    included: true,
    categories: ["All Categories"]
  })
  const standardFieldsRef = useRef<HTMLDivElement>(null)
  const customFieldsRef = useRef<HTMLDivElement>(null)

  const fieldManager = AssetFieldManager.getInstance()

  useEffect(() => {
    // Load initial fields
    setFields(fieldManager.getFields())

    // Subscribe to field changes
    const unsubscribe = fieldManager.subscribe((updatedFields) => {
      setFields(updatedFields)
    })

    return unsubscribe
  }, [fieldManager])



  const handleFieldToggle = (fieldId: string) => {
    fieldManager.toggleFieldInclusion(fieldId)
    toast.success("Field configuration updated!")
  }

  const handleFieldRequirement = (fieldId: string, isRequired: boolean) => {
    fieldManager.updateField(fieldId, { required: isRequired })
    toast.success("Field requirement updated!")
  }

  const handleAddCustomField = () => {
    if (!newCustomField.label) {
      toast.error("Please fill in all required fields")
      return
    }

    const customField: Omit<CustomAssetField, 'id'> = {
      name: newCustomField.label!.toLowerCase().replace(/\s+/g, '-'), // Convert label to name
      label: newCustomField.label!,
      type: newCustomField.type || "text",
      dataType: newCustomField.dataType || "Text",
      required: newCustomField.required || false,
      included: newCustomField.included || true,
      categories: newCustomField.categories || ["All Categories"],
      description: newCustomField.description,
      placeholder: newCustomField.placeholder,
      isStandard: false
    }

    fieldManager.addCustomField(customField)
    setNewCustomField({
      name: "",
      label: "",
      type: "text",
      dataType: "Text",
      required: false,
      included: true,
      categories: ["All Categories"]
    })
    setIsAddingCustomField(false)
    toast.success("Custom field added successfully!")
  }

  const handleDeleteCustomField = (fieldId: string) => {
    fieldManager.removeCustomField(fieldId)
    toast.success("Custom field deleted successfully!")
  }

  const handleCancel = () => {
    setIsAddingCustomField(false)
    setNewCustomField({
      name: "",
      label: "",
      type: "text",
      dataType: "Text",
      required: false,
      included: true,
      categories: ["All Categories"]
    })
  }

  const handleExportConfiguration = () => {
    const config = fieldManager.exportConfiguration()
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asset-fields-config.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Configuration exported successfully!")
  }

  const handleImportConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (fieldManager.importConfiguration(content)) {
        toast.success("Configuration imported successfully!")
      } else {
        toast.error("Invalid configuration file!")
      }
    }
    reader.readAsText(file)
  }

  const handleResetToDefault = () => {
    fieldManager.resetToDefault()
    toast.success("Configuration reset to default!")
  }

  const handleResetToIncludeImportedData = () => {
    fieldManager.resetToIncludeImportedData()
    toast.success("Configuration updated to include imported data!")
  }

  // Separate standard and custom fields
  const standardFields = fields.filter(field => field.isStandard) as StandardAssetField[]
  const customFields = fields.filter(field => !field.isStandard) as CustomAssetField[]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Database Assets</h1>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 sm:p-6 md:p-8 pt-0">
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
                  <BreadcrumbLink asChild ><Link href="/setup/databases">Databases</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Assets Table</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Database Assets</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Configure asset database fields from imported data and customize your asset management
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleExportConfiguration} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Config
                </Button>
                <label className="cursor-pointer">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Config
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportConfiguration}
                    className="hidden"
                  />
                </label>
                <Button variant="outline" onClick={handleResetToIncludeImportedData} className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Include Imported Data
                </Button>
                <Button variant="outline" onClick={handleResetToDefault} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Reset Default
                </Button>
              </div>
            </div>


            {/* Asset Database Fields */}
            <Card ref={standardFieldsRef}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Asset Database Fields ({standardFields.length})
                  {standardFields.length === 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (Click &quot;Include Imported Data&quot; to load fields)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Standard fields from imported data that can be customized. Asset Tag ID and Asset Description are required fields. Check the boxes next to the field names you want to include.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] w-full">
                  <div className="p-4">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table className="w-full">
                        <TableHeader className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                          <TableRow>
                            <TableHead className="w-8 bg-slate-100 dark:bg-slate-800 font-semibold"> </TableHead>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Field name</TableHead>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Data Required</TableHead>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Description</TableHead>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Example</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {standardFields.map((field) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Checkbox
                                  checked={field.included}
                                  onCheckedChange={() => handleFieldToggle(field.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{field.label}</TableCell>
                              <TableCell>
                                <RadioGroup
                                  value={field.required ? "required" : "optional"}
                                  onValueChange={(value) => handleFieldRequirement(field.id, value === "required")}
                                  className="flex items-center gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="required" id={`required-${field.id}`} />
                                    <Label htmlFor={`required-${field.id}`} className="text-sm">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="optional" id={`optional-${field.id}`} />
                                    <Label htmlFor={`optional-${field.id}`} className="text-sm">Optional</Label>
                                  </div>
                                </RadioGroup>
                              </TableCell>
                              <TableCell className="break-words whitespace-normal text-sm leading-relaxed">{field.description}</TableCell>
                              <TableCell className="font-mono text-sm break-all">{field.example}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {standardFields.map((field) => (
                        <Card key={field.id} className="p-3">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={field.included}
                                  onCheckedChange={() => handleFieldToggle(field.id)}
                                />
                                <h3 className="font-medium text-sm">{field.label}</h3>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground">Data Required</div>
                              <RadioGroup
                                value={field.required ? "required" : "optional"}
                                onValueChange={(value) => handleFieldRequirement(field.id, value === "required")}
                                className="flex items-center gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="required" id={`mobile-required-${field.id}`} />
                                  <Label htmlFor={`mobile-required-${field.id}`} className="text-sm">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="optional" id={`mobile-optional-${field.id}`} />
                                  <Label htmlFor={`mobile-optional-${field.id}`} className="text-sm">Optional</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground">Description</div>
                              <p className="text-sm leading-relaxed">{field.description}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground">Example</div>
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{field.example}</code>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Asset Custom Fields */}
            <Card ref={customFieldsRef}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Asset Custom Fields ({customFields.length})
                  {customFields.length === 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (Click &quot;Include Imported Data&quot; to load fields)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Additional fields from imported data and custom fields you can add. These fields extend the standard asset database.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  {/* Add Custom Field Button */}
                  <div className="flex justify-start">
                    <Button
                      onClick={() => setIsAddingCustomField(true)}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Custom Field</span>
                      <span className="sm:hidden">Add Field</span>
                    </Button>
                  </div>

                  {/* Add Custom Field Form */}
                  {isAddingCustomField && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Add Custom Field</CardTitle>
                        <CardDescription>
                          Define a new custom field for your assets
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="custom-field-label" className="text-sm font-medium">
                            Custom Field Label *
                          </Label>
                          <Input
                            id="custom-field-label"
                            value={newCustomField.label || ""}
                            onChange={(e) => setNewCustomField(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Enter custom field label"
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="data-type" className="text-sm font-medium">
                            Data Type *
                          </Label>
                          <Select
                            value={newCustomField.dataType || "Text"}
                            onValueChange={(value) => setNewCustomField(prev => ({ ...prev, dataType: value }))}
                          >
                            <SelectTrigger id="data-type">
                              <SelectValue placeholder="Select Data Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Text">Text</SelectItem>
                              <SelectItem value="Numeric">Numeric</SelectItem>
                              <SelectItem value="Date">Date</SelectItem>
                              <SelectItem value="Dropdown list">Dropdown list</SelectItem>
                              <SelectItem value="Checkbox list">Checkbox list</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Data Required</Label>
                          <RadioGroup
                            value={newCustomField.required ? "Yes" : "Optional"}
                            onValueChange={(value: string) => setNewCustomField(prev => ({ ...prev, required: value === "Yes" }))}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="required-yes" />
                              <Label htmlFor="required-yes" className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Optional" id="required-optional" />
                              <Label htmlFor="required-optional" className="text-sm">Optional</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Selected Categories</Label>
                          <p className="text-sm text-muted-foreground">
                            Is this field visible to assets of selective &apos;Categories&apos;?
                          </p>
                          <RadioGroup
                            value={newCustomField.categories?.[0] || "All Categories"}
                            onValueChange={(value: string) => setNewCustomField(prev => ({ ...prev, categories: [value] }))}
                            className="flex flex-col space-y-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="All Categories" id="categories-all" />
                              <Label htmlFor="categories-all" className="text-sm">All Categories</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Limited Categories" id="categories-limited" />
                              <Label htmlFor="categories-limited" className="text-sm">Limited Categories</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleAddCustomField} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Custom Fields Table */}
                <ScrollArea className="h-[600px] w-full">
                  <div className="p-6">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table className="w-full">
                        <TableHeader className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                          <TableRow>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Field Name</TableHead>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Data Type</TableHead>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Categories</TableHead>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Required</TableHead>
                            <TableHead className="bg-slate-100 dark:bg-slate-800 font-semibold">Delete</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customFields.map((field) => (
                            <TableRow key={field.id}>
                              <TableCell className="font-medium">{field.name}</TableCell>
                              <TableCell>{field.dataType}</TableCell>
                              <TableCell>{Array.isArray(field.categories) ? field.categories.join(', ') : field.categories}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${field.required
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                  }`}>
                                  {field.required ? "Yes" : "Optional"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCustomField(field.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {customFields.map((field) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-sm">{field.name}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCustomField(field.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Data Type</div>
                                <div className="text-sm">{field.dataType}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Required</div>
                                <span className={`px-2 py-1 rounded-full text-xs ${field.required
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                  }`}>
                                  {field.required ? "Yes" : "Optional"}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Categories</div>
                              <div className="text-sm">{Array.isArray(field.categories) ? field.categories.join(', ') : field.categories}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}


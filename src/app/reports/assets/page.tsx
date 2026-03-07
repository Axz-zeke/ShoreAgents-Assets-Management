"use client";
import Link from "next/link"

import { useState } from "react";
import { getAllAssets } from "@/lib/centralized-assets";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  "Available": "bg-emerald-500/10 text-emerald-500 border-none",
  "In Use": "bg-blue-500/10 text-blue-500 border-none",
  "Maintenance": "bg-amber-500/10 text-amber-500 border-none",
  "Disposed": "bg-rose-500/10 text-rose-500 border-none",
  "Reserved": "bg-purple-500/10 text-purple-500 border-none",
  "Move": "bg-orange-500/10 text-orange-500 border-none",
}

interface ReportFilter {
  category: string;
  location: string;
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  costRange: {
    min: string;
    max: string;
  };
  selectedFields: string[];
}

interface AssetData {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  purchaseDate: string;
  cost: number;
  assignedTo: string;
  department: string;
}

const availableFields = [
  { id: "id", label: "Asset ID" },
  { id: "name", label: "Asset Name" },
  { id: "category", label: "Category" },
  { id: "location", label: "Location" },
  { id: "status", label: "Status" },
  { id: "purchaseDate", label: "Purchase Date" },
  { id: "cost", label: "Cost" },
  { id: "assignedTo", label: "Assigned To" },
  { id: "department", label: "Department" },
];

const categories = ["IT Equipment", "Furniture", "Vehicles", "Tools", "Machinery"];
const locations = ["Main Office", "Warehouse", "Branch Office", "Remote"];
const statuses = ["Available", "In Use", "Maintenance", "Disposed", "Reserved", "Move"];

export default function ReportsAssetsPage() {
  const [filters, setFilters] = useState<ReportFilter>({
    category: "",
    location: "",
    status: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    costRange: {
      min: "",
      max: "",
    },
    selectedFields: ["id", "name", "category", "location", "status"],
  });

  const [generatedReport, setGeneratedReport] = useState<AssetData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const mockAssets: AssetData[] = getAllAssets().map(asset => ({
    id: asset.id,
    name: asset.name,
    category: asset.category,
    location: asset.location,
    status: asset.status,
    purchaseDate: asset.purchaseDate,
    cost: asset.value,
    assignedTo: asset.assignedTo || "Unassigned",
    department: asset.department,
  }))

  const handleFieldToggle = (fieldId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldId)
        ? prev.selectedFields.filter(id => id !== fieldId)
        : [...prev.selectedFields, fieldId],
    }));
  };

  const generateReport = () => {
    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      let filteredData = [...mockAssets];

      // Apply filters
      if (filters.category) {
        filteredData = filteredData.filter(asset => asset.category === filters.category);
      }
      if (filters.location) {
        filteredData = filteredData.filter(asset => asset.location === filters.location);
      }
      if (filters.status) {
        filteredData = filteredData.filter(asset => asset.status === filters.status);
      }
      if (filters.costRange.min) {
        filteredData = filteredData.filter(asset => asset.cost >= parseFloat(filters.costRange.min));
      }
      if (filters.costRange.max) {
        filteredData = filteredData.filter(asset => asset.cost <= parseFloat(filters.costRange.max));
      }

      setGeneratedReport(filteredData);
      setIsGenerating(false);
    }, 1000);
  };

  const exportReport = () => {
    const csvContent = [
      filters.selectedFields.join(","),
      ...generatedReport.map(asset =>
        filters.selectedFields.map(field => asset[field as keyof AssetData]).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asset-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
                  <BreadcrumbLink asChild ><Link href="/dashboard">
                    Dashboard
                  </Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild ><Link href="/reports">
                    Reports
                  </Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Asset Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Asset Reports</h1>
                <p className="text-muted-foreground">
                  Generate custom reports with specific filters and data fields
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Filters Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Report Filters
                    </CardTitle>
                    <CardDescription>
                      Customize your report with specific filters and data fields
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Category Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={filters.category || "all"} onValueChange={(value) =>
                        setFilters(prev => ({ ...prev, category: value === "all" ? "" : value }))
                      }>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select value={filters.location || "all"} onValueChange={(value) =>
                        setFilters(prev => ({ ...prev, location: value === "all" ? "" : value }))
                      }>
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={filters.status || "all"} onValueChange={(value) =>
                        setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))
                      }>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cost Range */}
                    <div className="space-y-2">
                      <Label>Cost Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.costRange.min}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            costRange: { ...prev.costRange, min: e.target.value }
                          }))}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.costRange.max}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            costRange: { ...prev.costRange, max: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    {/* Data Fields Selection */}
                    <div className="space-y-2">
                      <Label>Data Fields</Label>
                      <ScrollArea className="max-h-48">
                        <div className="space-y-2 pr-4">
                          {availableFields.map(field => (
                            <div key={field.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={field.id}
                                checked={filters.selectedFields.includes(field.id)}
                                onCheckedChange={() => handleFieldToggle(field.id)}
                              />
                              <Label htmlFor={field.id} className="text-sm">
                                {field.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Generate Report Button */}
                    <Button
                      onClick={generateReport}
                      className="w-full"
                      disabled={isGenerating || filters.selectedFields.length === 0}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Filter className="mr-2 h-4 w-4" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Report Results */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Report Results</CardTitle>
                        <CardDescription>
                          {generatedReport.length} assets found
                        </CardDescription>
                      </div>
                      {generatedReport.length > 0 && (
                        <Button onClick={exportReport} variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {generatedReport.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No report generated yet. Configure filters and click &quot;Generate Report&quot; to see results.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border-t border-border mt-6">
                        <Table>
                          <TableHeader className="sticky top-0 z-30 bg-card">
                            <TableRow className="hover:bg-transparent border-b border-border">
                              {filters.selectedFields.map((fieldId, idx) => {
                                const field = availableFields.find(f => f.id === fieldId);
                                return (
                                  <TableHead
                                    key={fieldId}
                                    className={cn(
                                      "text-muted-foreground font-bold text-xs uppercase tracking-wider",
                                      idx === 0 ? "pl-6" : "",
                                      idx === filters.selectedFields.length - 1 ? "pr-6" : "",
                                      fieldId === "cost" ? "text-right pr-6" : ""
                                    )}
                                  >
                                    {field?.label}
                                  </TableHead>
                                );
                              })}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {generatedReport.map((asset) => (
                              <TableRow key={asset.id} className="hover:bg-muted/30 border-b border-border">
                                {filters.selectedFields.map((fieldId, idx) => (
                                  <TableCell
                                    key={fieldId}
                                    className={cn(
                                      "py-4",
                                      idx === 0 ? "pl-6" : "",
                                      idx === filters.selectedFields.length - 1 ? "pr-6" : "",
                                      fieldId === "cost" ? "text-right pr-6" : ""
                                    )}
                                  >
                                    {fieldId === "cost" ? (
                                      <span className="text-foreground font-mono text-sm">${asset[fieldId as keyof AssetData].toLocaleString()}</span>
                                    ) : fieldId === "status" ? (
                                      <Badge className={cn(
                                        "font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border-none",
                                        statusColors[asset[fieldId] as keyof typeof statusColors] || "bg-muted text-muted-foreground"
                                      )}>
                                        {asset[fieldId]}
                                      </Badge>
                                    ) : fieldId === "id" ? (
                                      <span className="font-mono text-muted-foreground text-sm">{asset[fieldId]}</span>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">{asset[fieldId as keyof AssetData]}</span>
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


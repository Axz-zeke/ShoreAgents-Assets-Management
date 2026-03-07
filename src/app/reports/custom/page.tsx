"use client";
import Link from "next/link"

import { useState } from "react";
import { useSystemSettings } from "@/contexts/system-settings-context";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Search, Download, X } from "lucide-react";

// Static asset data
const assetData = [
  {
    assetTagId: "AST-001",
    description: "Dell Laptop XPS 13",
    brand: "Dell",
    purchaseDate: "2023-01-15",
    cost: 1200,
    status: "Available"
  },
  {
    assetTagId: "AST-002",
    description: "Office Chair Ergonomic",
    brand: "Herman Miller",
    purchaseDate: "2023-02-20",
    cost: 350,
    status: "In Use"
  },
  {
    assetTagId: "AST-004",
    description: "MacBook Pro 16-inch",
    brand: "Apple",
    purchaseDate: "2023-03-05",
    cost: 2500,
    status: "Maintenance"
  },
  {
    assetTagId: "AST-005",
    description: "Standing Desk Adjustable",
    brand: "IKEA",
    purchaseDate: "2023-04-12",
    cost: 450,
    status: "Available"
  },
  {
    assetTagId: "AST-006",
    description: "Printer Laser Multifunction",
    brand: "HP",
    purchaseDate: "2022-09-08",
    cost: 800,
    status: "Disposed"
  },
  {
    assetTagId: "AST-007",
    description: "Monitor 27-inch 4K",
    brand: "LG",
    purchaseDate: "2023-05-18",
    cost: 600,
    status: "Available"
  },
  {
    assetTagId: "AST-008",
    description: "Conference Table 8-person",
    brand: "Steelcase",
    purchaseDate: "2022-12-03",
    cost: 1200,
    status: "Reserved"
  }
];

// Status options for the select dropdown
const statusOptions = [
  "Available",
  "In Use",
  "Maintenance",
  "Disposed",
  "Reserved",
  "Move"
];

// Get unique brands from asset data
const uniqueBrands = [...new Set(assetData.map(asset => asset.brand))];

export default function CustomReportsPage() {
  const { formatCurrency } = useSystemSettings();
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  // Filter assets based on search term and filters
  const filteredAssets = assetData.filter(asset => {
    const matchesSearch = searchTerm === "" ||
      asset.assetTagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || statusFilter === "all" || asset.status === statusFilter;
    const matchesBrand = brandFilter === "" || brandFilter === "all" || asset.brand === brandFilter;

    return matchesSearch && matchesStatus && matchesBrand;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setBrandFilter("");
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
                  <BreadcrumbPage>Custom Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Custom Reports</h1>
                <p className="text-muted-foreground">
                  Build tailored reports with specific filters and data fields
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Asset Report
                      </CardTitle>
                      <CardDescription>
                        Custom asset report with filtering and export options
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Search Bar */}
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search assets by ID, description, or brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div className="sm:w-48">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Brand Filter */}
                      <div className="sm:w-48">
                        <Select value={brandFilter} onValueChange={setBrandFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {uniqueBrands.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Results Count and Clear Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredAssets.length} of {assetData.length} assets
                      </div>
                      {(searchTerm !== "" || statusFilter !== "" || brandFilter !== "") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFilters}
                          className="h-8"
                        >
                          <X className="mr-2 h-3 w-3" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset Tag ID</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Purchase Date</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssets.map((asset) => (
                          <TableRow key={asset.assetTagId}>
                            <TableCell className="font-medium">
                              {asset.assetTagId}
                            </TableCell>
                            <TableCell>{asset.description}</TableCell>
                            <TableCell>{asset.brand}</TableCell>
                            <TableCell>{asset.purchaseDate}</TableCell>
                            <TableCell>{formatCurrency(asset.cost)}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${asset.status === 'Available' ? 'bg-green-100 text-green-800' :
                                asset.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                                  asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                    asset.status === 'Disposed' ? 'bg-red-100 text-red-800' :
                                      asset.status === 'Reserved' ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {asset.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


"use client";
import Link from "next/link"

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, ArrowRightLeft, Clock, Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Static transaction data
const transactionData = [
  {
    id: "TXN-001",
    assetId: "AST-001",
    assetName: "Dell Laptop XPS 13",
    transactionType: "Addition",
    date: "2023-01-15",
    user: "John Smith",
    department: "IT",
    notes: "New laptop purchased for IT department"
  },
  {
    id: "TXN-002",
    assetId: "AST-002",
    assetName: "Office Chair Ergonomic",
    transactionType: "Check Out",
    date: "2023-02-20",
    user: "Jane Doe",
    department: "HR",
    notes: "Assigned to HR manager"
  },
  {
    id: "TXN-004",
    assetId: "AST-004",
    assetName: "MacBook Pro 16-inch",
    transactionType: "Maintenance",
    date: "2023-03-05",
    user: "Tech Support",
    department: "IT",
    notes: "Scheduled maintenance - battery replacement"
  },
  {
    id: "TXN-005",
    assetId: "AST-005",
    assetName: "Standing Desk Adjustable",
    transactionType: "Movement",
    date: "2023-04-12",
    user: "Facilities",
    department: "Operations",
    notes: "Moved from Floor 2 to Floor 3"
  },
  {
    id: "TXN-006",
    assetId: "AST-006",
    assetName: "Printer Laser Multifunction",
    transactionType: "Disposal",
    date: "2022-09-08",
    user: "Asset Manager",
    department: "IT",
    notes: "End of life - recycled"
  },
  {
    id: "TXN-007",
    assetId: "AST-007",
    assetName: "Monitor 27-inch 4K",
    transactionType: "Check In",
    date: "2023-05-18",
    user: "Mike Johnson",
    department: "Engineering",
    notes: "Returned after project completion"
  },
  {
    id: "TXN-008",
    assetId: "AST-008",
    assetName: "Conference Table 8-person",
    transactionType: "Reservation",
    date: "2022-12-03",
    user: "Event Coordinator",
    department: "Marketing",
    notes: "Reserved for quarterly meeting"
  }
];

export default function TransactionReportsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: undefined as Date | undefined,
    to: undefined as Date | undefined,
  });
  const [transactionType, setTransactionType] = useState("");
  const [department, setDepartment] = useState("");

  // Filter transactions based on date range and filters
  const filteredTransactions = transactionData.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!dateRange.from || transactionDate >= dateRange.from) &&
      (!dateRange.to || transactionDate <= dateRange.to);
    const matchesType = !transactionType || transaction.transactionType === transactionType;
    const matchesDepartment = !department || transaction.department === department;

    return matchesDateRange && matchesType && matchesDepartment;
  });

  const handleGenerateReport = () => {
    console.log("Generating report with filters:", { dateRange, transactionType, department });
    setIsDialogOpen(false);
  };

  const handleClearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setTransactionType("");
    setDepartment("");
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
                  <BreadcrumbPage>Transaction Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Transaction Reports</h1>
                <p className="text-muted-foreground">
                  Full record of asset transactions (additions, disposals, movements, check-in/out)
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Generate Transaction Report</DialogTitle>
                    <DialogDescription>
                      Configure filters and date range for your transaction report.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Date Range Picker */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>From Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange.from && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>To Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange.to && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Transaction Type Filter */}
                    <div className="space-y-2">
                      <Label>Transaction Type</Label>
                      <Input
                        placeholder="Addition, Check Out, Maintenance, etc."
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                      />
                    </div>

                    {/* Department Filter */}
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        placeholder="IT, HR, Operations, Engineering, etc."
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                    <Button onClick={handleGenerateReport}>
                      Generate Report
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Transaction History
                      </CardTitle>
                      <CardDescription>
                        Showing {filteredTransactions.length} of {transactionData.length} transactions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {transaction.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{transaction.assetName}</div>
                                <div className="text-sm text-muted-foreground">{transaction.assetId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.transactionType === 'Addition' ? 'bg-green-100 text-green-800' :
                                  transaction.transactionType === 'Check Out' ? 'bg-blue-100 text-blue-800' :
                                    transaction.transactionType === 'Check In' ? 'bg-purple-100 text-purple-800' :
                                      transaction.transactionType === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                        transaction.transactionType === 'Disposal' ? 'bg-red-100 text-red-800' :
                                          transaction.transactionType === 'Movement' ? 'bg-indigo-100 text-indigo-800' :
                                            transaction.transactionType === 'Reservation' ? 'bg-pink-100 text-pink-800' :
                                              'bg-gray-100 text-gray-800'
                                }`}>
                                {transaction.transactionType}
                              </span>
                            </TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{transaction.user}</TableCell>
                            <TableCell>{transaction.department}</TableCell>
                            <TableCell className="max-w-xs truncate">{transaction.notes}</TableCell>
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


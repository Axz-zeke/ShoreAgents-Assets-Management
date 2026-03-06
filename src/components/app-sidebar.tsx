"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Package,
  Users,
  FileText,
  BarChart3,
  Shield,
  Plus,
  UserCheck,
  UserMinus,
  Move,
  Calendar,
  ArrowLeftRight,
  Trash2,
  Wrench,
  ShieldCheck,
  List,
  ClipboardList,
  Building2,
  MapPin,
  FolderOpen,
  Cog,
  Folder,
  MapPin as MapPinIcon,
  ArrowRight,
  Layers,
  Tag,
} from "lucide-react"


import { useSystemSettings } from "@/contexts/system-settings-context"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// ShoreAgents Assets dashboard data - moved outside component to prevent recreation
const data = {
  user: {
    name: "ShoreAgents Assets",
    email: "admin@shoreagents.com",
    avatar: "/avatars/user.jpg",
  },
  company: {
    name: "ShoreAgents Assets",
    plan: "Enterprise",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "Recent Activity",
          url: "/dashboard/activity",
        },
      ],
    },
    {
      title: "Assets",
      url: "/assets",
      icon: Package,
      items: [
        {
          title: "All Assets",
          url: "/assets",
        },
        {
          title: "Add Asset",
          url: "/assets/add",
          icon: Plus,
        },
        {
          title: "Check Out",
          url: "/assets/checkout",
          icon: UserCheck,
        },
        {
          title: "Check In",
          url: "/assets/checkin",
          icon: UserMinus,
        },
        {
          title: "Move Asset",
          url: "/assets/move",
          icon: Move,
        },
        {
          title: "Reserve Asset",
          url: "/assets/reserve",
          icon: Calendar,
        },
        {
          title: "Dispose Asset",
          url: "/assets/dispose",
          icon: Trash2,
        },
        {
          title: "Maintenance",
          url: "/assets/maintenance",
          icon: Wrench,
        },
        {
          title: "Warranties",
          url: "/assets/warranties",
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      items: [
        {
          title: "User Management",
          url: "/admin/users",
        },
        {
          title: "Departments",
          url: "/users/departments",
        },
        {
          title: "Roles",
          url: "/users/roles",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
      items: [
        {
          title: "Overview",
          url: "/reports",
        },
        {
          title: "Automated Reports",
          url: "/reports/automated",
        },
        {
          title: "Custom Reports",
          url: "/reports/custom",
        },
        {
          title: "Asset Reports",
          url: "/reports/assets",
        },
        {
          title: "Audit Reports",
          url: "/reports/audit",
        },
        {
          title: "Check-Out Reports",
          url: "/reports/checkout",
        },
        {
          title: "Depreciation Reports",
          url: "/reports/depreciation",
        },
        {
          title: "Insurance Reports",
          url: "/reports/insurance",
        },
        {
          title: "Maintenance Reports",
          url: "/reports/maintenance",
        },
        {
          title: "Reservation Reports",
          url: "/reports/reservation",
        },
        {
          title: "Status Reports",
          url: "/reports/status",
        },
        {
          title: "Transaction Reports",
          url: "/reports/transaction",
        },
        {
          title: "Other Reports",
          url: "/reports/other",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Security",
          url: "/settings/security",
        },
        {
          title: "Integrations",
          url: "/settings/integrations",
        },
        {
          title: "Backup",
          url: "/settings/backup",
        },
      ],
    },
    {
      title: "Setup",
      url: "/setup",
      icon: Cog,
      items: [
        {
          title: "Company Info.",
          url: "/setup/company-info",
          icon: Folder,
        },
        {
          title: "Sites",
          url: "/setup/sites",
          icon: MapPinIcon,
        },
        {
          title: "Locations",
          url: "/setup/locations",
          icon: MapPin,
        },
        {
          title: "Categories",
          url: "/setup/categories",
          icon: Layers,
        },
        {
          title: "Sub-categories",
          url: "/setup/sub-categories",
          icon: Tag,
        },
        {
          title: "Departments",
          url: "/setup/departments",
          icon: Users,
        },
        {
          title: "Employees",
          url: "/setup/employees",
          icon: Users,
        },
      ],
    },



    {
      title: "Tools",
      url: "/tools",
      icon: Wrench,
      items: [
        {
          title: "Import",
          url: "/tools/import",
          icon: Plus,
        },
        {
          title: "Export",
          url: "/tools/export",
          icon: FileText,
        },
        {
          title: "Documents Gallery",
          url: "/tools/documents",
          icon: FileText,
        },
        {
          title: "Image Gallery",
          url: "/tools/images",
          icon: GalleryVerticalEnd,
        },
        {
          title: "Audit",
          url: "/tools/audit",
          icon: ShieldCheck,
        },
      ],
    },
  ],
  projects: [
    {
      name: "IT Asset Management",
      url: "/projects/it-assets",
      icon: Shield,
    },
    {
      name: "Office Equipment",
      url: "/projects/office",
      icon: Frame,
    },
    {
      name: "Vehicle Fleet",
      url: "/projects/fleet",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { settings: companyInfo } = useSystemSettings()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 transition-all duration-300 hover:bg-sidebar-accent rounded-lg">
          {/* Company Logo */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shrink-0 transition-all duration-300">
            {companyInfo.logoUrl ? (
              <img
                src={companyInfo.logoUrl}
                alt={companyInfo.company}
                className="h-full w-full object-contain transition-opacity duration-300"
                style={{
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary transition-all duration-300">
                <GalleryVerticalEnd className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Company Name */}
          <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
            <span className="text-sm font-semibold text-sidebar-foreground truncate transition-all duration-300">
              {companyInfo.company}
            </span>
            <span className="text-xs text-sidebar-foreground/70 truncate transition-all duration-300">
              {companyInfo.organizationType}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}


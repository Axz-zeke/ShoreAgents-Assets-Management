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
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useDashboard } from "@/hooks/use-dashboard"
import { AddWidgetDialog } from "@/components/add-widget-dialog"
import { DraggableWidgetContainer } from "@/components/draggable-widget-container"
import { SortableProvider } from "@/components/sortable-provider"
import { RefreshCw, Package, UserCheck, UserMinus, Move, Wrench, Trash2, Calendar, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export default function Page() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    getWidgetComponent,
    getAvailableWidgets
  } = useDashboard()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/login')
          router.refresh()
        }
      } catch (error) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      reorderWidgets(active.id as string, over?.id as string)
    }
    setActiveId(null)
  }

  const availableWidgets = getAvailableWidgets()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Dashboard...</span>
        </div>
      </div>
    )
  }

  const quickLinks = [
    { label: "Check Out", href: "/assets/checkout", icon: UserCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Check In", href: "/assets/checkin", icon: UserMinus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Move", href: "/assets/move", icon: Move, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Maintenance", href: "/assets/maintenance", icon: Wrench, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Dispose", href: "/assets/dispose", icon: Trash2, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Reserve", href: "/assets/reserve", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Monitoring Center</h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-70">
                Asset Movement & System Health Overview
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AddWidgetDialog
                availableWidgets={availableWidgets}
                onAddWidget={addWidget}
              />
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-9 font-bold uppercase tracking-wider">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Links Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Button
                key={link.label}
                variant="outline"
                asChild
                className="h-auto py-4 flex flex-col gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 shadow-sm transition-all group"
              >
                <Link href={link.href}>
                  <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", link.bg, link.color)}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                </Link>
              </Button>
            ))}
          </div>

          <Separator className="bg-border/40" />

          {/* Widgets Grid */}
          <SortableProvider
            items={widgets.map(w => w.id)}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 auto-rows-min">
              {widgets.map((widget) => {
                const WidgetComponent = getWidgetComponent(widget.type)
                if (!WidgetComponent) return null

                return (
                  <DraggableWidgetContainer
                    key={widget.id}
                    widget={widget}
                    onRemove={() => removeWidget(widget.id)}
                    onResize={(id, size) => updateWidget(id, { size })}
                  >
                    <WidgetComponent />
                  </DraggableWidgetContainer>
                )
              })}
            </div>
          </SortableProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useMemo } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  // Memoize the items with their open state to prevent infinite re-renders
  const itemsWithOpenState = useMemo(() => {
    return items.map((item) => {
      // Check if current path matches any sub-item URL
      const isSubItemActive = item.items?.some(subItem => pathname === subItem.url)
      const shouldBeOpen = item.isActive || isSubItemActive

      return {
        ...item,
        shouldBeOpen
      }
    })
  }, [items, pathname])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {itemsWithOpenState.map((item) => {
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.shouldBeOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} className="hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200 ease-in-out">
                    {item.icon && <item.icon className="hover:text-primary transition-colors duration-200" />}
                    <span className="hover:text-primary transition-colors duration-200">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild className="hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200 ease-in-out">
                          <Link href={subItem.url}>
                            <span className="hover:text-primary transition-colors duration-200">{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

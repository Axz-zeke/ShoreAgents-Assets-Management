"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import {
    ArrowLeftRight,
    UserCheck,
    UserMinus,
    Clock,
    MapPin,
    ShieldAlert,
    ArrowUpRight,
    History
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export function AssetMovementWidget() {
    const { data: assets = [], isLoading } = useInstantAssets()

    // Derive movement events from asset status and updated_at
    // In a real app, this would query a dedicated 'activity_log' table
    const movementEvents = React.useMemo(() => {
        if (isLoading) return []

        return assets
            .filter(a => a.updatedAt && a.updatedAt !== '')
            .sort((a, b) => {
                const dateA = new Date(a.updatedAt!).getTime()
                const dateB = new Date(b.updatedAt!).getTime()
                return dateB - dateA
            })
            .slice(0, 10)
            .map(asset => {
                let action = "Updated"
                let icon = <Clock className="h-4 w-4" />
                let color = "bg-slate-500"

                if (asset.status === "In Use") {
                    action = "Checked Out"
                    icon = <UserCheck className="h-4 w-4" />
                    color = "bg-blue-500"
                } else if (asset.status === "Available" && asset.updatedAt !== asset.createdAt) {
                    action = "Checked In"
                    icon = <UserMinus className="h-4 w-4" />
                    color = "bg-emerald-500"
                } else if (asset.status === "Maintenance") {
                    action = "Sent to Maintenance"
                    icon = <ShieldAlert className="h-4 w-4" />
                    color = "bg-amber-500"
                } else if (asset.status === "Disposed") {
                    action = "Decommissioned"
                    icon = <ShieldAlert className="h-4 w-4" />
                    color = "bg-rose-500"
                }

                return {
                    id: asset.id,
                    name: asset.name,
                    action,
                    timestamp: new Date(asset.updatedAt!),
                    user: asset.assignedTo || "System",
                    location: asset.location || "N/A",
                    icon,
                    color,
                    status: asset.status
                }
            })
    }, [assets, isLoading])

    if (isLoading) {
        return (
            <Card className="h-full border-border/50 shadow-sm animate-pulse">
                <CardHeader className="pb-2">
                    <div className="h-6 w-32 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-muted rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full border-border/50 shadow-sm overflow-hidden flex flex-col group/card bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <History className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold tracking-tight">Recent Movement</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Real-time asset activities</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] bg-background/50">
                        {movementEvents.length} Recent
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <ScrollArea className="h-full max-h-[400px]">
                    <div className="divide-y divide-border/30">
                        {movementEvents.length > 0 ? (
                            movementEvents.map((event, idx) => (
                                <div
                                    key={`${event.id}-${idx}`}
                                    className="p-4 hover:bg-muted/30 transition-colors flex gap-4 items-start group"
                                >
                                    <div className={cn(
                                        "mt-1 p-2 rounded-full text-white shadow-lg shadow-black/5 transition-transform group-hover:scale-110",
                                        event.color
                                    )}>
                                        {event.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground/40">{event.action}</span>
                                            <span className="text-[10px] text-muted-foreground bg-muted p-1 px-2 rounded-full font-bold">
                                                {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="font-bold text-sm text-foreground truncate">{event.name}</div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                                <UserCheck className="h-3 w-3 opacity-50" />
                                                <span className="truncate max-w-[100px]">{event.user}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                                <MapPin className="h-3 w-3 opacity-50" />
                                                <span className="truncate max-w-[120px]">{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="h-4 w-4 text-primary cursor-pointer" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2 pt-8">
                                <ArrowLeftRight className="h-8 w-8 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-50">No recent movements detected</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

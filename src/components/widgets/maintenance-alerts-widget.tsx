"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useInstantMaintenance } from "@/hooks/use-instant-maintenance"
import { AlertTriangle, Calendar } from "lucide-react"

export function MaintenanceAlertsWidget() {
  const { data: maintenanceRecords = [], isLoading } = useInstantMaintenance()
  
  const upcomingMaintenance = React.useMemo(() => {
    if (isLoading) return []
    
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return maintenanceRecords
      .filter(record => {
        const dueDate = new Date(record.maintenance_due_date)
        return dueDate >= now && dueDate <= nextWeek && record.status === 'scheduled'
      })
      .sort((a, b) => new Date(a.maintenance_due_date).getTime() - new Date(b.maintenance_due_date).getTime())
      .slice(0, 5) // Show top 5 upcoming maintenance
  }, [maintenanceRecords, isLoading])

  return (
    <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Maintenance Alerts
        </CardTitle>
        <CardDescription>
          Upcoming maintenance schedules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] sm:h-[200px]">
          <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
            {upcomingMaintenance.length > 0 ? upcomingMaintenance.map((alert, index) => (
              <div key={alert.id}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{alert.assets?.name || alert.asset_id}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Due: {new Date(alert.maintenance_due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Badge 
                      variant={alert.status === 'scheduled' ? 'default' : alert.status === 'in_progress' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {alert.maintenance_title}
                    </Badge>
                  </div>
                </div>
                {index < upcomingMaintenance.length - 1 && <Separator className="my-1 sm:my-2" />}
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming maintenance alerts</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <Separator className="my-3 sm:my-4" />
        <Button variant="outline" className="w-full text-xs sm:text-sm">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  )
}

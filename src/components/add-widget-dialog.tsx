"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Plus, X } from 'lucide-react'
import { WidgetType, WidgetSize } from '@/types/widgets'
import { widgetConfigs } from '@/lib/dashboard-data'

interface AddWidgetDialogProps {
  availableWidgets: Array<[string, { type: WidgetType; title: string; description: string; icon: string; defaultSize: WidgetSize }]>
  onAddWidget: (type: WidgetType) => void
}

export function AddWidgetDialog({ availableWidgets, onAddWidget }: AddWidgetDialogProps) {
  const [open, setOpen] = useState(false)

  const handleAddWidget = (type: WidgetType) => {
    onAddWidget(type)
    setOpen(false)
  }

  const getSizeBadgeVariant = (size: WidgetSize) => {
    switch (size) {
      case 'small': return 'secondary'
      case 'medium': return 'default'
      case 'large': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Widget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Widget to Dashboard</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard. You can customize it later.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-4 pr-4">
            {availableWidgets.map(([type, config], index) => (
              <div key={type}>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleAddWidget(type as WidgetType)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      {config.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {config.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant={getSizeBadgeVariant(config.defaultSize)}>
                        {config.defaultSize}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                {index < availableWidgets.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        {availableWidgets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>All available widgets have been added to your dashboard.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

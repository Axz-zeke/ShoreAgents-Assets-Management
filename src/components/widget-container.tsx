"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, GripVertical } from 'lucide-react'
import { Widget, WidgetSize } from '@/types/widgets'
import { widgetConfigs } from '@/lib/dashboard-data'

interface WidgetContainerProps {
  widget: Widget
  onRemove: (id: string) => void
  children: React.ReactNode
}

export function WidgetContainer({ widget, onRemove, children }: WidgetContainerProps) {
  const config = widgetConfigs[widget.type]
  
  const getSizeClasses = (size: WidgetSize) => {
    switch (size) {
      case 'small': return 'col-span-1'
      case 'medium': return 'col-span-2'
      case 'large': return 'col-span-3'
      default: return 'col-span-2'
    }
  }

  return (
    <div className={`${getSizeClasses(widget.size)} group`}>
      <Card className="h-full hover:shadow-md transition-all duration-300 ease-in-out">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="text-xs">
                {widget.size}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(widget.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

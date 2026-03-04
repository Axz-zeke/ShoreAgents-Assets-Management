"use client"

import { Card, CardContent } from "@/components/ui/card"
import { WidgetSize } from "@/types/widgets"

interface DropPlaceholderProps {
  size: WidgetSize
}

export function DropPlaceholder({ size }: DropPlaceholderProps) {
  const getSizeClasses = (size: WidgetSize) => {
    switch (size) {
      case 'small': return 'col-span-1'
      case 'medium': return 'col-span-2'
      case 'large': return 'col-span-3'
      default: return 'col-span-2'
    }
  }

  return (
    <div className={`${getSizeClasses(size)} group`}>
      <Card className="h-full border border-dashed border-primary/20 bg-primary/2 animate-pulse">
        <CardContent className="flex items-center justify-center h-full min-h-[200px]">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 mx-auto bg-primary/20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-primary/40 rounded"></div>
            </div>
            <div className="text-sm text-primary/60 font-medium">
              Drop here
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

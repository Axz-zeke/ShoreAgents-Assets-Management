"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { X, GripVertical, LayoutGrid } from 'lucide-react'
import { Widget, WidgetSize } from '@/types/widgets'
import { widgetConfigs } from '@/lib/dashboard-data'
import { useEffect, useState } from 'react'
import { DropPlaceholder } from './drop-placeholder'

interface DraggableWidgetContainerProps {
  widget: Widget
  onRemove: (id: string) => void
  onResize: (id: string, size: WidgetSize) => void
  children: React.ReactNode
  activeId?: string | null
  overId?: string | null
}

export function DraggableWidgetContainer({ widget, onRemove, onResize, children, activeId, overId }: DraggableWidgetContainerProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id })

  const config = widgetConfigs[widget.type]
  
  // Check if this widget is a potential drop target
  const isDropTarget = activeId && activeId !== widget.id && !isDragging
  const isExactDropTarget = overId === widget.id && activeId && activeId !== widget.id
  
  const getSizeClasses = (size: WidgetSize) => {
    switch (size) {
      case 'small': return 'col-span-1'
      case 'medium': return 'col-span-1 sm:col-span-2 lg:col-span-2'
      case 'large': return 'col-span-1 sm:col-span-2 lg:col-span-3'
      default: return 'col-span-1 sm:col-span-2'
    }
  }

  const resizeWidget = (size: WidgetSize) => {
    onResize(widget.id, size)
  }

  const getSizeLabel = (size: WidgetSize) => {
    switch (size) {
      case 'small': return '1 Column'
      case 'medium': return '2 Columns'
      case 'large': return '3 Columns'
      default: return '2 Columns'
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'none',
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  // Render static version during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`${getSizeClasses(widget.size)} group`}>
        <Card className={`h-full transition-all duration-300 ${
          isDragging 
            ? 'shadow-2xl scale-105 rotate-1' 
            : isDropTarget
            ? 'shadow-md shadow-primary/10 scale-[1.005] border border-dashed border-primary/20'
            : 'hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.02]'
        }`}>
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base sm:text-lg flex-shrink-0">{config.icon}</span>
                <CardTitle className="text-base sm:text-lg truncate">{widget.title}</CardTitle>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                  {getSizeLabel(widget.size)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Resize widget"
                    >
                      <LayoutGrid className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem 
                      onClick={() => resizeWidget('small')}
                      className={widget.size === 'small' ? 'bg-accent' : ''}
                    >
                      1 Column
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => resizeWidget('medium')}
                      className={widget.size === 'medium' ? 'bg-accent' : ''}
                    >
                      2 Columns
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => resizeWidget('large')}
                      className={widget.size === 'large' ? 'bg-accent' : ''}
                    >
                      3 Columns
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled
                >
                  <GripVertical className="h-3 w-3" />
                </Button>
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

  // If this is the exact drop target, show placeholder instead
  if (isExactDropTarget) {
    return <DropPlaceholder size={widget.size} />
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`${getSizeClasses(widget.size)} group sortable-item`}
      data-dragging={isDragging}
      data-drop-target={isDropTarget}
      data-sortable-id={widget.id}
    >
      <Card className={`h-full transition-all duration-300 ${
        isDragging 
          ? 'shadow-2xl scale-105 rotate-1' 
          : isDropTarget
          ? 'shadow-md shadow-primary/10 scale-[1.005] border border-dashed border-primary/20'
          : 'hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.02]'
      }`}>
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-base sm:text-lg flex-shrink-0">{config.icon}</span>
              <CardTitle className="text-base sm:text-lg truncate">{widget.title}</CardTitle>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                {getSizeLabel(widget.size)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="Resize widget"
                  >
                    <LayoutGrid className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem 
                    onClick={() => resizeWidget('small')}
                    className={widget.size === 'small' ? 'bg-accent' : ''}
                  >
                    1 Column
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => resizeWidget('medium')}
                    className={widget.size === 'medium' ? 'bg-accent' : ''}
                  >
                    2 Columns
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => resizeWidget('large')}
                    className={widget.size === 'large' ? 'bg-accent' : ''}
                  >
                    3 Columns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 drag-handle cursor-grab active:cursor-grabbing hover:bg-muted/40"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-3 w-3" />
              </Button>
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

"use client"

import { useState, useCallback, useEffect } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { Widget, WidgetType, WidgetSize } from '@/types/widgets'
import { widgetConfigs, defaultWidgets } from '@/lib/dashboard-data'

// Widget component imports
import { AssetStatsWidget } from '@/components/widgets/asset-stats-widget'
import { RecentAddedAssetsWidget } from '@/components/widgets/recent-added-assets-widget'
import { MaintenanceAlertsWidget } from '@/components/widgets/maintenance-alerts-widget'
import { AssetLocationWidget } from '@/components/widgets/asset-location-widget'
import { DepartmentOverviewWidget } from '@/components/widgets/department-overview-widget'
import { AssetStatusPieWidget } from '@/components/widgets/asset-status-pie-widget'
import { AssetMovementWidget } from '@/components/widgets/asset-movement-widget'
import { AssetValueChartWidget } from '@/components/widgets/asset-value-chart-widget'

// Widget component mapping
const widgetComponents = {
  'asset-stats': AssetStatsWidget,
  'recent-added-assets': RecentAddedAssetsWidget,
  'maintenance-alerts': MaintenanceAlertsWidget,
  'asset-location': AssetLocationWidget,
  'department-overview': DepartmentOverviewWidget,
  'asset-status-pie': AssetStatusPieWidget,
  'asset-value-chart': AssetValueChartWidget,
  'asset-movement': AssetMovementWidget,
}

// Local storage key for dashboard widgets
const DASHBOARD_WIDGETS_KEY = 'dashboard-widgets'
const DASHBOARD_VERSION_KEY = 'dashboard-version'
const DASHBOARD_VERSION = '2' // bump this to reset all users to the new default layout

// Helper functions for localStorage
const saveWidgetsToStorage = (widgets: Widget[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DASHBOARD_WIDGETS_KEY, JSON.stringify(widgets))
      localStorage.setItem(DASHBOARD_VERSION_KEY, DASHBOARD_VERSION)
    } catch (error) {
      console.error('Failed to save widgets to localStorage:', error)
    }
  }
}

const loadWidgetsFromStorage = (): Widget[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedVersion = localStorage.getItem(DASHBOARD_VERSION_KEY)
      // If version mismatch, reset to defaults
      if (storedVersion !== DASHBOARD_VERSION) {
        localStorage.removeItem(DASHBOARD_WIDGETS_KEY)
        localStorage.setItem(DASHBOARD_VERSION_KEY, DASHBOARD_VERSION)
        return defaultWidgets
      }
      const stored = localStorage.getItem(DASHBOARD_WIDGETS_KEY)
      if (stored) {
        const parsedWidgets = JSON.parse(stored)
        if (Array.isArray(parsedWidgets) && parsedWidgets.length > 0) {
          return parsedWidgets
        }
      }
    } catch (error) {
      console.error('Failed to load widgets from localStorage:', error)
    }
  }
  return defaultWidgets
}

export function useDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load widgets from localStorage on mount
  useEffect(() => {
    const storedWidgets = loadWidgetsFromStorage()
    setWidgets(storedWidgets)
    setIsLoaded(true)
  }, [])

  // Save widgets to localStorage whenever widgets change
  useEffect(() => {
    if (isLoaded) {
      saveWidgetsToStorage(widgets)
    }
  }, [widgets, isLoaded])

  const addWidget = useCallback((type: WidgetType) => {
    const config = widgetConfigs[type]
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: config.title,
      size: config.defaultSize,
      position: { x: 0, y: widgets.length }
    }
    setWidgets(prev => [...prev, newWidget])
  }, [widgets.length])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id))
  }, [])

  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, ...updates } : widget
    ))
  }, [])

  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    setWidgets(prev => {
      const oldIndex = prev.findIndex(widget => widget.id === activeId)
      const newIndex = prev.findIndex(widget => widget.id === overId)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const resetToDefault = useCallback(() => {
    setWidgets(defaultWidgets)
  }, [])

  const getWidgetComponent = useCallback((type: WidgetType) => {
    return widgetComponents[type]
  }, [])

  const getAvailableWidgets = useCallback(() => {
    const usedTypes = new Set(widgets.map(w => w.type))
    return Object.entries(widgetConfigs).filter(([type]) => !usedTypes.has(type as WidgetType))
  }, [widgets])

  return {
    widgets,
    isLoaded,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    resetToDefault,
    getWidgetComponent,
    getAvailableWidgets,
    widgetConfigs
  }
}

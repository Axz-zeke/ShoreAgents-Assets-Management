// Widget types and interfaces
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  data?: Record<string, unknown>;
}

export type WidgetType =
  | 'asset-stats'
  | 'recent-added-assets'
  | 'asset-location'
  | 'maintenance-alerts'
  | 'asset-value-chart'
  | 'department-overview'
  | 'asset-status-pie'
  | 'asset-movement';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetConfig {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
}

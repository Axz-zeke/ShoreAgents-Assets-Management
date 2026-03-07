import { WidgetType, WidgetSize, Widget } from '@/types/widgets';

// Default widget configurations
export const widgetConfigs = {
  'asset-stats': {
    type: 'asset-stats' as WidgetType,
    title: 'Asset Statistics',
    description: 'Overview of total assets, active assets, and maintenance alerts',
    icon: '📊',
    defaultSize: 'large' as WidgetSize
  },
  'recent-added-assets': {
    type: 'recent-added-assets' as WidgetType,
    title: 'Recent Added Assets',
    description: 'Recently added assets with check in/out functionality',
    icon: '📦',
    defaultSize: 'medium' as WidgetSize
  },
  'asset-location': {
    type: 'asset-location' as WidgetType,
    title: 'Asset Locations',
    description: 'Distribution of assets across different locations',
    icon: '📍',
    defaultSize: 'medium' as WidgetSize
  },
  'maintenance-alerts': {
    type: 'maintenance-alerts' as WidgetType,
    title: 'Maintenance Alerts',
    description: 'Upcoming maintenance schedules and alerts',
    icon: '⚠️',
    defaultSize: 'medium' as WidgetSize
  },
  'asset-value-chart': {
    type: 'asset-value-chart' as WidgetType,
    title: 'Asset Value Chart',
    description: 'Chart showing asset values over time',
    icon: '📈',
    defaultSize: 'large' as WidgetSize
  },
  'department-overview': {
    type: 'department-overview' as WidgetType,
    title: 'Department Overview',
    description: 'Asset distribution across departments',
    icon: '🏢',
    defaultSize: 'medium' as WidgetSize
  },
  'asset-status-pie': {
    type: 'asset-status-pie' as WidgetType,
    title: 'Asset Status',
    description: 'Pie chart showing asset status distribution',
    icon: '🥧',
    defaultSize: 'small' as WidgetSize
  },
  'asset-movement': {
    type: 'asset-movement' as WidgetType,
    title: 'Asset Movement',
    description: 'Real-time monitoring of asset check-ins, check-outs, and moves',
    icon: '🔄',
    defaultSize: 'medium' as WidgetSize
  }
};

// Default dashboard layout
export const defaultWidgets: Widget[] = [
  {
    id: 'widget-1',
    type: 'asset-stats',
    title: 'Asset Statistics',
    size: 'medium',
    position: { x: 0, y: 0 }
  },
  {
    id: 'widget-2',
    type: 'asset-value-chart',
    title: 'Asset Value Chart',
    size: 'medium',
    position: { x: 2, y: 0 }
  },
  {
    id: 'widget-3',
    type: 'department-overview',
    title: 'Department Overview',
    size: 'medium',
    position: { x: 0, y: 1 }
  },
  {
    id: 'widget-4',
    type: 'recent-added-assets',
    title: 'Recent Added Assets',
    size: 'medium',
    position: { x: 2, y: 1 }
  }
];

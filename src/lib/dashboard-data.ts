import { WidgetType, WidgetSize, Widget } from '@/types/widgets';
import { getAllAssets } from './centralized-assets';

// Real data for widgets - calculated from centralized assets
export const mockAssetStats = (() => {
  const assets = getAllAssets();
  return {
    totalAssets: assets.length,
    activeAssets: assets.filter(asset => asset.status === 'In Use').length,
    maintenanceDue: assets.filter(asset => asset.status === 'Maintenance').length,
    totalValue: assets.reduce((sum, asset) => sum + asset.value, 0)
  };
})();

export const mockRecentAssets = getAllAssets().slice(0, 5).map(asset => ({
  id: asset.id,
  name: asset.name,
  category: asset.category,
  status: asset.status,
  assignedTo: asset.assignedTo || 'Unassigned'
}));

export const mockAssetLocations = (() => {
  const assets = getAllAssets();
  const locationCounts = assets.reduce((acc, asset) => {
    acc[asset.location] = (acc[asset.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
})();

export const mockMaintenanceAlerts = (() => {
  const assets = getAllAssets();
  const maintenanceAssets = assets.filter(asset => asset.status === 'Maintenance');

  return maintenanceAssets.map((asset, index) => ({
    id: `MA-${(index + 1).toString().padStart(3, '0')}`,
    asset: asset.name,
    type: 'Repair' as const,
    dueDate: asset.lastMaintenance || new Date().toISOString().split('T')[0],
    priority: 'High' as const
  }));
})();

export const mockDepartments = (() => {
  const assets = getAllAssets();
  const departmentData = assets.reduce((acc, asset) => {
    const deptName = `${asset.department} Department`;
    if (!acc[deptName]) {
      acc[deptName] = { assetCount: 0, value: 0 };
    }
    acc[deptName].assetCount += 1;
    acc[deptName].value += asset.value;
    return acc;
  }, {} as Record<string, { assetCount: number; value: number }>);

  return Object.entries(departmentData)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.assetCount - a.assetCount);
})();

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

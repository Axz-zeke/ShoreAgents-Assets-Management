"use client"

import { useState, useEffect } from 'react'

interface Asset {
  id: string
  asset_tag_id: string
  name: string | null
  description: string | null
  status: string | null
  category: string | null
  department: string | null
  created_at: Date
}

interface AssetStats {
  total: number
  byStatus: Record<string, number>
  byCategory: Record<string, number>
}

export default function PrismaAssetsExample() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [stats, setStats] = useState<AssetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAssets()
    fetchStats()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/prisma/assets')
      const data = await response.json()

      if (data.success) {
        setAssets(data.data)
      } else {
        setError(data.error || 'Failed to fetch assets')
      }
    } catch (err) {
      setError('Failed to fetch assets')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/prisma/assets/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const createAsset = async (assetData: any) => {
    try {
      const response = await fetch('/api/prisma/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the assets list
        fetchAssets()
        fetchStats()
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to create asset' }
    }
  }

  if (loading) {
    return <div>Loading assets...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assets (Prisma Example)</h1>

      {/* Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Statistics</h2>
          <p>Total Assets: {stats.total}</p>
          <div className="mt-2">
            <h3 className="font-medium">By Status:</h3>
            <ul className="ml-4">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <li key={status}>{status}: {count}</li>
              ))}
            </ul>
          </div>
          <div className="mt-2">
            <h3 className="font-medium">By Category:</h3>
            <ul className="ml-4">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <li key={category}>{category}: {count}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Assets List */}
      <div className="space-y-4">
        {assets.map((asset) => (
          <div key={asset.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{asset.name || 'Unnamed Asset'}</h3>
                <p className="text-sm text-gray-600">ID: {asset.asset_tag_id}</p>
                {asset.description && (
                  <p className="text-sm mt-1">{asset.description}</p>
                )}
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${asset.status === 'Available' ? 'bg-green-100 text-green-800' :
                  asset.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                    asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {asset.status}
                </span>
                {asset.category && (
                  <p className="text-sm text-gray-600 mt-1">{asset.category}</p>
                )}
                {asset.department && (
                  <p className="text-sm text-gray-600">{asset.department}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No assets found. Create your first asset to get started!
        </div>
      )}
    </div>
  )
}

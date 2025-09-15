'use client'

import { useState, useEffect } from 'react'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { ActionTable } from '@/components/dashboard/action-table'
import { SimulationModal } from '@/components/dashboard/simulation-modal'
import { Button } from '@/components/ui/button'
import { ActionType } from '@/lib/action-engine'
import { SimulationResult, runSimulation } from '@/lib/simulation'

interface ActionItem {
  id: string
  url: string
  action: ActionType
  rationale: string
  risk: number
  zombieScore: number
  clicks: number
  impressions: number
  position: number
  targetUrl?: string
}

export default function Dashboard() {
  const [actions, setActions] = useState<ActionItem[]>([])
  const [isSimulationOpen, setIsSimulationOpen] = useState(false)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demo
  useEffect(() => {
    const mockActions: ActionItem[] = [
      {
        id: '1',
        url: 'https://example.com/old-blog-post-2020',
        action: 'prune',
        rationale: 'Very low value content with no traffic, backlinks, or conversions',
        risk: 25,
        zombieScore: 85,
        clicks: 0,
        impressions: 12,
        position: 45,
      },
      {
        id: '2',
        url: 'https://example.com/duplicate-content-page',
        action: 'consolidate',
        rationale: 'High cannibalization similarity (87%) with better performing content',
        risk: 15,
        zombieScore: 65,
        clicks: 5,
        impressions: 150,
        position: 25,
        targetUrl: 'https://example.com/main-content-page'
      },
      {
        id: '3',
        url: 'https://example.com/outdated-guide',
        action: 'refresh',
        rationale: 'Content shows decline but has historical value - good candidate for refresh',
        risk: 20,
        zombieScore: 55,
        clicks: 25,
        impressions: 800,
        position: 18,
      },
      {
        id: '4',
        url: 'https://example.com/thin-content-page',
        action: 'redirect',
        rationale: 'Thin content with low value - redirect to relevant parent/category',
        risk: 30,
        zombieScore: 70,
        clicks: 2,
        impressions: 80,
        position: 35,
        targetUrl: 'https://example.com/category/'
      },
      {
        id: '5',
        url: 'https://example.com/valuable-content',
        action: 'keep',
        rationale: 'High-value content with backlinks, conversions, or Page 1 rankings',
        risk: 5,
        zombieScore: 15,
        clicks: 150,
        impressions: 2500,
        position: 8,
      }
    ]
    
    setTimeout(() => {
      setActions(mockActions)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleApprove = (actionIds: string[]) => {
    console.log('Approving actions:', actionIds)
    // TODO: Implement approval logic
  }

  const handleReject = (actionIds: string[]) => {
    console.log('Rejecting actions:', actionIds)
    // TODO: Implement rejection logic
  }

  const handleSimulate = () => {
    const simulationInput = {
      urls: actions.map(action => ({
        url: action.url,
        action: action.action,
        risk: action.risk,
        metrics: {
          clicks: action.clicks,
          impressions: action.impressions,
          position: action.position,
          ctr: 0,
          sessions: 0,
          conversions: 0,
          backlinks: 0,
          last_updated: new Date(),
          age_months: 12
        },
        rationale: action.rationale
      }))
    }

    const result = runSimulation(simulationInput)
    setSimulationResult(result)
    setIsSimulationOpen(true)
  }

  const handleApplyChanges = () => {
    console.log('Applying changes...')
    setIsSimulationOpen(false)
    // TODO: Implement change application
  }

  const totalUrls = actions.length
  const zombieUrls = actions.filter(a => a.zombieScore > 50).length
  const actionsPending = actions.filter(a => a.action !== 'keep').length
  const indexBloat = Math.round((zombieUrls / totalUrls) * 100)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PrunePro Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Remove zombie pages before they drain your rankings
          </p>
        </div>

        {/* Overview Cards */}
        <OverviewCards
          totalUrls={totalUrls}
          zombieUrls={zombieUrls}
          actionsPending={actionsPending}
          indexBloat={indexBloat}
        />

        {/* Action Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Content Actions</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Refresh Analysis
              </Button>
            </div>
          </div>

          <ActionTable
            actions={actions}
            onApprove={handleApprove}
            onReject={handleReject}
            onSimulate={handleSimulate}
          />
        </div>

        {/* Simulation Modal */}
        <SimulationModal
          isOpen={isSimulationOpen}
          onClose={() => setIsSimulationOpen(false)}
          result={simulationResult}
          onApply={handleApplyChanges}
        />
      </div>
    </div>
  )
}
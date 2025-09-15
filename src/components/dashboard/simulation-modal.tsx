'use client'

import { SimulationResult } from '@/lib/simulation'

interface SimulationModalProps {
  isOpen: boolean
  onClose: () => void
  result: SimulationResult | null
  onApply: () => void
}

export function SimulationModal({ isOpen, onClose, result, onApply }: SimulationModalProps) {
  if (!isOpen || !result) return null

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Simulation Results</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{result.totalUrls}</div>
              <div className="text-sm text-blue-600">Total URLs</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{result.actionsToApply}</div>
              <div className="text-sm text-green-600">Actions to Apply</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{result.projectedImpact.indexBloatReduction}%</div>
              <div className="text-sm text-purple-600">Index Bloat Reduction</div>
            </div>
            <div className={`p-4 rounded-lg ${getRiskColor(result.projectedImpact.riskLevel)}`}>
              <div className="text-2xl font-bold">{result.projectedImpact.riskLevel.toUpperCase()}</div>
              <div className="text-sm">Risk Level</div>
            </div>
          </div>

          {/* Projected Impact */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projected Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{result.projectedImpact.crawlBudgetReclaimed}</div>
                <div className="text-sm text-gray-600">Crawl Budget Reclaimed</div>
                <div className="text-xs text-gray-500">Estimated requests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{result.projectedImpact.trafficShift}</div>
                <div className="text-sm text-gray-600">Traffic Shift</div>
                <div className="text-xs text-gray-500">Clicks redirected/improved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{result.riskAnalysis.potentialLoss}</div>
                <div className="text-sm text-gray-600">Potential Loss</div>
                <div className="text-xs text-gray-500">Clicks at risk</div>
              </div>
            </div>
          </div>

          {/* Action Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(result.actionBreakdown).map(([action, count]) => (
                <div key={action} className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Analysis */}
          {result.riskAnalysis.highRiskUrls.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">High Risk URLs</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-800 mb-2">
                  {result.riskAnalysis.highRiskUrls.length} URLs require careful review:
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.riskAnalysis.highRiskUrls.slice(0, 5).map((url, index) => (
                    <li key={index} className="truncate">• {url}</li>
                  ))}
                  {result.riskAnalysis.highRiskUrls.length > 5 && (
                    <li className="text-red-600">... and {result.riskAnalysis.highRiskUrls.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Rollback Plan */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rollback Plan</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                {result.riskAnalysis.rollbackPlan}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

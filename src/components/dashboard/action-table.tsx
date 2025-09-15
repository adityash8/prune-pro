'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ActionType, getActionColor, getActionIcon } from '@/lib/action-engine'

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

interface ActionTableProps {
  actions: ActionItem[]
  onApprove: (actionIds: string[]) => void
  onReject: (actionIds: string[]) => void
  onSimulate: () => void
}

export function ActionTable({ actions, onApprove, onReject, onSimulate }: ActionTableProps) {
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<ActionType | 'all'>('all')

  const filteredActions = filter === 'all' 
    ? actions 
    : actions.filter(action => action.action === filter)

  const handleSelectAll = () => {
    if (selectedActions.size === filteredActions.length) {
      setSelectedActions(new Set())
    } else {
      setSelectedActions(new Set(filteredActions.map(action => action.id)))
    }
  }

  const handleSelectAction = (actionId: string) => {
    const newSelected = new Set(selectedActions)
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId)
    } else {
      newSelected.add(actionId)
    }
    setSelectedActions(newSelected)
  }

  const handleApprove = () => {
    onApprove(Array.from(selectedActions))
    setSelectedActions(new Set())
  }

  const handleReject = () => {
    onReject(Array.from(selectedActions))
    setSelectedActions(new Set())
  }

  const getRiskColor = (risk: number) => {
    if (risk < 20) return 'text-green-600 bg-green-50'
    if (risk < 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActionType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Actions</option>
            <option value="keep">Keep</option>
            <option value="refresh">Refresh</option>
            <option value="consolidate">Consolidate</option>
            <option value="prune">Prune</option>
            <option value="redirect">Redirect</option>
          </select>
          <span className="text-sm text-gray-500">
            {filteredActions.length} actions
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {selectedActions.size > 0 && (
            <>
              <Button
                onClick={handleApprove}
                variant="default"
                size="sm"
              >
                Approve ({selectedActions.size})
              </Button>
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
              >
                Reject ({selectedActions.size})
              </Button>
            </>
          )}
          <Button
            onClick={onSimulate}
            variant="secondary"
            size="sm"
          >
            Run Simulation
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedActions.size === filteredActions.length && filteredActions.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zombie Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metrics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rationale
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActions.map((action) => (
              <tr key={action.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedActions.has(action.id)}
                    onChange={() => handleSelectAction(action.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {action.url}
                  </div>
                  {action.targetUrl && (
                    <div className="text-xs text-gray-500">
                      → {action.targetUrl}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(action.action)}`}>
                    {getActionIcon(action.action)} {action.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {action.zombieScore}/100
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(action.risk)}`}>
                    {action.risk}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Clicks: {action.clicks}</div>
                  <div>Impressions: {action.impressions}</div>
                  <div>Position: {action.position || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  {action.rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredActions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No actions found for the selected filter.
        </div>
      )}
    </div>
  )
}

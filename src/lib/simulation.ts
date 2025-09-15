import { ActionType } from './action-engine'
import { URLMetrics } from './zombie-score'

export interface SimulationResult {
  totalUrls: number
  actionsToApply: number
  projectedImpact: {
    indexBloatReduction: number
    crawlBudgetReclaimed: number
    trafficShift: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  actionBreakdown: Record<ActionType, number>
  riskAnalysis: {
    highRiskUrls: string[]
    potentialLoss: number
    rollbackPlan: string
  }
}

export interface SimulationInput {
  urls: Array<{
    url: string
    action: ActionType
    risk: number
    metrics: URLMetrics
    rationale: string
  }>
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const { urls } = input
  
  // Count actions by type
  const actionBreakdown: Record<ActionType, number> = {
    keep: 0,
    refresh: 0,
    consolidate: 0,
    prune: 0,
    redirect: 0
  }
  
  urls.forEach(url => {
    actionBreakdown[url.action]++
  })
  
  // Calculate projected impact
  const actionsToApply = urls.filter(url => url.action !== 'keep').length
  const indexBloatReduction = calculateIndexBloatReduction(urls)
  const crawlBudgetReclaimed = calculateCrawlBudgetReclaimed(urls)
  const trafficShift = calculateTrafficShift(urls)
  
  // Risk analysis
  const highRiskUrls = urls
    .filter(url => url.risk > 50)
    .map(url => url.url)
  
  const potentialLoss = calculatePotentialLoss(urls)
  const riskLevel = determineRiskLevel(highRiskUrls.length, potentialLoss)
  
  return {
    totalUrls: urls.length,
    actionsToApply,
    projectedImpact: {
      indexBloatReduction,
      crawlBudgetReclaimed,
      trafficShift,
      riskLevel
    },
    actionBreakdown,
    riskAnalysis: {
      highRiskUrls,
      potentialLoss,
      rollbackPlan: generateRollbackPlan(urls)
    }
  }
}

function calculateIndexBloatReduction(urls: Array<{ action: ActionType; metrics: URLMetrics }>): number {
  const pruneCount = urls.filter(url => url.action === 'prune').length
  const redirectCount = urls.filter(url => url.action === 'redirect').length
  const consolidateCount = urls.filter(url => url.action === 'consolidate').length
  
  // Prune removes from index, redirect consolidates, consolidate removes duplicates
  const totalRemoved = pruneCount + redirectCount + consolidateCount
  
  return Math.round((totalRemoved / urls.length) * 100)
}

function calculateCrawlBudgetReclaimed(urls: Array<{ action: ActionType; metrics: URLMetrics }>): number {
  let reclaimed = 0
  
  urls.forEach(url => {
    if (url.action === 'prune') {
      // Estimate crawl budget based on page size and frequency
      reclaimed += estimateCrawlBudget(url.metrics)
    } else if (url.action === 'consolidate') {
      // Consolidation reduces duplicate crawling
      reclaimed += estimateCrawlBudget(url.metrics) * 0.5
    }
  })
  
  return Math.round(reclaimed)
}

function estimateCrawlBudget(metrics: URLMetrics): number {
  // Simple heuristic based on impressions (proxy for crawl frequency)
  return Math.min(100, Math.max(10, metrics.impressions / 100))
}

function calculateTrafficShift(urls: Array<{ action: ActionType; metrics: URLMetrics }>): number {
  let totalShift = 0
  
  urls.forEach(url => {
    if (url.action === 'consolidate' || url.action === 'redirect') {
      // Traffic gets redirected to better content
      totalShift += url.metrics.clicks * 0.8 // Assume 80% retention
    } else if (url.action === 'refresh') {
      // Refresh can improve traffic
      totalShift += url.metrics.clicks * 0.3 // Assume 30% improvement
    }
  })
  
  return Math.round(totalShift)
}

function calculatePotentialLoss(urls: Array<{ action: ActionType; risk: number; metrics: URLMetrics }>): number {
  let potentialLoss = 0
  
  urls.forEach(url => {
    if (url.action === 'prune' && url.risk > 30) {
      potentialLoss += url.metrics.clicks
    } else if (url.action === 'redirect' && url.risk > 40) {
      potentialLoss += url.metrics.clicks * 0.2 // 20% potential loss
    }
  })
  
  return Math.round(potentialLoss)
}

function determineRiskLevel(highRiskCount: number, potentialLoss: number): 'low' | 'medium' | 'high' {
  if (highRiskCount === 0 && potentialLoss < 100) return 'low'
  if (highRiskCount < 5 && potentialLoss < 500) return 'medium'
  return 'high'
}

function generateRollbackPlan(urls: Array<{ url: string; action: ActionType }>): string {
  const rollbackSteps = []
  
  const pruneUrls = urls.filter(url => url.action === 'prune')
  const redirectUrls = urls.filter(url => url.action === 'redirect')
  const consolidateUrls = urls.filter(url => url.action === 'consolidate')
  
  if (pruneUrls.length > 0) {
    rollbackSteps.push(`Restore ${pruneUrls.length} pruned URLs to index`)
  }
  
  if (redirectUrls.length > 0) {
    rollbackSteps.push(`Remove ${redirectUrls.length} redirect rules`)
  }
  
  if (consolidateUrls.length > 0) {
    rollbackSteps.push(`Restore ${consolidateUrls.length} consolidated URLs`)
  }
  
  return rollbackSteps.join('; ')
}

export function formatSimulationReport(result: SimulationResult): string {
  return `
# PrunePro Simulation Report

## Overview
- **Total URLs Analyzed**: ${result.totalUrls}
- **Actions to Apply**: ${result.actionsToApply}
- **Risk Level**: ${result.projectedImpact.riskLevel.toUpperCase()}

## Projected Impact
- **Index Bloat Reduction**: ${result.projectedImpact.indexBloatReduction}%
- **Crawl Budget Reclaimed**: ${result.projectedImpact.crawlBudgetReclaimed} estimated requests
- **Traffic Shift**: ${result.projectedImpact.trafficShift} clicks

## Action Breakdown
- Keep: ${result.actionBreakdown.keep}
- Refresh: ${result.actionBreakdown.refresh}
- Consolidate: ${result.actionBreakdown.consolidate}
- Prune: ${result.actionBreakdown.prune}
- Redirect: ${result.actionBreakdown.redirect}

## Risk Analysis
- **High Risk URLs**: ${result.riskAnalysis.highRiskUrls.length}
- **Potential Traffic Loss**: ${result.riskAnalysis.potentialLoss} clicks
- **Rollback Plan**: ${result.riskAnalysis.rollbackPlan}

${result.riskAnalysis.highRiskUrls.length > 0 ? `
## High Risk URLs
${result.riskAnalysis.highRiskUrls.map(url => `- ${url}`).join('\n')}
` : ''}
  `.trim()
}

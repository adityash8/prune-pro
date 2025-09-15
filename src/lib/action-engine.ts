import { URLMetrics, GuardFlags } from './zombie-score'

export type ActionType = 'keep' | 'refresh' | 'consolidate' | 'prune' | 'redirect'

export interface ActionDecision {
  type: ActionType
  rationale: string
  risk: number // 0-100
  confidence: number // 0-100
  targetUrl?: string // For redirects/consolidation
  refreshBrief?: string // For refresh actions
}

export interface ActionContext {
  url: string
  metrics: URLMetrics
  zombieScore: number
  guards: GuardFlags
  cannibalSimilarity: number
  clusterId?: string
  canonicalUrl?: string
  similarUrls?: Array<{
    url: string
    similarity: number
    metrics: URLMetrics
  }>
}

export function decideAction(context: ActionContext): ActionDecision {
  const { metrics, zombieScore, guards, cannibalSimilarity, similarUrls } = context

  // Safety guards - never prune high-value content
  if (guards.hasBacklinks || guards.hasConversions || guards.hasPage1Ranking) {
    return {
      type: 'keep',
      rationale: 'High-value content with backlinks, conversions, or Page 1 rankings',
      risk: 5,
      confidence: 95
    }
  }

  // Cannibalization detection
  if (cannibalSimilarity > 0.85 && similarUrls && similarUrls.length > 0) {
    const bestUrl = findBestCanonical(similarUrls)
    if (bestUrl.url !== context.url) {
      return {
        type: 'consolidate',
        rationale: `High cannibalization similarity (${Math.round(cannibalSimilarity * 100)}%) with better performing content`,
        risk: 15,
        confidence: 85,
        targetUrl: bestUrl.url
      }
    }
  }

  // Refresh opportunity - content with potential but declining
  if (zombieScore > 40 && zombieScore < 70 && 
      (metrics.clicks > 10 || metrics.impressions > 500) &&
      metrics.age_months > 6) {
    return {
      type: 'refresh',
      rationale: 'Content shows decline but has historical value - good candidate for refresh',
      risk: 20,
      confidence: 75,
      refreshBrief: generateRefreshBrief(metrics, context.url)
    }
  }

  // Redirect opportunity - thin content with related target
  if (zombieScore > 60 && metrics.clicks < 5 && 
      metrics.impressions < 200 && !guards.hasBacklinks) {
    const redirectTarget = findRedirectTarget(context.url)
    if (redirectTarget) {
      return {
        type: 'redirect',
        rationale: 'Thin content with low value - redirect to relevant parent/category',
        risk: 25,
        confidence: 70,
        targetUrl: redirectTarget
      }
    }
  }

  // Prune decision - very low value content
  if (zombieScore > 75 && 
      metrics.clicks < 2 && 
      metrics.impressions < 100 && 
      !guards.hasBacklinks && 
      !guards.hasConversions) {
    return {
      type: 'prune',
      rationale: 'Very low value content with no traffic, backlinks, or conversions',
      risk: 30,
      confidence: 80
    }
  }

  // Default to keep
  return {
    type: 'keep',
    rationale: 'Content meets minimum value thresholds',
    risk: 10,
    confidence: 60
  }
}

function findBestCanonical(similarUrls: Array<{ url: string; similarity: number; metrics: URLMetrics }>): { url: string; metrics: URLMetrics } {
  return similarUrls.reduce((best, current) => {
    const currentScore = calculateCanonicalScore(current.metrics)
    const bestScore = calculateCanonicalScore(best.metrics)
    return currentScore > bestScore ? current : best
  })
}

function calculateCanonicalScore(metrics: URLMetrics): number {
  let score = 0
  
  // Traffic weight
  score += metrics.clicks * 2
  score += metrics.impressions * 0.1
  
  // Ranking weight
  if (metrics.position > 0) {
    score += (21 - metrics.position) * 5 // Higher positions get more points
  }
  
  // Engagement weight
  score += metrics.conversions * 50
  score += metrics.backlinks * 10
  
  // CTR bonus
  score += metrics.ctr * 1000
  
  return score
}

function generateRefreshBrief(metrics: URLMetrics, url: string): string {
  const issues = []
  
  if (metrics.position > 20) issues.push('poor rankings')
  if (metrics.ctr < 0.02) issues.push('low click-through rate')
  if (metrics.clicks < 20) issues.push('declining traffic')
  if (metrics.age_months > 12) issues.push('outdated content')
  
  const urlPath = new URL(url).pathname
  const topic = urlPath.split('/').pop()?.replace(/-/g, ' ') || 'content'
  
  return `Refresh ${topic} content addressing: ${issues.join(', ')}. Focus on improving topical authority and user engagement.`
}

function findRedirectTarget(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/').filter(Boolean)
    
    // Remove last segment to get parent
    if (pathSegments.length > 1) {
      pathSegments.pop()
      return `${urlObj.origin}/${pathSegments.join('/')}/`
    }
    
    // Fallback to root
    return `${urlObj.origin}/`
  } catch {
    return null
  }
}

export function getActionColor(type: ActionType): string {
  switch (type) {
    case 'keep': return 'text-green-600 bg-green-50'
    case 'refresh': return 'text-blue-600 bg-blue-50'
    case 'consolidate': return 'text-purple-600 bg-purple-50'
    case 'prune': return 'text-red-600 bg-red-50'
    case 'redirect': return 'text-orange-600 bg-orange-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getActionIcon(type: ActionType): string {
  switch (type) {
    case 'keep': return '✓'
    case 'refresh': return '🔄'
    case 'consolidate': return '🔗'
    case 'prune': return '🗑️'
    case 'redirect': return '↗️'
    default: return '?'
  }
}

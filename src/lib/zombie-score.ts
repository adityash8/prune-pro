export interface URLMetrics {
  clicks: number
  impressions: number
  position: number
  ctr: number
  sessions?: number
  bounce_rate?: number
  avg_time_on_page?: number
  conversions: number
  backlinks: number
  last_updated: Date
  age_months: number
}

export interface ZombieScoreWeights {
  trafficRisk: number
  rankRisk: number
  engagement: number
  freshness: number
  cannibal: number
  noValueSignals: number
}

export const DEFAULT_WEIGHTS: ZombieScoreWeights = {
  trafficRisk: 0.3,
  rankRisk: 0.2,
  engagement: 0.1,
  freshness: 0.15,
  cannibal: 0.15,
  noValueSignals: 0.1
}

export interface GuardFlags {
  hasBacklinks: boolean
  hasConversions: boolean
  hasPage1Ranking: boolean
  hasRecentTraffic: boolean
  isCanonical: boolean
}

export function calculateZombieScore(
  metrics: URLMetrics,
  weights: ZombieScoreWeights = DEFAULT_WEIGHTS,
  cannibalSimilarity: number = 0
): { score: number; guards: GuardFlags; breakdown: Record<string, number> } {
  const guards: GuardFlags = {
    hasBacklinks: metrics.backlinks > 0,
    hasConversions: metrics.conversions > 0,
    hasPage1Ranking: metrics.position > 0 && metrics.position <= 10,
    hasRecentTraffic: metrics.clicks > 0 || metrics.impressions > 0,
    isCanonical: false // This would be set based on canonical analysis
  }

  // Traffic Risk (0-100): Low traffic + declining trend
  const trafficRisk = calculateTrafficRisk(metrics)
  
  // Rank Risk (0-100): Poor positions + low CTR
  const rankRisk = calculateRankRisk(metrics)
  
  // Engagement (0-100): Poor user signals
  const engagement = calculateEngagementRisk(metrics)
  
  // Freshness (0-100): Old content penalty
  const freshness = calculateFreshnessRisk(metrics)
  
  // Cannibal Risk (0-100): Similarity to other content
  const cannibalRisk = cannibalSimilarity * 100
  
  // No Value Signals (0-100): Zero conversions, no backlinks
  const noValueSignals = calculateNoValueRisk(metrics)

  const breakdown = {
    trafficRisk,
    rankRisk,
    engagement,
    freshness,
    cannibal: cannibalRisk,
    noValueSignals
  }

  // Calculate weighted score
  let score = 
    weights.trafficRisk * trafficRisk +
    weights.rankRisk * rankRisk +
    weights.engagement * engagement +
    weights.freshness * freshness +
    weights.cannibal * cannibalRisk +
    weights.noValueSignals * noValueSignals

  // Apply guard reductions
  if (guards.hasBacklinks) score *= 0.3 // Strong backlinks = 70% reduction
  if (guards.hasConversions) score *= 0.2 // Conversions = 80% reduction
  if (guards.hasPage1Ranking) score *= 0.1 // Page 1 = 90% reduction
  if (guards.hasRecentTraffic) score *= 0.5 // Recent traffic = 50% reduction

  return {
    score: Math.min(100, Math.max(0, score)),
    guards,
    breakdown
  }
}

function calculateTrafficRisk(metrics: URLMetrics): number {
  // High risk for very low traffic
  if (metrics.clicks === 0 && metrics.impressions < 100) return 90
  if (metrics.clicks < 5 && metrics.impressions < 500) return 70
  if (metrics.clicks < 20 && metrics.impressions < 1000) return 50
  if (metrics.clicks < 100) return 30
  return 10
}

function calculateRankRisk(metrics: URLMetrics): number {
  // High risk for poor positions
  if (metrics.position > 50) return 90
  if (metrics.position > 30) return 70
  if (metrics.position > 20) return 50
  if (metrics.position > 10) return 30
  
  // Low CTR penalty
  if (metrics.ctr < 0.01) return 80
  if (metrics.ctr < 0.02) return 60
  if (metrics.ctr < 0.05) return 40
  
  return 10
}

function calculateEngagementRisk(metrics: URLMetrics): number {
  let risk = 50 // Default moderate risk
  
  if (metrics.bounce_rate && metrics.bounce_rate > 0.8) risk += 30
  if (metrics.avg_time_on_page && metrics.avg_time_on_page < 30) risk += 20
  if (metrics.sessions && metrics.sessions < 5) risk += 20
  
  return Math.min(100, risk)
}

function calculateFreshnessRisk(metrics: URLMetrics): number {
  // Age-based penalty
  if (metrics.age_months > 24) return 80
  if (metrics.age_months > 12) return 60
  if (metrics.age_months > 6) return 40
  if (metrics.age_months > 3) return 20
  
  return 10
}

function calculateNoValueRisk(metrics: URLMetrics): number {
  let risk = 0
  
  if (metrics.conversions === 0) risk += 30
  if (metrics.backlinks === 0) risk += 20
  if (metrics.clicks === 0) risk += 30
  if (metrics.impressions < 50) risk += 20
  
  return Math.min(100, risk)
}

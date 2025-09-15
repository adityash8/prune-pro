// Simple text similarity for MVP - can be enhanced with embeddings later
export interface URLContent {
  url: string
  title: string
  content: string
  metaDescription?: string
  headings: string[]
}

export interface CannibalCluster {
  id: string
  urls: string[]
  centroid: string
  similarity: number
  canonicalUrl?: string
}

export function detectCannibalization(urls: URLContent[]): CannibalCluster[] {
  const clusters: CannibalCluster[] = []
  const processed = new Set<string>()
  
  for (let i = 0; i < urls.length; i++) {
    if (processed.has(urls[i].url)) continue
    
    const cluster: CannibalCluster = {
      id: `cluster_${clusters.length}`,
      urls: [urls[i].url],
      centroid: urls[i].url,
      similarity: 1.0
    }
    
    // Find similar URLs
    for (let j = i + 1; j < urls.length; j++) {
      if (processed.has(urls[j].url)) continue
      
      const similarity = calculateSimilarity(urls[i], urls[j])
      
      if (similarity > 0.7) { // Threshold for cannibalization
        cluster.urls.push(urls[j].url)
        processed.add(urls[j].url)
      }
    }
    
    if (cluster.urls.length > 1) {
      // Find canonical URL (best performing)
      cluster.canonicalUrl = findCanonicalUrl(cluster.urls)
      clusters.push(cluster)
    }
    
    processed.add(urls[i].url)
  }
  
  return clusters
}

function calculateSimilarity(url1: URLContent, url2: URLContent): number {
  const titleSim = calculateTextSimilarity(url1.title, url2.title)
  const contentSim = calculateTextSimilarity(url1.content, url2.content)
  const headingSim = calculateArraySimilarity(url1.headings, url2.headings)
  const urlSim = calculateUrlSimilarity(url1.url, url2.url)
  
  // Weighted similarity
  return (
    titleSim * 0.3 +
    contentSim * 0.4 +
    headingSim * 0.2 +
    urlSim * 0.1
  )
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

function calculateArraySimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1
  if (arr1.length === 0 || arr2.length === 0) return 0
  
  const set1 = new Set(arr1.map(h => h.toLowerCase()))
  const set2 = new Set(arr2.map(h => h.toLowerCase()))
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

function calculateUrlSimilarity(url1: string, url2: string): number {
  try {
    const path1 = new URL(url1).pathname.split('/').filter(Boolean)
    const path2 = new URL(url2).pathname.split('/').filter(Boolean)
    
    if (path1.length === 0 && path2.length === 0) return 1
    if (path1.length === 0 || path2.length === 0) return 0
    
    const set1 = new Set(path1)
    const set2 = new Set(path2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  } catch {
    return 0
  }
}

function findCanonicalUrl(urls: string[]): string {
  // Simple heuristic - prefer shorter, more specific URLs
  return urls.reduce((canonical, current) => {
    const currentPath = new URL(current).pathname
    const canonicalPath = new URL(canonical).pathname
    
    // Prefer shorter paths (more specific)
    if (currentPath.length < canonicalPath.length) return current
    
    // Prefer URLs without query parameters
    if (current.includes('?') && !canonical.includes('?')) return canonical
    if (!current.includes('?') && canonical.includes('?')) return current
    
    return canonical
  })
}

export function generateCannibalReport(clusters: CannibalCluster[]): string {
  if (clusters.length === 0) {
    return "No cannibalization detected."
  }
  
  let report = `Found ${clusters.length} cannibalization clusters:\n\n`
  
  clusters.forEach((cluster, index) => {
    report += `Cluster ${index + 1}:\n`
    report += `- Canonical: ${cluster.canonicalUrl}\n`
    report += `- Redirects: ${cluster.urls.filter(url => url !== cluster.canonicalUrl).join(', ')}\n`
    report += `- URLs affected: ${cluster.urls.length}\n\n`
  })
  
  return report
}

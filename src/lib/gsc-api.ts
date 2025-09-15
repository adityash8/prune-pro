/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from 'googleapis'

export interface GSCMetrics {
  clicks: number
  impressions: number
  position: number
  ctr: number
}

export interface GSCData {
  url: string
  metrics: GSCMetrics
  date: string
}

export class GSCClient {
  private auth: any
  private searchconsole: any

  constructor(accessToken: string) {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    
    this.auth.setCredentials({ access_token: accessToken })
    this.searchconsole = google.searchconsole({ version: 'v1', auth: this.auth })
  }

  async getSites(): Promise<string[]> {
    try {
      const response = await this.searchconsole.sites.list()
      return response.data.siteEntry?.map((site: any) => site.siteUrl) || []
    } catch (error) {
      console.error('Error fetching GSC sites:', error)
      throw new Error('Failed to fetch GSC sites')
    }
  }

  async getSearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string,
    maxRows: number = 25000
  ): Promise<GSCData[]> {
    try {
      const response = await this.searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: maxRows,
          startRow: 0
        }
      })

      const rows = response.data.rows || []
      
      return rows.map((row: any) => ({
        url: row.keys[0],
        metrics: {
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          position: row.position || 0,
          ctr: row.ctr || 0
        },
        date: endDate
      }))
    } catch (error) {
      console.error('Error fetching GSC analytics:', error)
      throw new Error('Failed to fetch GSC analytics')
    }
  }

  async getSearchAnalyticsWithQueries(
    siteUrl: string,
    startDate: string,
    endDate: string,
    maxRows: number = 10000
  ): Promise<Array<GSCData & { query: string }>> {
    try {
      const response = await this.searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['page', 'query'],
          rowLimit: maxRows,
          startRow: 0
        }
      })

      const rows = response.data.rows || []
      
      return rows.map((row: any) => ({
        url: row.keys[0],
        query: row.keys[1],
        metrics: {
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          position: row.position || 0,
          ctr: row.ctr || 0
        },
        date: endDate
      }))
    } catch (error) {
      console.error('Error fetching GSC analytics with queries:', error)
      throw new Error('Failed to fetch GSC analytics with queries')
    }
  }

  async getSitemaps(siteUrl: string): Promise<unknown[]> {
    try {
      const response = await this.searchconsole.sitemaps.list({
        siteUrl
      })
      return response.data.sitemap || []
    } catch (error) {
      console.error('Error fetching sitemaps:', error)
      return []
    }
  }

  async getUrlInspection(url: string, siteUrl: string): Promise<unknown> {
    try {
      const response = await this.searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl
        }
      })
      return response.data
    } catch (error) {
      console.error('Error inspecting URL:', error)
      return null
    }
  }
}

export function getDateRange(days: number = 90): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

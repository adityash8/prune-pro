# PrunePro - Content Pruning Agent

> "Remove zombie pages before they drain your rankings."

PrunePro is an automated content pruning agent that detects low-value pages, surfaces cannibalization, and recommends safe actions with simulation mode and one-click fixes.

## 🚀 Features

- **ZombieScore™ Algorithm**: Weighted scoring system to identify low-value content
- **Action Engine**: Intelligent recommendations (Keep/Refresh/Consolidate/Prune/Redirect)
- **Safety Rails**: Link equity & ranking guards to prevent mistakes
- **Simulation Mode**: Preview impact before applying changes
- **CMS Integration**: WordPress plugin and Webflow API support
- **Rollback System**: One-click undo with audit trail

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Postgres, Storage, RLS)
- **APIs**: Google Search Console, GA4
- **AI**: Claude 3.5 for tie-breaks, embeddings for clustering
- **CMS**: WordPress plugin, Webflow API
- **Monitoring**: PostHog, Sentry

### Core Components

1. **ZombieScore Calculator** (`src/lib/zombie-score.ts`)
   - Traffic risk analysis
   - Ranking performance evaluation
   - Engagement metrics
   - Freshness scoring
   - Cannibalization detection

2. **Action Engine** (`src/lib/action-engine.ts`)
   - Deterministic decision logic
   - Safety guard implementation
   - Canonical URL selection
   - Risk assessment

3. **GSC Integration** (`src/lib/gsc-api.ts`)
   - OAuth authentication
   - Search analytics data fetching
   - Query-level analysis
   - Sitemap integration

4. **Simulation System** (`src/lib/simulation.ts`)
   - Impact projection
   - Risk analysis
   - Rollback planning
   - Performance metrics

## 📊 Database Schema

```sql
-- Core tables
sites (id, domain, plan, settings, user_id)
urls (id, site_id, url, status, backlinks, conversions)
metrics (id, url_id, day, clicks, impressions, position, ctr)
actions (id, url_id, type, rationale, risk, status)
clusters (id, site_id, label, centroid_vector)
changes (id, action_id, applied_at, rollback_token, diff)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Google Cloud Console project with Search Console API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/prune-pro.git
   cd prune-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase and Google API credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Set up Supabase**
   ```bash
   # Run the migration
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### WordPress Plugin Installation

1. Upload the `wordpress-plugin` folder to `/wp-content/plugins/`
2. Activate the plugin in WordPress admin
3. Configure your PrunePro API key in Settings
4. Connect your site to PrunePro dashboard

## 🎯 Usage

### 1. Connect Google Search Console
- Navigate to `/auth`
- Authorize PrunePro to access your GSC data
- Select your property

### 2. Run Analysis
- PrunePro fetches 90 days of search data
- Calculates ZombieScore for each URL
- Detects cannibalization clusters
- Generates action recommendations

### 3. Review Actions
- Filter by action type (Keep/Refresh/Consolidate/Prune/Redirect)
- Review rationale and risk scores
- Select actions to approve

### 4. Simulate Impact
- Preview projected outcomes
- Review risk analysis
- Check rollback plan

### 5. Apply Changes
- Bulk apply approved actions
- Monitor implementation
- Use rollback if needed

## 🔧 Configuration

### ZombieScore Weights
Customize the scoring algorithm in `src/lib/zombie-score.ts`:

```typescript
const CUSTOM_WEIGHTS = {
  trafficRisk: 0.4,    // Higher weight for traffic analysis
  rankRisk: 0.2,
  engagement: 0.1,
  freshness: 0.15,
  cannibal: 0.1,
  noValueSignals: 0.05
}
```

### Safety Guards
Modify guard thresholds in the Action Engine:

```typescript
// Never prune if:
- backlinks > 5
- conversions > 0
- position <= 10
- recent traffic > 50 clicks
```

## 📈 Pricing Tiers

- **Free**: 50 URLs, simulation only
- **Starter $49/mo**: 5k URLs, WP plugin, CSV export
- **Pro $99/mo**: 50k URLs, Webflow integration, Slack alerts
- **Agency $299/mo**: 500k URLs, white-label, API access

## 🛡️ Safety Features

1. **Guard Rails**: Never prune high-value content
2. **Simulation Mode**: Preview before applying
3. **Rollback System**: One-click undo
4. **Audit Trail**: Complete change history
5. **Risk Scoring**: Quantified risk assessment

## 🔄 Integration Ecosystem

- **Content Phoenix**: Handles refresh actions
- **RankForge**: Creates new content
- **CrawlSmith**: Full site crawling
- **Edge SEO**: Cloudflare/Vercel middleware

## 📊 Success Metrics

- **Index Bloat Reduction**: Target 20%+ reduction
- **Traffic Lift**: 10%+ improvement on consolidated clusters
- **False Positive Rate**: <3% rollback rate
- **Time to Action**: <1 day from scan to approval

## 🚧 Roadmap

### MVP (Weeks 1-4) ✅
- [x] GSC OAuth integration
- [x] ZombieScore calculation
- [x] Action Engine v1
- [x] Simulation mode
- [x] WordPress plugin
- [x] CSV export

### Phase 2 (Weeks 5-8)
- [ ] Webflow integration
- [ ] Slack alerts
- [ ] White-label PDF reports
- [ ] Enhanced cannibal detection
- [ ] Edge SEO mode

### Phase 3 (Weeks 9-12)
- [ ] API access
- [ ] Multi-site workspaces
- [ ] Backlink integration (Ahrefs/SEMrush)
- [ ] Lift attribution model

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.prunepro.com](https://docs.prunepro.com)
- **Community**: [Discord](https://discord.gg/prunepro)
- **Email**: support@prunepro.com

## 🙏 Acknowledgments

- Google Search Console API
- Supabase team
- OpenAI for embeddings
- The SEO community for feedback

---

Built with ❤️ by [EZ MONEY Pte. Ltd.](https://ezmoney.com)
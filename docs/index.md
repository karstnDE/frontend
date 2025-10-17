# DefiTuna Analytics Platform

<div class="hero-banner" data-animate>
  <div class="hero-banner__content">
    <div class="hero-badges">
      <span class="hero-badge">Treasury Intelligence</span>
      <span class="hero-badge">Live Solana Data</span>
    </div>
    <h1>Transparent analytics for the DefiTuna treasury.</h1>
    <p>
      Monitor inflows, classify on-chain activity, and publish interactive dashboards with a single pipeline.
      This documentation is your launch pad for automation, audits, and stakeholder updates.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="interactive/">Explore dashboards</a>
      <a class="btn-secondary" href="defituna/overview/">Understand the methodology</a>
    </div>
  </div>
</div>

<div class="card-section" data-animate>
  <h2>Start here</h2>
  <p>Choose an entry point based on what you need to accomplish today.</p>

  <div class="section-grid">
    <div class="section-card" data-animate>
      <h3><span class="icon">??</span> Ship the latest dashboard</h3>
      <p>Run the private pipeline, sync the generated bundle into <code>docs/analytics/</code>, and publish with <code>mkdocs gh-deploy</code>.</p>
      <ul>
        <li>Review <code>docs/data/_manifest.json</code> for timestamps.</li>
        <li>Use the Quick Publish script or GitHub Action.</li>
      </ul>
    </div>
    <div class="section-card" data-animate>
      <h3><span class="icon">???</span> Investigate treasury flows</h3>
      <p>Jump into the interactive charts to compare token vs. type outcomes, filter ranges, and trace high impact transactions.</p>
      <ul>
        <li>Interactive filtering and drilldowns.</li>
        <li>Direct Solscan links for transaction-level follow up.</li>
      </ul>
    </div>
    <div class="section-card" data-animate>
      <h3><span class="icon">??</span> Extend the toolkit</h3>
      <p>Borrow scripts and patterns from the main analytics repository. Keep imports pointed at the packaged <code>solana_analytics</code> modules.</p>
      <ul>
        <li>CLI utilities for data fetch &amp; classification.</li>
        <li>Guidance for new dashboards and runbooks.</li>
      </ul>
    </div>
  </div>
</div>

<div class="card-section" data-animate>
  <h2>Operational checklist</h2>
  <div class="section-grid">
    <div class="section-card" data-animate>
      <h3><span class="icon">??</span> Daily publish</h3>
      <p>Confirm cache freshness, run the attribution job, sync the <code>site/</code> export, and push to <code>main</code>.</p>
      <p><strong>Tip:</strong> update <code>docs/data/_manifest.json</code> so the dashboard shows "last updated".</p>
    </div>
    <div class="section-card" data-animate>
      <h3><span class="icon">??</span> QA workflows</h3>
      <p>Use fixture-driven regression checks in <code>tests/fixtures/</code> or launch the debug notebooks in <code>supporting_analyses/</code>.</p>
    </div>
    <div class="section-card" data-animate>
      <h3><span class="icon">??</span> Share insights</h3>
      <p>Embed dashboard slices in investor updates or docs by linking to <code>/interactive/</code> sections with anchors.</p>
    </div>
  </div>
</div>

<div class="card-section" data-animate>
  <h2>Why this pipeline?</h2>
  <blockquote class="testimonial">"The DefiTuna treasury reports transformed our stakeholder calls. Being able to drill into hot wallets and protocol splits with a single URL is a game changer."</blockquote>
  <p>Add your own internal testimonials or wins here to keep the team aligned on impact.</p>
</div>

<div class="callout-slab" data-animate>
  <h2>Need help or want to contribute?</h2>
  <p>Open an issue in the analytics repo or tag the data platform channel. We welcome suggestions for new dashboards, runbooks, or automation hooks.</p>
  <div class="callout-actions">
    <a class="btn-primary" href="https://github.com/defituna/analytics/issues">Request a feature</a>
    <a class="btn-secondary" href="mailto:data@defituna.com">Contact the data team</a>
  </div>
</div>

import re

js_path = 'agri-connect/frontend/js/net_profit.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

pattern = re.compile(r'function renderOptimizationResults\(data\) \{.*?\n\}\n\n// Gate Pass Booking QR Generator Modal', re.DOTALL)

new_render_func = """function renderOptimizationResults(data) {
  const rankings = data.rankings;
  if (!rankings || rankings.length === 0) return;

  const resultsContainer = document.getElementById('mandi-comparison-tbody');
  if (resultsContainer) {
    resultsContainer.innerHTML = rankings.map((r, idx) => {
      const isOptimal = r.is_optimal_net;
      
      return `
        <div class="mandi-card ${isOptimal ? 'optimal' : ''}">
          <div class="mc-rank">${idx + 1}</div>
          <div>
            <div class="mc-name">${r.mandi_name} ${isOptimal ? '<span style="font-size: 0.75rem; background: var(--farmer-forest); color: #fff; padding: 2px 6px; border-radius: 4px; margin-left: 8px; vertical-align: middle;">OPTIMAL</span>' : ''}</div>
            <div class="mc-dist"><i class="ph ph-map-pin"></i> ${r.distance_km} km (${r.est_transit_hours} hrs) | ${r.district}, ${r.state}</div>
          </div>
          <div>
            <div class="mc-metric-label">Gross Listed</div>
            <div style="font-size: 1.1rem; font-weight: 600;">₹${r.modal_price.toLocaleString()}</div>
            <div style="font-size: 0.8rem; color: var(--danger);">-${r.deductions.total.toLocaleString()} freight/cess</div>
          </div>
          <div style="text-align: right;">
            <div class="mc-metric-label">True Net Profit</div>
            <div class="mc-net-profit">₹${r.net_profit.toLocaleString()}</div>
            <button class="farmer-btn" style="padding: 8px 12px; font-size: 0.75rem; margin-top: 8px;" onclick="bookGatePass('${r.mandi_id}', '${r.mandi_name}', ${r.net_profit}, ${r.quantity_qtl})">Book Token</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Gate Pass Booking QR Generator Modal"""

new_js = pattern.sub(new_render_func, js_content)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(new_js)

print('net_profit.js updated.')

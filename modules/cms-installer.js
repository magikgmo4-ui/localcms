/* ═══════════════════════════════════════════════════════════════════════════
   modules/cms-installer.js — CMS Module Installer V1
   Installateur de bundles standardisés depuis /shared/install-queue/
   Pipeline : Scan → Inspect → Precheck → Backup → Staging → Validate
              → Install → Post-check → Finalize

   Règles :
   - Séparé de MOD_INSTALLER (legacy registre interne) — aucune collision
   - Pattern IIFE, BUS.emit, FN.html — conforme aux modules LocalCMS
   - Aucun shell libre, aucune écriture hors pipeline installateur
   - Precheck affiché avant tout bouton Install actif

   Intégration via PATCH_LOCALCMS_V5_M2.txt (3 insertions).
   ═══════════════════════════════════════════════════════════════════════════ */

const MOD_CMS_INSTALLER = (() => {

  const API = '/api/installer';

  /* ── State ────────────────────────────────────────────────────── */
  let bundles        = [];     // résultat du dernier scan
  let selectedBundle = null;   // nom du bundle inspecté
  let manifest       = null;   // manifeste + résultat precheck
  let pipelineState  = null;   // résultat du dernier install
  let installing     = false;  // guard anti double-clic
  let activeTab      = 'queue';

  /* ── Render principal ─────────────────────────────────────────── */

  const render = () => {
    FN.html('cms-installer-content', `
      <div class="c-editor-toolbar"
           style="margin-bottom:12px;border-radius:var(--radius);border:1px solid var(--border)">
        ${_renderTabs()}
      </div>
      ${activeTab === 'queue' ? _renderQueue() : _renderHistory()}
    `);
  };

  const _renderTabs = () =>
    [['queue', '📦 File d\'installation'], ['history', '📋 Historique']].map(([id, label]) =>
      `<div class="c-editor-tab ${id === activeTab ? 'is-active' : ''}"
            onclick="MOD_CMS_INSTALLER.setTab('${id}')">${label}</div>`
    ).join('');

  /* ── Onglet Queue ─────────────────────────────────────────────── */

  const _renderQueue = () => `
    <div class="c-card" style="margin-bottom:12px">
      <div class="c-section" style="margin-top:0;margin-bottom:10px">
        <span class="c-section__title">📦 File d'installation — /shared/install-queue/</span>
      </div>
      <button class="c-btn c-btn--primary" onclick="MOD_CMS_INSTALLER.scan()">
        🔍 Scanner la file
      </button>
      <div id="cms-installer-bundles" style="margin-top:12px">
        ${_renderBundleList()}
      </div>
    </div>
    ${manifest ? _renderManifestPanel() : ''}
    ${pipelineState ? _renderPipeline() : ''}
  `;

  const _renderBundleList = () => {
    if (!bundles.length) {
      return `<div class="u-muted" style="font-size:12px">
        Aucun bundle disponible. Cliquer sur Scanner pour lister /shared/install-queue/.
      </div>`;
    }
    return `
      <div class="c-table-wrap"><table class="c-table">
        <thead><tr><th>Bundle</th><th>Taille</th><th>Modifié</th><th>Actions</th></tr></thead>
        <tbody>
          ${bundles.map(b => `
            <tr style="${selectedBundle === b.filename ? 'background:var(--bg-2)' : ''}">
              <td class="u-mono" style="font-size:11px">${_esc(b.filename)}</td>
              <td style="font-size:11px;color:var(--text-2)">${_size(b.size)}</td>
              <td style="font-size:10px;color:var(--text-2)">${b.modified ? b.modified.slice(0,19).replace('T',' ') : '—'}</td>
              <td style="display:flex;gap:6px;align-items:center">
                <button class="c-btn c-btn--icon"
                        onclick="MOD_CMS_INSTALLER.inspect('${_esc(b.filename)}')">
                  🔍 Inspecter
                </button>
                <button class="c-btn c-btn--run"
                        onclick="MOD_CMS_INSTALLER.installBundle('${_esc(b.filename)}')"
                        ${installing ? 'disabled' : ''}>
                  ⬇ Installer
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table></div>`;
  };

  /* ── Panneau manifeste + precheck ─────────────────────────────── */

  const _renderManifestPanel = () => {
    if (!manifest) return '';
    const m      = manifest;
    const errors = m._precheck_errors || [];
    const ok     = !errors.length;
    const accent = ok ? 'var(--green)' : 'var(--red)';
    return `
      <div class="c-card" style="margin-bottom:12px;border-left:3px solid ${accent}">
        <div class="c-section" style="margin-top:0;margin-bottom:10px;display:flex;align-items:center;gap:8px">
          <span class="c-section__title">📄 Manifeste — ${_esc(selectedBundle)}</span>
          ${ok
            ? `<span class="c-badge c-badge--online">✓ Precheck OK</span>`
            : `<span class="c-badge" style="background:var(--red);color:#fff">${errors.length} erreur(s) precheck</span>`
          }
        </div>
        <div class="l-grid-2" style="gap:8px;font-size:12px;margin-bottom:${errors.length ? '12px' : '0'}">
          ${_mRow('ID',          m.id)}
          ${_mRow('Nom',         m.name)}
          ${_mRow('Version',     m.version)}
          ${_mRow('Groupe',      m.group)}
          ${_mRow('Target key',  m.target_key)}
          ${_mRow('Description', m.description)}
          ${_mRow('Fichiers',    (m.files || []).map(f => `${f.src} → ${f.dest}`).join(' · '))}
          ${m.sanity_check ? _mRow('Sanity check', m.sanity_check + '()') : ''}
        </div>
        ${errors.length ? `
          <div style="padding:8px;background:var(--bg-2);border-radius:var(--radius);border-left:3px solid var(--red)">
            <div style="font-size:11px;font-weight:600;color:var(--red);margin-bottom:6px">Erreurs Precheck</div>
            ${errors.map(e => `<div class="u-mono" style="font-size:10px;color:var(--text-2);margin-bottom:3px">• ${_esc(e)}</div>`).join('')}
          </div>` : ''}
      </div>`;
  };

  const _mRow = (label, value) => `
    <div>
      <div style="color:var(--text-2);font-size:10px;margin-bottom:2px">${label}</div>
      <div class="u-mono" style="font-size:11px">${value != null ? _esc(String(value)) : '—'}</div>
    </div>`;

  /* ── Pipeline display ─────────────────────────────────────────── */

  const PIPELINE_ORDER  = ['precheck','backup','staging','validate','install','post_check','finalize','rollback'];
  const PIPELINE_LABELS = {
    precheck:'Precheck', backup:'Backup', staging:'Staging',
    validate:'Validate', install:'Install', post_check:'Post-check',
    finalize:'Finalize', rollback:'Rollback',
  };
  const STEP_ICON = { ok:'✓', failed:'✕', skipped:'⊘', running:'⟳', pending:'○' };
  const STEP_COL  = {
    ok:'var(--green)', failed:'var(--red)',
    skipped:'var(--text-2)', running:'var(--accent)', pending:'var(--border)',
  };

  const _renderPipeline = () => {
    if (!pipelineState) return '';
    const { steps, result, error, sanity_check } = pipelineState;
    const stepsToShow = PIPELINE_ORDER.filter(s => s in steps || (s !== 'rollback'));
    const resultColor = result === 'ok' ? 'var(--green)' : result === 'rollback' ? 'var(--yellow)' : 'var(--red)';
    const resultLabel = result === 'ok' ? '✓ Installation réussie' : result === 'rollback' ? '⚠ Rollback effectué' : `✕ Échec — ${error || ''}`;
    return `
      <div class="c-card">
        <div class="c-section" style="margin-top:0;margin-bottom:12px">
          <span class="c-section__title">⚙ Pipeline — ${_esc(pipelineState.bundle || '')}</span>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
          ${stepsToShow.filter(s => s in steps).map((s, i, arr) => {
            const st  = (steps[s] || {}).status || 'pending';
            const col = STEP_COL[st] || STEP_COL.pending;
            return `
              ${i > 0 ? `<span style="color:var(--text-2);font-size:10px">→</span>` : ''}
              <div style="display:flex;align-items:center;gap:4px;padding:4px 10px;
                           border-radius:var(--radius);border:1px solid ${col};font-size:11px">
                <span style="color:${col}">${STEP_ICON[st] || '○'}</span>
                <span>${PIPELINE_LABELS[s] || s}</span>
                ${(steps[s] || {}).error
                  ? `<span class="u-mono" style="font-size:9px;color:var(--red);margin-left:4px" title="${_esc((steps[s]||{}).error||'')}">!</span>`
                  : ''}
              </div>`;
          }).join('')}
        </div>
        <div style="padding:8px 12px;border-radius:var(--radius);border-left:3px solid ${resultColor};background:var(--bg-2)">
          <span style="font-size:12px;font-weight:600;color:${resultColor}">${resultLabel}</span>
          ${result === 'ok' && sanity_check
            ? `<div style="font-size:10px;color:var(--text-2);margin-top:4px">
                 Post-check : <span class="u-mono">${_esc(sanity_check)}()</span> — signal BUS émis
               </div>`
            : ''}
        </div>
      </div>`;
  };

  /* ── Onglet Historique ────────────────────────────────────────── */

  const _renderHistory = () => `
    <div class="c-card">
      <div class="c-section" style="margin-top:0;margin-bottom:10px">
        <span class="c-section__title">📋 Historique des installations</span>
      </div>
      <button class="c-btn" onclick="MOD_CMS_INSTALLER.loadHistory()" style="margin-bottom:12px">
        🔄 Actualiser
      </button>
      <div id="cms-installer-history">
        <div class="u-muted" style="font-size:12px">Cliquer sur Actualiser.</div>
      </div>
    </div>`;

  /* ── Actions publiques ────────────────────────────────────────── */

  const setTab = (t) => { activeTab = t; render(); };

  const scan = async () => {
    BUS.emit('log:add', 'INFO', 'CMS Installer : scan /shared/install-queue/');
    try {
      const res = await fetch(`${API}/scan`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      bundles        = data.bundles || [];
      manifest       = null;
      selectedBundle = null;
      pipelineState  = null;
      BUS.emit('log:add', 'OK', `CMS Installer : ${bundles.length} bundle(s) trouvé(s)`);
      render();
    } catch (e) {
      BUS.emit('log:add', 'ERR', `CMS Installer scan : ${e.message}`);
      FN.html('cms-installer-bundles',
        `<span class="u-err">Erreur scan : ${_esc(e.message)}</span>`);
    }
  };

  const inspect = async (filename) => {
    selectedBundle = filename;
    manifest       = null;
    pipelineState  = null;
    BUS.emit('log:add', 'INFO', `CMS Installer : inspect ${filename}`);
    render();
    try {
      const [inspRes, preRes] = await Promise.all([
        fetch(`${API}/inspect?bundle=${encodeURIComponent(filename)}`),
        fetch(`${API}/precheck`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bundle: filename }),
        }),
      ]);
      if (!inspRes.ok) throw new Error(`Inspect HTTP ${inspRes.status}`);
      const inspData = await inspRes.json();
      const preData  = preRes.ok ? await preRes.json() : { errors: [], result: 'failed' };
      manifest = { ...inspData.manifest, _precheck_errors: preData.errors || [] };
      const pcOk = preData.result === 'ok';
      BUS.emit('log:add', pcOk ? 'OK' : 'WARN',
        `CMS Installer : inspect ${filename} — precheck ${preData.result}`);
      render();
    } catch (e) {
      BUS.emit('log:add', 'ERR', `CMS Installer inspect : ${e.message}`);
      manifest = null;
      render();
    }
  };

  const installBundle = async (filename) => {
    if (installing) return;
    if (!confirm(`Installer le bundle "${filename}" ?\n\nCette action copie des fichiers vers la destination autorisée.\nUn backup sera créé si des fichiers existants sont écrasés.`)) return;
    installing     = true;
    selectedBundle = filename;
    pipelineState  = { bundle: filename, steps: { precheck: { status: 'running' } }, result: null };
    BUS.emit('log:add', 'INFO', `CMS Installer : install ${filename}`);
    render();
    try {
      const res = await fetch(`${API}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundle: filename }),
      });
      if (!res.ok && res.status !== 422) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      pipelineState = {
        bundle:       filename,
        steps:        data.steps || {},
        result:       data.result,
        error:        data.error,
        sanity_check: data.sanity_check,
      };
      if (data.result === 'ok') {
        BUS.emit('log:add', 'OK', `CMS Installer : ${filename} installé`);
        if (data.sanity_check) {
          BUS.emit('installer:sanity', data.module_id);
        }
      } else {
        BUS.emit('log:add', 'ERR',
          `CMS Installer : ${data.result} — ${data.error || ''}`);
      }
      render();
    } catch (e) {
      BUS.emit('log:add', 'ERR', `CMS Installer install : ${e.message}`);
      pipelineState = {
        bundle: filename,
        steps:  {},
        result: 'failed',
        error:  e.message,
      };
      render();
    } finally {
      installing = false;
    }
  };

  const loadHistory = async () => {
    FN.html('cms-installer-history',
      `<div class="u-muted" style="font-size:12px">Chargement…</div>`);
    try {
      const res = await fetch(`${API}/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const logs = data.logs || [];
      if (!logs.length) {
        FN.html('cms-installer-history',
          `<div class="u-muted" style="font-size:12px">Aucun historique disponible.</div>`);
        return;
      }
      const resultColor = (r) =>
        r === 'ok' ? 'var(--green)' : r === 'rollback' ? 'var(--yellow)' : 'var(--red)';
      const rows = logs.map(l => `
        <tr>
          <td style="font-size:10px;color:var(--text-2)">${l.timestamp ? l.timestamp.slice(0,19).replace('T',' ') : '—'}</td>
          <td class="u-mono" style="font-size:10px">${_esc(l.bundle || '—')}</td>
          <td class="u-mono" style="font-size:10px">${_esc(l.module_id || '—')}</td>
          <td style="font-size:10px">${_esc(l.pipeline_step || '—')}</td>
          <td><span style="color:${resultColor(l.result)};font-size:11px;font-weight:600">${_esc(l.result || '—')}</span></td>
          <td style="font-size:10px;color:var(--text-2)">${l.error ? _esc(l.error) : ''}</td>
        </tr>`).join('');
      FN.html('cms-installer-history', `
        <div class="c-table-wrap"><table class="c-table">
          <thead>
            <tr>
              <th>Timestamp</th><th>Bundle</th><th>Module ID</th>
              <th>Étape</th><th>Résultat</th><th>Erreur</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table></div>`);
    } catch (e) {
      FN.html('cms-installer-history',
        `<span class="u-err">Erreur : ${_esc(e.message)}</span>`);
    }
  };

  /* ── Helpers privés ───────────────────────────────────────────── */

  const _size = (bytes) => {
    if (bytes == null) return '—';
    if (bytes < 1024)    return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const _esc = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  /* ── Init ─────────────────────────────────────────────────────── */

  const init = () => { render(); };

  return { init, render, setTab, scan, inspect, installBundle, loadHistory };

})();

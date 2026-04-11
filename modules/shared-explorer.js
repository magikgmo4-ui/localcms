/* ═══════════════════════════════════════════════════════════════
   modules/shared-explorer.js — MOD_SHARED_EXPLORER V1
   Explorateur /shared — lecture seule absolue
   Spec: MOD_SHARED_EXPLORER V1 LOCKED 2026-03-15

   RÈGLES INVIOLABLES :
   - aucun endpoint d'écriture
   - aucune exécution
   - aucun accès hors /shared
   - .env bloqué en preview et download
   - preview texte si <= 5 MB seulement
   - PDF = metadata + téléchargement uniquement
   - Archives = listables + téléchargeables, non extraites
   ═══════════════════════════════════════════════════════════════ */

const MOD_SHARED_EXPLORER = (() => {

  /* ─── CONSTANTS ────────────────────────────────────────── */
  const VERSION           = 'V1.0.0';
  const API_BASE          = '/api/shared';
  const MAX_PREVIEW_BYTES = 5 * 1024 * 1024; // 5 MB — décision figée

  // Whitelist par catégorie (vérification côté backend aussi — défense en profondeur)
  const WHITELIST_TEXT    = new Set(['txt','md','json','yaml','yml','log','conf','ini','toml']);
  const WHITELIST_CODE    = new Set(['py','sh','js','ts','sql','css','html']);
  const WHITELIST_IMAGE   = new Set(['jpg','jpeg','png','gif','svg','webp']);
  const WHITELIST_ARCHIVE = new Set(['zip','tar','gz']); // tar.gz géré séparément
  const WHITELIST_PDF     = new Set(['pdf']);

  // Bloqué explicitement en V1 — jamais en preview ni download
  const BLOCKED_NAMES = new Set(['.env']);

  const CATEGORY = {
    text   : { icon:'📄', label:'Texte/Config', preview:true,  download:true,  color:'var(--accent)' },
    code   : { icon:'💻', label:'Code',         preview:true,  download:true,  color:'var(--green)'  },
    image  : { icon:'🖼', label:'Image',        preview:false, download:true,  color:'var(--purple)' },
    archive: { icon:'🗜', label:'Archive',      preview:false, download:true,  color:'var(--yellow)' },
    pdf    : { icon:'📕', label:'PDF',          preview:false, download:true,  color:'var(--red)'    },
    blocked: { icon:'🔒', label:'Bloqué',       preview:false, download:false, color:'var(--red)'    },
    unknown: { icon:'❓', label:'Inconnu',      preview:false, download:false, color:'var(--text-2)' },
  };

  /* ─── STATE ─────────────────────────────────────────────── */
  let state = {
    currentPath   : '',
    entries       : [],
    selected      : null,
    preview       : null,        // { content, truncated } | { error } | null
    search        : { q:'', ext:'', from:'', to:'' },
    searchResults : null,        // null = not in search mode
    loading       : false,
    error         : null,
    logs          : [],          // ring buffer max 100
    initialized   : false,
  };

  /* ─── UTILS ─────────────────────────────────────────────── */
  const _ext = (name) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.tar.gz')) return 'tar.gz';
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const _category = (name) => {
    if (BLOCKED_NAMES.has(name.toLowerCase())) return 'blocked';
    const ext = _ext(name);
    if (WHITELIST_TEXT.has(ext))                          return 'text';
    if (WHITELIST_CODE.has(ext))                          return 'code';
    if (WHITELIST_IMAGE.has(ext))                         return 'image';
    if (WHITELIST_ARCHIVE.has(ext) || ext === 'tar.gz')   return 'archive';
    if (WHITELIST_PDF.has(ext))                           return 'pdf';
    return 'unknown';
  };

  const _canPreview  = (name, size) =>
    CATEGORY[_category(name)]?.preview === true && size <= MAX_PREVIEW_BYTES;

  const _canDownload = (name) =>
    CATEGORY[_category(name)]?.download === true;

  const _formatSize = (bytes) => {
    if (bytes == null) return '—';
    if (bytes < 1024)         return bytes + ' B';
    if (bytes < 1048576)      return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const _formatDate = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('fr-FR', {
        day:'2-digit', month:'2-digit', year:'numeric',
        hour:'2-digit', minute:'2-digit'
      });
    } catch { return ts; }
  };

  const _breadcrumbs = (path) => {
    const parts = path ? path.split('/').filter(Boolean) : [];
    return [
      { label:'/shared', path:'' },
      ...parts.map((p, i) => ({ label:p, path:parts.slice(0, i+1).join('/') }))
    ];
  };

  /* ─── LOGGING ───────────────────────────────────────────── */
  // Format: { timestamp, user_id, action, path_relative, result, error? }
  const _log = (action, path, result, error) => {
    const entry = {
      timestamp    : new Date().toISOString(),
      user_id      : 'cms_user', // bind to real session when available
      action,
      path_relative: path,
      result,
      ...(error ? { error } : {}),
    };
    state.logs.push(entry);
    if (state.logs.length > 100) state.logs.shift();
    const level = result === 'ok' ? 'OK' : (result === 'denied' || result === 'error' ? 'WARN' : 'INFO');
    BUS.emit('log:add', level,
      `[SHARED] ${action} ${path} → ${result}${error ? ' ('+error+')' : ''}`);
    return entry;
  };

  /* ─── API CALLS — GET ONLY, no mutation ─────────────────── */
  const _apiGet = async (endpoint, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = `${API_BASE}/${endpoint}${qs ? '?' + qs : ''}`;
    const resp = await fetch(url, { method:'GET', credentials:'same-origin' });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({ error:'HTTP ' + resp.status }));
      throw Object.assign(new Error(body.error || 'HTTP ' + resp.status), { status: resp.status });
    }
    return resp;
  };

  const _apiJson = async (endpoint, params = {}) => {
    const resp = await _apiGet(endpoint, params);
    return resp.json();
  };

  /* ─── ACTIONS ───────────────────────────────────────────── */

  /** Navigate to a directory path (relative to /shared root) */
  const navigate = async (path = '') => {
    state.loading     = true;
    state.error       = null;
    state.selected    = null;
    state.preview     = null;
    state.searchResults = null;
    _render();
    try {
      const data        = await _apiJson('list', { path });
      state.entries     = data.entries || [];
      state.currentPath = path;
      _log('list', path || '/', 'ok');
    } catch (e) {
      state.error = _friendlyError(e);
      _log('list', path || '/', 'error', e.message);
    } finally {
      state.loading = false;
      _render();
    }
  };

  /** Select an entry — dir = navigate, file = show detail */
  const selectEntry = async (entry) => {
    if (typeof entry === 'string') entry = JSON.parse(entry);
    if (entry.type === 'dir') { await navigate(entry.path); return; }
    state.selected = entry;
    state.preview  = null;
    _render();
    // Auto-preview for eligible files
    if (_canPreview(entry.name, entry.size)) {
      await loadPreview(entry.path);
    }
  };

  /** Load text preview for a file */
  const loadPreview = async (path) => {
    try {
      const data    = await _apiJson('read', { path });
      state.preview = { content: data.content || '', truncated: !!data.truncated };
      _log('read', path, 'ok');
    } catch (e) {
      state.preview = { error: _friendlyError(e) };
      _log('read', path, 'error', e.message);
    }
    _render();
  };

  /** Trigger file download via browser anchor */
  const downloadFile = (path, name) => {
    _log('download', path, 'ok');
    const url = `${API_BASE}/download?path=${encodeURIComponent(path)}`;
    const a   = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);
  };

  /** Copy relative or absolute path to clipboard */
  const copyPath = (type) => {
    if (!state.selected) return;
    const text = type === 'abs' ? '/shared/' + state.selected.path : state.selected.path;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    _showFlash('✓ Chemin copié');
    BUS.emit('log:add','OK','[SHARED] Chemin copié: ' + text);
  };

  /** Update search field state (does NOT auto-trigger search) */
  const setSearch = (key, value) => { state.search[key] = value; };

  /** Execute search with current state.search params */
  const doSearch = async () => {
    const { q, ext, from, to } = state.search;
    const hasAny = [q, ext, from, to].some(v => v && v.trim());
    if (!hasAny) { state.searchResults = null; _render(); return; }
    state.loading = true; state.error = null; _render();
    try {
      const params = {};
      if (q)    params.q    = q;
      if (ext)  params.ext  = ext.replace(/^\./,'');
      if (from) params.from = from;
      if (to)   params.to   = to;
      const data          = await _apiJson('search', params);
      state.searchResults = data.results || [];
      _log('search', q || '*', 'ok');
    } catch (e) {
      state.error = _friendlyError(e);
      _log('search', q || '*', 'error', e.message);
    } finally { state.loading = false; _render(); }
  };

  /** Clear search and return to directory view */
  const clearSearch = () => {
    state.search = { q:'', ext:'', from:'', to:'' };
    state.searchResults = null;
    _render();
  };

  /** Close the detail panel */
  const closeDetail = () => {
    state.selected = null;
    state.preview  = null;
    _render();
  };

  /** Return access log (for inspection/smoke test) */
  const getLogs = () => [...state.logs];

  /* ─── ERROR MESSAGES ────────────────────────────────────── */
  const _friendlyError = (e) => {
    if (e.status === 403 || e.message?.toLowerCase().includes('denied')) return 'Accès refusé';
    if (e.status === 413 || e.message?.toLowerCase().includes('too large')) return 'Fichier trop volumineux pour la preview (max 5 MB)';
    if (e.status === 404) return 'Fichier ou dossier introuvable';
    if (!navigator.onLine) return 'Hors connexion';
    return e.message || 'Erreur inattendue';
  };

  /* ─── FLASH MESSAGE ─────────────────────────────────────── */
  const _showFlash = (msg) => {
    const el = document.getElementById('sx-flash');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 1800);
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  const _render = () => FN.html('shared-explorer-content', _buildUI());

  const _buildUI = () => `
    <div id="sx-root" style="display:flex;flex-direction:column;gap:12px">

      <!-- Flash toast -->
      <div id="sx-flash" style="position:fixed;bottom:24px;right:24px;
        background:var(--green);color:var(--bg-0);padding:6px 14px;
        border-radius:var(--radius);font-family:var(--mono);font-size:11px;font-weight:500;
        opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:9999"></div>

      <!-- Toolbar: breadcrumb + search -->
      <div class="c-card" style="padding:10px 14px">
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:10px">
          <!-- Breadcrumb -->
          <div style="display:flex;align-items:center;gap:4px;flex:1;min-width:160px;
            font-family:var(--mono);font-size:11px;overflow:hidden;white-space:nowrap">
            ${_breadcrumbs(state.currentPath).map((b, i, arr) => `
              <span onclick="MOD_SHARED_EXPLORER.navigate('${b.path}')"
                style="cursor:pointer;white-space:nowrap;
                  color:${i===arr.length-1 ? 'var(--text-0)' : 'var(--accent)'};
                  ${i<arr.length-1 ? 'text-decoration:underline;text-underline-offset:2px':''}">
                ${b.label}</span>
              ${i<arr.length-1 ? '<span style="color:var(--text-3);margin:0 1px">/</span>' : ''}
            `).join('')}
          </div>
          <!-- Search bar -->
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <input id="sx-q" class="c-input" placeholder="Nom…"
              style="width:110px;padding:4px 8px;font-size:11px"
              value="${state.search.q.replace(/"/g,'&quot;')}"
              oninput="MOD_SHARED_EXPLORER.setSearch('q',this.value)"
              onkeydown="if(event.key==='Enter')MOD_SHARED_EXPLORER.doSearch()">
            <input id="sx-ext" class="c-input" placeholder=".ext"
              style="width:58px;padding:4px 8px;font-size:11px"
              value="${state.search.ext.replace(/"/g,'&quot;')}"
              oninput="MOD_SHARED_EXPLORER.setSearch('ext',this.value)"
              onkeydown="if(event.key==='Enter')MOD_SHARED_EXPLORER.doSearch()">
            <input id="sx-from" class="c-input" type="date"
              style="width:128px;padding:4px 8px;font-size:11px"
              value="${state.search.from}"
              onchange="MOD_SHARED_EXPLORER.setSearch('from',this.value)">
            <button class="c-btn" onclick="MOD_SHARED_EXPLORER.doSearch()"
              style="padding:4px 10px;font-size:11px" title="Rechercher">🔍 Chercher</button>
            ${state.searchResults !== null ? `
              <button class="c-btn" onclick="MOD_SHARED_EXPLORER.clearSearch()"
                style="padding:4px 8px;font-size:11px;color:var(--text-2)" title="Effacer recherche">✕</button>` : ''}
          </div>
        </div>
      </div>

      <!-- Error banner -->
      ${state.error ? `
        <div class="c-card" style="background:var(--red-dim);border-color:var(--red);
          padding:10px 14px;font-family:var(--mono);font-size:11.5px;color:var(--red);
          display:flex;align-items:center;gap:8px">
          <span>⚠</span> <span>${state.error}</span>
          <button onclick="MOD_SHARED_EXPLORER.clearError()"
            style="margin-left:auto;background:none;border:none;color:var(--text-2);cursor:pointer;font-size:14px">✕</button>
        </div>` : ''}

      <!-- Main content area -->
      ${state.loading
        ? `<div style="padding:32px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--text-2)">
             <span style="animation:spin 1s linear infinite;display:inline-block;margin-right:8px">⟳</span>Chargement…</div>`
        : (state.searchResults !== null ? _buildSearchResults() : _buildSplitView())
      }
    </div>`;

  /* ── Split view: file list + optional detail panel ── */
  const _buildSplitView = () => `
    <div style="display:grid;grid-template-columns:1fr ${state.selected?'min(340px,38%)':'0px'};
      gap:12px;align-items:start;transition:grid-template-columns 0.2s">
      ${_buildFileList()}
      ${state.selected ? _buildDetailPanel() : ''}
    </div>`;

  /* ── File / directory listing ── */
  const _buildFileList = () => {
    if (!state.entries.length) return `
      <div class="c-card" style="padding:40px;text-align:center;
        color:var(--text-2);font-family:var(--mono);font-size:11px">
        — Dossier vide —
      </div>`;

    const sorted = [...state.entries].sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });

    return `
      <div class="c-table-wrap" style="overflow-y:auto;max-height:640px">
        <table class="c-table" style="table-layout:fixed;width:100%">
          <thead>
            <tr>
              <th style="width:32px;padding:8px 6px 8px 12px"></th>
              <th>Nom</th>
              <th style="width:80px">Taille</th>
              <th style="width:130px">Modifié</th>
              <th style="width:72px">Type</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(e => {
              const cat      = e.type === 'dir' ? null : _category(e.name);
              const catInfo  = cat ? CATEGORY[cat] : null;
              const isSel    = state.selected?.path === e.path;
              const entryStr = JSON.stringify(e).replace(/\\/g,'\\\\').replace(/"/g,"'");
              return `
                <tr onclick='MOD_SHARED_EXPLORER.selectEntry(${JSON.stringify(JSON.stringify(e))})'
                  style="cursor:pointer;${isSel
                    ? 'background:var(--accent-glow);'
                    : ''}"
                  title="${e.name.replace(/"/g,'&quot;')}">
                  <td style="text-align:center;font-size:15px;padding:7px 6px 7px 12px;
                    border-left:2px solid ${isSel?'var(--accent)':'transparent'}">
                    ${e.type === 'dir' ? '📁' : (catInfo?.icon || '❓')}
                  </td>
                  <td style="font-family:var(--mono);font-size:11.5px;
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
                    color:${e.type==='dir'?'var(--accent)':'var(--text-0)'}">
                    ${e.name.replace(/</g,'&lt;').replace(/>/g,'&gt;')}
                  </td>
                  <td style="font-family:var(--mono);font-size:10.5px;color:var(--text-2)">
                    ${e.type === 'dir' ? '—' : _formatSize(e.size)}
                  </td>
                  <td style="font-family:var(--mono);font-size:10px;color:var(--text-2)">
                    ${_formatDate(e.mtime)}
                  </td>
                  <td>
                    <span class="c-tag" style="border-color:${catInfo?.color||'var(--border)'}">
                      ${e.type==='dir' ? 'dir' : (catInfo?.label || '?')}
                    </span>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div style="padding:6px 14px;border-top:1px solid var(--border);
          font-family:var(--mono);font-size:10px;color:var(--text-3);text-align:right">
          ${sorted.length} élément${sorted.length!==1?'s':''}
        </div>
      </div>`;
  };

  /* ── Detail panel (right side) ── */
  const _buildDetailPanel = () => {
    const e      = state.selected;
    if (!e || e.type === 'dir') return '';
    const cat     = _category(e.name);
    const info    = CATEGORY[cat];
    const tooBig  = e.size > MAX_PREVIEW_BYTES;

    return `
      <div style="display:flex;flex-direction:column;gap:10px;min-width:0">

        <!-- Metadata card -->
        <div class="c-card" style="padding:12px 14px">
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px">
            <span style="font-size:22px;flex-shrink:0">${info.icon}</span>
            <div style="min-width:0;flex:1">
              <div style="font-family:var(--mono);font-size:12px;font-weight:600;
                color:var(--text-0);word-break:break-all;line-height:1.3">
                ${e.name.replace(/</g,'&lt;')}
              </div>
              <div style="font-size:10px;color:${info.color};margin-top:2px">${info.label}</div>
            </div>
            <button onclick="MOD_SHARED_EXPLORER.closeDetail()"
              style="background:none;border:none;cursor:pointer;color:var(--text-2);
                font-size:14px;flex-shrink:0;padding:0 2px" title="Fermer">✕</button>
          </div>

          ${[
            ['Chemin',    e.path],
            ['Taille',    _formatSize(e.size)],
            ['Modifié',   _formatDate(e.mtime)],
            ['Extension', _ext(e.name) || '—'],
          ].map(([k,v]) => `
            <div style="display:flex;align-items:baseline;padding:5px 0;
              border-bottom:1px solid var(--border)">
              <span style="font-size:10px;color:var(--text-2);font-family:var(--mono);
                width:68px;flex-shrink:0">${k}</span>
              <span style="font-size:11px;font-family:var(--mono);color:var(--text-1);
                word-break:break-all">${v}</span>
            </div>`).join('')}

          <!-- Action buttons — LECTURE SEULE, aucune écriture -->
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
            <button class="c-btn c-btn--icon" onclick="MOD_SHARED_EXPLORER.copyPath('rel')"
              title="Copier chemin relatif">📋 rel</button>
            <button class="c-btn c-btn--icon" onclick="MOD_SHARED_EXPLORER.copyPath('abs')"
              title="Copier chemin absolu (/shared/…)">📋 abs</button>
            ${info.download ? `
              <button class="c-btn c-btn--icon"
                onclick="MOD_SHARED_EXPLORER.downloadFile('${e.path.replace(/'/g,"\\'")}','${e.name.replace(/'/g,"\\'")}')">
                ⬇ Télécharger</button>` : ''}
            ${info.preview && !tooBig ? `
              <button class="c-btn c-btn--icon"
                onclick="MOD_SHARED_EXPLORER.loadPreview('${e.path.replace(/'/g,"\\'")}')">
                👁 Preview</button>` : ''}
          </div>

          <!-- Info ligne pour les types non-previewables -->
          ${!info.preview || tooBig ? `
            <div style="margin-top:8px;font-size:10px;font-family:var(--mono);
              color:${tooBig ? 'var(--yellow)' : 'var(--text-2)'}">
              ${tooBig && info.preview
                ? '⚠ Fichier > 5 MB — preview non disponible'
                : cat === 'pdf'     ? 'PDF : metadata + téléchargement seulement'
                : cat === 'archive' ? 'Archive : téléchargeable, non extraite'
                : cat === 'image'   ? 'Image : téléchargement seulement'
                : cat === 'blocked' ? '🔒 Accès non autorisé (fichier bloqué)'
                : 'Type non prévisualisable — metadata seulement'}
            </div>` : ''}
        </div>

        <!-- Preview card -->
        ${state.preview ? _buildPreviewCard() : ''}
      </div>`;
  };

  /* ── Preview card ── */
  const _buildPreviewCard = () => {
    const p = state.preview;
    if (p.error) return `
      <div class="c-card" style="background:var(--red-dim);border-color:var(--red);
        padding:10px 14px;font-family:var(--mono);font-size:11px;color:var(--red)">
        ⚠ ${p.error}
      </div>`;
    return `
      <div class="c-card" style="padding:0;overflow:hidden">
        <div style="padding:5px 12px;background:var(--bg-3);border-bottom:1px solid var(--border);
          display:flex;align-items:center;gap:8px">
          <span style="font-size:10px;font-family:var(--mono);color:var(--text-2);
            text-transform:uppercase;letter-spacing:.08em">Preview</span>
          ${p.truncated
            ? `<span class="c-tag" style="color:var(--yellow);border-color:var(--yellow)">tronqué</span>`
            : `<span class="c-tag">${p.content.length} chars</span>`}
          <span style="margin-left:auto;font-size:10px;color:var(--text-3);font-family:var(--mono)">
            lecture seule</span>
        </div>
        <pre style="margin:0;padding:12px 14px;font-family:var(--mono);font-size:11px;
          line-height:1.65;color:var(--text-1);overflow:auto;max-height:380px;
          white-space:pre-wrap;word-break:break-word;background:var(--bg-0);tab-size:2"
          >${p.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
      </div>`;
  };

  /* ── Search results ── */
  const _buildSearchResults = () => {
    const results = state.searchResults;
    if (!results || !results.length) return `
      <div class="c-card" style="padding:32px;text-align:center;
        color:var(--text-2);font-family:var(--mono);font-size:11px">
        — Aucun résultat —
      </div>`;
    return `
      <div>
        <div style="font-size:10px;color:var(--text-2);font-family:var(--mono);
          margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em">
          ${results.length} résultat${results.length>1?'s':''}
        </div>
        <div class="c-table-wrap">
          <table class="c-table" style="table-layout:fixed">
            <thead>
              <tr>
                <th style="width:28px"></th>
                <th>Nom</th>
                <th>Chemin</th>
                <th style="width:80px">Taille</th>
                <th style="width:120px">Modifié</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(e => `
                <tr onclick='MOD_SHARED_EXPLORER.selectEntry(${JSON.stringify(JSON.stringify(e))})'
                  style="cursor:pointer">
                  <td style="text-align:center;font-size:14px">
                    ${CATEGORY[_category(e.name)]?.icon || '❓'}</td>
                  <td style="font-family:var(--mono);font-size:11.5px;overflow:hidden;
                    text-overflow:ellipsis;white-space:nowrap">${e.name.replace(/</g,'&lt;')}</td>
                  <td style="font-family:var(--mono);font-size:10.5px;color:var(--accent);
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.path}</td>
                  <td style="font-family:var(--mono);font-size:10.5px;color:var(--text-2)">
                    ${_formatSize(e.size)}</td>
                  <td style="font-family:var(--mono);font-size:10px;color:var(--text-2)">
                    ${_formatDate(e.mtime)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  };

  /* ─── PUBLIC API ─────────────────────────────────────────── */
  const clearError = () => { state.error = null; _render(); };

  const init = () => {
    if (state.initialized) { _render(); return; }
    state.initialized = true;
    BUS.emit('log:add','INFO','[SHARED] MOD_SHARED_EXPLORER ' + VERSION + ' init');
    navigate('');
  };

  /* Expose internals for testing only — prefixed with _ */
  return {
    /* Public */
    init, navigate, selectEntry, closeDetail,
    loadPreview, downloadFile, copyPath,
    setSearch, doSearch, clearSearch, clearError,
    getLogs,
    /* Testing internals */
    _ext, _category, _canPreview, _canDownload,
    _formatSize, _log,
    _state : () => state,
    _reset : () => {
      state = { currentPath:'', entries:[], selected:null, preview:null,
        search:{q:'',ext:'',from:'',to:''}, searchResults:null,
        loading:false, error:null, logs:[], initialized:false };
    },
    /* Constants exposed for tests */
    MAX_PREVIEW_BYTES, CATEGORY, BLOCKED_NAMES,
  };

})();

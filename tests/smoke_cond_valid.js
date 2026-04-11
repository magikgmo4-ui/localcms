/**
 * SMOKE TEST — $COND + $VALID (Node.js, sans dépendance externe)
 * Mission : GO_LOCALCMS_M1_1_COND_VALID_SMOKE_05
 * Date    : 2026-03-23
 *
 * Architecture : mock DOM minimal + extraction des IIFEs depuis localcms-v5.html
 * Couverture :
 *   Groupe A — IA Config : $COND + $VALID
 *   Groupe B — Machines Config : $COND
 *   Groupe C — Non-régression : cas limites
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════
// MOCK DOM
// ═══════════════════════════════════════════════════════════════════

class MockElement {
  constructor(tag, id) {
    this.tagName  = tag;
    this.id       = id || '';
    this.type     = 'text';
    this.value    = '';
    this.checked  = false;
    this.className = '';
    this.style    = { display: '', cssText: '' };
    this.textContent = '';
    this._children = [];
    this._parent   = null;
  }
  appendChild(child) {
    child._parent = this;
    this._children.push(child);
    return child;
  }
  remove() {
    if (this._parent) {
      this._parent._children = this._parent._children.filter(c => c !== this);
      this._parent = null;
    }
    mockDOM._removeFromRegistry(this);
  }
  /* closest('.c-field') → remonte jusqu'au wrapper ayant la classe c-field */
  closest(selector) {
    if (selector === '.c-field') {
      // Si cet élément EST le wrapper
      if (this.className && this.className.split(' ').includes('c-field')) return this;
      // Sinon cherche le parent
      let cur = this._parent;
      while (cur) {
        if (cur.className && cur.className.split(' ').includes('c-field')) return cur;
        cur = cur._parent;
      }
    }
    return null;
  }
}

const mockDOM = {
  _elements: {},   // id → MockElement
  _allElements: [], // toutes les instances (y compris sans id)

  reset() {
    this._elements = {};
    this._allElements = [];
  },

  _removeFromRegistry(el) {
    if (el.id) delete this._elements[el.id];
    this._allElements = this._allElements.filter(e => e !== el);
  },

  /* Crée un champ input + son wrapper .c-field liés */
  addField(fieldId, { type = 'text', value = '', checked = false } = {}) {
    const wrapper = new MockElement('div', '');
    wrapper.className = 'c-field';

    const input = new MockElement('input', `cfg-${fieldId}`);
    input.type    = type;
    input.value   = value;
    input.checked = checked;

    wrapper.appendChild(input);
    this._elements[input.id] = input;
    this._allElements.push(wrapper, input);
    return { wrapper, input };
  },

  getElementById(id) {
    return this._elements[id] || null;
  },

  querySelectorAll(selector) {
    if (selector === '.cval-error') {
      return this._allElements.filter(
        el => el.className && el.className.split(' ').includes('cval-error')
      );
    }
    return [];
  },

  createElement(tag) {
    const el = new MockElement(tag, '');
    this._allElements.push(el);
    return el;
  }
};

// Injecter le mock document global
global.document = {
  getElementById: (id)         => mockDOM.getElementById(id),
  querySelectorAll: (sel)      => mockDOM.querySelectorAll(sel),
  createElement: (tag)         => mockDOM.createElement(tag),
};

// ═══════════════════════════════════════════════════════════════════
// $COND — copie exacte de localcms-v5.html l.1597–1631
// ═══════════════════════════════════════════════════════════════════

const $COND = (() => {
  const apply = (conditions) => {
    if (!conditions || !conditions.length) return;
    const controlled = new Set();
    conditions.forEach(c => (c.show || []).forEach(f => controlled.add(f)));
    const visible = new Set();
    conditions.forEach(cond => {
      const wh = cond.when;
      if (!wh) return;
      const el = document.getElementById(`cfg-${wh.field}`);
      if (!el) return;
      const val = el.type === 'checkbox' ? String(el.checked) : el.value;
      if (val === wh.eq) (cond.show || []).forEach(f => visible.add(f));
    });
    controlled.forEach(fieldId => {
      const el = document.getElementById(`cfg-${fieldId}`);
      const wrapper = el ? el.closest('.c-field') : null;
      if (wrapper) wrapper.style.display = visible.has(fieldId) ? '' : 'none';
    });
  };
  return { apply };
})();

// ═══════════════════════════════════════════════════════════════════
// $VALID — copie exacte de localcms-v5.html l.1637–1687
// ═══════════════════════════════════════════════════════════════════

const $VALID = (() => {
  const URL_RE = /^https?:\/\/.+/;
  const run = (validators, values) => {
    const errors = [];
    (validators || []).forEach(v => {
      const raw = values[v.field];
      const val = (raw === null || raw === undefined) ? '' : String(raw).trim();
      if (v.required && !val) errors.push({ field: v.field, message: 'Champ requis' });
      if (v.url && val && !URL_RE.test(val)) errors.push({ field: v.field, message: 'URL invalide' });
    });
    return { valid: errors.length === 0, errors };
  };
  const showErrors = (errors) => {
    clearErrors();
    errors.forEach(err => {
      const el = document.getElementById(`cfg-${err.field}`);
      const wrapper = el ? el.closest('.c-field') : null;
      if (!wrapper) return;
      const msg = document.createElement('div');
      msg.className = 'cval-error';
      msg.style.cssText = 'font-size:10px;color:var(--red);font-family:var(--mono);margin-top:3px';
      msg.textContent = err.message;
      wrapper.appendChild(msg);
    });
  };
  const clearErrors = () => {
    document.querySelectorAll('.cval-error').forEach(e => e.remove());
  };
  return { run, showErrors, clearErrors };
})();

// ═══════════════════════════════════════════════════════════════════
// MANIFESTES (extraits des modules/*.js)
// ═══════════════════════════════════════════════════════════════════

const IA_CONDITIONS = [
  { when:{ field:'ia_provider', eq:'openai'      }, show:['ia_api_key'] },
  { when:{ field:'ia_provider', eq:'anthropic'   }, show:['ia_api_key'] },
  { when:{ field:'ia_provider', eq:'mistral'     }, show:['ia_api_key'] },
  { when:{ field:'ia_provider', eq:'cohere'      }, show:['ia_api_key'] },
  { when:{ field:'ia_provider', eq:'groq'        }, show:['ia_api_key'] },
  { when:{ field:'ia_provider', eq:'together-ai' }, show:['ia_api_key'] },
  { when:{ field:'ia_provider', eq:'huggingface' }, show:['ia_api_key'] },
  { when:{ field:'ia_provider', eq:'custom'      }, show:['ia_api_key'] },
];

const IA_VALIDATORS = [
  { field:'ia_host',    url:true      },
  { field:'ia_api_key', required:true },
  { field:'ia_img_host',url:true      },
];

const MC_CONDITIONS = [
  { when:{ field:'mc_ssh_auth', eq:'key'          }, show:['mc_ssh_key'] },
  { when:{ field:'mc_ssh_auth', eq:'password'     }, show:['mc_ssh_pass'] },
  { when:{ field:'mc_ssh_auth', eq:'key+password' }, show:['mc_ssh_key','mc_ssh_pass'] },
  { when:{ field:'mc_ssh_auth', eq:'certificate'  }, show:['mc_ssh_cert'] },
];

const MC_VALIDATORS = [
  { field:'mc_ssh_host',        required:true },
  { field:'mc_ftp_host',        required:true },
  { field:'mc_ext_url',         url:true },
  { field:'mc_ext_oauth_url',   url:true },
  { field:'mc_ext_webhook_url', url:true },
  { field:'mc_vpn_server',      required:true },
];

// ═══════════════════════════════════════════════════════════════════
// RUNNER
// ═══════════════════════════════════════════════════════════════════

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  mockDOM.reset();
  try {
    const result = fn();
    if (result === true) {
      passed++;
      results.push({ name, status: 'PASS' });
      console.log(`  PASS  ${name}`);
    } else {
      failed++;
      results.push({ name, status: 'FAIL', reason: result });
      console.log(`  FAIL  ${name}`);
      console.log(`        → ${result}`);
    }
  } catch (e) {
    failed++;
    results.push({ name, status: 'FAIL', reason: e.message });
    console.log(`  FAIL  ${name}`);
    console.log(`        → EXCEPTION: ${e.message}`);
  }
  mockDOM.reset();
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'assertion failed');
  return true;
}

// ═══════════════════════════════════════════════════════════════════
// GROUPE A — IA Config : $COND + $VALID
// ═══════════════════════════════════════════════════════════════════

console.log('\n── Groupe A : IA Config $COND ─────────────────────────────────');

test('A-01  ia_provider=openai → ia_api_key visible', () => {
  const provEl = mockDOM.addField('ia_provider', { type:'select', value:'openai' });
  const keyEl  = mockDOM.addField('ia_api_key',  { type:'text',   value:'' });
  $COND.apply(IA_CONDITIONS);
  return assert(
    keyEl.wrapper.style.display === '',
    `display=${keyEl.wrapper.style.display} (attendu '')`
  );
});

test('A-02  ia_provider=none → ia_api_key masqué', () => {
  const provEl = mockDOM.addField('ia_provider', { type:'select', value:'none' });
  const keyEl  = mockDOM.addField('ia_api_key',  { type:'text',   value:'' });
  $COND.apply(IA_CONDITIONS);
  return assert(
    keyEl.wrapper.style.display === 'none',
    `display=${keyEl.wrapper.style.display} (attendu 'none')`
  );
});

test('A-03  ia_provider=custom → ia_api_key visible', () => {
  const provEl = mockDOM.addField('ia_provider', { type:'select', value:'custom' });
  const keyEl  = mockDOM.addField('ia_api_key',  { type:'text',   value:'' });
  $COND.apply(IA_CONDITIONS);
  return assert(
    keyEl.wrapper.style.display === '',
    `display=${keyEl.wrapper.style.display} (attendu '')`
  );
});

test('A-04  $COND.apply() — champ source absent → champ contrôlé masqué (sémantique: 0 condition satisfaite)', () => {
  // ia_provider absent du DOM, ia_api_key présent
  // Comportement attendu : controlled={ia_api_key}, visible={} → display='none'
  // Sémantique correcte : aucune condition satisfaite ⇒ aucun champ visible
  const keyEl = mockDOM.addField('ia_api_key', { type:'text', value:'' });
  $COND.apply(IA_CONDITIONS); // ne doit pas lever d'exception
  return assert(
    keyEl.wrapper.style.display === 'none',
    `display=${keyEl.wrapper.style.display} (attendu 'none' — source absente = 0 condition satisfaite)`
  );
});

test('A-05  $COND.apply() — champ cible absent → pas de crash', () => {
  // ia_provider présent, ia_api_key absent du DOM
  mockDOM.addField('ia_provider', { type:'select', value:'openai' });
  $COND.apply(IA_CONDITIONS); // ne doit pas lever d'exception
  return true;
});

console.log('\n── Groupe A : IA Config $VALID ────────────────────────────────');

test('A-06  $VALID.run — tous vides → erreur ia_api_key required', () => {
  const result = $VALID.run(IA_VALIDATORS, {});
  const hasReq = result.errors.some(e => e.field === 'ia_api_key' && e.message === 'Champ requis');
  return assert(hasReq, `errors=${JSON.stringify(result.errors)}`);
});

test('A-07  $VALID.run — ia_host invalide → erreur URL', () => {
  const result = $VALID.run(IA_VALIDATORS, {
    ia_host: 'pas-une-url',
    ia_api_key: 'sk-xxx'
  });
  const hasURL = result.errors.some(e => e.field === 'ia_host' && e.message === 'URL invalide');
  return assert(hasURL, `errors=${JSON.stringify(result.errors)}`);
});

test('A-08  $VALID.run — ia_host valide + api_key rempli → valid:true', () => {
  const result = $VALID.run(IA_VALIDATORS, {
    ia_host:    'https://api.openai.com',
    ia_api_key: 'sk-test123'
  });
  return assert(result.valid === true, `valid=${result.valid} errors=${JSON.stringify(result.errors)}`);
});

test('A-09  $VALID.run — ia_img_host invalide → erreur URL', () => {
  const result = $VALID.run(IA_VALIDATORS, {
    ia_api_key:  'sk-xxx',
    ia_img_host: 'ftp://wrong'
  });
  const hasURL = result.errors.some(e => e.field === 'ia_img_host' && e.message === 'URL invalide');
  return assert(hasURL, `errors=${JSON.stringify(result.errors)}`);
});

test('A-10  $VALID.showErrors — injecte div.cval-error dans wrapper', () => {
  const keyEl = mockDOM.addField('ia_api_key', { type:'text', value:'' });
  $VALID.showErrors([{ field:'ia_api_key', message:'Champ requis' }]);
  const errDivs = keyEl.wrapper._children.filter(c => c.className === 'cval-error');
  return assert(errDivs.length === 1, `${errDivs.length} div.cval-error trouvé(s) (attendu 1)`);
});

test('A-11  $VALID.clearErrors — supprime tous les div.cval-error', () => {
  const keyEl  = mockDOM.addField('ia_api_key', { type:'text', value:'' });
  const hostEl = mockDOM.addField('ia_host',    { type:'text', value:'' });
  $VALID.showErrors([
    { field:'ia_api_key', message:'Champ requis' },
    { field:'ia_host',    message:'URL invalide' }
  ]);
  $VALID.clearErrors();
  const remaining = mockDOM.querySelectorAll('.cval-error');
  return assert(remaining.length === 0, `${remaining.length} div.cval-error restant(s) après clearErrors`);
});

// ═══════════════════════════════════════════════════════════════════
// GROUPE B — Machines Config : $COND
// ═══════════════════════════════════════════════════════════════════

console.log('\n── Groupe B : Machines Config $COND ───────────────────────────');

test('B-01  mc_ssh_auth=key → mc_ssh_key visible, mc_ssh_pass masqué', () => {
  mockDOM.addField('mc_ssh_auth', { type:'select', value:'key' });
  const keyEl  = mockDOM.addField('mc_ssh_key',  { type:'text', value:'' });
  const passEl = mockDOM.addField('mc_ssh_pass', { type:'text', value:'' });
  mockDOM.addField('mc_ssh_cert', { type:'text', value:'' });
  $COND.apply(MC_CONDITIONS);
  const keyVisible  = keyEl.wrapper.style.display  === '';
  const passHidden  = passEl.wrapper.style.display === 'none';
  return assert(keyVisible && passHidden,
    `key.display=${keyEl.wrapper.style.display} pass.display=${passEl.wrapper.style.display}`);
});

test('B-02  mc_ssh_auth=password → mc_ssh_pass visible, mc_ssh_key masqué', () => {
  mockDOM.addField('mc_ssh_auth', { type:'select', value:'password' });
  const keyEl  = mockDOM.addField('mc_ssh_key',  { type:'text', value:'' });
  const passEl = mockDOM.addField('mc_ssh_pass', { type:'text', value:'' });
  mockDOM.addField('mc_ssh_cert', { type:'text', value:'' });
  $COND.apply(MC_CONDITIONS);
  return assert(
    passEl.wrapper.style.display === '' && keyEl.wrapper.style.display === 'none',
    `pass=${passEl.wrapper.style.display} key=${keyEl.wrapper.style.display}`
  );
});

test('B-03  mc_ssh_auth=key+password → mc_ssh_key ET mc_ssh_pass visibles', () => {
  mockDOM.addField('mc_ssh_auth', { type:'select', value:'key+password' });
  const keyEl  = mockDOM.addField('mc_ssh_key',  { type:'text', value:'' });
  const passEl = mockDOM.addField('mc_ssh_pass', { type:'text', value:'' });
  mockDOM.addField('mc_ssh_cert', { type:'text', value:'' });
  $COND.apply(MC_CONDITIONS);
  return assert(
    keyEl.wrapper.style.display === '' && passEl.wrapper.style.display === '',
    `key=${keyEl.wrapper.style.display} pass=${passEl.wrapper.style.display}`
  );
});

test('B-04  mc_ssh_auth=certificate → mc_ssh_cert visible, key/pass masqués', () => {
  mockDOM.addField('mc_ssh_auth', { type:'select', value:'certificate' });
  const keyEl  = mockDOM.addField('mc_ssh_key',  { type:'text', value:'' });
  const passEl = mockDOM.addField('mc_ssh_pass', { type:'text', value:'' });
  const certEl = mockDOM.addField('mc_ssh_cert', { type:'text', value:'' });
  $COND.apply(MC_CONDITIONS);
  return assert(
    certEl.wrapper.style.display === '' &&
    keyEl.wrapper.style.display  === 'none' &&
    passEl.wrapper.style.display === 'none',
    `cert=${certEl.wrapper.style.display} key=${keyEl.wrapper.style.display} pass=${passEl.wrapper.style.display}`
  );
});

test('B-05  $VALID.run Machines — mc_ssh_host vide → erreur required', () => {
  const result = $VALID.run(MC_VALIDATORS, {});
  const hasSsh = result.errors.some(e => e.field === 'mc_ssh_host');
  return assert(hasSsh, `errors=${JSON.stringify(result.errors)}`);
});

test('B-06  $VALID.run Machines — mc_ext_url invalide → URL erreur', () => {
  const result = $VALID.run(MC_VALIDATORS, {
    mc_ssh_host: 'srv1',
    mc_ftp_host: 'ftp1',
    mc_vpn_server: 'vpn1',
    mc_ext_url: 'not-a-url'
  });
  const hasURL = result.errors.some(e => e.field === 'mc_ext_url' && e.message === 'URL invalide');
  return assert(hasURL, `errors=${JSON.stringify(result.errors)}`);
});

test('B-07  $VALID.run Machines — tous champs requis remplis + URLs vides → valid:true', () => {
  const result = $VALID.run(MC_VALIDATORS, {
    mc_ssh_host:  'srv1.example.com',
    mc_ftp_host:  'ftp.example.com',
    mc_vpn_server:'vpn.example.com'
  });
  return assert(result.valid === true, `valid=${result.valid} errors=${JSON.stringify(result.errors)}`);
});

// ═══════════════════════════════════════════════════════════════════
// GROUPE C — Non-régression
// ═══════════════════════════════════════════════════════════════════

console.log('\n── Groupe C : Non-régression ──────────────────────────────────');

test('C-01  $COND.apply(null) → pas de crash', () => {
  $COND.apply(null);
  return true;
});

test('C-02  $COND.apply([]) → pas de crash', () => {
  $COND.apply([]);
  return true;
});

test('C-03  $VALID.run([], {}) → valid:true, errors:[]', () => {
  const result = $VALID.run([], {});
  return assert(result.valid === true && result.errors.length === 0,
    `valid=${result.valid} errors=${result.errors.length}`);
});

test('C-04  $VALID.run — champ url vide → pas d\'erreur URL (règle : val && !regex)', () => {
  // Une URL vide ne doit PAS déclencher l'erreur URL (seulement si valeur présente + invalide)
  const result = $VALID.run([{ field:'ia_host', url:true }], { ia_host:'' });
  return assert(result.valid === true, `valid=${result.valid} errors=${JSON.stringify(result.errors)}`);
});

test('C-05  $VALID.run — required + url sur même champ, valeur vide → required uniquement', () => {
  const result = $VALID.run(
    [{ field:'test_field', required:true, url:true }],
    { test_field: '' }
  );
  const reqCount = result.errors.filter(e => e.field === 'test_field' && e.message === 'Champ requis').length;
  const urlCount = result.errors.filter(e => e.field === 'test_field' && e.message === 'URL invalide').length;
  return assert(reqCount === 1 && urlCount === 0,
    `req=${reqCount} url=${urlCount} (attendu req=1 url=0)`);
});

test('C-06  $COND — checkbox type=true : valeur lue comme String(checked)', () => {
  mockDOM.addField('flag_field',  { type:'checkbox', checked:true });
  const targetEl = mockDOM.addField('target_field', { type:'text', value:'' });
  const conds = [{ when:{ field:'flag_field', eq:'true' }, show:['target_field'] }];
  // Remplace le champ pour forcer type=checkbox
  mockDOM._elements['cfg-flag_field'].type = 'checkbox';
  $COND.apply(conds);
  return assert(
    targetEl.wrapper.style.display === '',
    `display=${targetEl.wrapper.style.display} (attendu '')`
  );
});

test('C-07  $COND — champ contrôlé sans wrapper .c-field → pas de crash', () => {
  // Créer un input sans wrapper c-field
  const el = new MockElement('input', 'cfg-orphan');
  el.type  = 'text';
  el.value = '';
  mockDOM._elements['cfg-orphan'] = el;
  // Source présente + cible = orphan (pas de wrapper)
  mockDOM.addField('src_field', { type:'text', value:'match' });
  const conds = [{ when:{ field:'src_field', eq:'match' }, show:['orphan'] }];
  $COND.apply(conds);
  return true;
});

test('C-08  $COND IA et MC sur DOM combiné → isolation totale (pas de cross-contamination)', () => {
  // Simule la situation où les deux panels sont dans le DOM (même si M1/M2 ne le font pas)
  mockDOM.addField('ia_provider', { type:'select', value:'none' });
  const keyEl  = mockDOM.addField('ia_api_key',  { type:'text', value:'' });
  mockDOM.addField('mc_ssh_auth', { type:'select', value:'key' });
  const sshKey = mockDOM.addField('mc_ssh_key',  { type:'text', value:'' });
  mockDOM.addField('mc_ssh_pass', { type:'text', value:'' });
  mockDOM.addField('mc_ssh_cert', { type:'text', value:'' });

  // Apply IA conditions only
  $COND.apply(IA_CONDITIONS);
  // MC fields should not have been touched (still display:'')
  return assert(
    sshKey.wrapper.style.display === '',
    `sshKey.display=${sshKey.wrapper.style.display} après apply IA uniquement`
  );
});

// ═══════════════════════════════════════════════════════════════════
// RAPPORT FINAL
// ═══════════════════════════════════════════════════════════════════

const total = passed + failed;
console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  RÉSULTAT : ${passed}/${total} PASS — ${failed} FAIL`);
console.log('══════════════════════════════════════════════════════════════');

if (failed > 0) {
  console.log('\n  Tests en échec :');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`    ✗ ${r.name}`);
    if (r.reason) console.log(`      → ${r.reason}`);
  });
}

process.exit(failed > 0 ? 1 : 0);

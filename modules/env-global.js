/**
 * modules/env-global.js — MOD_ENV_GLOBAL_DATA
 * LocalCMS · M-3.4 · Manifeste déclaratif V1 · v1.0.0
 *
 * ═══ CONTRAT ═══════════════════════════════════════════════════════
 *
 * Données déclaratives uniquement. Aucune fonction. Aucun effet de bord.
 *
 * Contenu :
 *   ✓ Identité module
 *   ✓ meta (activeDefault)
 *   ✓ 3 groupes (machines 9 / shared_env 9 / network 7 = 25 champs)
 *     fidèlement extraits de l'inline d'origine
 *   ✓ conditions[]       — vide (inline sans conditions)
 *   ✓ validators[]       — $VALID
 *   ✓ profile_bindings[] — vide (source de profils, pas consommateur)
 *
 * Non contenu :
 *   ✗ init / render / setGroup / save / exportAll / importProfile
 *     → bridge dans localcms-v5.html
 *   ✗ HTML inline
 *   ✗ chemins absolus ou relatifs utilisateur
 *   ✗ données réseau utilisateur hardcodées
 *   ✗ persistance directe
 *
 * Différence structurelle vs M-3.1/3.2/3.3 :
 *   Ce module utilise `groups` (≠ `forms`).
 *   Chaque groupe a directement `label`, `icon`, `fields[]`.
 *   Pas de `sections[]` intermédiaire — fidèle à la structure GROUPS inline.
 *
 * Aucun champ password (F-15 non applicable ici).
 *
 * P0 — Valeurs vidées :
 *   eg_m_key      : '~/.ssh/id_ed25519'  → '' (chemin utilisateur)
 *   eg_n_subnet   : '192.168.1.0/24'     → '' (IP utilisateur)
 *   eg_n_gateway  : '192.168.1.1'        → '' (IP utilisateur)
 *   eg_n_dns1     : '1.1.1.1'            → '' (IP)
 *   eg_n_dns2     : '8.8.8.8'            → '' (IP)
 *
 * P0 — Placeholders neutralisés :
 *   eg_m_host     : '192.168.1.10'       → '<host-ou-ip>'
 *   eg_s_domain   : 'example.com'        → '<domaine>'
 *   eg_n_vpn_server: 'vpn.example.com'   → '<serveur-vpn>'
 *   eg_n_proxy    : 'http://proxy:3128'  → '<proxy-url>'
 *
 * Valeurs conservées (localhost / standard) :
 *   eg_s_redis_url : 'redis://localhost:6379'       (service local générique)
 *   eg_n_noproxy   : 'localhost,127.0.0.1,.local'   (convention NO_PROXY standard)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const MOD_ENV_GLOBAL_DATA = {

  /* ── Identité ──────────────────────────────────────────────────── */
  id:           'env_global',
  label:        'Pr\u00e9configurations globales',
  icon:         '\uD83D\uDD11',
  version:      '1.0.0',
  group:        'global',
  type:         'config',
  capabilities: ['render'],
  os_compat:    ['all'],
  interfaces:   ['config'],

  /* ── Métadonnées ────────────────────────────────────────────────── */
  meta: {
    activeDefault: 'machines',
  },

  /* ════════════════════════════════════════════════════════════════
     GROUPS — 3 groupes, 25 champs
     Structure : { label, icon, fields[] }
     (pas de sections[] intermédiaire — fidèle à l'inline)
     ════════════════════════════════════════════════════════════════ */
  groups: {

    /* ── 1. Machines prédéfinies (9 champs) ─────────────────────── */
    machines: {
      label: 'Machines pr\u00e9d\u00e9finies',
      icon:  '\uD83D\uDDA7',
      fields: [
        { id:'eg_m_name', label:'Nom machine',
          type:'text',   value:'', placeholder:'srv-prod' },
        { id:'eg_m_host', label:'Host/IP',
          type:'text',   value:'', placeholder:'<host-ou-ip>' }, /* P0 */
        { id:'eg_m_user', label:'User SSH',
          type:'text',   value:'deploy' },
        { id:'eg_m_port', label:'Port SSH',
          type:'number', value:'22' },
        { id:'eg_m_key',  label:'Cl\u00e9 priv\u00e9e',
          type:'text',   value:'' }, /* P0 — '~/.ssh/id_ed25519' vid\u00e9 */
        { id:'eg_m_env',  label:'Environnement',
          type:'select', value:'dev',
          options:['dev','staging','prod','test'] },
        { id:'eg_m_role', label:'R\u00f4le',
          type:'select', value:'web',
          options:['web','db','cache','queue','worker','monitor','bastion','all'] },
        { id:'eg_m_os',   label:'OS cible',
          type:'select', value:'debian',
          options:['debian','ubuntu','centos','rhel','alpine',
                   'windows-server','macos'] },
        { id:'eg_m_tags', label:'Tags',
          type:'text',   value:'', placeholder:'prod,backend,region:eu' },
      ],
    },

    /* ── 2. Variables partagées (9 champs) ──────────────────────── */
    shared_env: {
      label: 'Variables partag\u00e9es',
      icon:  '\uD83D\uDD11',
      fields: [
        { id:'eg_s_domain',    label:'DOMAIN',
          type:'text',   value:'', placeholder:'<domaine>' }, /* P0 */
        { id:'eg_s_app_name',  label:'APP_NAME',
          type:'text',   value:'' },
        { id:'eg_s_env',       label:'NODE_ENV',
          type:'select', value:'development',
          options:['development','staging','production','test'] },
        { id:'eg_s_tz',        label:'Timezone',
          type:'select', value:'UTC',
          options:['UTC','America/New_York','America/Toronto',
                   'Europe/Paris','Asia/Tokyo'] },
        { id:'eg_s_db_host',   label:'DB_HOST',
          type:'text',   value:'localhost' },
        { id:'eg_s_redis_url', label:'REDIS_URL',
          type:'text',   value:'redis://localhost:6379' }, /* service local conserv\u00e9 */
        { id:'eg_s_smtp_host', label:'SMTP_HOST',
          type:'text',   value:'' },
        { id:'eg_s_s3_region', label:'AWS_REGION',
          type:'select', value:'us-east-1',
          options:['us-east-1','eu-west-1','ap-northeast-1'] },
        { id:'eg_s_log_level', label:'LOG_LEVEL',
          type:'select', value:'info',
          options:['debug','info','warn','error'] },
      ],
    },

    /* ── 3. Réseau partagé (7 champs) ───────────────────────────── */
    network: {
      label: 'R\u00e9seau partag\u00e9',
      icon:  '\uD83C\uDF10',
      fields: [
        { id:'eg_n_subnet',     label:'Subnet LAN',
          type:'text', value:'' }, /* P0 — '192.168.1.0/24' vid\u00e9 */
        { id:'eg_n_gateway',    label:'Gateway',
          type:'text', value:'' }, /* P0 — '192.168.1.1' vid\u00e9 */
        { id:'eg_n_dns1',       label:'DNS primaire',
          type:'text', value:'' }, /* P0 — '1.1.1.1' vid\u00e9 */
        { id:'eg_n_dns2',       label:'DNS secondaire',
          type:'text', value:'' }, /* P0 — '8.8.8.8' vid\u00e9 */
        { id:'eg_n_vpn_server', label:'VPN server',
          type:'text', value:'', placeholder:'<serveur-vpn>' }, /* P0 */
        { id:'eg_n_proxy',      label:'Proxy HTTP',
          type:'text', value:'', placeholder:'<proxy-url>' }, /* P0 */
        { id:'eg_n_noproxy',    label:'NO_PROXY',
          type:'text', value:'localhost,127.0.0.1,.local' }, /* convention standard conserv\u00e9e */
      ],
    },

  }, /* /groups */

  /* ════════════════════════════════════════════════════════════════
     CONDITIONS — vide (inline sans conditions)
     ════════════════════════════════════════════════════════════════ */
  conditions: [],

  /* ════════════════════════════════════════════════════════════════
     VALIDATORS — $VALID
     ════════════════════════════════════════════════════════════════ */
  validators: [
    { field:'eg_m_host',      required:true },
    { field:'eg_m_name',      required:true },
    { field:'eg_n_vpn_server',required:true },
  ],

  /* ════════════════════════════════════════════════════════════════
     PROFILE BINDINGS — F-14
     Pas de binding entrant sur MOD_ENV_GLOBAL.
     ════════════════════════════════════════════════════════════════ */
  profile_bindings: [],

}; /* /MOD_ENV_GLOBAL_DATA */

/**
 * modules/data-sources.js — MOD_DATA_SOURCES_DATA
 * LocalCMS · M-3.3 · Manifeste déclaratif V1 · v1.0.0
 *
 * ═══ CONTRAT ═══════════════════════════════════════════════════════
 *
 * Données déclaratives uniquement. Aucune fonction. Aucun effet de bord.
 *
 * Contenu :
 *   ✓ Identité module
 *   ✓ meta (typeIcons, typeLabels, activeDefault)
 *   ✓ 5 forms (database 15 / api 15 / files 13 / images 19 / computed 10)
 *     = 72 champs, fidèles à l'inline d'origine
 *   ✓ conditions[]       — when/show ($COND canonique) — vide (inline sans conditions)
 *   ✓ validators[]       — $VALID
 *   ✓ profile_bindings[] — F-14 — vide (pas de binding entrant)
 *
 * Non contenu :
 *   ✗ init / render / switchType / save / test / preview → bridge localcms-v5.html
 *   ✗ HTML inline
 *   ✗ chemins absolus ou relatifs utilisateur
 *   ✗ données réelles hardcodées
 *   ✗ persistance directe
 *
 * F-15 sensitive:true sur 3 champs password :
 *   ds_db_pass, ds_api_key, ds_img_secret
 *
 * P0 — Valeurs vidées (étaient hardcodées dans l'inline) :
 *   ds_img_path   : './uploads/images' → '' (chemin relatif)
 *   ds_img_prefix : 'uploads/'         → '' (chemin relatif)
 *
 * P0 — Placeholders/hints neutralisés :
 *   ds_f_path     : '/var/log/nginx/access.log' → '<chemin-ou-uri>'
 *   ds_img_cdn_url: 'https://cdn.example.com'   → '<cdn-url>'
 *   ds_c_formula  : hint avec champ concret      → hint générique
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const MOD_DATA_SOURCES_DATA = {

  /* ── Identité ──────────────────────────────────────────────────── */
  id:           'data_sources',
  label:        'Sources de donn\u00e9es',
  icon:         '\uD83D\uDDC4',
  version:      '1.0.0',
  group:        'data',
  type:         'config',
  capabilities: ['render', 'generate'],
  os_compat:    ['all'],
  interfaces:   ['config'],

  /* ── Métadonnées onglets ────────────────────────────────────────── */
  meta: {
    activeDefault: 'database',
    typeIcons : {
      database: '\uD83D\uDDC4',
      api     : '\uD83D\uDD0C',
      files   : '\uD83D\uDCC1',
      images  : '\uD83D\uDDBC',
      computed: '\uD83D\uDCC8',
    },
    typeLabels: {
      database: 'Base de donn\u00e9es',
      api     : 'API/REST',
      files   : 'Fichiers/Logs',
      images  : 'Images',
      computed: 'Calcul\u00e9es/Proba',
    },
  },

  /* ════════════════════════════════════════════════════════════════
     FORMS — 5 définitions, 72 champs
     ════════════════════════════════════════════════════════════════ */
  forms: {

    /* ── 1. Base de données (15 champs) ─────────────────────────── */
    database: { id:'ds-db', sections:[
      { label:'Base de donn\u00e9es', icon:'\uD83D\uDDC4', first:true, fields:[
        { id:'ds_db_type',     label:'Type',
          type:'select', value:'postgresql',
          options:['postgresql','mysql','mariadb','sqlite','mongodb','redis',
                   'influxdb','timescaledb','clickhouse','cassandra',
                   'elasticsearch','neo4j','duckdb','supabase','planetscale',
                   'neon','turso','custom'] },
        { id:'ds_db_name',     label:'Nom connexion',
          type:'text',   value:'', placeholder:'<nom-connexion>' },
        { id:'ds_db_host',     label:'Host',
          type:'text',   value:'localhost' },
        { id:'ds_db_port',     label:'Port',
          type:'number', value:'5432' },
        { id:'ds_db_dbname',   label:'Database',
          type:'text',   value:'' },
        { id:'ds_db_user',     label:'Utilisateur',
          type:'text',   value:'' },
        { id:'ds_db_pass',     label:'Mot de passe',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'ds_db_ssl',      label:'SSL',
          type:'toggle', value:false },
        { id:'ds_db_pool',     label:'Pool size',
          type:'number', value:'5' },
        { id:'ds_db_ro',       label:'Lecture seule',
          type:'toggle', value:false },
        { id:'ds_db_schema',   label:'Schema/Collection',
          type:'text',   value:'public' },
        { id:'ds_db_interval', label:'Polling (s)',
          type:'number', value:'60', hint:'0=temps r\u00e9el' },
        { id:'ds_db_query',    label:'Requ\u00eate par d\u00e9faut',
          type:'textarea', value:'', rows:3, wide:true },
        { id:'ds_db_tags',     label:'Tags / Labels',
          type:'text',   value:'', placeholder:'prod,analytics' },
        { id:'ds_db_enabled',  label:'Activ\u00e9',
          type:'toggle', value:true },
      ]},
    ]},

    /* ── 2. API / REST / GraphQL (15 champs) ────────────────────── */
    api: { id:'ds-api', sections:[
      { label:'API / REST / GraphQL', icon:'\uD83D\uDD0C', first:true, fields:[
        { id:'ds_api_name',       label:'Nom',
          type:'text',   value:'', placeholder:'<nom-api>' },
        { id:'ds_api_url',        label:'URL de base',
          type:'url',    value:'' },
        { id:'ds_api_type',       label:'Type',
          type:'select', value:'rest',
          options:['rest','graphql','grpc','websocket','sse','webhook',
                   'rss','atom','soap','custom'] },
        { id:'ds_api_method',     label:'M\u00e9thode HTTP',
          type:'select', value:'GET',
          options:['GET','POST','PUT','PATCH','DELETE'] },
        { id:'ds_api_auth',       label:'Auth',
          type:'select', value:'none',
          options:['none','api-key-header','api-key-query','bearer',
                   'basic','oauth2','hmac','custom'] },
        { id:'ds_api_key',        label:'API Key / Token',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'ds_api_key_header', label:'Header name',
          type:'text',   value:'X-API-Key' },
        { id:'ds_api_body',       label:'Body (JSON)',
          type:'textarea', value:'', rows:3, wide:true },
        { id:'ds_api_headers',    label:'Headers custom',
          type:'textarea', value:'', rows:2, hint:'KEY: value par ligne', wide:true },
        { id:'ds_api_interval',   label:'Polling (s)',
          type:'number', value:'300' },
        { id:'ds_api_path',       label:'JSONPath r\u00e9sultat',
          type:'text',   value:'', placeholder:'$.data.items' },
        { id:'ds_api_cache',      label:'Cache TTL (s)',
          type:'number', value:'60' },
        { id:'ds_api_retry',      label:'Retry count',
          type:'number', value:'3' },
        { id:'ds_api_timeout',    label:'Timeout (s)',
          type:'number', value:'30' },
        { id:'ds_api_enabled',    label:'Activ\u00e9',
          type:'toggle', value:true },
      ]},
    ]},

    /* ── 3. Fichiers / Logs / Streams (13 champs) ───────────────── */
    files: { id:'ds-files', sections:[
      { label:'Fichiers / Logs / Streams', icon:'\uD83D\uDCC1', first:true, fields:[
        { id:'ds_f_name',      label:'Nom',
          type:'text',   value:'', placeholder:'<nom-source>' },
        { id:'ds_f_type',      label:'Type source',
          type:'select', value:'file',
          options:['file','directory','s3','sftp','ftp','nfs','samba',
                   'google-drive','dropbox','nextcloud','stdin','pipe',
                   'socket','serial','custom'] },
        { id:'ds_f_path',      label:'Chemin / URI',
          type:'text',   value:'', placeholder:'<chemin-ou-uri>', wide:true }, /* P0 — path neutralis\u00e9 */
        { id:'ds_f_format',    label:'Format',
          type:'select', value:'log',
          options:['log','json-lines','csv','tsv','xml','yaml',
                   'parquet','avro','orc','binary','raw'] },
        { id:'ds_f_watch',     label:'Surveiller (inotify)',
          type:'toggle', value:true },
        { id:'ds_f_tail',      label:'Tail (flux continu)',
          type:'toggle', value:false },
        { id:'ds_f_encoding',  label:'Encodage',
          type:'select', value:'utf-8',
          options:['utf-8','iso-8859-1','windows-1252','ascii','utf-16'] },
        { id:'ds_f_delimiter', label:'D\u00e9limiteur CSV',
          type:'text',   value:',' },
        { id:'ds_f_headers',   label:'En-t\u00eates CSV',
          type:'toggle', value:true },
        { id:'ds_f_regex',     label:'Regex filtre',
          type:'text',   value:'', placeholder:'ERROR|WARN' },
        { id:'ds_f_rotate',    label:'G\u00e9rer rotation',
          type:'toggle', value:true },
        { id:'ds_f_machine',   label:'Machine source',
          type:'text',   value:'localhost' },
        { id:'ds_f_enabled',   label:'Activ\u00e9',
          type:'toggle', value:true },
      ]},
    ]},

    /* ── 4. Images — Stockage & Config (19 champs) ──────────────── */
    images: { id:'ds-images', sections:[
      { label:'Images \u2014 Stockage & Config', icon:'\uD83D\uDDBC', first:true, fields:[
        { id:'ds_img_storage',     label:'Type de stockage',
          type:'select', value:'local',
          options:['local','s3','gcs','azure-blob','cloudflare-r2','minio',
                   'sftp','ftp','backblaze-b2','nextcloud','gdrive'] },
        { id:'ds_img_path',        label:'Chemin local',
          type:'text',   value:'' }, /* P0 — './uploads/images' vid\u00e9 */
        { id:'ds_img_bucket',      label:'Bucket / Container',
          type:'text',   value:'' },
        { id:'ds_img_endpoint',    label:'Endpoint S3',
          type:'url',    value:'' },
        { id:'ds_img_key',         label:'Access Key',
          type:'text',   value:'' },
        { id:'ds_img_secret',      label:'Secret Key',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'ds_img_cdn_url',     label:'CDN URL',
          type:'url',    value:'', placeholder:'<cdn-url>' }, /* P0 — hostname vid\u00e9 */
        { id:'ds_img_max_size',    label:'Taille max (MB)',
          type:'number', value:'10' },
        { id:'ds_img_formats',     label:'Formats accept\u00e9s',
          type:'text',   value:'jpg,jpeg,png,webp,gif,bmp,tiff,svg,ico' },
        { id:'ds_img_resize',      label:'Redimensionner auto',
          type:'toggle', value:true },
        { id:'ds_img_w',           label:'Largeur max (px)',
          type:'number', value:'2048' },
        { id:'ds_img_h',           label:'Hauteur max (px)',
          type:'number', value:'2048' },
        { id:'ds_img_quality',     label:'Qualit\u00e9 (1-100)',
          type:'number', value:'85' },
        { id:'ds_img_thumb',       label:'G\u00e9n\u00e9rer thumbnails',
          type:'toggle', value:true },
        { id:'ds_img_thumb_sizes', label:'Tailles thumbs',
          type:'text',   value:'150x150,300x300,600x600' },
        { id:'ds_img_webp',        label:'Convertir en WebP',
          type:'toggle', value:true },
        { id:'ds_img_strip_meta',  label:'Supprimer metadata EXIF',
          type:'toggle', value:true },
        { id:'ds_img_public',      label:'Acc\u00e8s public',
          type:'toggle', value:false },
        { id:'ds_img_prefix',      label:'Pr\u00e9fixe cl\u00e9',
          type:'text',   value:'' }, /* P0 — 'uploads/' vid\u00e9 */
      ]},
    ]},

    /* ── 5. Données calculées / Probabilités (10 champs) ─────────── */
    computed: { id:'ds-computed', sections:[
      { label:'Donn\u00e9es calcul\u00e9es / Probabilit\u00e9s', icon:'\uD83D\uDCC8', first:true, fields:[
        { id:'ds_c_name',            label:'Nom calcul',
          type:'text',   value:'', placeholder:'<nom-calcul>' },
        { id:'ds_c_sources',         label:'Sources (csv noms)',
          type:'text',   value:'', placeholder:'<source1>,<source2>' },
        { id:'ds_c_formula',         label:'Formule / Expression',
          type:'textarea', value:'', rows:3,
          hint:'JS: sources.<nom>.champ * poids + ...', /* P0 — noms concrets neutralis\u00e9s */
          wide:true },
        { id:'ds_c_method',          label:'M\u00e9thode statistique',
          type:'select', value:'average',
          options:['average','weighted_avg','median','percentile','std_dev',
                   'min','max','sum','count','rate','zscore','moving_avg','bayesian'] },
        { id:'ds_c_window',          label:'Fen\u00eatre temps (s)',
          type:'number', value:'3600' },
        { id:'ds_c_threshold_warn',  label:'Seuil WARN',
          type:'number', value:'70' },
        { id:'ds_c_threshold_err',   label:'Seuil ERROR',
          type:'number', value:'90' },
        { id:'ds_c_output',          label:'Format sortie',
          type:'select', value:'number',
          options:['number','percent','boolean','string','json','chart-data'] },
        { id:'ds_c_display',         label:'Affichage',
          type:'select', value:'gauge',
          options:['gauge','progress','sparkline','number','badge','table','heatmap'] },
        { id:'ds_c_refresh',         label:'Rafra\u00eechir (s)',
          type:'number', value:'30' },
      ]},
    ]},

  }, /* /forms */

  /* ════════════════════════════════════════════════════════════════
     CONDITIONS — when/show ($COND canonique)
     L'inline d'origine n'avait aucune condition déclarée.
     Tableau vide — ne pas inventer hors périmètre.
     ════════════════════════════════════════════════════════════════ */
  conditions: [],

  /* ════════════════════════════════════════════════════════════════
     VALIDATORS — $VALID
     ════════════════════════════════════════════════════════════════ */
  validators: [
    { field:'ds_api_url',         url:true      },
    { field:'ds_db_host',         required:true },
    { field:'ds_api_name',        required:true },
    { field:'ds_img_endpoint',    url:true      },
    { field:'ds_img_cdn_url',     url:true      },
  ],

  /* ════════════════════════════════════════════════════════════════
     PROFILE BINDINGS — F-14
     Pas de binding entrant sur MOD_DATA_SOURCES.
     ════════════════════════════════════════════════════════════════ */
  profile_bindings: [],

}; /* /MOD_DATA_SOURCES_DATA */

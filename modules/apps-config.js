/**
 * modules/apps-config.js — MOD_APPS_CFG_DATA
 * LocalCMS · M-4.3 · Manifeste déclaratif V1 · v1.0.0
 *
 * ═══ CONTRAT ═══════════════════════════════════════════════════════
 *
 * Données déclaratives uniquement. Aucune fonction. Aucun effet de bord.
 *
 * Contenu :
 *   ✓ Identité module
 *   ✓ meta (activeDefault, typeIcons, typeLabels)
 *   ✓ 6 forms :
 *       nginx        36 champs
 *       postgresql   27 champs
 *       redis        29 champs
 *       postfix      20 champs
 *       prometheus   22 champs
 *       backup       20 champs
 *       ─────────────────────
 *       TOTAL       154 champs
 *   ✓ conditions[]       — vide (inline sans conditions)
 *   ✓ validators[]       — champs obligatoires
 *   ✓ profile_bindings[] — vide
 *
 * Non contenu :
 *   ✗ generators (logique de génération conf/yaml/sh) → bridge
 *   ✗ render / switchType / generate / init           → bridge
 *   ✗ HTML inline
 *
 * F-15 — champs sensitive:true (5) :
 *   redis_password, redis_replica_auth,
 *   pf_relay_pass, bk_repo_pass, bk_aws_secret
 *
 * P0 — Valeurs vidées (14) :
 *   ng_server_name  : 'example.com'                                 → ''
 *   ng_root         : '/var/www/html'                               → ''
 *   ng_ssl_cert     : '/etc/letsencrypt/live/domain/fullchain.pem'  → ''
 *   ng_ssl_key      : '/etc/letsencrypt/live/domain/privkey.pem'    → ''
 *   redis_ssl_cert  : '/path/to/redis.crt'                         → ''
 *   redis_ssl_key   : '/path/to/redis.key'                         → ''
 *   redis_dir       : '/var/lib/redis'                              → ''
 *   pf_hostname     : 'mail.example.com'                            → ''
 *   pf_domain       : 'example.com'                                 → ''
 *   pf_cert         : '/etc/ssl/certs/ssl-cert-snakeoil.pem'       → ''
 *   pf_key          : '/etc/ssl/private/ssl-cert-snakeoil.key'     → ''
 *   pf_aliases      : 'hash:/etc/aliases'                           → ''
 *   prom_alert_rules: '/etc/prometheus/rules/*.yml'                 → ''
 *   bk_src          : '/home\n/etc\n/var/www'                       → ''
 *
 * P0 — Valeurs conservées (P0 conformes) :
 *   ng_proxy_pass       : 'http://localhost:3000'     (URL service local)
 *   ng_upstream_servers : 'server 127.0.0.1:3000;…'  (loopback)
 *   pf_origin           : '$mydomain'                 (référence variable)
 *   pf_destinations     : '$myhostname localhost…'    (références variables)
 *   pf_networks         : '127.0.0.0/8 [::1]/128'    (loopback standard)
 *   prom_path           : 'http://localhost:9090'     (URL service local)
 *   prom_alertmgr_url   : 'http://localhost:9093'     (URL service local)
 *
 * P0 — Placeholders neutralisés (7) :
 *   ng_server_name  : 'example.com www.example.com'                → '<domaine> www.<domaine>'
 *   ng_proxy_pass   : 'http://127.0.0.1:3000'                      → '<url-backend>'
 *   pg_hba_subnet   : '192.168.1.0/24'                             → '<sous-reseau/masque>'
 *   redis_unixsocket: '/run/redis/redis.sock'                      → '<chemin-socket>'
 *   redis_replica_of: '192.168.1.1 6379'                           → '<ip-master> <port>'
 *   pf_networks     : '127.0.0.0/8 192.168.1.0/24'                → '<réseaux autorisés>'
 *   bk_dest_path    : '/backup ou s3:…'                            → '<local:/chemin ou s3:bucket/path ou sftp:serveur:/chemin>'
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const MOD_APPS_CFG_DATA = {

  /* ── Identité ──────────────────────────────────────────────────── */
  id:           'apps_cfg',
  label:        'Applications',
  icon:         '\uD83D\uDCE6',
  version:      '1.0.0',
  group:        'applications',
  type:         'config',
  capabilities: ['render', 'generate'],
  os_compat:    ['all'],
  interfaces:   ['config'],

  /* ── Métadonnées ────────────────────────────────────────────────── */
  meta: {
    activeDefault: 'nginx',
    typeIcons: {
      nginx:      '\uD83C\uDF10',
      postgresql: '\uD83D\uDDC4',
      redis:      '\u26A1',
      postfix:    '\uD83D\uDCE7',
      prometheus: '\uD83D\uDCCA',
      backup:     '\uD83D\uDCBE',
    },
    typeLabels: {
      nginx:      'nginx',
      postgresql: 'PostgreSQL',
      redis:      'Redis',
      postfix:    'Postfix/SMTP',
      prometheus: 'Prometheus',
      backup:     'Backup/Restic',
    },
  },

  /* ════════════════════════════════════════════════════════════════
     FORMS — 6 forms, 154 champs
     ════════════════════════════════════════════════════════════════ */
  forms: {

    /* ── 1. nginx (36 champs) ───────────────────────────────────── */
    nginx: { id:'apps-nginx', sections:[
      { label:'Serveur HTTP', icon:'\uD83C\uDF10', first:true, fields:[
        { id:'ng_server_name',    label:'server_name',              type:'text',        value:'',
          placeholder:'<domaine> www.<domaine>' },                             /* P0 */
        { id:'ng_listen',         label:'Port (listen)',             type:'select',      value:'80',
          options:['80','443','8080','8443','3000'] },
        { id:'ng_root',           label:'root',                     type:'text',        value:'' },
        /* P0 — '/var/www/html' vidé */
        { id:'ng_index',          label:'index',                    type:'text',        value:'index.html index.php' },
        { id:'ng_ssl',            label:'SSL/TLS',                  type:'toggle',      value:false },
        { id:'ng_ssl_cert',       label:'ssl_certificate',          type:'text',        value:'' },
        /* P0 — '/etc/letsencrypt/…' vidé */
        { id:'ng_ssl_key',        label:'ssl_certificate_key',      type:'text',        value:'' },
        /* P0 — '/etc/letsencrypt/…' vidé */
        { id:'ng_ssl_proto',      label:'ssl_protocols',            type:'multiselect',
          value:['TLSv1.2','TLSv1.3'], options:['TLSv1.2','TLSv1.3'] },
        { id:'ng_hsts',           label:'HSTS',                     type:'toggle',      value:true },
        { id:'ng_http2',          label:'HTTP/2',                   type:'toggle',      value:true },
      ]},
      { label:'Proxy / Upstream', icon:'\uD83D\uDD00', fields:[
        { id:'ng_proxy',          label:'Proxy pass',               type:'toggle',      value:false },
        { id:'ng_proxy_pass',     label:'proxy_pass URL',           type:'url',
          value:'http://localhost:3000',                                        /* localhost — P0 conforme */
          placeholder:'<url-backend>' },                                        /* P0 ph */
        { id:'ng_proxy_timeout',  label:'proxy_read_timeout',       type:'number',      value:'60' },
        { id:'ng_proxy_buffers',  label:'proxy_buffers',            type:'text',        value:'4 16k' },
        { id:'ng_upstream_name',  label:'upstream name',            type:'text',        value:'app_servers' },
        { id:'ng_upstream_servers',label:'Upstream servers',        type:'textarea',
          value:'server 127.0.0.1:3000;\n# server 127.0.0.1:3001;', rows:3, wide:true },
        /* loopback P0 conforme */
        { id:'ng_lb_method',      label:'Load balancing',           type:'select',      value:'round_robin',
          options:['round_robin','least_conn','ip_hash','hash','random'] },
      ]},
      { label:'Performance', icon:'\u26A1', fields:[
        { id:'ng_gzip',           label:'gzip',                     type:'toggle',      value:true },
        { id:'ng_gzip_types',     label:'gzip_types',               type:'text',
          value:'text/plain text/css application/json application/javascript', wide:true },
        { id:'ng_gzip_level',     label:'gzip_comp_level',          type:'select',      value:'6',
          options:['1','2','3','4','5','6','7','8','9'] },
        { id:'ng_keepalive',      label:'keepalive_timeout',        type:'number',      value:'65' },
        { id:'ng_client_max',     label:'client_max_body_size',     type:'select',      value:'10m',
          options:['1m','5m','10m','50m','100m','unlimited'] },
        { id:'ng_worker_conn',    label:'worker_connections',       type:'number',      value:'1024' },
        { id:'ng_sendfile',       label:'sendfile',                 type:'toggle',      value:true },
        { id:'ng_tcpnopush',      label:'tcp_nopush',               type:'toggle',      value:true },
      ]},
      { label:'S\u00e9curit\u00e9 Headers', icon:'\uD83D\uDD12', fields:[
        { id:'ng_xframe',         label:'X-Frame-Options',          type:'select',      value:'SAMEORIGIN',
          options:['DENY','SAMEORIGIN','ALLOW-FROM'] },
        { id:'ng_xcontent',       label:'X-Content-Type-Options',   type:'toggle',      value:true },
        { id:'ng_xss',            label:'X-XSS-Protection',         type:'toggle',      value:true },
        { id:'ng_referrer',       label:'Referrer-Policy',          type:'select',
          value:'no-referrer-when-downgrade',
          options:['no-referrer','strict-origin','same-origin',
                   'no-referrer-when-downgrade','strict-origin-when-cross-origin'] },
        { id:'ng_csp',            label:'Content-Security-Policy',  type:'text',        value:'',
          placeholder:"default-src 'self'", wide:true },
        { id:'ng_ratelimit',      label:'limit_req_zone',           type:'toggle',      value:false },
        { id:'ng_rate',           label:'Rate limit (r/s)',         type:'number',      value:'10' },
      ]},
      { label:'Cache statique', icon:'\uD83D\uDCBE', fields:[
        { id:'ng_static_cache',   label:'Cache fichiers statiques', type:'toggle',      value:true },
        { id:'ng_cache_time',     label:'expires',                  type:'select',      value:'1y',
          options:['1h','24h','7d','30d','1y','max'] },
        { id:'ng_cache_exts',     label:'Extensions',               type:'text',
          value:'jpg jpeg png gif ico css js woff woff2 ttf' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'ng_file_ext',       label:'Extension',                type:'file-ext',    value:'conf',
          allowed:['conf','sh','txt'] },
      ]},
    ]},

    /* ── 2. postgresql (27 champs) ──────────────────────────────── */
    postgresql: { id:'apps-pg', sections:[
      { label:'Connexion', icon:'\uD83D\uDDC4', first:true, fields:[
        { id:'pg_listen',         label:'listen_addresses',         type:'text',        value:'localhost',
          placeholder:'localhost ou *' },
        { id:'pg_port',           label:'port',                     type:'number',      value:'5432' },
        { id:'pg_max_conn',       label:'max_connections',          type:'select',      value:'100',
          options:['50','100','200','300','500','1000'] },
        { id:'pg_superuser_reserved',label:'superuser_reserved_connections',type:'number',value:'3' },
        { id:'pg_ssl',            label:'ssl',                      type:'toggle',      value:false },
        { id:'pg_ssl_cert',       label:'ssl_cert_file',            type:'text',        value:'server.crt' },
        { id:'pg_ssl_key',        label:'ssl_key_file',             type:'text',        value:'server.key' },
      ]},
      { label:'M\u00e9moire', icon:'\uD83D\uDCBE', fields:[
        { id:'pg_shared_buffers', label:'shared_buffers',           type:'select',      value:'256MB',
          options:['64MB','128MB','256MB','512MB','1GB','2GB','4GB','8GB'] },
        { id:'pg_effective_cache',label:'effective_cache_size',     type:'select',      value:'1GB',
          options:['256MB','512MB','1GB','2GB','4GB','8GB','16GB'] },
        { id:'pg_work_mem',       label:'work_mem',                 type:'select',      value:'4MB',
          options:['1MB','4MB','8MB','16MB','32MB','64MB','128MB'] },
        { id:'pg_maintenance_work_mem',label:'maintenance_work_mem',type:'select',      value:'64MB',
          options:['16MB','64MB','128MB','256MB','512MB'] },
        { id:'pg_huge_pages',     label:'huge_pages',               type:'select',      value:'try',
          options:['off','try','on'] },
      ]},
      { label:'Write-Ahead Log', icon:'\uD83D\uDCDD', fields:[
        { id:'pg_wal_level',      label:'wal_level',                type:'select',      value:'replica',
          options:['minimal','replica','logical'] },
        { id:'pg_wal_buffers',    label:'wal_buffers',              type:'select',      value:'16MB',
          options:['1MB','4MB','16MB','64MB','-1 (auto)'] },
        { id:'pg_checkpoint_completion',label:'checkpoint_completion_target',type:'text',value:'0.9' },
        { id:'pg_max_wal_size',   label:'max_wal_size',             type:'select',      value:'1GB',
          options:['256MB','1GB','2GB','4GB'] },
        { id:'pg_min_wal_size',   label:'min_wal_size',             type:'select',      value:'80MB',
          options:['32MB','80MB','256MB'] },
      ]},
      { label:'Logging', icon:'\uD83D\uDCCA', fields:[
        { id:'pg_log_dest',       label:'log_destination',          type:'select',      value:'stderr',
          options:['stderr','csvlog','syslog','jsonlog'] },
        { id:'pg_log_duration',   label:'log_duration',             type:'toggle',      value:false },
        { id:'pg_log_min_duration',label:'log_min_duration_statement (ms)',type:'number',value:'1000',
          hint:'log requ\u00eates lentes >Xms, -1=off' },
        { id:'pg_log_stmts',      label:'log_statement',            type:'select',      value:'none',
          options:['none','ddl','mod','all'] },
        { id:'pg_log_connections',label:'log_connections',          type:'toggle',      value:false },
        { id:'pg_log_disconnections',label:'log_disconnections',    type:'toggle',      value:false },
      ]},
      { label:'Authentification (pg_hba)', icon:'\uD83D\uDD10', fields:[
        { id:'pg_hba_local',      label:'Local connections',        type:'select',      value:'peer',
          options:['trust','peer','md5','scram-sha-256','reject'] },
        { id:'pg_hba_host',       label:'Host connections',         type:'select',      value:'scram-sha-256',
          options:['trust','md5','scram-sha-256','reject','ldap','radius','cert'] },
        { id:'pg_hba_subnet',     label:'Subnet autoris\u00e9',     type:'text',        value:'127.0.0.1/32',
          placeholder:'<sous-reseau/masque>' },                                 /* P0 ph */
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'pg_file_ext',       label:'Extension',                type:'file-ext',    value:'conf',
          allowed:['conf','sh','txt'] },
      ]},
    ]},

    /* ── 3. redis (29 champs) ───────────────────────────────────── */
    redis: { id:'apps-redis', sections:[
      { label:'R\u00e9seau & Auth', icon:'\u26A1', first:true, fields:[
        { id:'redis_bind',        label:'bind',                     type:'text',        value:'127.0.0.1',
          placeholder:'127.0.0.1 ::1' },                                        /* loopback conservé */
        { id:'redis_port',        label:'port',                     type:'number',      value:'6379' },
        { id:'redis_unixsocket',  label:'unixsocket',               type:'text',        value:'',
          placeholder:'<chemin-socket>' },                                       /* P0 ph */
        { id:'redis_password',    label:'requirepass',              type:'password',    value:'',
          sensitive:true },
        { id:'redis_protected_mode',label:'protected-mode',         type:'toggle',      value:true },
        { id:'redis_ssl',         label:'TLS',                      type:'toggle',      value:false },
        { id:'redis_ssl_port',    label:'tls-port',                 type:'number',      value:'6380' },
        { id:'redis_ssl_cert',    label:'tls-cert-file',            type:'text',        value:'' },
        /* P0 — '/path/to/redis.crt' vidé */
        { id:'redis_ssl_key',     label:'tls-key-file',             type:'text',        value:'' },
        /* P0 — '/path/to/redis.key' vidé */
        { id:'redis_max_clients', label:'maxclients',               type:'number',      value:'10000' },
      ]},
      { label:'M\u00e9moire & Eviction', icon:'\uD83D\uDCBE', fields:[
        { id:'redis_maxmemory',   label:'maxmemory',                type:'text',        value:'256mb',
          placeholder:'256mb / 1gb' },
        { id:'redis_eviction',    label:'maxmemory-policy',         type:'select',      value:'allkeys-lru',
          options:['noeviction','allkeys-lru','allkeys-lfu','volatile-lru',
                   'volatile-lfu','allkeys-random','volatile-random','volatile-ttl'] },
        { id:'redis_lazyfree',    label:'lazyfree-lazy-eviction',   type:'toggle',      value:true },
        { id:'redis_active_expire',label:'active-expire-enabled',   type:'toggle',      value:true },
      ]},
      { label:'Persistance', icon:'\uD83D\uDCFF', fields:[
        { id:'redis_save',        label:'save (RDB)',                type:'toggle',      value:true },
        { id:'redis_save_rules',  label:'save rules',               type:'textarea',
          value:'900 1\n300 10\n60 10000', rows:3, hint:'secondes changements' },
        { id:'redis_rdbfile',     label:'dbfilename',               type:'text',        value:'dump.rdb' },
        { id:'redis_dir',         label:'dir',                      type:'text',        value:'' },
        /* P0 — '/var/lib/redis' vidé */
        { id:'redis_aof',         label:'appendonly (AOF)',          type:'toggle',      value:false },
        { id:'redis_aof_fsync',   label:'appendfsync',              type:'select',      value:'everysec',
          options:['always','everysec','no'] },
        { id:'redis_aof_rewrite', label:'auto-aof-rewrite-percentage',type:'number',    value:'100' },
      ]},
      { label:'Replication', icon:'\uD83D\uDD04', fields:[
        { id:'redis_replica_of',  label:'replicaof',                type:'text',        value:'',
          placeholder:'<ip-master> <port>' },                                   /* P0 ph */
        { id:'redis_replica_auth',label:'masterauth',               type:'password',    value:'',
          sensitive:true },
        { id:'redis_replica_readonly',label:'replica-read-only',    type:'toggle',      value:true },
        { id:'redis_min_replicas',label:'min-replicas-to-write',    type:'number',      value:'0' },
      ]},
      { label:'Cluster', icon:'\uD83C\uDF10', fields:[
        { id:'redis_cluster',     label:'cluster-enabled',          type:'toggle',      value:false },
        { id:'redis_cluster_config',label:'cluster-config-file',    type:'text',        value:'nodes.conf' },
        { id:'redis_cluster_timeout',label:'cluster-node-timeout (ms)',type:'number',   value:'15000' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'redis_file_ext',    label:'Extension',                type:'file-ext',    value:'conf',
          allowed:['conf','sh','txt'] },
      ]},
    ]},

    /* ── 4. postfix (20 champs) ─────────────────────────────────── */
    postfix: { id:'apps-postfix', sections:[
      { label:'Identit\u00e9', icon:'\uD83D\uDCE7', first:true, fields:[
        { id:'pf_hostname',       label:'myhostname',               type:'text',        value:'' },
        /* P0 — 'mail.example.com' vidé */
        { id:'pf_domain',         label:'mydomain',                 type:'text',        value:'' },
        /* P0 — 'example.com' vidé */
        { id:'pf_origin',         label:'myorigin',                 type:'text',        value:'$mydomain' },
        { id:'pf_networks',       label:'mynetworks',               type:'text',
          value:'127.0.0.0/8 [::1]/128',                                        /* loopback conservé */
          placeholder:'<r\u00e9seaux autoris\u00e9s>', wide:true },              /* P0 ph */
      ]},
      { label:'Relay & Destinations', icon:'\uD83D\uDD00', fields:[
        { id:'pf_relayhost',      label:'relayhost',                type:'text',        value:'',
          placeholder:'[smtp.gmail.com]:587' },
        { id:'pf_relay_user',     label:'SMTP username',            type:'email',       value:'' },
        { id:'pf_relay_pass',     label:'SMTP password',            type:'password',    value:'',
          sensitive:true },
        { id:'pf_destinations',   label:'mydestination',            type:'text',
          value:'$myhostname localhost.$mydomain localhost $mydomain', wide:true },
        { id:'pf_aliases',        label:'alias_maps',               type:'text',        value:'' },
        /* P0 — 'hash:/etc/aliases' vidé */
      ]},
      { label:'TLS / S\u00e9curit\u00e9', icon:'\uD83D\uDD12', fields:[
        { id:'pf_tls_in',         label:'TLS entrant',              type:'select',      value:'may',
          options:['none','may','encrypt'] },
        { id:'pf_tls_out',        label:'TLS sortant',              type:'select',      value:'encrypt',
          options:['none','may','encrypt'] },
        { id:'pf_cert',           label:'smtpd_tls_cert_file',      type:'text',        value:'' },
        /* P0 — '/etc/ssl/certs/ssl-cert-snakeoil.pem' vidé */
        { id:'pf_key',            label:'smtpd_tls_key_file',       type:'text',        value:'' },
        /* P0 — '/etc/ssl/private/ssl-cert-snakeoil.key' vidé */
        { id:'pf_sasl',           label:'SASL Auth',                type:'toggle',      value:true },
        { id:'pf_spf',            label:'SPF check',                type:'toggle',      value:true },
        { id:'pf_dkim',           label:'DKIM (opendkim)',           type:'toggle',      value:false },
      ]},
      { label:'Limites', icon:'\uD83D\uDCCA', fields:[
        { id:'pf_msg_size',       label:'message_size_limit (bytes)',type:'number',      value:'10240000' },
        { id:'pf_rcpt_limit',     label:'smtpd_recipient_limit',    type:'number',      value:'1000' },
        { id:'pf_queue_lifetime', label:'maximal_queue_lifetime',   type:'select',      value:'5d',
          options:['1d','2d','5d','7d'] },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'pf_file_ext',       label:'Extension',                type:'file-ext',    value:'conf',
          allowed:['conf','sh','txt'] },
      ]},
    ]},

    /* ── 5. prometheus (22 champs) ──────────────────────────────── */
    prometheus: { id:'apps-prom', sections:[
      { label:'Serveur', icon:'\uD83D\uDCCA', first:true, fields:[
        { id:'prom_host',         label:'Host',                     type:'text',        value:'0.0.0.0' },
        { id:'prom_port',         label:'Port',                     type:'number',      value:'9090' },
        { id:'prom_path',         label:'--web.external-url',       type:'url',
          value:'http://localhost:9090' },                                       /* URL locale — P0 conforme */
        { id:'prom_retention',    label:'--storage.tsdb.retention.time',type:'select', value:'15d',
          options:['7d','15d','30d','90d','1y'] },
        { id:'prom_retention_size',label:'Max storage',             type:'select',      value:'10GB',
          options:['1GB','5GB','10GB','50GB','100GB'] },
      ]},
      { label:'Scrape global', icon:'\u2699', fields:[
        { id:'prom_scrape_interval',label:'scrape_interval',        type:'select',      value:'15s',
          options:['5s','10s','15s','30s','60s'] },
        { id:'prom_eval_interval', label:'evaluation_interval',     type:'select',      value:'15s',
          options:['5s','10s','15s','30s','60s'] },
        { id:'prom_scrape_timeout',label:'scrape_timeout',          type:'select',      value:'10s',
          options:['5s','10s','30s'] },
      ]},
      { label:'Jobs de scrape', icon:'\uD83C\uDFAF', fields:[
        { id:'prom_job_node',     label:'node_exporter',            type:'toggle',      value:true },
        { id:'prom_node_port',    label:'node port',                type:'number',      value:'9100' },
        { id:'prom_job_app',      label:'Application',              type:'toggle',      value:true },
        { id:'prom_app_port',     label:'app metrics port',         type:'number',      value:'8080' },
        { id:'prom_app_path',     label:'app metrics path',         type:'text',        value:'/metrics' },
        { id:'prom_job_pg',       label:'postgres_exporter',        type:'toggle',      value:false },
        { id:'prom_job_redis',    label:'redis_exporter',           type:'toggle',      value:false },
        { id:'prom_job_nginx',    label:'nginx_exporter',           type:'toggle',      value:false },
      ]},
      { label:'Alertmanager', icon:'\uD83D\uDD14', fields:[
        { id:'prom_alertmgr',     label:'Alertmanager',             type:'toggle',      value:false },
        { id:'prom_alertmgr_url', label:'URL',                      type:'url',
          value:'http://localhost:9093' },                                       /* URL locale — P0 conforme */
        { id:'prom_alert_rules',  label:'R\u00e8gles fichier',      type:'text',        value:'' },
        /* P0 — '/etc/prometheus/rules/*.yml' vidé */
        { id:'prom_alert_slack',  label:'Slack webhook',            type:'url',         value:'' },
        { id:'prom_alert_email',  label:'Email',                    type:'email',       value:'' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'prom_file_ext',     label:'Extension',                type:'file-ext',    value:'yaml',
          allowed:['yaml','yml','sh','txt'] },
      ]},
    ]},

    /* ── 6. backup (20 champs) ──────────────────────────────────── */
    backup: { id:'apps-backup', sections:[
      { label:'Outil & Source', icon:'\uD83D\uDCBE', first:true, fields:[
        { id:'bk_tool',           label:'Outil de backup',          type:'select',      value:'restic',
          options:['restic','rsync','borgbackup','duplicati','rclone','tar+gpg','custom'] },
        { id:'bk_src',            label:'Source(s)',                 type:'textarea',    value:'',
          /* P0 — '/home\n/etc\n/var/www' vidé */
          rows:4, wide:true, hint:'Un chemin par ligne' },
        { id:'bk_exclude',        label:'Exclusions',               type:'textarea',
          value:'*.log\n*.tmp\nnode_modules\n.git', rows:3, wide:true },
      ]},
      { label:'Destination', icon:'\uD83D\uDCE6', fields:[
        { id:'bk_dest_type',      label:'Type de destination',      type:'select',      value:'local',
          options:['local','ssh','s3','b2','rclone','sftp','azure','gcs'] },
        { id:'bk_dest_path',      label:'Chemin/URL',               type:'text',        value:'',
          placeholder:'<local:/chemin ou s3:bucket/path ou sftp:serveur:/chemin>' }, /* P0 ph */
        { id:'bk_repo_pass',      label:'Mot de passe repo',        type:'password',    value:'',
          sensitive:true },
        { id:'bk_aws_key',        label:'AWS Access Key',           type:'text',        value:'' },
        { id:'bk_aws_secret',     label:'AWS Secret',               type:'password',    value:'',
          sensitive:true },
        { id:'bk_ssh_user',       label:'SSH User',                 type:'text',        value:'' },
        { id:'bk_ssh_host',       label:'SSH Host',                 type:'text',        value:'' },
      ]},
      { label:'R\u00e9tention', icon:'\uD83D\uDCC5', fields:[
        { id:'bk_keep_daily',     label:'keep-daily',               type:'number',      value:'7' },
        { id:'bk_keep_weekly',    label:'keep-weekly',              type:'number',      value:'4' },
        { id:'bk_keep_monthly',   label:'keep-monthly',             type:'number',      value:'12' },
        { id:'bk_keep_yearly',    label:'keep-yearly',              type:'number',      value:'5' },
        { id:'bk_prune',          label:'Pruner auto',              type:'toggle',      value:true },
        { id:'bk_verify',         label:'V\u00e9rifier apr\u00e8s backup',type:'toggle',value:true },
      ]},
      { label:'Notifications', icon:'\uD83D\uDD14', fields:[
        { id:'bk_notify_slack',   label:'Slack webhook',            type:'url',         value:'' },
        { id:'bk_notify_email',   label:'Email',                    type:'email',       value:'' },
        { id:'bk_notify_on',      label:'Notifier sur',             type:'multiselect',
          value:['error'], options:['success','error','warning'] },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'bk_file_ext',       label:'Extension',                type:'file-ext',    value:'sh',
          allowed:['sh','txt','conf','yaml'] },
      ]},
    ]},

  }, /* /forms */

  /* ════════════════════════════════════════════════════════════════
     CONDITIONS — vide (inline sans conditions)
     ════════════════════════════════════════════════════════════════ */
  conditions: [],

  /* ════════════════════════════════════════════════════════════════
     VALIDATORS
     ════════════════════════════════════════════════════════════════ */
  validators: [
    { field:'ng_server_name', required:true },
    { field:'pf_hostname',    required:true },
    { field:'pf_domain',      required:true },
  ],

  /* ════════════════════════════════════════════════════════════════
     PROFILE BINDINGS — vide
     ════════════════════════════════════════════════════════════════ */
  profile_bindings: [],

}; /* /MOD_APPS_CFG_DATA */

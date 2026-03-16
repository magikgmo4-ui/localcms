/**
 * modules/queue-config.js — MOD_QUEUE_CFG_DATA
 * LocalCMS · M-4.1 · Manifeste déclaratif V1 · v1.0.0
 *
 * ═══ CONTRAT ═══════════════════════════════════════════════════════
 *
 * Données déclaratives uniquement. Aucune fonction. Aucun effet de bord.
 *
 * Contenu :
 *   ✓ Identité module
 *   ✓ meta (activeDefault, typeIcons, typeLabels)
 *   ✓ 4 forms (rabbitmq 26 / kafka 33 / nats 23 / webhooks 19 = 101 champs)
 *     fidèlement extraits de l'inline d'origine
 *   ✓ conditions[]       — vide (inline sans conditions)
 *   ✓ validators[]       — champs obligatoires / url
 *   ✓ profile_bindings[] — vide
 *
 * Non contenu :
 *   ✗ generators (logique JS de génération de fichiers) → bridge
 *   ✗ render / switchType / generate / init           → bridge
 *   ✗ HTML inline
 *
 * F-15 — champs sensitive:true (8) :
 *   rmq_pass, rmq_erlang_cookie, kfk_sasl_pass,
 *   nats_token, nats_password,
 *   wh_secret, wh_auth_token, wh_in_secret
 *
 * P0 — Valeurs vidées :
 *   rmq_pass      : 'guest'       → '' (credential, même si défaut)
 *   nats_js_store : '/tmp/nats'   → '' (chemin absolu)
 *   wh_in_path    : '/webhooks/incoming' → '' (chemin concret)
 *
 * P0 — Placeholders neutralisés :
 *   rmq_cert         : '/etc/ssl/rabbitmq/server.crt' → '<chemin-cert-tls>'
 *   kfk_ssl_ca       : '/etc/kafka/ssl/ca.crt'        → '<chemin-ca-cert>'
 *   wh_url           : 'https://api.example.com/...'  → '<url-webhook>'
 *   wh_in_path       : '/webhooks/github'              → '<path-webhook>'
 *   wh_in_ip_whitelist: '140.82.112.0/20 (GitHub)'   → '<plage-ip>'
 *
 * Valeurs conservées (génériques / localhost) :
 *   rmq_host:'localhost', rmq_vhost:'/', rmq_pass:'' (vidé)
 *   kfk_brokers:'localhost:9092' (service local)
 *   nats_host:'0.0.0.0' (adresse d'écoute standard)
 *   nats_subjects:'events.>' (pattern NATS standard)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const MOD_QUEUE_CFG_DATA = {

  /* ── Identité ──────────────────────────────────────────────────── */
  id:           'queue_cfg',
  label:        'Queue & Messages',
  icon:         '\uD83D\uDCE8',
  version:      '1.0.0',
  group:        'infrastructure',
  type:         'config',
  capabilities: ['render', 'generate'],
  os_compat:    ['all'],
  interfaces:   ['config'],

  /* ── Métadonnées ────────────────────────────────────────────────── */
  meta: {
    activeDefault: 'rabbitmq',
    typeIcons:  { rabbitmq:'\uD83D\uDC07', kafka:'\uD83D\uDCE1', nats:'\uD83D\uDE80', webhooks:'\uD83D\uDCE8' },
    typeLabels: { rabbitmq:'RabbitMQ', kafka:'Kafka', nats:'NATS / JetStream', webhooks:'WebHooks' },
  },

  /* ════════════════════════════════════════════════════════════════
     FORMS — 4 forms, 101 champs
     Structure fidèle à l'inline : id + sections[]
     ════════════════════════════════════════════════════════════════ */
  forms: {

    /* ── 1. RabbitMQ (26 champs) ────────────────────────────────── */
    rabbitmq: { id:'q-rabbit', sections:[
      { label:'Connexion', icon:'\uD83D\uDC07', first:true, fields:[
        { id:'rmq_host',               label:'Host',               type:'text',    value:'localhost' },
        { id:'rmq_port',               label:'Port AMQP',          type:'select',  value:'5672',
          options:['5672','5671 (TLS)','15672','15671'] },
        { id:'rmq_user',               label:'Username',           type:'text',    value:'guest' },
        { id:'rmq_pass',               label:'Password',           type:'password',value:'',
          sensitive:true },                                         /* P0 — 'guest' vidé */
        { id:'rmq_vhost',              label:'Virtual Host',       type:'text',    value:'/',
          placeholder:'/mon-app' },
        { id:'rmq_tls',                label:'TLS',                type:'toggle',  value:false },
        { id:'rmq_cert',               label:'TLS cert',           type:'text',    value:'',
          placeholder:'<chemin-cert-tls>' },                        /* P0 */
        { id:'rmq_heartbeat',          label:'heartbeat (s)',      type:'number',  value:'60' },
        { id:'rmq_prefetch',           label:'prefetch count',     type:'number',  value:'10' },
        { id:'rmq_connection_timeout', label:'Timeout (ms)',       type:'number',  value:'10000' },
      ]},
      { label:'Exchange & Queue', icon:'\uD83D\uDCE8', fields:[
        { id:'rmq_exchange',           label:'Exchange name',      type:'text',    value:'',
          placeholder:'my.exchange' },
        { id:'rmq_exchange_type',      label:'Exchange type',      type:'select',  value:'direct',
          options:['direct','topic','fanout','headers','x-delayed-message'] },
        { id:'rmq_exchange_durable',   label:'Exchange durable',   type:'toggle',  value:true },
        { id:'rmq_queue',              label:'Queue name',         type:'text',    value:'',
          placeholder:'my.queue' },
        { id:'rmq_queue_durable',      label:'Queue durable',      type:'toggle',  value:true },
        { id:'rmq_queue_exclusive',    label:'Exclusive',          type:'toggle',  value:false },
        { id:'rmq_queue_autodel',      label:'Auto-delete',        type:'toggle',  value:false },
        { id:'rmq_routing_key',        label:'Routing key',        type:'text',    value:'#',
          placeholder:'event.* ou #' },
        { id:'rmq_dlx',                label:'Dead Letter Exchange',type:'text',   value:'',
          placeholder:'dlx.exchange' },
        { id:'rmq_message_ttl',        label:'Message TTL (ms)',   type:'number',  value:'86400000' },
        { id:'rmq_max_length',         label:'Max queue length',   type:'number',  value:'',
          hint:'Vide = illimité' },
      ]},
      { label:'Cluster', icon:'\uD83C\uDF10', fields:[
        { id:'rmq_cluster',            label:'Mode cluster',       type:'select',  value:'standalone',
          options:['standalone','cluster','quorum'] },
        { id:'rmq_nodes',              label:'N\u0153uds',         type:'text',    value:'',
          placeholder:'rabbit@node1,rabbit@node2' },
        { id:'rmq_erlang_cookie',      label:'Erlang cookie',      type:'password',value:'',
          sensitive:true, placeholder:'ERLANG_COOKIE_SECRET' },
        { id:'rmq_ha_policy',          label:'HA policy',          type:'select',  value:'none',
          options:['none','all','exactly','nodes'] },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'rmq_file_ext',           label:'Extension',          type:'file-ext',value:'env',
          allowed:['env','json','yaml','conf'] },
      ]},
    ]},

    /* ── 2. Kafka (33 champs) ───────────────────────────────────── */
    kafka: { id:'q-kafka', sections:[
      { label:'Brokers', icon:'\uD83D\uDCE1', first:true, fields:[
        { id:'kfk_brokers',            label:'Bootstrap servers',  type:'text',    value:'localhost:9092',
          placeholder:'kafka1:9092,kafka2:9092', wide:true },
        { id:'kfk_protocol',           label:'Security protocol',  type:'select',  value:'PLAINTEXT',
          options:['PLAINTEXT','SSL','SASL_PLAINTEXT','SASL_SSL'] },
        { id:'kfk_sasl_mechanism',     label:'SASL mechanism',     type:'select',  value:'PLAIN',
          options:['PLAIN','SCRAM-SHA-256','SCRAM-SHA-512','GSSAPI','OAUTHBEARER'] },
        { id:'kfk_sasl_user',          label:'SASL username',      type:'text',    value:'' },
        { id:'kfk_sasl_pass',          label:'SASL password',      type:'password',value:'',
          sensitive:true },
        { id:'kfk_ssl_ca',             label:'SSL CA cert',        type:'text',    value:'',
          placeholder:'<chemin-ca-cert>' },                         /* P0 */
        { id:'kfk_ssl_cert',           label:'SSL client cert',    type:'text',    value:'' },
        { id:'kfk_ssl_key',            label:'SSL client key',     type:'text',    value:'' },
      ]},
      { label:'Producer', icon:'\uD83D\uDCE4', fields:[
        { id:'kfk_topic',              label:'Topic',              type:'text',    value:'',
          placeholder:'events.app.v1' },
        { id:'kfk_acks',               label:'acks',               type:'select',  value:'all',
          options:['0','1','all','-1'] },
        { id:'kfk_compression',        label:'compression.type',   type:'select',  value:'lz4',
          options:['none','gzip','snappy','lz4','zstd'] },
        { id:'kfk_batch_size',         label:'batch.size (bytes)', type:'number',  value:'16384' },
        { id:'kfk_linger_ms',          label:'linger.ms',          type:'number',  value:'5' },
        { id:'kfk_max_block',          label:'max.block.ms',       type:'number',  value:'60000' },
        { id:'kfk_retries',            label:'retries',            type:'number',  value:'3' },
        { id:'kfk_retry_backoff',      label:'retry.backoff.ms',   type:'number',  value:'100' },
        { id:'kfk_idempotent',         label:'enable.idempotence', type:'toggle',  value:true },
      ]},
      { label:'Consumer', icon:'\uD83D\uDCE5', fields:[
        { id:'kfk_group_id',           label:'group.id',           type:'text',    value:'',
          placeholder:'my-consumer-group' },
        { id:'kfk_auto_offset',        label:'auto.offset.reset',  type:'select',  value:'earliest',
          options:['earliest','latest','none'] },
        { id:'kfk_auto_commit',        label:'enable.auto.commit', type:'toggle',  value:true },
        { id:'kfk_commit_interval',    label:'auto.commit.interval.ms',type:'number',value:'5000' },
        { id:'kfk_max_poll',           label:'max.poll.records',   type:'number',  value:'500' },
        { id:'kfk_session_timeout',    label:'session.timeout.ms', type:'number',  value:'30000' },
        { id:'kfk_heartbeat',          label:'heartbeat.interval.ms',type:'number',value:'3000' },
        { id:'kfk_fetch_min',          label:'fetch.min.bytes',    type:'number',  value:'1' },
        { id:'kfk_fetch_max_wait',     label:'fetch.max.wait.ms',  type:'number',  value:'500' },
      ]},
      { label:'Topic / Cluster', icon:'\uD83D\uDDC4', fields:[
        { id:'kfk_partitions',         label:'num.partitions',     type:'number',  value:'1' },
        { id:'kfk_replication',        label:'replication.factor', type:'number',  value:'1' },
        { id:'kfk_retention_ms',       label:'retention.ms',       type:'number',  value:'604800000',
          hint:'7 jours par défaut' },
        { id:'kfk_retention_bytes',    label:'retention.bytes',    type:'number',  value:'-1',
          hint:'-1 = illimité' },
        { id:'kfk_cleanup_policy',     label:'cleanup.policy',     type:'select',  value:'delete',
          options:['delete','compact','delete,compact'] },
        { id:'kfk_min_isr',            label:'min.insync.replicas',type:'number',  value:'1' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'kfk_file_ext',           label:'Extension',          type:'file-ext',value:'env',
          allowed:['env','json','yaml','properties'] },
      ]},
    ]},

    /* ── 3. NATS / JetStream (23 champs) ───────────────────────── */
    nats: { id:'q-nats', sections:[
      { label:'Serveur NATS', icon:'\uD83D\uDE80', first:true, fields:[
        { id:'nats_host',              label:'Host',               type:'text',    value:'0.0.0.0' },
        { id:'nats_port',              label:'Port',               type:'number',  value:'4222' },
        { id:'nats_http_port',         label:'HTTP monitoring port',type:'number', value:'8222' },
        { id:'nats_cluster_name',      label:'Cluster name',       type:'text',    value:'',
          placeholder:'my-cluster' },
        { id:'nats_max_payload',       label:'max_payload (bytes)',type:'number',  value:'1048576' },
        { id:'nats_max_connections',   label:'max_connections',    type:'number',  value:'65536' },
        { id:'nats_ping_interval',     label:'ping_interval (s)',  type:'number',  value:'120' },
        { id:'nats_max_pings',         label:'max_pings_outstanding',type:'number',value:'3' },
      ]},
      { label:'Auth', icon:'\uD83D\uDD10', fields:[
        { id:'nats_auth',              label:'Authentification',   type:'select',  value:'none',
          options:['none','token','user_password','nkeys','jwt'] },
        { id:'nats_token',             label:'Token',              type:'password',value:'',
          sensitive:true },
        { id:'nats_user',              label:'Username',           type:'text',    value:'' },
        { id:'nats_password',          label:'Password',           type:'password',value:'',
          sensitive:true },
        { id:'nats_tls',               label:'TLS',                type:'toggle',  value:false },
      ]},
      { label:'JetStream', icon:'\uD83D\uDCBE', fields:[
        { id:'nats_jetstream',         label:'JetStream activ\u00e9',type:'toggle',value:false },
        { id:'nats_js_store',          label:'store_dir',          type:'text',    value:'' },
        /* P0 — '/tmp/nats' vidé */
        { id:'nats_js_max_mem',        label:'max_memory_store (GB)',type:'number',value:'1' },
        { id:'nats_js_max_disk',       label:'max_file_store (GB)',type:'number',  value:'10' },
        { id:'nats_stream_name',       label:'Stream name',        type:'text',    value:'',
          placeholder:'EVENTS' },
        { id:'nats_subjects',          label:'Subjects',           type:'text',    value:'events.>',
          placeholder:'events.> ou log.*' },
        { id:'nats_retention',         label:'Retention policy',   type:'select',  value:'limits',
          options:['limits','interest','workqueue'] },
        { id:'nats_max_msgs',          label:'max_msgs',           type:'number',  value:'-1',
          hint:'-1 = illimité' },
        { id:'nats_max_age',           label:'max_age',            type:'text',    value:'',
          placeholder:'24h, 7d' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'nats_file_ext',          label:'Extension',          type:'file-ext',value:'conf',
          allowed:['conf','env','json','yaml'] },
      ]},
    ]},

    /* ── 4. WebHooks (19 champs) ────────────────────────────────── */
    webhooks: { id:'q-webhooks', sections:[
      { label:'Webhook Sortant', icon:'\uD83D\uDCE4', first:true, fields:[
        { id:'wh_url',                 label:'URL destination',    type:'url',     value:'',
          placeholder:'<url-webhook>' },                            /* P0 */
        { id:'wh_method',              label:'M\u00e9thode HTTP',  type:'select',  value:'POST',
          options:['POST','PUT','PATCH'] },
        { id:'wh_content_type',        label:'Content-Type',       type:'select',
          value:'application/json',
          options:['application/json','application/x-www-form-urlencoded',
                   'text/plain','multipart/form-data'] },
        { id:'wh_secret',              label:'Secret (HMAC)',      type:'password',value:'',
          sensitive:true, placeholder:'Shared secret pour signature' },
        { id:'wh_hmac_algo',           label:'HMAC algorithm',     type:'select',  value:'sha256',
          options:['sha1','sha256','sha512'] },
        { id:'wh_auth_type',           label:'Auth type',          type:'select',  value:'hmac',
          options:['none','hmac','bearer','basic','api-key'] },
        { id:'wh_auth_token',          label:'Token / API Key',    type:'password',value:'',
          sensitive:true },
        { id:'wh_timeout',             label:'Timeout (ms)',       type:'number',  value:'10000' },
        { id:'wh_retry_count',         label:'Retry count',        type:'number',  value:'3' },
        { id:'wh_retry_delay',         label:'Retry delay (ms)',   type:'number',  value:'1000' },
        { id:'wh_retry_strategy',      label:'Retry strategy',     type:'select',  value:'exponential',
          options:['fixed','exponential','jitter'] },
        { id:'wh_events',              label:'\u00c9v\u00e9nements d\u00e9clencheurs',type:'text',
          value:'', placeholder:'push,pull_request,release', wide:true },
      ]},
      { label:'Webhook Entrant', icon:'\uD83D\uDCE5', fields:[
        { id:'wh_in_path',             label:'Path entrant',       type:'text',    value:'',
          placeholder:'<path-webhook>' },                           /* P0 — '/webhooks/incoming' vidé */
        { id:'wh_in_verify_sig',       label:'V\u00e9rifier signature',type:'toggle',value:true },
        { id:'wh_in_secret',           label:'Secret entrant',     type:'password',value:'',
          sensitive:true },
        { id:'wh_in_ip_whitelist',     label:'IP whitelist',       type:'text',    value:'',
          placeholder:'<plage-ip>', wide:true },                    /* P0 */
        { id:'wh_in_queue',            label:'Queue de traitement',type:'select',  value:'none',
          options:['none','rabbitmq','kafka','nats','memory'] },
        { id:'wh_in_queue_backend',    label:'Queue backend',      type:'text',    value:'' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'wh_file_ext',            label:'Extension',          type:'file-ext',value:'env',
          allowed:['env','json','yaml','sh'] },
      ]},
    ]},

  }, /* /forms */

  /* ════════════════════════════════════════════════════════════════
     CONDITIONS — vide (inline sans conditions)
     ════════════════════════════════════════════════════════════════ */
  conditions: [],

  /* ════════════════════════════════════════════════════════════════
     VALIDATORS — $VALID
     ════════════════════════════════════════════════════════════════ */
  validators: [
    { field:'rmq_host',    required:true },
    { field:'kfk_brokers', required:true },
    { field:'wh_url',      type:'url'    },
  ],

  /* ════════════════════════════════════════════════════════════════
     PROFILE BINDINGS — F-14 — vide (source de config, pas consommateur)
     ════════════════════════════════════════════════════════════════ */
  profile_bindings: [],

}; /* /MOD_QUEUE_CFG_DATA */

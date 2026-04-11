/**
 * modules/sec-config.js — MOD_SEC_CFG_DATA
 * LocalCMS · M-4.2 · Manifeste déclaratif V1 · v1.0.0
 *
 * ═══ CONTRAT ═══════════════════════════════════════════════════════
 *
 * Données déclaratives uniquement. Aucune fonction. Aucun effet de bord.
 *
 * Contenu :
 *   ✓ Identité module
 *   ✓ meta (activeDefault, typeIcons, typeLabels)
 *   ✓ 6 forms :
 *       ssl           28 champs  (SSL/TLS, certbot, openssl, config TLS)
 *       fail2ban      20 champs  (jails, custom jail)
 *       gpg           14 champs  (génération de clé, export)
 *       secrets        7 champs  (sops/age/vault)
 *       ssh_hardening 20 champs  (sshd_config durci)
 *       scan          19 champs  (Trivy, Semgrep, politique mots de passe)
 *       ─────────────────────────────
 *       TOTAL        108 champs
 *   ✓ conditions[]       — vide (inline sans conditions)
 *   ✓ validators[]       — fields obligatoires
 *   ✓ profile_bindings[] — vide
 *
 * Non contenu :
 *   ✗ generators (logique de génération bash/conf) → bridge
 *   ✗ render / switchType / generate / init        → bridge
 *   ✗ HTML inline
 *
 * F-15 — champs sensitive:true (1) :
 *   gpg_passphrase
 *
 * P0 — Valeurs vidées :
 *   ssl_webroot   : '/var/www/html'         → '' (chemin absolu serveur)
 *   f2b_destemail : 'admin@example.com'     → '' (email exemple concret)
 *   sshh_banner   : '/etc/issue.net'        → '' (chemin absolu)
 *
 * P0 — Placeholders neutralisés :
 *   ssl_domain        : 'example.com'                      → '<domaine>'
 *   ssl_san           : 'www.example.com,api.example.com'  → '<www.domaine,api.domaine>'
 *   ssl_cn            : 'example.com'                      → '<domaine>'
 *   gpg_recipient     : 'user@example.com'                 → '<fingerprint-ou-email>'
 *   f2b_custom_logpath: '/var/log/app/access.log'          → '<chemin-log>'
 *
 * Valeurs conservées (standards / génériques) :
 *   ssl_renew_hook   : 'systemctl reload nginx'   (commande standard générique)
 *   ssl_key_out/cert_out/csr_out : noms de fichiers génériques
 *   ssl_ciphers_custom : preset hardening standard (RFC)
 *   sshh_kex / sshh_ciphers / sshh_macs : hardening SSH standard (Mozilla)
 *   f2b_ignoreip     : '127.0.0.1/8 ::1'  (localhost/loopback — standard)
 *   sec_vars         : template clé=vide  (aucune valeur réelle)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const MOD_SEC_CFG_DATA = {

  /* ── Identité ──────────────────────────────────────────────────── */
  id:           'sec_cfg',
  label:        'S\u00e9curit\u00e9',
  icon:         '\uD83D\uDD12',
  version:      '1.0.0',
  group:        'security',
  type:         'config',
  capabilities: ['render', 'generate'],
  os_compat:    ['all'],
  interfaces:   ['config'],

  /* ── Métadonnées ────────────────────────────────────────────────── */
  meta: {
    activeDefault: 'ssl',
    typeIcons: {
      ssl:           '\uD83D\uDD12',
      fail2ban:      '\uD83D\uDEE1',
      gpg:           '\uD83D\uDD11',
      secrets:       '\uD83D\uDDDD',
      ssh_hardening: '\uD83D\uDD10',
      scan:          '\uD83D\uDD0D',
    },
    typeLabels: {
      ssl:           'SSL/TLS',
      fail2ban:      'Fail2ban',
      gpg:           'GPG',
      secrets:       'Secrets/sops',
      ssh_hardening: 'SSH Hardening',
      scan:          'Scan & Audit',
    },
  },

  /* ════════════════════════════════════════════════════════════════
     FORMS — 6 forms, 108 champs
     ════════════════════════════════════════════════════════════════ */
  forms: {

    /* ── 1. SSL/TLS (28 champs) ─────────────────────────────────── */
    ssl: { id:'sec-ssl', sections:[
      { label:'Certificat', icon:'\uD83D\uDD12', first:true, fields:[
        { id:'ssl_method',        label:'M\u00e9thode',          type:'select', value:'certbot',
          options:['certbot','acme.sh','openssl_self','openssl_ca','mkcert'] },
        { id:'ssl_domain',        label:'Domaine principal',     type:'text',   value:'',
          placeholder:'<domaine>' },                                    /* P0 */
        { id:'ssl_san',           label:'SAN (alt names)',       type:'text',   value:'',
          placeholder:'<www.domaine,api.domaine>', wide:true },          /* P0 */
        { id:'ssl_email',         label:'Email ACME',            type:'email',  value:'' },
        { id:'ssl_challenge',     label:'Challenge ACME',        type:'select', value:'http',
          options:['http','dns','tls-alpn'] },
        { id:'ssl_dns_provider',  label:'DNS Provider',          type:'select', value:'none',
          options:['none','cloudflare','route53','digitalocean','gcloud','ovh','namecheap'] },
        { id:'ssl_webroot',       label:'Webroot path',          type:'text',   value:'' },
        /* P0 — '/var/www/html' vidé */
        { id:'ssl_auto_renew',    label:'Renouvellement auto',   type:'toggle', value:true },
        { id:'ssl_renew_hook',    label:'Post-renew hook',       type:'text',
          value:'systemctl reload nginx' },                              /* commande standard conservée */
      ]},
      { label:'openssl \u2014 Cl\u00e9 & CSR', icon:'\uD83D\uDD11', fields:[
        { id:'ssl_key_type',      label:'Type de cl\u00e9',      type:'select', value:'rsa',
          options:['rsa','ec'] },
        { id:'ssl_key_size',      label:'Taille (RSA bits)',     type:'select', value:'4096',
          options:['2048','3072','4096'] },
        { id:'ssl_ec_curve',      label:'Courbe EC',             type:'select', value:'secp384r1',
          options:['prime256v1','secp384r1','secp521r1'] },
        { id:'ssl_key_out',       label:'Sortie cl\u00e9',       type:'text',   value:'server.key' },
        { id:'ssl_cert_out',      label:'Sortie cert',           type:'text',   value:'server.crt' },
        { id:'ssl_csr_out',       label:'Sortie CSR',            type:'text',   value:'server.csr' },
        { id:'ssl_days',          label:'Validit\u00e9 (jours)', type:'number', value:'365' },
        { id:'ssl_cn',            label:'Common Name',           type:'text',   value:'',
          placeholder:'<domaine>' },                                     /* P0 */
        { id:'ssl_org',           label:'Organisation',          type:'text',   value:'' },
        { id:'ssl_country',       label:'Pays (C)',              type:'text',   value:'FR' },
        { id:'ssl_state',         label:'\u00c9tat / Province',  type:'text',   value:'' },
        { id:'ssl_city',          label:'Ville',                 type:'text',   value:'' },
      ]},
      { label:'TLS nginx / Apache', icon:'\u2699', fields:[
        { id:'ssl_protocols',     label:'Protocoles',            type:'multiselect',
          value:['TLSv1.2','TLSv1.3'], options:['TLSv1.2','TLSv1.3'] },
        { id:'ssl_ciphers',       label:'Ciphers preset',        type:'select', value:'modern',
          options:['modern','intermediate','old'] },
        { id:'ssl_ciphers_custom',label:'Ciphers custom',        type:'text',
          value:'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256', wide:true },
        { id:'ssl_stapling',      label:'OCSP Stapling',         type:'toggle', value:true },
        { id:'ssl_session_cache', label:'ssl_session_cache',     type:'text',   value:'shared:SSL:10m' },
        { id:'ssl_session_timeout',label:'ssl_session_timeout',  type:'text',   value:'1d' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'ssl_file_ext',      label:'Extension',             type:'file-ext', value:'sh',
          allowed:['sh','conf','txt'] },
      ]},
    ]},

    /* ── 2. Fail2ban (20 champs) ────────────────────────────────── */
    fail2ban: { id:'sec-f2b', sections:[
      { label:'Jail DEFAULT', icon:'\uD83D\uDEE1', first:true, fields:[
        { id:'f2b_bantime',       label:'bantime',               type:'select', value:'1h',
          options:['10m','30m','1h','6h','24h','7d'] },
        { id:'f2b_findtime',      label:'findtime',              type:'select', value:'10m',
          options:['5m','10m','30m','1h','24h'] },
        { id:'f2b_maxretry',      label:'maxretry',              type:'number', value:'5' },
        { id:'f2b_ignoreip',      label:'ignoreip',              type:'text',
          value:'127.0.0.1/8 ::1', wide:true },                         /* localhost standard conservé */
        { id:'f2b_backend',       label:'backend',               type:'select', value:'systemd',
          options:['auto','systemd','polling'] },
        { id:'f2b_destemail',     label:'destemail',             type:'email',  value:'' },
        /* P0 — 'admin@example.com' vidé */
        { id:'f2b_action',        label:'action',                type:'select',
          value:'%(action_mw)s',
          options:['%(action_)s','%(action_mw)s','%(action_mwl)s'] },
      ]},
      { label:'Jails activ\u00e9s', icon:'\uD83D\uDD10', fields:[
        { id:'f2b_ssh',           label:'sshd',                  type:'toggle', value:true },
        { id:'f2b_ssh_port',      label:'SSH port',              type:'text',   value:'ssh' },
        { id:'f2b_nginx_http',    label:'nginx-http-auth',       type:'toggle', value:false },
        { id:'f2b_nginx_badbots', label:'nginx-badbots',         type:'toggle', value:false },
        { id:'f2b_nginx_limit',   label:'nginx-limit-req',       type:'toggle', value:false },
        { id:'f2b_postfix',       label:'postfix',               type:'toggle', value:false },
        { id:'f2b_dovecot',       label:'dovecot',               type:'toggle', value:false },
        { id:'f2b_recidive',      label:'recidive',              type:'toggle', value:true },
      ]},
      { label:'Jail personnalis\u00e9', icon:'\u26a1', fields:[
        { id:'f2b_custom_name',   label:'Nom du jail',           type:'text',   value:'',
          placeholder:'my-app' },
        { id:'f2b_custom_filter', label:'failregex',             type:'text',   value:'',
          placeholder:'^.*Failed.*<HOST>.*$', wide:true },
        { id:'f2b_custom_logpath',label:'logpath',               type:'text',   value:'',
          placeholder:'<chemin-log>' },                                  /* P0 */
        { id:'f2b_custom_port',   label:'Port(s)',               type:'text',   value:'',
          placeholder:'http,https,8080' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'f2b_file_ext',      label:'Extension',             type:'file-ext', value:'conf',
          allowed:['conf','sh','txt'] },
      ]},
    ]},

    /* ── 3. GPG (14 champs) ─────────────────────────────────────── */
    gpg: { id:'sec-gpg', sections:[
      { label:'Cl\u00e9 GPG', icon:'\uD83D\uDD11', first:true, fields:[
        { id:'gpg_action',        label:'Action',                type:'select', value:'genkey',
          options:['genkey','export','encrypt','sign'] },
        { id:'gpg_key_type',      label:'Key-Type',              type:'select', value:'RSA',
          options:['RSA','DSA','ECDSA','EdDSA'] },
        { id:'gpg_key_length',    label:'Key-Length',            type:'select', value:'4096',
          options:['2048','3072','4096'] },
        { id:'gpg_expire',        label:'Expire-Date',           type:'select', value:'2y',
          options:['0','1y','2y','5y','10y'] },
        { id:'gpg_name',          label:'Name-Real',             type:'text',   value:'',
          placeholder:'Jean Dupont' },
        { id:'gpg_email',         label:'Name-Email',            type:'email',  value:'' },
        { id:'gpg_comment',       label:'Name-Comment',          type:'text',   value:'' },
        { id:'gpg_passphrase',    label:'Passphrase',            type:'password', value:'',
          sensitive:true },                                              /* F-15 */
        { id:'gpg_batch',         label:'Mode batch',            type:'toggle', value:true },
        { id:'gpg_armor',         label:'Format ASCII armor',    type:'toggle', value:true },
        { id:'gpg_cipher',        label:'Cipher-Algo',           type:'select', value:'AES256',
          options:['AES128','AES256','CAMELLIA256','TWOFISH'] },
        { id:'gpg_hash',          label:'Digest-Algo',           type:'select', value:'SHA512',
          options:['SHA256','SHA384','SHA512'] },
        { id:'gpg_recipient',     label:'Destinataire (fingerprint/email)',
          type:'text',   value:'', placeholder:'<fingerprint-ou-email>' }, /* P0 */
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'gpg_file_ext',      label:'Extension',             type:'file-ext', value:'sh',
          allowed:['sh','txt','asc'] },
      ]},
    ]},

    /* ── 4. Secrets / sops (7 champs) ──────────────────────────── */
    secrets: { id:'sec-secrets', sections:[
      { label:'Outil', icon:'\uD83D\uDDDD', first:true, fields:[
        { id:'sec_tool',          label:'Outil',                 type:'select', value:'sops',
          options:['sops','age','ansible-vault','vault','env-encrypted'] },
        { id:'sec_backend',       label:'Backend',               type:'select', value:'local',
          options:['local','pgp','age','aws-kms','gcp-kms'] },
        { id:'sec_file',          label:'Fichier secrets',       type:'text',   value:'secrets.enc.yaml' },
        { id:'sec_recipients',    label:'Cl\u00e9s (age/pgp)',   type:'textarea', value:'', rows:3,
          hint:'Une cl\u00e9 par ligne' },
        { id:'sec_kms_key',       label:'KMS Key ARN',           type:'text',   value:'',
          placeholder:'arn:aws:kms:us-east-1:\u2026' },
      ]},
      { label:'Variables', icon:'\uD83D\uDD12', fields:[
        { id:'sec_vars',          label:'Variables (KEY=val)',    type:'textarea',
          value:'DB_PASSWORD=\nAPI_KEY=\nJWT_SECRET=', rows:6, wide:true },
        /* template vide — aucune valeur réelle */
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'sec_file_ext',      label:'Extension',             type:'file-ext', value:'sh',
          allowed:['sh','yaml','env','txt'] },
      ]},
    ]},

    /* ── 5. SSH Hardening (20 champs) ───────────────────────────── */
    ssh_hardening: { id:'sec-sshhard', sections:[
      { label:'sshd_config \u2014 Hardened', icon:'\uD83D\uDD10', first:true, fields:[
        { id:'sshh_port',         label:'Port',                  type:'select', value:'22',
          options:['22','2222','22022','8022','2200'] },
        { id:'sshh_address_family',label:'AddressFamily',        type:'select', value:'inet',
          options:['any','inet','inet6'] },
        { id:'sshh_root',         label:'PermitRootLogin',       type:'select', value:'no',
          options:['no','prohibit-password','forced-commands-only'] },
        { id:'sshh_password',     label:'PasswordAuthentication',type:'toggle', value:false },
        { id:'sshh_pubkey',       label:'PubkeyAuthentication',  type:'toggle', value:true },
        { id:'sshh_max_auth',     label:'MaxAuthTries',          type:'number', value:'3' },
        { id:'sshh_max_sess',     label:'MaxSessions',           type:'number', value:'5' },
        { id:'sshh_login_grace',  label:'LoginGraceTime (s)',    type:'number', value:'30' },
        { id:'sshh_x11',          label:'X11Forwarding',         type:'toggle', value:false },
        { id:'sshh_agent',        label:'AllowAgentForwarding',  type:'toggle', value:false },
        { id:'sshh_tcp',          label:'AllowTcpForwarding',    type:'select', value:'no',
          options:['no','yes','local','remote'] },
        { id:'sshh_alive_interval',label:'ClientAliveInterval',  type:'number', value:'300' },
        { id:'sshh_alive_count',  label:'ClientAliveCountMax',   type:'number', value:'2' },
        { id:'sshh_banner',       label:'Banner',                type:'text',   value:'' },
        /* P0 — '/etc/issue.net' vidé */
        { id:'sshh_allow_users',  label:'AllowUsers',            type:'text',   value:'',
          placeholder:'deployer maintenance' },
        { id:'sshh_allow_groups', label:'AllowGroups',           type:'text',   value:'',
          placeholder:'ssh-users sudo' },
        { id:'sshh_kex',          label:'KexAlgorithms',         type:'text',
          value:'curve25519-sha256,diffie-hellman-group16-sha512', wide:true },
        { id:'sshh_ciphers',      label:'Ciphers',               type:'text',
          value:'chacha20-poly1305@openssh.com,aes256-gcm@openssh.com', wide:true },
        { id:'sshh_macs',         label:'MACs',                  type:'text',
          value:'hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com', wide:true },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'sshh_file_ext',     label:'Extension',             type:'file-ext', value:'conf',
          allowed:['conf','sh','txt'] },
      ]},
    ]},

    /* ── 6. Scan & Audit (19 champs) ────────────────────────────── */
    scan: { id:'sec-scan', sections:[
      { label:'Outils de scan', icon:'\uD83D\uDD0D', first:true, fields:[
        { id:'scan_trivy',        label:'Trivy',                 type:'toggle', value:true },
        { id:'scan_trivy_target', label:'Cible Trivy',           type:'select', value:'image',
          options:['image','fs','repo','sbom'] },
        { id:'scan_trivy_severity',label:'S\u00e9v\u00e9rit\u00e9 min',type:'select',value:'HIGH',
          options:['UNKNOWN','LOW','MEDIUM','HIGH','CRITICAL'] },
        { id:'scan_bandit',       label:'Bandit (Python)',        type:'toggle', value:false },
        { id:'scan_semgrep',      label:'Semgrep',               type:'toggle', value:false },
        { id:'scan_semgrep_rules',label:'R\u00e8gles Semgrep',   type:'text',
          value:'p/security-audit p/owasp-top-ten', wide:true },
        { id:'scan_npm_audit',    label:'npm audit',             type:'toggle', value:true },
        { id:'scan_pip_audit',    label:'pip-audit',             type:'toggle', value:false },
        { id:'scan_snyk',         label:'Snyk',                  type:'toggle', value:false },
        { id:'scan_output_format',label:'Format sortie',         type:'select', value:'table',
          options:['table','json','sarif','cyclonedx','spdx'] },
        { id:'scan_fail_on',      label:'Fail si (CI/CD)',       type:'select', value:'HIGH',
          options:['CRITICAL','HIGH','MEDIUM','never'] },
      ]},
      { label:'Politique mots de passe', icon:'\uD83D\uDD11', fields:[
        { id:'scan_pwd_len',      label:'Longueur minimum',      type:'number', value:'12' },
        { id:'scan_pwd_upper',    label:'Majuscules',            type:'toggle', value:true },
        { id:'scan_pwd_digit',    label:'Chiffres',              type:'toggle', value:true },
        { id:'scan_pwd_special',  label:'Caract\u00e8res sp\u00e9ciaux',type:'toggle',value:true },
        { id:'scan_pwd_expire',   label:'Expiration (jours)',    type:'number', value:'90' },
        { id:'scan_2fa',          label:'2FA obligatoire',       type:'toggle', value:false },
        { id:'scan_2fa_method',   label:'M\u00e9thode 2FA',      type:'select', value:'totp',
          options:['totp','webauthn','u2f','sms'] },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'scan_file_ext',     label:'Extension',             type:'file-ext', value:'sh',
          allowed:['sh','yaml','json','txt'] },
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
    { field:'ssl_domain', required:true },
  ],

  /* ════════════════════════════════════════════════════════════════
     PROFILE BINDINGS — vide
     ════════════════════════════════════════════════════════════════ */
  profile_bindings: [],

}; /* /MOD_SEC_CFG_DATA */

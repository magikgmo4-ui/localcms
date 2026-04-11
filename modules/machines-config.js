/**
 * modules/machines-config.js — MOD_MACHINES_CFG_DATA
 * LocalCMS · M-3.2 · Manifeste déclaratif V1 · v1.0.0
 *
 * ═══ CONTRAT ═══════════════════════════════════════════════════════
 *
 * Données déclaratives uniquement. Aucune fonction. Aucun effet de bord.
 *
 * Contenu :
 *   ✓ Identité module
 *   ✓ meta (typeIcons, typeLabels, activeDefault)
 *   ✓ 6 forms (profile 12 / ssh 14 / sftp_ftp 9 / vpn 12 / routes 6 /
 *              external_apps 12 = 65 champs)
 *   ✓ conditions[]       — when/show ($COND canonique)
 *   ✓ validators[]       — $VALID
 *   ✓ profile_bindings[] — F-14
 *
 * Non contenu :
 *   ✗ init / render / switchType / save / generate / test
 *     → bridge dans localcms-v5.html
 *   ✗ HTML inline
 *   ✗ chemins absolus ou relatifs utilisateur
 *   ✗ données machine réelles hardcodées
 *   ✗ persistance directe
 *
 * F-15 sensitive:true sur 7 champs password :
 *   mc_ssh_pass, mc_ftp_pass, mc_vpn_privkey, mc_vpn_psk,
 *   mc_ext_api_key, mc_ext_client_secret, mc_ext_webhook_secret
 *
 * P0 — Valeurs vidées (étaient hardcodées dans l'inline) :
 *   mc_ssh_key       : ~/.ssh/id_ed25519 → '' (chemin utilisateur)
 *   mc_ftp_root      : /var/www/html     → '' (chemin absolu)
 *   mc_rt_hosts      : IPs+hostnames     → '' (données utilisateur)
 *   mc_rt_default_gw : 192.168.1.1       → '' (IP utilisateur)
 *   mc_vpn_local_ip  : 10.0.0.2/24       → '' (IP utilisateur)
 *   mc_vpn_dns       : 10.0.0.1          → '' (IP utilisateur)
 *   mc_vpn_routes conservé : 0.0.0.0/0  (notation route technique neutre)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const MOD_MACHINES_CFG_DATA = {

  /* ── Identité ──────────────────────────────────────────────────── */
  id:           'machines_cfg',
  label:        'Machines & Profils',
  icon:         '\uD83D\uDDA7',
  version:      '1.0.0',
  group:        'infrastructure',
  type:         'config',
  capabilities: ['render', 'generate'],
  os_compat:    ['all'],
  interfaces:   ['config'],

  /* ── Métadonnées onglets ────────────────────────────────────────── */
  meta: {
    activeDefault: 'profile',
    typeIcons : {
      profile      : '\uD83D\uDDA7',
      ssh          : '\uD83D\uDD10',
      sftp_ftp     : '\uD83D\uDCC2',
      vpn          : '\uD83D\uDD12',
      routes       : '\uD83D\uDDFA',
      external_apps: '\uD83D\uDD17',
    },
    typeLabels: {
      profile      : 'Profil',
      ssh          : 'SSH',
      sftp_ftp     : 'SFTP/FTP',
      vpn          : 'VPN/Tunnel',
      routes       : 'Routes/Hosts',
      external_apps: 'Apps Externes',
    },
  },

  /* ════════════════════════════════════════════════════════════════
     FORMS — 6 définitions, 65 champs
     ════════════════════════════════════════════════════════════════ */
  forms: {

    /* ── 1. Profil machine (12 champs) ──────────────────────────── */
    profile: { id:'mc-profile', sections:[
      { label:'Profil machine', icon:'\uD83D\uDDA7', first:true, fields:[
        { id:'mc_name',     label:'Nom',
          type:'text',   value:'', placeholder:'srv-web-01' },
        { id:'mc_role',     label:'R\u00f4le',
          type:'select', value:'web',
          options:['web','db','cache','queue','worker','monitor','bastion','dev','staging','prod','all'] },
        { id:'mc_env',      label:'Environnement',
          type:'select', value:'dev',
          options:['dev','test','staging','prod'] },
        { id:'mc_os',       label:'OS',
          type:'select', value:'debian',
          options:['debian','ubuntu','centos','rhel','fedora','alpine','arch',
                   'windows-server-2022','windows-server-2019','macos'] },
        { id:'mc_arch',     label:'Architecture',
          type:'select', value:'x86_64',
          options:['x86_64','arm64','armv7','i386'] },
        { id:'mc_provider', label:'Provider',
          type:'select', value:'bare',
          options:['bare','virtualbox','vmware','qemu-kvm','docker','lxc',
                   'aws-ec2','gcp','azure','hetzner','ovh','digitalocean',
                   'oracle-cloud','linode','scaleway','vultr'] },
        { id:'mc_region',   label:'Region / DC',
          type:'text',   value:'', placeholder:'eu-west-1 ou local' },
        { id:'mc_cpu',      label:'CPU (vCPU)',
          type:'number', value:'2' },
        { id:'mc_ram',      label:'RAM (GB)',
          type:'number', value:'4' },
        { id:'mc_disk',     label:'Disk (GB)',
          type:'number', value:'40' },
        { id:'mc_tags',     label:'Tags (csv)',
          type:'text',   value:'', placeholder:'prod,nginx,frontend' },
        { id:'mc_notes',    label:'Notes',
          type:'textarea', value:'', rows:2, wide:true },
      ]},
    ]},

    /* ── 2. Connexion SSH (14 champs) ───────────────────────────── */
    ssh: { id:'mc-ssh', sections:[
      { label:'Connexion SSH', icon:'\uD83D\uDD10', first:true, fields:[
        { id:'mc_ssh_host',    label:'Host/IP',
          type:'text',   value:'', placeholder:'<host-ou-ip>' },
        { id:'mc_ssh_port',    label:'Port SSH',
          type:'select', value:'22',
          options:['22','2222','22022','8022','2200'] },
        { id:'mc_ssh_user',    label:'Utilisateur',
          type:'text',   value:'deploy' },
        { id:'mc_ssh_auth',    label:'Authentification',
          type:'select', value:'key',
          options:['key','password','key+password','certificate','gssapi'] },
        { id:'mc_ssh_key',     label:'Cl\u00e9 priv\u00e9e',
          type:'text',   value:'', placeholder:'chemin/vers/cle-privee' }, /* P0 — pas de path utilisateur */
        { id:'mc_ssh_pass',    label:'Mot de passe',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'mc_ssh_cert',    label:'SSH Certificate',
          type:'text',   value:'' },
        { id:'mc_ssh_jump',    label:'Jump host (bastion)',
          type:'text',   value:'', placeholder:'user@bastion' },
        { id:'mc_ssh_timeout', label:'ConnectTimeout (s)',
          type:'number', value:'10' },
        { id:'mc_ssh_alive',   label:'ServerAliveInterval',
          type:'number', value:'60' },
        { id:'mc_ssh_compress',label:'Compression',
          type:'toggle', value:false },
        { id:'mc_ssh_mux',     label:'ControlMaster (multiplex)',
          type:'toggle', value:true },
        { id:'mc_ssh_agent',   label:'ForwardAgent',
          type:'toggle', value:false },
        { id:'mc_ssh_x11',     label:'X11Forward',
          type:'toggle', value:false },
      ]},
    ]},

    /* ── 3. SFTP / FTP / FTPS (9 champs) ───────────────────────── */
    sftp_ftp: { id:'mc-sftp', sections:[
      { label:'SFTP / FTP / FTPS', icon:'\uD83D\uDCC2', first:true, fields:[
        { id:'mc_ftp_type',    label:'Protocole',
          type:'select', value:'sftp',
          options:['sftp','ftp','ftps','ftpes'] },
        { id:'mc_ftp_host',    label:'Host',
          type:'text',   value:'', placeholder:'<host-ftp>' },
        { id:'mc_ftp_port',    label:'Port',
          type:'select', value:'22',
          options:['21','22','990','2121'] },
        { id:'mc_ftp_user',    label:'Utilisateur',
          type:'text',   value:'' },
        { id:'mc_ftp_pass',    label:'Mot de passe',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'mc_ftp_root',    label:'R\u00e9pertoire racine',
          type:'text',   value:'', placeholder:'<repertoire-racine>' }, /* P0 — pas de path absolu */
        { id:'mc_ftp_passive', label:'Mode passif',
          type:'toggle', value:true },
        { id:'mc_ftp_tls_cert',label:'TLS Certificate',
          type:'text',   value:'' },
        { id:'mc_ftp_timeout', label:'Timeout (s)',
          type:'number', value:'30' },
      ]},
    ]},

    /* ── 4. VPN / Tunnel (12 champs) ────────────────────────────── */
    vpn: { id:'mc-vpn', sections:[
      { label:'VPN / Tunnel', icon:'\uD83D\uDD12', first:true, fields:[
        { id:'mc_vpn_type',      label:'Type',
          type:'select', value:'wireguard',
          options:['wireguard','openvpn','ipsec-ikev2','ipsec-l2tp','tailscale',
                   'zerotier','sshuttle','openconnect','cisco-anyconnect','palo-alto-gp'] },
        { id:'mc_vpn_server',    label:'Serveur',
          type:'text',   value:'', placeholder:'<serveur-vpn>' },
        { id:'mc_vpn_port',      label:'Port',
          type:'number', value:'51820' },
        { id:'mc_vpn_iface',     label:'Interface',
          type:'text',   value:'wg0' },
        { id:'mc_vpn_privkey',   label:'Cl\u00e9 priv\u00e9e',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'mc_vpn_pubkey',    label:'Cl\u00e9 publique peer',
          type:'text',   value:'' },
        { id:'mc_vpn_psk',       label:'Pre-shared Key',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'mc_vpn_local_ip',  label:'IP locale',
          type:'text',   value:'', placeholder:'<ip-locale/masque>' }, /* P0 — pas d'IP utilisateur */
        { id:'mc_vpn_routes',    label:'Routes (AllowedIPs)',
          type:'text',   value:'0.0.0.0/0', wide:true }, /* notation route neutre conservée */
        { id:'mc_vpn_dns',       label:'DNS VPN',
          type:'text',   value:'', placeholder:'<dns-vpn>' }, /* P0 — pas d'IP utilisateur */
        { id:'mc_vpn_keepalive', label:'PersistentKeepalive',
          type:'number', value:'25' },
        { id:'mc_vpn_auto',      label:'Connexion auto',
          type:'toggle', value:true },
      ]},
    ]},

    /* ── 5. Routes IP / hostname (6 champs) ─────────────────────── */
    routes: { id:'mc-routes', sections:[
      { label:'Routes IP / hostname', icon:'\uD83D\uDDFA', first:true, fields:[
        { id:'mc_rt_hostname',   label:'Hostname local',
          type:'text',   value:'', placeholder:'mon-serveur' },
        { id:'mc_rt_hosts',      label:'/etc/hosts entries',
          type:'textarea', value:'', rows:5, wide:true,
          hint:'<ip> <hostname>' }, /* P0 — pas d'IP/hostname utilisateur */
        { id:'mc_rt_default_gw', label:'Gateway par d\u00e9faut',
          type:'text',   value:'', placeholder:'<passerelle-par-defaut>' }, /* P0 — pas d'IP utilisateur */
        { id:'mc_rt_static',     label:'Routes statiques',
          type:'textarea', value:'', rows:3,
          hint:'ip route add <subnet> via <gateway>', wide:true },
        { id:'mc_rt_mtu',        label:'MTU',
          type:'number', value:'1500' },
        { id:'mc_rt_netns',      label:'Network namespace',
          type:'text',   value:'', placeholder:'prod-ns' },
      ]},
    ]},

    /* ── 6. Applications externes / Services (12 champs) ─────────── */
    external_apps: { id:'mc-extapps', sections:[
      { label:'Applications externes / Services', icon:'\uD83D\uDD17', first:true, fields:[
        { id:'mc_ext_type',           label:"Type d\u2019app",
          type:'select', value:'gdrive',
          options:['gdrive','dropbox','nextcloud','s3','ftp-server','sftp-server',
                   'smtp-external','webhook-receiver','slack','telegram','discord',
                   'notion','jira','github','gitlab','gitea','registry',
                   'monitoring-api','custom'] },
        { id:'mc_ext_name',           label:'Nom',
          type:'text',   value:'', placeholder:'Mon Google Drive' },
        { id:'mc_ext_url',            label:'URL / Endpoint',
          type:'url',    value:'' },
        { id:'mc_ext_api_key',        label:'API Key / Token',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'mc_ext_client_id',      label:'Client ID',
          type:'text',   value:'' },
        { id:'mc_ext_client_secret',  label:'Client Secret',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'mc_ext_oauth_url',      label:'OAuth URL',
          type:'url',    value:'' },
        { id:'mc_ext_scope',          label:'Scopes',
          type:'text',   value:'', placeholder:'read write admin' },
        { id:'mc_ext_webhook_url',    label:'Webhook URL',
          type:'url',    value:'' },
        { id:'mc_ext_webhook_secret', label:'Webhook Secret',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'mc_ext_enabled',        label:'Activ\u00e9',
          type:'toggle', value:true },
        { id:'mc_ext_notes',          label:'Notes',
          type:'textarea', value:'', rows:2, wide:true },
      ]},
    ]},

  }, /* /forms */

  /* ════════════════════════════════════════════════════════════════
     CONDITIONS — when/show ($COND canonique)
     Couverture : conditions SSH réactives sur mc_ssh_auth
     ════════════════════════════════════════════════════════════════ */
  conditions: [
    /* Authentification SSH → champs visibles selon méthode */
    { when:{ field:'mc_ssh_auth', eq:'key'          }, show:['mc_ssh_key'] },
    { when:{ field:'mc_ssh_auth', eq:'password'     }, show:['mc_ssh_pass'] },
    { when:{ field:'mc_ssh_auth', eq:'key+password' }, show:['mc_ssh_key','mc_ssh_pass'] },
    { when:{ field:'mc_ssh_auth', eq:'certificate'  }, show:['mc_ssh_cert'] },
  ],

  /* ════════════════════════════════════════════════════════════════
     VALIDATORS — $VALID
     ════════════════════════════════════════════════════════════════ */
  validators: [
    { field:'mc_ssh_host',       required:true },
    { field:'mc_ftp_host',       required:true },
    { field:'mc_ext_url',        url:true },
    { field:'mc_ext_oauth_url',  url:true },
    { field:'mc_ext_webhook_url',url:true },
    { field:'mc_vpn_server',     required:true },
  ],

  /* ════════════════════════════════════════════════════════════════
     PROFILE BINDINGS — F-14
     Syntaxe : $USER.<cat>[active].<prop>
     ════════════════════════════════════════════════════════════════ */
  profile_bindings: [],
  /* Note : MOD_MACHINES_CFG est lui-même la source des profils machines
     ($USER.machines). Il n'a pas de binding entrant — il alimente $USER. */

}; /* /MOD_MACHINES_CFG_DATA */

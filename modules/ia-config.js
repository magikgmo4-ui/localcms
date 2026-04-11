/**
 * modules/ia-config.js — MOD_IA_CFG_DATA
 * LocalCMS · M-3.1 (corr.) · Manifeste déclaratif V1 · v1.1.0
 *
 * ═══ CONTRAT ═══════════════════════════════════════════════════════
 *
 * Ce fichier contient UNIQUEMENT des données déclaratives.
 * Aucune fonction. Aucune logique. Aucun effet de bord.
 *
 * Ce que contient ce fichier :
 *   ✓ Identité module (id, label, icon, version, group, type…)
 *   ✓ Métadonnées onglets (meta : typeIcons, typeLabels, activeDefault)
 *   ✓ 4 définitions de forms (endpoint 16 / prompt_template 11 /
 *     multi_ia 11 / image_ia 12 = 50 champs)
 *     → fidèlement extraites de l'inline d'origine, sans perte
 *   ✓ conditions[]       — syntaxe when/show ($COND canonique)
 *   ✓ validators[]       — syntaxe $VALID
 *   ✓ profile_bindings[] — F-14 ($USER.<cat>[active].<prop>)
 *
 * Ce que NE contient PAS ce fichier :
 *   ✗ init / render / switchType / save / testEndpoint / generate
 *     → bridge dans localcms-v5.html (strictement nécessaire)
 *   ✗ HTML inline
 *   ✗ chemins absolus
 *   ✗ persistance directe (localStorage…)
 *
 * F-15 : sensitive:true sur ia_api_key (endpoint) et ia_img_api_key (image_ia)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const MOD_IA_CFG_DATA = {

  /* ── Identité ──────────────────────────────────────────────────── */
  id:           'ia_cfg',
  label:        'IA / Prompts Config',
  icon:         '🤖',
  version:      '1.1.0',
  group:        'ia',
  type:         'config',
  capabilities: ['render', 'generate'],
  os_compat:    ['all'],
  interfaces:   ['config'],

  /* ── Métadonnées onglets (lues par le bridge) ─────────────────── */
  meta: {
    activeDefault: 'endpoint',
    typeIcons : { endpoint:'🤖', prompt_template:'📝', multi_ia:'🔀', image_ia:'🖼' },
    typeLabels: { endpoint:'Endpoint', prompt_template:'Templates', multi_ia:'Multi-IA', image_ia:'Images IA' },
  },

  /* ════════════════════════════════════════════════════════════════
     FORMS
     4 définitions extraites fidèlement de l'inline localcms-v5.html
     Total : 50 champs (16 + 11 + 11 + 12)
     ════════════════════════════════════════════════════════════════ */
  forms: {

    /* ── 1. Endpoint IA  (16 champs) ──────────────────────────── */
    endpoint: { id:'ia-endpoint', sections:[
      { label:'Endpoint IA', icon:'🤖', first:true, fields:[
        { id:'ia_provider',      label:'Provider',
          type:'select', value:'ollama',
          options:['ollama','openai','anthropic','mistral','cohere','groq',
                   'together-ai','huggingface','lm-studio','gpt4all',
                   'llamacpp','textgen-webui','koboldcpp','custom'] },
        { id:'ia_name',          label:'Nom du profil',
          type:'text', value:'', placeholder:'Mon Ollama local' },
        { id:'ia_host',          label:'Host URL',
          type:'url', value:'http://localhost:11434', placeholder:'http://localhost:11434' },
        { id:'ia_api_key',       label:'API Key',
          type:'password', value:'', placeholder:'sk-\u2026 ou vide pour local',
          sensitive:true }, /* F-15 — jamais persisté en clair dans $STORE */
        { id:'ia_model',         label:'Modèle par défaut',
          type:'text', value:'', placeholder:'llama3.2, mistral, gpt-4o\u2026' },
        { id:'ia_models_list',   label:'Modèles disponibles',
          type:'textarea', value:'llama3.2\nmistral:7b\ngemma2:9b',
          rows:4, hint:'Un par ligne', wide:true },
        { id:'ia_timeout',       label:'Timeout (s)',
          type:'number', value:'120' },
        { id:'ia_max_tokens',    label:'Max tokens',
          type:'number', value:'4096' },
        { id:'ia_temperature',   label:'Temperature',
          type:'text', value:'0.7', placeholder:'0.0 \u2013 2.0' },
        { id:'ia_top_p',         label:'Top-P',
          type:'text', value:'0.9' },
        { id:'ia_top_k',         label:'Top-K',
          type:'number', value:'40' },
        { id:'ia_context_window',label:'Context window',
          type:'number', value:'131072' },
        { id:'ia_stream',        label:'Streaming',
          type:'toggle', value:true },
        { id:'ia_system_prompt', label:'System prompt par défaut',
          type:'textarea', value:'Tu es un assistant technique expert en DevOps et développement logiciel.',
          rows:3, wide:true },
        { id:'ia_machine',       label:'Machine cible',
          type:'text', value:'localhost', placeholder:'srv-gpu-01',
          binding:'$USER.machines[active].id' }, /* F-14 */
        { id:'ia_enabled',       label:'Activ\u00e9',
          type:'toggle', value:true },
      ]},
    ]},

    /* ── 2. Template de prompt  (11 champs) ────────────────────── */
    prompt_template: { id:'ia-prompt', sections:[
      { label:'Template de prompt', icon:'\uD83D\uDCDD', first:true, fields:[
        { id:'ia_tpl_name',       label:'Nom du template',
          type:'text', value:'', placeholder:'Analyse de log' },
        { id:'ia_tpl_role',       label:'R\u00f4le',
          type:'select', value:'analysis',
          options:['analysis','generation','transform','qa','code','debug',
                   'explain','summarize','translate','compare','classify','extract','custom'] },
        { id:'ia_tpl_format',     label:'Format sortie',
          type:'select', value:'text',
          options:['text','json','markdown','csv','yaml','code','list','table'] },
        { id:'ia_tpl_input_type', label:"Type d\u2019entr\u00e9e",
          type:'select', value:'text',
          options:['text','file','log','code','data','image','url','structured'] },
        { id:'ia_tpl_system',     label:'System prompt',
          type:'textarea', value:'', rows:3, wide:true },
        { id:'ia_tpl_user',       label:'User prompt ({{variables}})',
          type:'textarea',
          value:'Analyse ce log et identifie les erreurs:\n\n{{content}}\n\nR\u00e9ponds en JSON avec: errors[], warnings[], suggestions[]',
          rows:6, wide:true },
        { id:'ia_tpl_model',      label:'Mod\u00e8le pr\u00e9f\u00e9r\u00e9',
          type:'text', value:'', placeholder:'laisser vide = d\u00e9faut' },
        { id:'ia_tpl_temp',       label:'Temperature',
          type:'text', value:'0.3' },
        { id:'ia_tpl_max_tok',    label:'Max tokens',
          type:'number', value:'2048' },
        { id:'ia_tpl_tags',       label:'Tags',
          type:'text', value:'', placeholder:'devops,logs,monitoring' },
        { id:'ia_tpl_active',     label:'Actif',
          type:'toggle', value:true },
      ]},
    ]},

    /* ── 3. Multi-IA / routage  (11 champs) ────────────────────── */
    multi_ia: { id:'ia-multi', sections:[
      { label:'Config multi-IA (routage)', icon:'\uD83D\uDD00', first:true, fields:[
        { id:'ia_router_strategy', label:'Strat\u00e9gie',
          type:'select', value:'primary_fallback',
          options:['primary_fallback','round_robin','cheapest','fastest','best_quality','by_task'] },
        { id:'ia_primary',         label:'IA primaire',
          type:'text', value:'', placeholder:'nom du profil' },
        { id:'ia_fallbacks',       label:'Fallbacks (csv)',
          type:'text', value:'', placeholder:'ollama-local, gpt-3.5' },
        { id:'ia_timeout_fallback',label:'Timeout avant fallback (s)',
          type:'number', value:'30' },
        { id:'ia_cache',           label:'Cache r\u00e9ponses',
          type:'toggle', value:true },
        { id:'ia_cache_ttl',       label:'Cache TTL (min)',
          type:'number', value:'60' },
        { id:'ia_rate_limit',      label:'Rate limit (req/min)',
          type:'number', value:'20' },
        { id:'ia_cost_limit_day',  label:'Budget max/jour ($)',
          type:'number', value:'5' },
        { id:'ia_log_requests',    label:'Logger requ\u00eates',
          type:'toggle', value:true },
        { id:'ia_log_tokens',      label:'Logger tokens utilis\u00e9s',
          type:'toggle', value:true },
        { id:'ia_anonymize',       label:'Anonymiser logs',
          type:'toggle', value:true },
      ]},
    ]},

    /* ── 4. IA Image — génération / analyse  (12 champs) ─────── */
    image_ia: { id:'ia-image', sections:[
      { label:'IA Image (g\u00e9n\u00e9ration / analyse)', icon:'\uD83D\uDDBC', first:true, fields:[
        { id:'ia_img_provider',   label:'Provider image',
          type:'select', value:'stable-diffusion',
          options:['stable-diffusion','ollama-llava','openai-dall-e','midjourney-api',
                   'comfyui','automatic1111','huggingface-inference','replicate'] },
        { id:'ia_img_host',       label:'Host URL',
          type:'url', value:'http://localhost:7860' },
        { id:'ia_img_api_key',    label:'API Key',
          type:'password', value:'',
          sensitive:true }, /* F-15 */
        { id:'ia_img_model',      label:'Mod\u00e8le',
          type:'text', value:'', placeholder:'sdxl, dall-e-3, llava\u2026' },
        { id:'ia_img_width',      label:'Largeur px',
          type:'select', value:'512',
          options:['256','512','768','1024','1280','1920'] },
        { id:'ia_img_height',     label:'Hauteur px',
          type:'select', value:'512',
          options:['256','512','768','1024','1280','1920'] },
        { id:'ia_img_steps',      label:'Steps',
          type:'number', value:'20' },
        { id:'ia_img_cfg',        label:'CFG Scale',
          type:'number', value:'7' },
        { id:'ia_img_sampler',    label:'Sampler',
          type:'select', value:'DPM++ 2M Karras',
          options:['DDIM','DPM++ 2M Karras','Euler a','PLMS','UniPC','LCM'] },
        { id:'ia_img_output_dir', label:'Dossier sortie',
          type:'text', value:'' }, /* P0 — pas de chemin hardcodé */
        { id:'ia_img_format',     label:'Format sortie',
          type:'select', value:'png',
          options:['png','jpg','webp'] },
        { id:'ia_img_analyze',    label:'Analyser images',
          type:'toggle', value:true },
      ]},
    ]},

  }, /* /forms */

  /* ════════════════════════════════════════════════════════════════
     CONDITIONS — when/show ($COND canonique)
     Périmètre : uniquement champs présents dans les forms ci-dessus.
     8 règles : providers cloud → ia_api_key visible.
     Providers locaux (ollama, lm-studio, gpt4all, llamacpp,
     textgen-webui, koboldcpp) : ia_api_key reste caché.
     Résultat : $VALID.required sur ia_api_key actif seulement si visible.
     ════════════════════════════════════════════════════════════════ */
  conditions: [
    { when:{ field:'ia_provider', eq:'openai'      }, show:['ia_api_key'] },
    { when:{ field:'ia_provider', eq:'anthropic'   }, show:['ia_api_key'] },
    { when:{ field:'ia_provider', eq:'mistral'     }, show:['ia_api_key'] },
    { when:{ field:'ia_provider', eq:'cohere'      }, show:['ia_api_key'] },
    { when:{ field:'ia_provider', eq:'groq'        }, show:['ia_api_key'] },
    { when:{ field:'ia_provider', eq:'together-ai' }, show:['ia_api_key'] },
    { when:{ field:'ia_provider', eq:'huggingface' }, show:['ia_api_key'] },
    { when:{ field:'ia_provider', eq:'custom'      }, show:['ia_api_key'] },
  ],

  /* ════════════════════════════════════════════════════════════════
     VALIDATORS — $VALID
     ════════════════════════════════════════════════════════════════ */
  validators: [
    { field:'ia_host',     url:true      },         /* endpoint */
    { field:'ia_api_key',  required:true },         /* endpoint — actif si $COND visible */
    { field:'ia_img_host', url:true      },         /* image_ia */
  ],

  /* ════════════════════════════════════════════════════════════════
     PROFILE BINDINGS — F-14
     Syntaxe : $USER.<cat>[active].<prop>
     ════════════════════════════════════════════════════════════════ */
  profile_bindings: [
    { field:'ia_machine', source:'$USER.machines', key:'active', prop:'id' },
  ],

}; /* /MOD_IA_CFG_DATA */

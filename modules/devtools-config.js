/**
 * modules/devtools-config.js — MOD_DEVTOOLS_CFG_DATA
 * LocalCMS · M-4.4 · Manifeste déclaratif V1 · v1.0.0
 *
 * ═══ CONTRAT ═══════════════════════════════════════════════════════
 *
 * Données déclaratives uniquement. Aucune fonction. Aucun effet de bord.
 *
 * Contenu :
 *   ✓ Identité module
 *   ✓ meta (activeDefault, typeIcons, typeLabels)
 *   ✓ 8 forms :
 *       eslint         18 champs
 *       prettier       15 champs
 *       typescript     28 champs
 *       vite           18 champs
 *       jest           12 champs
 *       python_tools   16 champs
 *       editorconfig   13 champs
 *       precommit      18 champs
 *       ─────────────────────────
 *       TOTAL         138 champs
 *   ✓ conditions[]       — vide (inline sans conditions)
 *   ✓ validators[]       — vide (aucun champ obligatoire déclaré)
 *   ✓ profile_bindings[] — vide
 *
 * Non contenu :
 *   ✗ generators (logique de génération JSON/YAML/JS/TOML) → bridge
 *   ✗ render / switchType / generate / init               → bridge
 *   ✗ HTML inline
 *
 * F-15 — champs sensitive:true : aucun (0)
 *
 * P0 — Aucune value ou placeholder problématique détectée.
 *   vt_base value:'/' et placeholder:'/' — conservés
 *   (racine générique, non lié à un serveur concret)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const MOD_DEVTOOLS_CFG_DATA = {

  /* ── Identité ──────────────────────────────────────────────────── */
  id:           'devtools_cfg',
  label:        'Dev Tools',
  icon:         '\uD83D\uDD27',
  version:      '1.0.0',
  group:        'devtools',
  type:         'config',
  capabilities: ['render', 'generate'],
  os_compat:    ['all'],
  interfaces:   ['config'],

  /* ── Métadonnées ────────────────────────────────────────────────── */
  meta: {
    activeDefault: 'eslint',
    typeIcons: {
      eslint:        '\uD83D\uDD0D',
      prettier:      '\u2728',
      typescript:    '\uD83D\uDCD8',
      vite:          '\u26A1',
      jest:          '\uD83E\uDDEA',
      python_tools:  '\uD83D\uDC0D',
      editorconfig:  '\uD83D\uDCDD',
      precommit:     '\uD83E\uDEA9',
    },
    typeLabels: {
      eslint:        'ESLint',
      prettier:      'Prettier',
      typescript:    'TypeScript',
      vite:          'Vite',
      jest:          'Jest/Vitest',
      python_tools:  'Python/pyproject',
      editorconfig:  '.editorconfig',
      precommit:     'pre-commit',
    },
  },

  /* ════════════════════════════════════════════════════════════════
     FORMS — 8 forms, 138 champs
     ════════════════════════════════════════════════════════════════ */
  forms: {

    /* ── 1. eslint (18 champs) ──────────────────────────────────── */
    eslint: { id:'dt-eslint', sections:[
      { label:'ESLint / Biome', icon:'\uD83D\uDD0D', first:true, fields:[
        { id:'el_tool',           label:'Outil',                    type:'select',      value:'eslint',
          options:['eslint','biome','oxlint'] },
        { id:'el_extends',        label:'extends (presets)',         type:'multiselect',
          value:['eslint:recommended'],
          options:['eslint:recommended','@typescript-eslint/recommended',
                   'plugin:react/recommended','plugin:react-hooks/recommended',
                   'plugin:jsx-a11y/recommended','plugin:import/recommended',
                   'airbnb','airbnb-typescript','standard','prettier'] },
        { id:'el_parser',         label:'parser',                   type:'select',
          value:'@typescript-eslint/parser',
          options:['default','@typescript-eslint/parser','@babel/eslint-parser','vue-eslint-parser'] },
        { id:'el_env_browser',    label:'env: browser',             type:'toggle',      value:true },
        { id:'el_env_node',       label:'env: node',                type:'toggle',      value:true },
        { id:'el_env_es2022',     label:'env: es2022',              type:'toggle',      value:true },
        { id:'el_ecma_version',   label:'ecmaVersion',              type:'select',      value:'latest',
          options:['2020','2021','2022','2023','latest'] },
        { id:'el_source_type',    label:'sourceType',               type:'select',      value:'module',
          options:['module','commonjs','script'] },
        { id:'el_jsx',            label:'ecmaFeatures: jsx',        type:'toggle',      value:true },
        { id:'el_no_console',     label:'no-console',               type:'select',      value:'warn',
          options:['off','warn','error'] },
        { id:'el_no_unused',      label:'no-unused-vars',           type:'select',      value:'warn',
          options:['off','warn','error'] },
        { id:'el_semi',           label:'semi',                     type:'select',      value:'always',
          options:['always','never','off'] },
        { id:'el_quotes',         label:'quotes',                   type:'select',      value:'single',
          options:['single','double','backtick','off'] },
        { id:'el_indent',         label:'indent',                   type:'select',      value:'2',
          options:['2','4','tab','off'] },
        { id:'el_max_len',        label:'max-len',                  type:'number',      value:'120' },
        { id:'el_eol_last',       label:'eol-last',                 type:'select',      value:'always',
          options:['always','never','off'] },
        { id:'el_ignore_patterns',label:'ignorePatterns',           type:'text',
          value:'node_modules,dist,build,.next', wide:true },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'el_file_ext',       label:'Extension',                type:'file-ext',    value:'json',
          allowed:['json','yaml','js','txt'] },
      ]},
    ]},

    /* ── 2. prettier (15 champs) ────────────────────────────────── */
    prettier: { id:'dt-prettier', sections:[
      { label:'Prettier', icon:'\u2728', first:true, fields:[
        { id:'pr_print_width',    label:'printWidth',               type:'number',      value:'100' },
        { id:'pr_tab_width',      label:'tabWidth',                 type:'number',      value:'2' },
        { id:'pr_use_tabs',       label:'useTabs',                  type:'toggle',      value:false },
        { id:'pr_semi',           label:'semi',                     type:'toggle',      value:true },
        { id:'pr_single_quote',   label:'singleQuote',              type:'toggle',      value:true },
        { id:'pr_jsx_single',     label:'jsxSingleQuote',           type:'toggle',      value:false },
        { id:'pr_trailing_comma', label:'trailingComma',            type:'select',      value:'es5',
          options:['none','es5','all'] },
        { id:'pr_bracket_spacing',label:'bracketSpacing',           type:'toggle',      value:true },
        { id:'pr_bracket_same_line',label:'bracketSameLine',        type:'toggle',      value:false },
        { id:'pr_arrow_parens',   label:'arrowParens',              type:'select',      value:'always',
          options:['always','avoid'] },
        { id:'pr_end_of_line',    label:'endOfLine',                type:'select',      value:'lf',
          options:['lf','crlf','cr','auto'] },
        { id:'pr_prose_wrap',     label:'proseWrap (Markdown)',     type:'select',      value:'preserve',
          options:['always','never','preserve'] },
        { id:'pr_html_whitespace',label:'htmlWhitespaceSensitivity',type:'select',      value:'css',
          options:['css','strict','ignore'] },
        { id:'pr_overrides',      label:'Overrides JSON',           type:'textarea',    value:'',
          rows:4, hint:'[{"files":"*.md","options":{...}}]', wide:true },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'pr_file_ext',       label:'Extension',                type:'file-ext',    value:'json',
          allowed:['json','yaml','js','txt'] },
      ]},
    ]},

    /* ── 3. typescript (28 champs) ──────────────────────────────── */
    typescript: { id:'dt-tsconfig', sections:[
      { label:'compilerOptions', icon:'\uD83D\uDCD8', first:true, fields:[
        { id:'ts_target',         label:'target',                   type:'select',      value:'ES2022',
          options:['ES5','ES6','ES2017','ES2019','ES2020','ES2021','ES2022','ES2023','ESNext'] },
        { id:'ts_lib',            label:'lib',                      type:'text',
          value:'DOM,DOM.Iterable,ES2022', placeholder:'DOM,ES2022' },
        { id:'ts_module',         label:'module',                   type:'select',      value:'ESNext',
          options:['CommonJS','ES6','ES2020','ES2022','ESNext','NodeNext','AMD','None'] },
        { id:'ts_module_resolution',label:'moduleResolution',       type:'select',      value:'Bundler',
          options:['Node','NodeNext','Bundler','Classic'] },
        { id:'ts_jsx',            label:'jsx',                      type:'select',      value:'react-jsx',
          options:['preserve','react','react-jsx','react-jsxdev','react-native'] },
        { id:'ts_out_dir',        label:'outDir',                   type:'text',        value:'./dist' },
        { id:'ts_root_dir',       label:'rootDir',                  type:'text',        value:'./src' },
        { id:'ts_base_url',       label:'baseUrl',                  type:'text',        value:'.',
          placeholder:'.' },
        { id:'ts_paths',          label:'paths (JSON)',              type:'textarea',
          value:'{\n  "@/*": ["./src/*"]\n}', rows:3, wide:true },
        { id:'ts_strict',         label:'strict',                   type:'toggle',      value:true },
        { id:'ts_no_implicit_any',label:'noImplicitAny',            type:'toggle',      value:true },
        { id:'ts_strict_null',    label:'strictNullChecks',         type:'toggle',      value:true },
        { id:'ts_no_unused_locals',label:'noUnusedLocals',          type:'toggle',      value:false },
        { id:'ts_no_unused_params',label:'noUnusedParameters',      type:'toggle',      value:false },
        { id:'ts_exact_opt_props',label:'exactOptionalPropertyTypes',type:'toggle',     value:false },
        { id:'ts_no_unchecked_idx',label:'noUncheckedIndexedAccess',type:'toggle',      value:false },
        { id:'ts_es_module_interop',label:'esModuleInterop',        type:'toggle',      value:true },
        { id:'ts_allow_synth',    label:'allowSyntheticDefaultImports',type:'toggle',   value:true },
        { id:'ts_skip_lib_check', label:'skipLibCheck',             type:'toggle',      value:true },
        { id:'ts_declaration',    label:'declaration',              type:'toggle',      value:false },
        { id:'ts_source_map',     label:'sourceMap',                type:'toggle',      value:true },
        { id:'ts_inline_source_map',label:'inlineSourceMap',        type:'toggle',      value:false },
        { id:'ts_resolve_json',   label:'resolveJsonModule',        type:'toggle',      value:true },
        { id:'ts_incremental',    label:'incremental',              type:'toggle',      value:false },
        { id:'ts_composite',      label:'composite',                type:'toggle',      value:false },
      ]},
      { label:'include / exclude', icon:'\uD83D\uDCC1', fields:[
        { id:'ts_include',        label:'include',                  type:'text',        value:'src',
          placeholder:'src, types' },
        { id:'ts_exclude',        label:'exclude',                  type:'text',
          value:'node_modules, dist, build' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'ts_file_ext',       label:'Extension',                type:'file-ext',    value:'json',
          allowed:['json','txt'] },
      ]},
    ]},

    /* ── 4. vite (18 champs) ────────────────────────────────────── */
    vite: { id:'dt-vite', sections:[
      { label:'Vite Config', icon:'\u26A1', first:true, fields:[
        { id:'vt_framework',      label:'Framework plugin',         type:'select',      value:'react',
          options:['react','vue','svelte','solid','qwik','vanilla','lit'] },
        { id:'vt_root',           label:'root',                     type:'text',        value:'.',
          placeholder:'.' },
        { id:'vt_base',           label:'base',                     type:'text',        value:'/',
          placeholder:'/' },                         /* '/' = racine générique, P0 conforme */
        { id:'vt_out_dir',        label:'build.outDir',             type:'text',        value:'dist' },
        { id:'vt_target',         label:'build.target',             type:'select',      value:'es2022',
          options:['es2015','es2018','es2020','es2022','esnext',
                   'chrome58','firefox57','safari11','edge16'] },
        { id:'vt_source_map',     label:'build.sourcemap',          type:'select',      value:'false',
          options:['true','false','inline','hidden'] },
        { id:'vt_min',            label:'build.minify',             type:'select',      value:'esbuild',
          options:['esbuild','terser','false'] },
        { id:'vt_chunk_size',     label:'build.chunkSizeWarningLimit (KB)',type:'number',value:'1000' },
        { id:'vt_lib_mode',       label:'Mode librairie',           type:'toggle',      value:false },
        { id:'vt_lib_entry',      label:'lib.entry',                type:'text',        value:'src/index.ts' },
        { id:'vt_lib_formats',    label:'lib.formats',              type:'multiselect',
          value:['es','cjs'], options:['es','cjs','umd','iife'] },
      ]},
      { label:'Dev Server', icon:'\uD83D\uDDB5', fields:[
        { id:'vt_host',           label:'server.host',              type:'text',        value:'localhost' },
        { id:'vt_port',           label:'server.port',              type:'number',      value:'5173' },
        { id:'vt_https',          label:'server.https',             type:'toggle',      value:false },
        { id:'vt_open',           label:'server.open',              type:'toggle',      value:false },
        { id:'vt_cors',           label:'server.cors',              type:'toggle',      value:false },
        { id:'vt_proxy',          label:'server.proxy (JSON)',       type:'textarea',    value:'',
          rows:3, hint:'{ "/api": "http://localhost:3000" }', wide:true },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'vt_file_ext',       label:'Extension',                type:'file-ext',    value:'js',
          allowed:['js','ts','txt'] },
      ]},
    ]},

    /* ── 5. jest (12 champs) ────────────────────────────────────── */
    jest: { id:'dt-jest', sections:[
      { label:'Jest / Vitest', icon:'\uD83E\uDDEA', first:true, fields:[
        { id:'jt_tool',           label:'Outil',                    type:'select',      value:'vitest',
          options:['vitest','jest','jest+ts'] },
        { id:'jt_test_env',       label:'testEnvironment',          type:'select',      value:'jsdom',
          options:['node','jsdom','happy-dom','edge-runtime'] },
        { id:'jt_transform',      label:'transform (preset)',        type:'select',      value:'ts-jest',
          options:['ts-jest','babel-jest','esbuild-jest','swc','none'] },
        { id:'jt_coverage',       label:'coverage',                 type:'toggle',      value:true },
        { id:'jt_coverage_provider',label:'coverageProvider',       type:'select',      value:'v8',
          options:['v8','istanbul','c8'] },
        { id:'jt_coverage_threshold',label:'branches threshold (%)',type:'number',      value:'70' },
        { id:'jt_setup_files',    label:'setupFilesAfterFramework', type:'text',        value:'',
          placeholder:'./src/setupTests.ts' },
        { id:'jt_test_match',     label:'testMatch',                type:'text',
          value:'**/__tests__/**/*.ts,**/*.test.ts', wide:true },
        { id:'jt_module_name',    label:'moduleNameMapper',         type:'textarea',
          value:'{\n  "@/(.*)": "<rootDir>/src/$1"\n}', rows:3, wide:true },
        { id:'jt_globals',        label:'globals',                  type:'toggle',      value:true,
          hint:'Vitest globals (describe/test sans import)' },
        { id:'jt_watch_exclude',  label:'watchExclude',             type:'text',        value:'node_modules,dist' },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'jt_file_ext',       label:'Extension',                type:'file-ext',    value:'json',
          allowed:['json','js','ts','txt'] },
      ]},
    ]},

    /* ── 6. python_tools (16 champs) ────────────────────────────── */
    python_tools: { id:'dt-pytools', sections:[
      { label:'pyproject.toml', icon:'\uD83D\uDC0D', first:true, fields:[
        { id:'py_name',           label:'[project] name',           type:'text',        value:'',
          placeholder:'mon-projet' },
        { id:'py_version',        label:'version',                  type:'text',        value:'0.1.0' },
        { id:'py_python_req',     label:'requires-python',          type:'select',      value:'>=3.11',
          options:['>=3.9','>=3.10','>=3.11','>=3.12','>=3.13'] },
        { id:'py_build_backend',  label:'build-system',             type:'select',      value:'setuptools',
          options:['setuptools','hatchling','flit_core','pdm-backend','maturin'] },
        { id:'py_ruff',           label:'Ruff (linter/formatter)',  type:'toggle',      value:true },
        { id:'py_ruff_line',      label:'ruff.line-length',         type:'number',      value:'120' },
        { id:'py_ruff_select',    label:'ruff.select',              type:'text',        value:'E,F,W,I,N,UP',
          hint:'Codes r\u00e8gles Ruff', wide:true },
        { id:'py_black',          label:'Black (formatter)',        type:'toggle',      value:false },
        { id:'py_black_line',     label:'black.line-length',        type:'number',      value:'100' },
        { id:'py_mypy',           label:'Mypy (type check)',        type:'toggle',      value:true },
        { id:'py_mypy_strict',    label:'mypy strict',              type:'toggle',      value:false },
        { id:'py_pytest_dir',     label:'pytest testpaths',         type:'text',        value:'tests' },
        { id:'py_pytest_cov',     label:'pytest --cov',             type:'toggle',      value:true },
        { id:'py_cov_threshold',  label:'Coverage min (%)',         type:'number',      value:'80' },
        { id:'py_isort',          label:'isort',                    type:'toggle',      value:false },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'py_file_ext',       label:'Extension',                type:'file-ext',    value:'toml',
          allowed:['toml','ini','cfg','txt'] },
      ]},
    ]},

    /* ── 7. editorconfig (13 champs) ────────────────────────────── */
    editorconfig: { id:'dt-editor', sections:[
      { label:'.editorconfig', icon:'\uD83D\uDCDD', first:true, fields:[
        { id:'ec_indent_style',   label:'indent_style',             type:'select',      value:'space',
          options:['space','tab'] },
        { id:'ec_indent_size',    label:'indent_size',              type:'select',      value:'2',
          options:['2','4','8'] },
        { id:'ec_end_of_line',    label:'end_of_line',              type:'select',      value:'lf',
          options:['lf','crlf','cr'] },
        { id:'ec_charset',        label:'charset',                  type:'select',      value:'utf-8',
          options:['utf-8','utf-8-bom','utf-16be','utf-16le','latin1'] },
        { id:'ec_trim_trailing',  label:'trim_trailing_whitespace', type:'toggle',      value:true },
        { id:'ec_insert_final',   label:'insert_final_newline',     type:'toggle',      value:true },
        { id:'ec_max_line',       label:'max_line_length',          type:'select',      value:'120',
          options:['80','100','120','160','off'] },
      ]},
      { label:'Overrides par type', icon:'\uD83D\uDCC1', fields:[
        { id:'ec_makefile_tab',   label:'Makefile: tabs',           type:'toggle',      value:true },
        { id:'ec_md_trim',        label:'Markdown: no trim',        type:'toggle',      value:true },
        { id:'ec_py_indent',      label:'Python indent',            type:'select',      value:'4',
          options:['2','4'] },
        { id:'ec_go_indent',      label:'Go: tabs',                 type:'toggle',      value:true },
        { id:'ec_yaml_indent',    label:'YAML indent',              type:'select',      value:'2',
          options:['2','4'] },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'ec_file_ext',       label:'Extension',                type:'file-ext',    value:'txt',
          allowed:['txt','conf'] },
      ]},
    ]},

    /* ── 8. precommit (18 champs) ───────────────────────────────── */
    precommit: { id:'dt-precommit', sections:[
      { label:'.pre-commit-config.yaml', icon:'\uD83E\uDEA9', first:true, fields:[
        { id:'pc_prettier',       label:'prettier',                 type:'toggle',      value:true },
        { id:'pc_eslint',         label:'eslint',                   type:'toggle',      value:false },
        { id:'pc_black',          label:'black (Python)',           type:'toggle',      value:false },
        { id:'pc_ruff',           label:'ruff',                     type:'toggle',      value:false },
        { id:'pc_mypy',           label:'mypy',                     type:'toggle',      value:false },
        { id:'pc_trailing_ws',    label:'trailing-whitespace',      type:'toggle',      value:true },
        { id:'pc_end_of_file',    label:'end-of-file-fixer',        type:'toggle',      value:true },
        { id:'pc_check_yaml',     label:'check-yaml',               type:'toggle',      value:true },
        { id:'pc_check_json',     label:'check-json',               type:'toggle',      value:true },
        { id:'pc_check_merge',    label:'check-merge-conflict',     type:'toggle',      value:true },
        { id:'pc_detect_secrets', label:'detect-secrets',           type:'toggle',      value:true },
        { id:'pc_commit_lint',    label:'commitlint',               type:'toggle',      value:false },
        { id:'pc_commit_msg',     label:'commitizen',               type:'toggle',      value:false },
        { id:'pc_hadolint',       label:'hadolint (Docker)',        type:'toggle',      value:false },
        { id:'pc_shellcheck',     label:'shellcheck',               type:'toggle',      value:false },
        { id:'pc_gitleaks',       label:'gitleaks (secrets)',       type:'toggle',      value:false },
      ]},
      { label:'Sortie fichier', icon:'\uD83D\uDCC4', fields:[
        { id:'pc_file_ext',       label:'Extension',                type:'file-ext',    value:'yaml',
          allowed:['yaml','yml','txt'] },
      ]},
    ]},

  }, /* /forms */

  /* ════════════════════════════════════════════════════════════════
     CONDITIONS — vide (inline sans conditions)
     ════════════════════════════════════════════════════════════════ */
  conditions: [],

  /* ════════════════════════════════════════════════════════════════
     VALIDATORS — vide (aucun champ required dans l'inline)
     ════════════════════════════════════════════════════════════════ */
  validators: [],

  /* ════════════════════════════════════════════════════════════════
     PROFILE BINDINGS — vide
     ════════════════════════════════════════════════════════════════ */
  profile_bindings: [],

}; /* /MOD_DEVTOOLS_CFG_DATA */

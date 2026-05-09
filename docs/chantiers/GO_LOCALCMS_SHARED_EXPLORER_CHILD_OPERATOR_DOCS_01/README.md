# GO_LOCALCMS_SHARED_EXPLORER_CHILD_OPERATOR_DOCS_01

## Objectif

Documenter le flux opérateur réel de Shared Explorer après validation en usage réel.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_SHARED_EXPLORER_CHILD_OPERATOR_DOCS_01
- Base: main @ 4a598bf
- Remote: git@github.com:magikgmo4-ui/localcms.git

## Décision héritée

- GO_LOCALCMS_SHARED_EXPLORER_CHILD_REAL_USAGE_ACCEPTANCE_01: PASS 19/19 — Shared Explorer validé en usage réel

---

## Livrables

| Fichier | Action | Contenu |
| ------- | ------ | ------- |
| `docs/operator/SHARED_EXPLORER_V1_OPERATOR_GUIDE.md` | **créé** | Guide opérateur complet |

## Aucune modification applicative

- `api/shared_explorer.py` : non touché
- `modules/shared-explorer.js` : non touché
- `docs/module/README_M1.md` : non touché (aucune stale détectée)
- Runtime : aucun fichier créé ou supprimé

## Couverture guide opérateur

1. Environnement requis et structure SHARED_ROOT
2. Accès au panel UI
3. Navigation dossiers — racine, sous-dossiers, cas d'erreur
4. Preview fichier texte — extensions, limite 5 MB
5. Téléchargement — fichiers texte et archives
6. Recherche — paramètres, filtres, limite 200 résultats
7. API endpoints avec exemple curl cycle complet
8. Sécurité — path traversal, .env, binaires, taille
9. Lien avec CMS Installer — install-queue / install-logs / install-backups
10. Scénarios d'erreur et résolution
11. Limites V1
12. Preuve de validation

## Verdict

**PASS**

Guide opérateur créé. Aucune stale détectée dans README_M1.md. Aucun code applicatif modifié.

## Prochain GO recommandé

Documentation opérateur complète pour Shared Explorer V1.
Prochain chantier selon besoin : Config Store M3 acceptance/docs, hardening complémentaire, ou chantier applicatif.

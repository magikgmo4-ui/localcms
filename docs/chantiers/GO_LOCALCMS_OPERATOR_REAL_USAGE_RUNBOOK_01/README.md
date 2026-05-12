# GO_LOCALCMS_OPERATOR_REAL_USAGE_RUNBOOK_01

## Objectif

Transformer la validation E2E en procédure opérateur stable, reproductible et documentée.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_OPERATOR_REAL_USAGE_RUNBOOK_01
- Base: main @ 75a3bf3
- Remote: git@github.com:magikgmo4-ui/localcms.git

## Décision héritée

- GO_LOCALCMS_OPERATOR_WORKFLOW_E2E_ACCEPTANCE_01: PASS — flux E2E validé en conditions réelles

---

## Livrables

| Fichier | Action | Contenu |
| ------- | ------ | ------- |
| `docs/operator/OPERATOR_REAL_USAGE_RUNBOOK.md` | **créé** | Runbook opérateur complet |

## Couverture runbook

1. Prérequis — variables, répertoires
2. Étape 1 — Démarrer le host (critère PASS/FAIL)
3. Étape 2 — Déposer un bundle (format, manifest minimal)
4. Étape 3 — Vérifier via Shared Explorer
5. Étape 4 — Scanner via Installer
6. Étape 5 — Inspecter le manifeste
7. Étape 6 — Precheck (table des erreurs et actions correctives)
8. Étape 7 — Installer (pipeline complet, tableau 1ère install vs réinstall)
9. Étape 8 — Vérifier le fichier installé
10. Étape 9 — Consulter l'historique
11. Étape 10 — Lire les logs via Shared Explorer
12. Étape 11 — Rollback (critères PASS/FAIL)
13. Étape 12 — Nettoyage post-session
14. Tableau critères PASS/FAIL globaux
15. Checklist opérateur rapide
16. Références aux guides détaillés

## Aucune modification applicative

- `api/shared_explorer.py` : non touché
- `api/cms_installer.py` : non touché
- `modules/shared-explorer.js` : non touché
- `modules/cms-installer.js` : non touché

## Verdict

**PASS**

Runbook opérateur créé. Couvre le flux complet en 12 étapes avec critères PASS/FAIL explicites et checklist opérateur rapide.

## Prochain GO recommandé

Documentation opérateur complète.
Prochain chantier selon besoin : Config Store M3 acceptance réelle, M3 guide opérateur, ou hardening complémentaire.

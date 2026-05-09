# GO_LOCALCMS_CMS_INSTALLER_CHILD_OPERATOR_DOCS_01

## Objectif

Documenter le flux opérateur réel du CMS Module Installer V1 après validation backend et UI.

## Base canonique

- Repo: /home/ghost/localcms
- Branche: go/GO_LOCALCMS_CMS_INSTALLER_CHILD_OPERATOR_DOCS_01
- Base: main @ f454cb4
- Remote: git@github.com:magikgmo4-ui/localcms.git

## Décision héritée

- GO_LOCALCMS_CMS_INSTALLER_CHILD_REAL_BUNDLE_ACCEPTANCE_01: PASS — backend validé
- GO_LOCALCMS_CMS_INSTALLER_CHILD_UI_ACCEPTANCE_01: PASS — UI validée, rollback button ajouté

---

## Livrables

| Fichier | Action | Contenu |
| ------- | ------ | ------- |
| `docs/operator/CMS_INSTALLER_V1_OPERATOR_GUIDE.md` | **créé** | Guide opérateur complet |
| `docs/module/README_M2.md` | **mis à jour** | Correction stale : endpoints rollback/backups/restore ajoutés ; suppression "Pas de rollback manuel" |

## Stale corrigée dans README_M2.md

Ligne supprimée : `Pas de rollback manuel.`

Endpoints ajoutés :
- `POST /api/installer/rollback`
- `GET /api/installer/backups`
- `POST /api/installer/restore`

Ces endpoints existent depuis la release V2 et sont validés dans la campagne 157/157 PASS.

## Couverture guide opérateur

1. Environnement et variables requises
2. Format bundle — schéma manifest.json complet + exemple Python
3. Flux UI opérateur pas à pas (Scan → Inspect → Install → Rollback → History)
4. API endpoints avec exemple curl cycle complet
5. Pipeline détaillé (étapes, rollback automatique, bloquants)
6. Scénarios d'erreur et résolution
7. Sécurité
8. Limites V1
9. Preuve de validation (SHA des GOs d'acceptance)

## Aucune modification applicative

- `modules/cms-installer.js` : non touché
- `api/cms_installer.py` : non touché
- `localcms-v5.html` : non touché

## Verdict

**PASS**

Guide opérateur créé. Stale README_M2 corrigée. Aucun code applicatif modifié.

## Prochain GO recommandé

Documentation opérateur complète pour l'installer V1.
Prochain chantier selon besoin : Shared Explorer opérateur, M3 config store opérateur, ou chantier applicatif.

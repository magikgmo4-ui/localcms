# 04_CLOSEOUT_TEMPLATE — GO_LOCALCMS_DBLAYER_MIGRATION_PARENT_01

## VERDICT

Statut : `PASS` / `FAIL` / `PARTIAL`

## 13_ESTABLISHED

- À remplir avec faits validés uniquement.

## État de départ retenu

- Machine :
- Repo :
- Branche initiale :
- HEAD initial :
- État working tree :

## Correctif minimal appliqué

- À remplir.
- Indiquer `NO_PATCH` si aucun patch code n'a été fait.

## Fichiers exacts touchés

```text
À remplir
```

## Diff synthétique

```bash
git diff --stat
```

Résumé :

- À remplir.

## Vérifications réelles exécutées

```text
À remplir
```

## Résultats

| Commande | Résultat |
|---|---|
| À remplir | PASS/FAIL |

## Limites restantes réelles

- À remplir.

## 11_KEY_DECISIONS

- À remplir.

## 12_INVARIANTS respectés

- [ ] Repo séparé de opt-trading
- [ ] Branche dédiée
- [ ] Pas de refactor global
- [ ] Tests/smokes documentés
- [ ] État Git documenté
- [ ] Point de reprise écrit

## 16_TODO

- À remplir.

## 17_RESUME_POINT

```bash
ssh db-layer
tmux attach -t claude-localcms || tmux new -s claude-localcms
cd /opt/localcms
git status --short --branch
```

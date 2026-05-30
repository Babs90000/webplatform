---
name: debugging-typescript
description: Systematic debugging workflow for TypeScript, React, Next.js, and Node.js/MCP projects. Use when diagnosing a bug, error, or unexpected behavior in TypeScript code.
---

# Debugging TypeScript — Workflow Systématique

## Processus de debug (toujours dans cet ordre)

1. Lire le message d'erreur complet (stack trace inclus)
2. Classifier l'erreur (TypeScript compile / runtime / logique / réseau)
3. Localiser : fichier, fonction, ligne
4. Reproduire de façon minimale
5. Corriger avec une solution ciblée
6. Vérifier qu'aucune régression n'est introduite

## Erreurs TypeScript fréquentes

### Type 'X | undefined' is not assignable to type 'X'

```typescript
// Problème : find() peut retourner undefined
const user = users.find(u => u.id === id); // User | undefined
doSomething(user); // ERREUR TypeScript

// Solution : guard clause
const user = users.find(u => u.id === id);
if (!user) throw new Error(`User ${id} not found`);
doSomething(user); // TypeScript sait que user est User ici
```

### Cannot read properties of undefined/null

```typescript
// Optional chaining
const city = user?.address?.city ?? 'Ville inconnue';
const name = user?.name ?? 'Anonyme';
```

### Promise non attendue (floating promise)

```typescript
// Problème silencieux
useEffect(() => {
  fetchData(); // Promise ignorée
}, []);

// Correct
useEffect(() => {
  void fetchData(); // 'void' indique l'intention délibérée
}, []);
```

## Debugging React

### useEffect qui boucle

```typescript
// Cause : objet recréé à chaque render comme dépendance
useEffect(() => { fetchUser(filters); }, [filters]); // boucle si filters est un objet

// Solution : dépendances primitives ou useMemo
const stableFilters = useMemo(() => filters, [filters.page, filters.search]);
useEffect(() => { fetchUser(stableFilters); }, [stableFilters]);
```

### État qui ne se met pas à jour

```typescript
// Pour les objets imbriqués : spread à tous les niveaux
setUser(prev => ({ ...prev, address: { ...prev.address, city: 'Paris' } }));
```

## Debugging MCP / Node.js

```typescript
// Logs sur stderr (ne pollue pas le protocole MCP stdio)
console.error('[DEBUG] Paramètres:', JSON.stringify(params));
```

## Checklist avant de déclarer un bug résolu

- [ ] L'erreur n'apparaît plus dans la console
- [ ] tsc --noEmit passe sans erreur
- [ ] Les cas limites sont vérifiés (null, undefined, tableau vide)
- [ ] Pas de régression sur les fonctionnalités adjacentes

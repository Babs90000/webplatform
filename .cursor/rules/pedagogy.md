---
description: "Pedagogical rule: always explain generated code with objective, concepts, and next steps. Applied in all coding contexts."
alwaysApply: true
---

# Règle Pédagogique — Toujours active

Après chaque génération de code, fournir systématiquement ce bloc structuré.
Ne jamais générer du code sans son explication.

## Format obligatoire post-génération

```
OBJECTIF
Ce que ce code accomplit, en une ou deux phrases simples.

FONCTIONNEMENT — bloc par bloc
Explication de chaque partie importante du code, dans l'ordre.

CONCEPTS UTILISÉS
- NomDuConcept : définition courte et accessible
- ...

POINTS D'ATTENTION
Ce qui ne doit pas être modifié sans comprendre l'impact, effets de bord.

POUR ALLER PLUS LOIN
Une suggestion concrète : amélioration possible ou concept à explorer ensuite.
```

## Style pédagogique

- Tutoiement, ton direct et bienveillant
- Nommer les concepts avec leur terme exact (hook, closure, union type, guard clause, etc.)
- Utiliser des analogies pour les concepts abstraits
- Signaler les conventions communauté : "C'est le pattern standard en React pour..."
- Pour Python et Rust (débutant) : comparer avec TypeScript à chaque concept nouveau

## Niveau par stack

| Stack | Niveau | Comportement |
|---|---|---|
| React + TypeScript | Intermédiaire | Expliquer hooks avancés, patterns, perf |
| Next.js | Intermédiaire | Expliquer SSR/SSG/ISR, Server Components |
| Alpine.js | Intermédiaire | Rappeler directives et leur utilité |
| MCP / Node.js | Intermédiaire | Expliquer architecture, transports, Zod |
| PHP | Avancé | Comparaison TS si pertinent |
| Python | Débutant | Syntaxe détaillée, comparaison TS |
| Rust | Débutant | Ownership/borrowing expliqué à chaque bloc |

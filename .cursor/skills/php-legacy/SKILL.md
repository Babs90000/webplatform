---
name: php-legacy
description: Reviews PHP legacy code, suggests refactoring, and provides TypeScript/Node.js migration equivalents. Use when working with PHP code, comparing PHP to TypeScript patterns, or planning a PHP-to-Node.js migration.
---

# PHP Legacy — Review et Migration vers TypeScript

## Équivalences PHP -> TypeScript

| PHP | TypeScript |
|---|---|
| $array = [] | const arr: string[] = [] |
| array_map($fn, $arr) | arr.map(fn) |
| array_filter($arr, $fn) | arr.filter(fn) |
| isset($var) | var != null |
| null coalescing ?? | ?? (même opérateur) |
| Closure / fn() => | () => arrow function |
| PDO requêtes paramétrées | pg / prisma / drizzle |
| composer require | npm install |

## Service PHP -> Service TypeScript

```php
// PHP
class UserService {
  public function findById(string $id): ?User {
    return $this->repository->find($id);
  }
}
```

```typescript
// TypeScript — objet de fonctions fléchées
export const userService = {
  findById: async (id: string): Promise<User | null> => {
    return userRepository.findOne({ where: { id } });
  },
};
```

## Points de vigilance lors de la migration

- PHP synchrone par défaut -> Node.js est async/await
- PHP gère une requête à la fois -> Node.js event loop single thread
- Sessions PHP -> JWT ou sessions Redis en Node.js
- Types PHP dynamiques -> TypeScript est strict par conception

## Ordre de migration recommandé

1. Identifier les entités métier (models)
2. Créer les schémas Zod (remplace les validations PHP)
3. Migrer les repositories (accès données)
4. Migrer les services (logique métier)
5. Migrer les controllers -> routes API ou MCP tools
6. Migrer les vues -> composants React

---
name: security-audit
description: Audits TypeScript, React, and Node.js/MCP code for OWASP vulnerabilities, SQL injection, XSS, JWT flaws, and insecure dependencies. Use when reviewing code security, checking authentication logic, or auditing before deployment.
---

# Audit de Sécurité — TypeScript / Node.js / React

## Checklist d'audit (dans cet ordre)

### 1. Validation des entrées — CRITIQUE
- [ ] Toutes les entrées utilisateur validées avec Zod
- [ ] Pas de eval(), Function(), new Function()
- [ ] Paramètres URL et query string validés avant usage
- [ ] Validation côté serveur même si client la fait aussi

```typescript
// DANGEREUX — injection SQL
const user = await db.query(`SELECT * FROM users WHERE id = ${req.params.id}`);

// SECURISE — validation + requête paramétrée
const ParamSchema = z.object({ id: z.string().uuid() });
const { id } = ParamSchema.parse(req.params);
const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
```

### 2. Authentification JWT
- [ ] Vérifier exp, iss, algorithme (rejeter alg: none)
- [ ] Secrets dans variables d'environnement, jamais dans le code
- [ ] Vérification d'autorisation sur chaque route
- [ ] Rate limiting sur les endpoints d'auth

```typescript
// SECURISE
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET manquant dans environnement');
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
```

### 3. XSS
- [ ] React échappe le JSX automatiquement — éviter dangerouslySetInnerHTML
- [ ] Si dangerouslySetInnerHTML nécessaire : utiliser DOMPurify
- [ ] CSP configurée dans les headers HTTP

### 4. Variables d'environnement
- [ ] .env dans .gitignore
- [ ] .env.example sans valeurs réelles commité
- [ ] Pas de secrets dans les logs
- [ ] Variables NEXT_PUBLIC_ ne contiennent pas de secrets

### 5. Dépendances
```bash
npm audit
npm audit fix
npx npm-check-updates
```

### 6. Headers HTTP sécurisés (next.config.ts)
```typescript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
```

### 7. CORS
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

### 8. MCP spécifique
- [ ] Valider tous les inputs des tools avec Zod
- [ ] Ne pas exposer de paths système via des resources
- [ ] Sanitiser les outputs contenant des données utilisateur

## Format du rapport

```
CRITIQUE : [description] — Risque immédiat d'exploitation
ELEVE    : [description] — A corriger avant déploiement
MOYEN    : [description] — A corriger dans la prochaine sprint
FAIBLE   : [description] — Bonne pratique à intégrer
INFO     : [description] — Amélioration optionnelle
```

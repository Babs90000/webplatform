# Feuille de route — WebPlatform

> Générateur de sites web par IA (HTML / CSS / JS), édition visuelle,
> hébergement et nom de domaine inclus. Cible : freelances, TPE/PME et
> associations francophones.

Dernière mise à jour : 19 juin 2026.

---

## 1. Vision produit

Permettre à toute personne **sans compétence technique** de créer, modifier et
mettre en ligne un site professionnel **100 % personnalisé**, généré par IA,
avec tout l'essentiel inclus (nom de domaine, hébergement, support).

Principes directeurs :

- **Simplicité** : décrire son besoin en langage naturel, ajuster visuellement.
- **Transparence** : le client peut récupérer son code (export), pas de
  verrouillage.
- **Tout inclus** : domaine + hébergement + support dans l'abonnement.
- **Francophone** : interface, contenu généré et support en français.

> Positionnement assumé : on communique sur **nos atouts** (personnalisation,
> tout inclus, accessibilité tarifaire, francophone) plutôt que sur des
> comparaisons frontales avec d'autres outils.

---

## 2. État actuel du socle technique

| Brique | Stack | Statut |
|---|---|---|
| Frontend studio | Next.js 15 (App Router), TypeScript, Tailwind + CSS Modules, Zustand | ✅ Opérationnel |
| Backend codegen | Fastify, Node.js, Supabase | ✅ Opérationnel |
| Génération IA | DeepSeek V4 Pro / Flash, streaming `<wpFile>` / `<wpEdit>` | ✅ Opérationnel |
| Édition assistée (chat) | Koala Codeur — exécution de modifications (diffs `SEARCH/REPLACE`) | ✅ Opérationnel |
| Chat conseiller (propositions) | **Hermes Agent** (Nous Research, Coolify) — mémoire + skills | ⏳ V2+ (cf. §9) |
| Revue qualité (comité créatif) | 6 experts DeepSeek + finitions + audit manuel / auto | ✅ Opérationnel |
| Routes `/hermes/*` (backend WP) | Alias interne → Koala Codeur (DeepSeek, stateless) | ✅ Opérationnel — **≠ Hermes Agent** |
| Édition visuelle | Clic sur texte / image / fond dans l'aperçu | ✅ Opérationnel |
| Aperçu live | iframe `srcDoc`, bundler, Alpine.js (CDN) | ✅ Opérationnel |
| Upload d'images | Supabase Storage (URL publique + repli signé) | ✅ Opérationnel |
| Auth & projets | Supabase | ✅ Opérationnel |
| Facturation | Stripe | ⛔ À faire (V1) |
| Provisioning domaine | API OVH / Gandi | ⛔ À faire (V1) |
| Déploiement / hébergement client | Serveur + SSL automatisé | ⛔ À faire (V1) |

---

## 3. Les versions

### V0 — Socle technique *(en place)*

Le cœur du produit fonctionne : génération, édition visuelle et assistée,
aperçu, gestion de projets. C'est la fondation des versions suivantes.

---

### V1 — Offre commerciale « site clé en main » *(cible immédiate)*

Objectif : transformer le socle technique en **service vendable** avec
abonnement, domaine, hébergement et support.

#### 3.1 Périmètre produit

| Élément | Détail |
|---|---|
| Création | Génération IA + édition visuelle (déjà en place) |
| Nom de domaine | Inclus (ex. `monsite.com` via OVH / Gandi) |
| Hébergement | Inclus, SSL automatique |
| Support | Basique : FAQ, guides, e‑mail sous 24 h |
| Export du code | Option à 180 € (site statique livré en ZIP) |
| SEO | Balises meta générées automatiquement |
| Analytiques | Optionnel, respectueux du RGPD (Plausible / Umami) |
| Sauvegardes | Backups automatiques quotidiens |

#### 3.2 Tarification (hypothèse de travail)

| Offre | Prix |
|---|---|
| Abonnement | **12 €/mois** (offre lancement : 10 €/mois pour les 100 premiers) |
| Export du site | **180 €** (paiement unique) |
| Site supplémentaire | +5 €/mois |

#### 3.3 Chantiers techniques V1 (à implémenter)

1. **Facturation Stripe**
   - Abonnement mensuel récurrent (12 €).
   - Paiement unique (export 180 €).
   - Gestion cycle de vie : essai, échec de paiement, résiliation.
2. **Provisioning de nom de domaine**
   - Intégration API OVH / Gandi (achat + renouvellement auto).
   - Configuration DNS automatique vers l'hébergement.
3. **Hébergement & déploiement automatisé**
   - Publication d'un site en 1 clic, certificat SSL.
   - Mise à jour à chaque modification.
4. **Support basique**
   - Centre d'aide / FAQ, guides pas à pas.
   - Boîte `support@…` avec engagement 24 h.
5. **Valeur ajoutée incluse**
   - SEO : génération automatique des balises meta.
   - Analytiques optionnelles (Plausible / Umami).
   - Sauvegardes automatiques.
6. **Conformité**
   - RGPD (analytiques sans cookies, mentions légales, hébergement EU).
   - CGV / CGU, politique de remboursement.

#### 3.4 Lancement commercial V1

- **Page d'offre** claire : ce qui est inclus, le prix, l'export possible.
- **Démo gratuite** (7 jours).
- **Parrainage** : 1 mois offert par filleul.
- **Témoignages** réels au fil de l'eau.
- **Canaux** : LinkedIn (freelances/PME), réseaux sociaux (artisans,
  associations), partenariats graphistes / rédacteurs web (commission).

#### 3.5 Messages clés (formulation positive)

- « Un site professionnel **100 % personnalisé**, avec **nom de domaine,
  hébergement et support inclus**. »
- « **Votre site, votre code** : exportable à tout moment, sans verrouillage. »
- « **Personnalisation illimitée** grâce à l'IA, pas de gabarits rigides. »
- « **En français**, pensé pour le marché francophone. »

---

### V2 — Sites dynamiques légers *(évolution)*

Ajouter de l'interactivité **sans serveur applicatif lourd** :

- Formulaires fonctionnels (contact, réservation) avec envoi d'e‑mail.
- Édition de contenu par le client (mini‑CMS : textes, images, articles).
- Blog / actualités multi‑pages.
- Composants interactifs avancés (Alpine.js : menus, onglets, modales, FAQ).
- Bibliothèque de sections prêtes à l'emploi.

#### V2 — Première intégration Hermes Agent (conseiller Studio)

> **Hors périmètre V1.** Instance **Hermes Agent + WebUI** déjà sur Coolify
> (`nousresearch/hermes-agent`). Voir **§9** pour la feuille de route complète.

Le Studio garde **Koala Codeur** comme exécuteur de code. **Hermes Agent** (Nous Research)
ajoute la couche **conseiller qui apprend** : mémoire persistée, skills, recherche
cross-sessions — impossible à reproduire avec les appels DeepSeek stateless actuels.

| Mode | Comportement |
|---|---|
| **Discuter** | Hermes — SEO, CRO, design, copy, sans toucher aux fichiers |
| **Proposer** | Plan validé par l'utilisateur |
| **Appliquer** | Pipeline WP : `wpEdit` → comité créatif → sauvegarde |

Livrables V2 : context files par projet, gateway Hermes, skill `webplatform-studio`,
bascule UI *Conseiller* | *Modifier*.

---

### V3 — Builder d'applications *(piste stratégique séparée)*

Produit **distinct** avec hébergement serveur et runtime :

- Authentification des utilisateurs finaux.
- Base de données par projet.
- E‑commerce (catalogue, panier, paiement).
- Logique métier / API.
- Stack Next.js / React côté client.

> À traiter plus tard comme une offre à part entière, pas comme un palier de
> l'abonnement V1.

---

## 4. Économie de l'offre V1 (indicatif)

#### Coût estimé par client

| Poste | Mensuel | Annuel |
|---|---|---|
| Hébergement | ~0,07 € | ~0,80 € |
| Nom de domaine | ~0,83 € | ~10 € |
| Support basique | ~2,00 € | ~24 € |
| **Total** | **~2,90 €** | **~35 €** |

> Marge indicative : **12 € − 2,90 € ≈ 9 €/mois** par client.

#### Projection (hypothèse)

| Clients | Revenu/mois | Bénéfice/mois | Bénéfice/an |
|---|---|---|---|
| 50 | 600 € | ~455 € | ~5 460 € |
| 100 | 1 200 € | ~910 € | ~10 920 € |
| 200 | 2 400 € | ~1 820 € | ~21 840 € |

> Chiffres à valider avec les coûts réels (fournisseur domaine, hébergeur,
> temps de support, frais Stripe ~1,5 % + 0,25 €).

---

## 5. Architecture paiements (fournisseur interchangeable)

La facturation est **découplée du PSP** (Payment Service Provider). Stripe est
l'adaptateur V1 car il couvre abonnements, paiements uniques, webhooks et portail
client avec le moins de code — mais **aucune route métier n'importe Stripe
directement**.

```
Routes HTTP (/billing, /exports/checkout, /payments/webhook)
        ↓
getPaymentProvider()          ← PAYMENT_PROVIDER=stripe|mollie|payplug
        ↓
PaymentProvider (interface)   ← checkout, portail, verifyWebhook
        ↓
Événements normalisés         ← subscription.activated, payment.succeeded…
        ↓
handlePaymentEvents()         ← Supabase (subscriptions, exports, tenants)
```

| Couche | Fichiers | Rôle |
|---|---|---|
| Contrat | `src/lib/payments/types.ts` | Interface `PaymentProvider`, événements métier |
| Factory | `src/lib/payments/provider.ts` | Choisit le PSP via `PAYMENT_PROVIDER` |
| Adaptateur V1 | `src/lib/payments/stripe-provider.ts` | Implémentation Stripe (isolée) |
| Handler | `src/lib/payments/event-handler.ts` | Logique métier post-webhook (PSP-agnostique) |
| Repository | `src/lib/repositories/subscriptions.ts` | DB — colonnes `stripe_*` = IDs externes génériques pour la V1 |

**Pourquoi Stripe en V1 ?** Checkout hébergé, abonnements récurrents, essai
gratuit, portail client et webhooks signés — le tout documenté et rapide à
brancher. C'est le chemin le plus court pour valider le produit.

**Alternatives européennes à évaluer ensuite** (même interface, nouvel adaptateur) :

| Fournisseur | Siège | Atouts | Limites vs Stripe |
|---|---|---|---|
| **Mollie** | Pays-Bas (EU) | SEPA, iDEAL, Bancontact, tarifs clairs, bon DX | Portail abonnement moins complet |
| **Payplug** | France | Cartes EU, SEPA, support FR | Moins orienté SaaS récurrent |
| **Lemon Squeezy** | MoR US/EU | Gère TVA EU en tant que merchant of record | Moins de contrôle, US |

Migration future : implémenter `mollie-provider.ts`, changer
`PAYMENT_PROVIDER=mollie`, migrer les abonnements actifs (script one-shot).
Les routes front appellent `/api/v1/billing/*` — jamais l'API Stripe directement.

> Migration DB prévue : renommer `stripe_customer` → `provider_customer_id` et
> ajouter `payment_provider` quand un second PSP sera activé.

---

## 6. Ordre de priorité recommandé pour la V1

1. **Facturation** (abstraction + Stripe V1) — en cours.
2. **Déploiement / hébergement + SSL** (mettre un site en ligne).
3. **Provisioning de domaine** (OVH / Gandi).
4. **Page d'offre + parcours d'inscription** (front commercial).
5. **Support** (FAQ, e‑mail, guides).
6. **SEO auto + analytiques + sauvegardes** (valeur ajoutée).
7. **Conformité** (RGPD, CGV/CGU) — en parallèle, à finaliser avant lancement.

---

## 7. Risques & points de vigilance

- **Renouvellement de domaine** : automatiser, sinon expiration = site KO.
- **Coût du support** : borne le temps par client pour préserver la marge.
- **RGPD** : hébergement EU, analytiques sans cookies, données clients.
- **Dépendance fournisseurs** (DeepSeek, Supabase, hébergeur) : prévoir des
  alternatives et surveiller les coûts à l'échelle.
- **Qualité de génération IA** : c'est le cœur de la valeur — à maintenir au
  plus haut niveau.

---

## 8. Prochaines étapes (à arbitrer ensemble)

- [x] Abstraction paiements + adaptateur Stripe V1 (backend).
- [x] Front billing (checkout abo, portail, export payant).
- [ ] Automatisation domaine (API OVH / Gandi).
- [ ] Déploiement + SSL automatisés.
- [ ] Page « offre » et parcours d'inscription.
- [ ] Support (FAQ + e‑mail + guides).
- [ ] SEO auto + Plausible/Umami + backups.
- [ ] Conformité RGPD + CGV/CGU.

---

## 9. Hermes Agent (Nous Research) — stratégie multi-versions

> Référence : [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) —
> agent auto-améliorant (mémoire, skills, cron, MCP, gateway multi-plateforme).
> Déployé sur Coolify : stack **Hermes Agent + WebUI** (gateway interne, WebUI :8787).

### Distinction importante

| | Hermes Agent (Coolify) | Koala Codeur / routes `/hermes/*` (WebPlatform) |
|---|---|---|
| Éditeur | Nous Research | WebPlatform (DeepSeek via OpenRouter) |
| Mémoire | Persistante, cross-sessions, skills | Session + brief + fichiers projet |
| Rôle cible | Conseiller, automatiser, apprendre du client | Générer et patcher du code |
| Fine-tuning global | Non — apprentissage par mémoire/skills | Non |

Les deux sont **complémentaires** : Hermes pense et mémorise ; Koala Codeur exécute
sur le code avec le comité créatif (garde-fou qualité).

### Architecture cible (schéma)

```
Utilisateur (Studio / Telegram / …)
        ↓
Hermes Agent (gateway Coolify)     ← mémoire, skills, propositions
        ↓  [validation « Appliquer »]
WebPlatform API (codegen / audit)  ← wpEdit, comité 6 experts, déploiement
        ↓
Site client (HTML/CSS/JS)
```

### Par version — ce qu'on peut mettre en place

#### V1 *(en cours — sans Hermes Agent)*

- Koala Codeur exécuteur + comité créatif + audit manuel/auto.
- **Pas d'intégration Hermes** : focus commercial (Stripe, déploiement, domaine).
- Préparer le terrain : documenter l'URL gateway Hermes, clés, volumes persistants.

#### V2 — Conseiller + mémoire projet

| Fonctionnalité Hermes | Usage WebPlatform |
|---|---|
| **Context files** | Injecter brief, persona marque, liste pages, dernier score audit |
| **Mémoire persistée** | Hermes se souvient des préférences client (ton, couleurs, contraintes) |
| **Mode discuter / proposer / appliquer** | Chat Studio branché sur gateway ; bouton « Appliquer dans le site » |
| **Skill `webplatform-studio`** | Règles codegen WP, anti-patterns, workflow audit |
| **Session search (FTS5)** | « Tu m'avais proposé quoi pour le hero la semaine dernière ? » |

#### V2.5 — MCP + automatisation légère

| Fonctionnalité Hermes | Usage WebPlatform |
|---|---|
| **MCP server WebPlatform** | Tools : `get_project_files`, `preview_url`, `trigger_audit`, `deploy` |
| **Cron Hermes** | Rapport hebdo SEO, rappel renouvellement domaine, backup check |
| **Subagents** | Paralléliser : audit SEO + relecture copy sur grosses refontes |
| **Gateway Telegram/Slack** | Client notifié : « Site prêt — qualité 87/100 » (option abonnement Pro) |

#### V3 — Builder apps + agent ops

| Fonctionnalité Hermes | Usage WebPlatform |
|---|---|
| **Skills métier** | E-commerce, réservation, formulaires — procédures apprises par secteur |
| **Honcho (modèle utilisateur)** | Personnalisation offre : TPE vs association vs freelance |
| **Terminal backends (Docker/SSH)** | Environnements isolés pour previews ou builds Next.js |
| **Automations client** | « Chaque lundi, propose 3 idées d'article blog » → brouillon dans mini-CMS |

#### V4+ — Boucle d'amélioration produit *(R&D)*

| Fonctionnalité Hermes | Usage WebPlatform |
|---|---|
| **Trajectories / compression** | Améliorer les prompts codegen à partir de sessions réelles (opt-in) |
| **Skills Hub communautaire** | Templates secteur (restaurant, avocat, association) partagés |
| **Multi-tenant Hermes** | Un agent par tenant agence, mémoire isolée par client final |
| **Support niveau 2** | Hermes répond aux FAQ support, escalade humain si bloqué |

### Ce qu'on ne délègue **pas** à Hermes (rester sur WP)

- Génération initiale HTML/CSS/JS (pipeline `<wpFile>` optimisé).
- Comité créatif 6 experts + polish (scores, garde-fous, coût maîtrisé).
- Facturation, provisioning domaine, déploiement SSL (logique métier critique).
- Données sensibles clients (RGPD) : Hermes reçoit un **contexte filtré**, pas toute la DB.

### Prérequis infra (déjà en place sur Coolify)

- Volumes persistants : `hermes-home` (mémoire, config, sessions).
- Gateway interne + WebUI admin (port 8787).
- Clés provider (OpenRouter / Nous Portal) — **séparées** des clés codegen WP si besoin.
- Healthcheck + backups du volume Hermes (la mémoire **est** le produit).

### Prochaines étapes Hermes (post-V1)

- [ ] **V2** — Gateway API + context files par `project_id` + skill `webplatform-studio`.
- [ ] **V2** — UI Studio : onglet Conseiller Hermes + flux « Appliquer ».
- [ ] **V2.5** — MCP server WebPlatform exposé à Hermes.
- [ ] **V2.5** — Cron : rapport qualité / SEO hebdomadaire (offre Pro).
- [ ] **V3** — Gateway Telegram pour notifications client.
- [ ] **V4** — Trajectories anonymisées pour améliorer les prompts (opt-in).

---

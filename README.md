# ProjectOcp — Gestion des Moteurs (OCP)

Application complète : frontend React (Vite) + backend Node/Express + MySQL.

## Structure

```
ProjectOcp/
├─ src/                    (frontend React)
│  ├─ components/
│  ├─ App.jsx, main.jsx, api.js, constants.js, index.css
├─ public/
│  └─ logo-ocp.jpg
├─ index.html
├─ vite.config.js
├─ package.json            (frontend)
├─ .env.example            (frontend : VITE_API_URL)
└─ ocp-backend/
   ├─ config/db.js
   ├─ middleware/auth.js
   ├─ routes/ (auth, moteurs, equivalents, pannes, historique)
   ├─ scripts/ (creer-utilisateur.js, import-excel.js)
   ├─ schema.sql
   ├─ server.js
   ├─ package.json         (backend)
   └─ .env.example          (backend : DB_*, JWT_*, PORT)
```

## 1) Base de données MySQL

```bash
mysql -u root -p < ocp-backend/schema.sql
```

## 2) Backend

```bash
cd ocp-backend
npm install
cp .env.example .env      # puis remplir DB_PASSWORD, JWT_SECRET...
node scripts/creer-utilisateur.js admin1 VotreMotDePasse admin
node scripts/import-excel.js chemin/vers/stock.xlsx     # optionnel : import du stock existant
npm run dev                # démarre sur http://localhost:4000
```

## 3) Frontend

```bash
cd ..                      # racine ProjectOcp
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:4000/api
npm run dev                # démarre sur http://localhost:5173
```

## Comptes

Chaque personne a son propre compte : email + mot de passe (pas de mot de
passe partagé). Depuis `ocp-backend/`, créez les 4 comptes responsables
(remplacez les emails et mots de passe par les vrais) :

```bash
node scripts/creer-utilisateur.js "Hosni"    hosni@ocp.com    MotDePasse1 admin
node scripts/creer-utilisateur.js "Zarnaoui" zarnaoui@ocp.com MotDePasse2 admin
node scripts/creer-utilisateur.js "Ahmed"    ahmed@ocp.com    MotDePasse3 admin
node scripts/creer-utilisateur.js "Atabi"    atabi@ocp.com    MotDePasse4 admin
```

- **admin** : accès complet (stock, ajout, modification, suppression, historique).
- **visiteur** : tout sauf le stock ("en stock" reste masqué, y compris côté API) —
  utile si vous voulez plus tard donner un accès en lecture à d'autres collègues
  sans qu'ils voient le stock ; créez-les avec `visiteur` au lieu de `admin`.

Chacun se connecte avec son propre email/mot de passe sur la page de connexion —
les sessions sont indépendantes (un JWT par personne, valable 8h par défaut,
réglable dans `.env` via `JWT_EXPIRES_IN`).

## Tenue dans la durée (historique qui grossit)

- Les tables `moteurs` et `historique` sont indexées (état, forme, puissance,
  localisation, matricule, date) : les recherches restent rapides même avec
  des milliers de lignes d'historique.
- La page Historique charge par défaut les 300 événements les plus récents, et
  la recherche par matricule interroge directement MySQL (pas de chargement
  de tout l'historique côté navigateur) : l'app reste légère même dans
  plusieurs années.
- Si un jour l'historique devient vraiment volumineux (dizaines de milliers de
  lignes), archiver les entrées de plus d'un an dans une table
  `historique_archive` est une option simple à ajouter plus tard.

## Notes

- La "Position géographique" propose Saake1 / Saake2 / M.Tekfen / M.Z / ME en
  autocomplétion (insensible à la casse), avec saisie libre possible.
- Chaque passage d'un moteur à l'état "en révision" incrémente son compteur
  de révisions (`revisionCount`), visible dans la liste et les fiches.
- Toute suppression est archivée dans l'historique avant d'être effacée.
- Le logo est votre propre fichier (`public/logo-ocp.jpg`) — remplacez-le si besoin.

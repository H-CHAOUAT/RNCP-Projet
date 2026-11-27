# Étapes de test par mode

Comptes : `victoria@test.com` (parent), `lucas@test.com` (enfant), `marc@test.com` (adulte seul).

Les modes 1 et 2 partagent la même base. Si elle contient encore les anciens comptes, repartir à zéro avec `docker compose down -v` (**efface toutes les données locales**).

## 1. Mode dev (back et front dans le terminal, Postgres en Docker)

1. Lancer :
   ```bash
   docker compose up -d postgres
   cd backend && mvn spring-boot:run     # terminal 1, avec JAVA_HOME sur le JDK 21
   cd frontend && npm run dev            # terminal 2
   ```
2. Ouvrir `http://localhost:5173`.
3. Se connecter avec les 3 comptes (`Password1234`).
4. Dérouler le [parcours dans l'app](#parcours-dans-lapp).

## 2. Tout Docker en local (avec Caddy)

1. Arrêter le backend du mode dev (les ports 8080 et 80 doivent être libres).
2. Lancer :
   ```bash
   docker compose up -d --build
   docker compose ps
   ```
   Les 3 conteneurs doivent tourner. En cas de souci : `docker compose logs -f backend frontend`.
3. Ouvrir `http://localhost`.
4. Se connecter avec les 3 comptes (`Password1234`).
5. Recharger la page sur `/goals` : pas de 404.
6. Dérouler le [parcours dans l'app](#parcours-dans-lapp).
7. Arrêter : `docker compose down`.

## 3. Prod (sur la VM)

1. Créer le sous-domaine DuckDNS avec l'IP publique de la VM.
2. Ouvrir le port TCP 8443 en entrée dans OCI (Security List ou NSG).
3. Sur la VM, vérifier que le port est libre (`ss -ltn | grep 8443` ne retourne rien) et qu'il reste de la RAM et du disque (`free -h`, `df -h`).
4. Sur la VM, cloner la branche à déployer avec la commande `git clone` du README. Pour une mise à jour, suivre sa section « Mettre à jour ».
5. Dans `~/finfam` : `cp .env.prod.example .env && chmod 600 .env`, puis remplir `.env`.
6. Lancer :
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   docker compose -f docker-compose.prod.yml ps
   ```
   Les 3 conteneurs doivent tourner. Seul `frontend` publie un port (`8443->443`) ; `5432` et `8080` apparaissent sans flèche.
7. Depuis ton PC : `curl https://<domaine>.duckdns.org:8443/api/health` doit répondre `"status":"OK"`, sans erreur de certificat.
8. Ouvrir `https://<domaine>.duckdns.org:8443` : aucun avertissement de sécurité.
9. Se connecter avec les 3 comptes (`SEED_PASSWORD`).
10. Copier un code d'invitation avec Victoria.
11. Recharger la page sur `/goals` : pas de 404.
12. Tester depuis un téléphone en 4G.
13. Vérifier que l'autre application de la VM fonctionne toujours.
14. Dérouler le [parcours dans l'app](#parcours-dans-lapp), sans laisser de données d'essai avant la présentation.

En cas de problème (logs : `docker compose -f docker-compose.prod.yml logs -f frontend backend`) :

| Symptôme | À regarder |
|---|---|
| Délai dépassé | IP dans DuckDNS, règle OCI 8443, puis pare-feu de la VM |
| Erreur de certificat ou TLS | Logs de `frontend` : domaine et token DuckDNS |
| Erreur 502 sur `/api` | Logs de `backend` : démarrage en cours ou en échec |

## Parcours dans l'app

1. Essayer un mauvais mot de passe : il doit être refusé.
2. Avec chaque compte, ouvrir le tableau de bord, Finances, Objectifs, Transactions, Factures, Famille et Paramètres.
3. Créer un objectif : les montants d'épargne sont affichés par mois. Recharger, puis le supprimer.
4. Avec Victoria : voir Lucas dans le foyer, filtrer les objectifs par membre, ouvrir la page de Lucas et générer un code d'invitation.
5. Avec Lucas : il ne doit pouvoir ni inviter ni changer les rôles.
6. Avec Marc : il n'a pas de foyer.
7. Se déconnecter depuis le menu du compte.

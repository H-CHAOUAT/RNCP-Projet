# Utilisateurs de test (DataSeeder)

Générés au démarrage du backend par `DataSeeder` (si moins de 10 utilisateurs en base).

- **Mot de passe de tous les comptes `@test.com` : `Password1234`**
- Email : `prénomnom@test.com`, en minuscules et sans accents (ex. `chloemartin@test.com`).
- Rôles : `ADULT` (seul, sans foyer), `PARENT` (gère un foyer), `CHILD`.
- Chaque famille du seeder a 2 `PARENT` (le 1er est le parent principal, le 2e son conjoint) et 2 ou 3 `CHILD`.
- Revenu des enfants selon leur rang : 1er = 0, 2e = 200, suivants = 350. Les enfants n'ont aucune dépense fixe.

Total : 298 comptes de test (71 familles, 1 adulte(s) seul(s)).

## Un compte par persona (pour tester vite)

| Persona | Famille | Nom | Email | Revenu | Devise | Solde | Dépenses fixes |
|---|---|---|---|---|---|---|---|
| **Persona 1 : Adulte (Marc)** | (none) | Marc  | `marc@test.com` | 1900 | EUR | 600 | 890 |
| **Persona 2 : Parent (Elyne)** | Elyne's Family | Elyne  | `elyne@test.com` | 2600 | EUR | 1200 | 1880 |
| **Persona 3 : Enfant (Lucas)** | Elyne's Family | Lucas  | `lucas@test.com` | 20 | EUR | 35 | 0 |
| Parent, EUR, 3 enfants | Martin Family | Sophie Martin | `sophiemartin@test.com` | 3200 | EUR | 3080 | 1620 |
| Parent, EUR, 2 enfants | Dupont Family | Marie Dupont | `mariedupont@test.com` | 2850 | EUR | 1800 | 2080 |
| Conjoint (2e parent), EUR | Martin Family | Thomas Martin | `thomasmartin@test.com` | 2400 | EUR | 800 | 2080 |
| Parent, USD | Simon Family | Amélie Simon | `ameliesimon@test.com` | 4750 | USD | 3000 | 1535 |
| Parent, GBP | Lefebvre Family | Sandrine Lefebvre | `sandrinelefebvre@test.com` | 3300 | GBP | 3300 | 1620 |
| Parent, MAD | Leroy Family | Caroline Leroy | `carolineleroy@test.com` | 3250 | MAD | 3600 | 2080 |
| Enfant sans revenu | Martin Family | Emma Martin | `emmamartin@test.com` | 0 | EUR | 140 | 0 |
| Enfant avec petit revenu (200) | Martin Family | Lucas Martin | `lucasmartin@test.com` | 200 | EUR | 170 | 0 |
| Enfant avec revenu (350) | Martin Family | Chloé Martin | `chloemartin@test.com` | 350 | EUR | 200 | 0 |

## Comptes hors seed

- `adsystab@gmail.com` (PARENT, sans famille), créé à la main et non par le seeder.

## Toutes les familles

### Martin Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Sophie Martin | `sophiemartin@test.com` | 3200 | 3080 | 2 | 1620 |
| PARENT | Thomas Martin | `thomasmartin@test.com` | 2400 | 800 | 3 | 2080 |
| CHILD | Emma Martin | `emmamartin@test.com` | 0 | 140 | 4 | 0 |
| CHILD | Lucas Martin | `lucasmartin@test.com` | 200 | 170 | 5 | 0 |
| CHILD | Chloé Martin | `chloemartin@test.com` | 350 | 200 | 6 | 0 |

### Dupont Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Marie Dupont | `mariedupont@test.com` | 2850 | 1800 | 7 | 2080 |
| PARENT | Pierre Dupont | `pierredupont@test.com` | 2240 | 1000 | 8 | 1420 |
| CHILD | Antoine Dupont | `antoinedupont@test.com` | 0 | 160 | 9 | 0 |
| CHILD | Lucie Dupont | `luciedupont@test.com` | 200 | 190 | 10 | 0 |

### Bernard Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Claire Bernard | `clairebernard@test.com` | 4100 | 2100 | 11 | 1420 |
| PARENT | François Bernard | `francoisbernard@test.com` | 3080 | 1200 | 12 | 1750 |
| CHILD | Mathieu Bernard | `mathieubernard@test.com` | 0 | 180 | 13 | 0 |
| CHILD | Anaïs Bernard | `anaisbernard@test.com` | 200 | 210 | 14 | 0 |

### Laurent Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Isabelle Laurent | `isabellelaurent@test.com` | 3650 | 2400 | 15 | 1750 |
| PARENT | Michel Laurent | `michellaurent@test.com` | 2920 | 1400 | 16 | 2520 |
| CHILD | Paul Laurent | `paullaurent@test.com` | 0 | 200 | 17 | 0 |
| CHILD | Charlotte Laurent | `charlottelaurent@test.com` | 200 | 230 | 18 | 0 |

### Moreau Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Julie Moreau | `juliemoreau@test.com` | 2800 | 2700 | 19 | 2520 |
| PARENT | Nicolas Moreau | `nicolasmoreau@test.com` | 2160 | 1600 | 20 | 1535 |
| CHILD | Théo Moreau | `theomoreau@test.com` | 0 | 220 | 21 | 0 |
| CHILD | Inès Moreau | `inesmoreau@test.com` | 200 | 250 | 22 | 0 |

### Simon Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Amélie Simon | `ameliesimon@test.com` | 4750 | 3000 | 23 | 1535 |
| PARENT | David Simon | `davidsimon@test.com` | 3400 | 1800 | 24 | 1620 |
| CHILD | Hugo Simon | `hugosimon@test.com` | 0 | 240 | 25 | 0 |
| CHILD | Léa Simon | `leasimon@test.com` | 200 | 270 | 1 | 0 |
| CHILD | Jade Simon | `jadesimon@test.com` | 350 | 300 | 2 | 0 |

### Lefebvre Family (GBP)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Sandrine Lefebvre | `sandrinelefebvre@test.com` | 3300 | 3300 | 3 | 1620 |
| PARENT | Christophe Lefebvre | `christophelefebvre@test.com` | 2400 | 2000 | 4 | 2080 |
| CHILD | Maxime Lefebvre | `maximelefebvre@test.com` | 0 | 260 | 5 | 0 |
| CHILD | Eva Lefebvre | `evalefebvre@test.com` | 200 | 290 | 6 | 0 |

### Leroy Family (MAD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Caroline Leroy | `carolineleroy@test.com` | 3250 | 3600 | 7 | 2080 |
| PARENT | Stéphane Leroy | `stephaneleroy@test.com` | 2240 | 2200 | 8 | 1420 |
| CHILD | Romain Leroy | `romainleroy@test.com` | 0 | 280 | 9 | 0 |
| CHILD | Camille Leroy | `camilleleroy@test.com` | 200 | 310 | 10 | 0 |

### Roux Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Virginie Roux | `virginieroux@test.com` | 3200 | 3900 | 11 | 1420 |
| PARENT | Laurent Roux | `laurentroux@test.com` | 2480 | 2400 | 12 | 1750 |
| CHILD | Enzo Roux | `enzoroux@test.com` | 0 | 300 | 13 | 0 |
| CHILD | Manon Roux | `manonroux@test.com` | 200 | 330 | 14 | 0 |

### Michel Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Nathalie Michel | `nathaliemichel@test.com` | 2850 | 4200 | 15 | 1750 |
| PARENT | Éric Michel | `ericmichel@test.com` | 2320 | 2600 | 16 | 2520 |
| CHILD | Quentin Michel | `quentinmichel@test.com` | 0 | 320 | 17 | 0 |
| CHILD | Laura Michel | `lauramichel@test.com` | 200 | 350 | 18 | 0 |

### Garcia Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Elena Garcia | `elenagarcia@test.com` | 4100 | 4500 | 19 | 2520 |
| PARENT | Carlos Garcia | `carlosgarcia@test.com` | 3160 | 2800 | 20 | 1535 |
| CHILD | Diego Garcia | `diegogarcia@test.com` | 0 | 140 | 21 | 0 |
| CHILD | Isabella Garcia | `isabellagarcia@test.com` | 200 | 170 | 22 | 0 |
| CHILD | Sofía Garcia | `sofiagarcia@test.com` | 350 | 200 | 23 | 0 |

### Martinez Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Ana Martinez | `anamartinez@test.com` | 3650 | 4800 | 24 | 1535 |
| PARENT | José Martinez | `josemartinez@test.com` | 3000 | 3000 | 25 | 1620 |
| CHILD | Pablo Martinez | `pablomartinez@test.com` | 0 | 160 | 1 | 0 |
| CHILD | Carmen Martinez | `carmenmartinez@test.com` | 200 | 190 | 2 | 0 |

### Lopez Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Rosa Lopez | `rosalopez@test.com` | 2800 | 5100 | 3 | 1620 |
| PARENT | Miguel Lopez | `miguellopez@test.com` | 2000 | 3200 | 4 | 2080 |
| CHILD | Javier Lopez | `javierlopez@test.com` | 0 | 180 | 5 | 0 |
| CHILD | Valeria Lopez | `valerialopez@test.com` | 200 | 210 | 6 | 0 |

### Sanchez Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Marta Sanchez | `martasanchez@test.com` | 4750 | 5400 | 7 | 2080 |
| PARENT | Juan Sanchez | `juansanchez@test.com` | 3240 | 3400 | 8 | 1420 |
| CHILD | Alejandro Sanchez | `alejandrosanchez@test.com` | 0 | 200 | 9 | 0 |
| CHILD | Natalia Sanchez | `nataliasanchez@test.com` | 200 | 230 | 10 | 0 |

### Gonzalez Family (GBP)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Patricia Gonzalez | `patriciagonzalez@test.com` | 3300 | 5700 | 11 | 1420 |
| PARENT | Francisco Gonzalez | `franciscogonzalez@test.com` | 2480 | 3600 | 12 | 1750 |
| CHILD | Sergio Gonzalez | `sergiogonzalez@test.com` | 0 | 220 | 13 | 0 |
| CHILD | Raquel Gonzalez | `raquelgonzalez@test.com` | 200 | 250 | 14 | 0 |

### Benali Family (MAD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Fatima Benali | `fatimabenali@test.com` | 3250 | 6000 | 15 | 1750 |
| PARENT | Mohammed Benali | `mohammedbenali@test.com` | 2320 | 800 | 16 | 2520 |
| CHILD | Youssef Benali | `youssefbenali@test.com` | 0 | 240 | 17 | 0 |
| CHILD | Meryem Benali | `meryembenali@test.com` | 200 | 270 | 18 | 0 |
| CHILD | Hamza Benali | `hamzabenali@test.com` | 350 | 300 | 19 | 0 |

### Chaouat Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Houda Chaouat | `houdachaouat@test.com` | 3200 | 6300 | 20 | 2520 |
| PARENT | Amine Chaouat | `aminechaouat@test.com` | 2560 | 1000 | 21 | 1535 |
| CHILD | Saad Chaouat | `saadchaouat@test.com` | 0 | 260 | 22 | 0 |
| CHILD | Zineb Chaouat | `zinebchaouat@test.com` | 200 | 290 | 23 | 0 |

### Tahiri Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Nadia Tahiri | `nadiatahiri@test.com` | 2850 | 6600 | 24 | 1535 |
| PARENT | Omar Tahiri | `omartahiri@test.com` | 2400 | 1200 | 25 | 1620 |
| CHILD | Othmane Tahiri | `othmanetahiri@test.com` | 0 | 280 | 1 | 0 |
| CHILD | Hanae Tahiri | `hanaetahiri@test.com` | 200 | 310 | 2 | 0 |

### Guerraoui Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Rachida Guerraoui | `rachidaguerraoui@test.com` | 4100 | 6900 | 3 | 1620 |
| PARENT | Hassan Guerraoui | `hassanguerraoui@test.com` | 3000 | 1400 | 4 | 2080 |
| CHILD | Mehdi Guerraoui | `mehdiguerraoui@test.com` | 0 | 300 | 5 | 0 |
| CHILD | Soukaina Guerraoui | `soukainaguerraoui@test.com` | 200 | 330 | 6 | 0 |

### Moukrim Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Laila Moukrim | `lailamoukrim@test.com` | 3650 | 7200 | 7 | 2080 |
| PARENT | Khalid Moukrim | `khalidmoukrim@test.com` | 2840 | 1600 | 8 | 1420 |
| CHILD | Reda Moukrim | `redamoukrim@test.com` | 0 | 320 | 9 | 0 |
| CHILD | Amina Moukrim | `aminamoukrim@test.com` | 200 | 350 | 10 | 0 |
| CHILD | Ilyas Moukrim | `ilyasmoukrim@test.com` | 350 | 380 | 11 | 0 |

### Benkirane Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Widad Benkirane | `widadbenkirane@test.com` | 2800 | 1500 | 12 | 1420 |
| PARENT | Karim Benkirane | `karimbenkirane@test.com` | 2080 | 1800 | 13 | 1750 |
| CHILD | Adam Benkirane | `adambenkirane@test.com` | 0 | 140 | 14 | 0 |
| CHILD | Hajar Benkirane | `hajarbenkirane@test.com` | 200 | 170 | 15 | 0 |

### Idrissi Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Siham Idrissi | `sihamidrissi@test.com` | 4750 | 1800 | 16 | 1750 |
| PARENT | Tariq Idrissi | `tariqidrissi@test.com` | 3320 | 2000 | 17 | 2520 |
| CHILD | Zakaria Idrissi | `zakariaidrissi@test.com` | 0 | 160 | 18 | 0 |
| CHILD | Nour Idrissi | `nouridrissi@test.com` | 200 | 190 | 19 | 0 |

### Ouali Family (GBP)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Samira Ouali | `samiraouali@test.com` | 3300 | 2100 | 20 | 2520 |
| PARENT | Mourad Ouali | `mouradouali@test.com` | 2560 | 2200 | 21 | 1535 |
| CHILD | Bilal Ouali | `bilalouali@test.com` | 0 | 180 | 22 | 0 |
| CHILD | Yasmine Ouali | `yasmineouali@test.com` | 200 | 210 | 23 | 0 |

### Hamdani Family (MAD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Karima Hamdani | `karimahamdani@test.com` | 3250 | 2400 | 24 | 1535 |
| PARENT | Abdelkrim Hamdani | `abdelkrimhamdani@test.com` | 2400 | 2400 | 25 | 1620 |
| CHILD | Rayan Hamdani | `rayanhamdani@test.com` | 0 | 200 | 1 | 0 |
| CHILD | Imane Hamdani | `imanehamdani@test.com` | 200 | 230 | 2 | 0 |

### Belkacem Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Djamila Belkacem | `djamilabelkacem@test.com` | 3200 | 2700 | 3 | 1620 |
| PARENT | Rachid Belkacem | `rachidbelkacem@test.com` | 2400 | 2600 | 4 | 2080 |
| CHILD | Nassim Belkacem | `nassimbelkacem@test.com` | 0 | 220 | 5 | 0 |
| CHILD | Sabrina Belkacem | `sabrinabelkacem@test.com` | 200 | 250 | 6 | 0 |
| CHILD | Walid Belkacem | `walidbelkacem@test.com` | 350 | 280 | 7 | 0 |

### Tremblay Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Stéphanie Tremblay | `stephanietremblay@test.com` | 2850 | 3000 | 8 | 2080 |
| PARENT | Marc Tremblay | `marctremblay@test.com` | 2240 | 2800 | 9 | 1420 |
| CHILD | Gabriel Tremblay | `gabrieltremblay@test.com` | 0 | 240 | 10 | 0 |
| CHILD | Mathilde Tremblay | `mathildetremblay@test.com` | 200 | 270 | 11 | 0 |

### Roy Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Mélanie Roy | `melanieroy@test.com` | 4100 | 3300 | 12 | 1420 |
| PARENT | Philippe Roy | `philipperoy@test.com` | 3080 | 3000 | 13 | 1750 |
| CHILD | Étienne Roy | `etienneroy@test.com` | 0 | 260 | 14 | 0 |
| CHILD | Aurélie Roy | `aurelieroy@test.com` | 200 | 290 | 15 | 0 |

### Gagnon Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Véronique Gagnon | `veroniquegagnon@test.com` | 3650 | 3600 | 16 | 1750 |
| PARENT | Jean Gagnon | `jeangagnon@test.com` | 2920 | 3200 | 17 | 2520 |
| CHILD | Samuel Gagnon | `samuelgagnon@test.com` | 0 | 280 | 18 | 0 |
| CHILD | Noémie Gagnon | `noemiegagnon@test.com` | 200 | 310 | 19 | 0 |

### Côté Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Josée Côté | `joseecote@test.com` | 2800 | 3900 | 20 | 2520 |
| PARENT | Alain Côté | `alaincote@test.com` | 2160 | 3400 | 21 | 1535 |
| CHILD | Alexis Côté | `alexiscote@test.com` | 0 | 300 | 22 | 0 |
| CHILD | Ariane Côté | `arianecote@test.com` | 200 | 330 | 23 | 0 |
| CHILD | Vincent Côté | `vincentcote@test.com` | 350 | 360 | 24 | 0 |

### Gauthier Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Hélène Gauthier | `helenegauthier@test.com` | 4750 | 4200 | 25 | 1535 |
| PARENT | Patrick Gauthier | `patrickgauthier@test.com` | 3400 | 3600 | 1 | 1620 |
| CHILD | Jonathan Gauthier | `jonathangauthier@test.com` | 0 | 320 | 2 | 0 |
| CHILD | Myriam Gauthier | `myriamgauthier@test.com` | 200 | 350 | 3 | 0 |

### Müller Family (GBP)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Lena Müller | `lenamuller@test.com` | 3300 | 4500 | 4 | 1620 |
| PARENT | Klaus Müller | `klausmuller@test.com` | 2400 | 800 | 5 | 2080 |
| CHILD | Jonas Müller | `jonasmuller@test.com` | 0 | 140 | 6 | 0 |
| CHILD | Anna Müller | `annamuller@test.com` | 200 | 170 | 7 | 0 |
| CHILD | Timo Müller | `timomuller@test.com` | 350 | 200 | 8 | 0 |

### Schmidt Family (MAD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Petra Schmidt | `petraschmidt@test.com` | 3250 | 4800 | 9 | 2080 |
| PARENT | Dieter Schmidt | `dieterschmidt@test.com` | 2240 | 1000 | 10 | 1420 |
| CHILD | Niklas Schmidt | `niklasschmidt@test.com` | 0 | 160 | 11 | 0 |
| CHILD | Katharina Schmidt | `katharinaschmidt@test.com` | 200 | 190 | 12 | 0 |

### Weber Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Sabine Weber | `sabineweber@test.com` | 3200 | 5100 | 13 | 1420 |
| PARENT | Markus Weber | `markusweber@test.com` | 2480 | 1200 | 14 | 1750 |
| CHILD | Felix Weber | `felixweber@test.com` | 0 | 180 | 15 | 0 |
| CHILD | Julia Weber | `juliaweber@test.com` | 200 | 210 | 16 | 0 |

### Meyer Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Claudia Meyer | `claudiameyer@test.com` | 2850 | 5400 | 17 | 1750 |
| PARENT | Stefan Meyer | `stefanmeyer@test.com` | 2320 | 1400 | 18 | 2520 |
| CHILD | Florian Meyer | `florianmeyer@test.com` | 0 | 200 | 19 | 0 |
| CHILD | Sophia Meyer | `sophiameyer@test.com` | 200 | 230 | 20 | 0 |

### Wagner Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Monika Wagner | `monikawagner@test.com` | 4100 | 5700 | 21 | 2520 |
| PARENT | Jürgen Wagner | `jurgenwagner@test.com` | 3160 | 1600 | 22 | 1535 |
| CHILD | Tim Wagner | `timwagner@test.com` | 0 | 220 | 23 | 0 |
| CHILD | Hannah Wagner | `hannahwagner@test.com` | 200 | 250 | 24 | 0 |
| CHILD | Leon Wagner | `leonwagner@test.com` | 350 | 280 | 25 | 0 |

### Nguyen Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Linh Nguyen | `linhnguyen@test.com` | 3650 | 6000 | 1 | 1535 |
| PARENT | Minh Nguyen | `minhnguyen@test.com` | 3000 | 1800 | 2 | 1620 |
| CHILD | Hieu Nguyen | `hieunguyen@test.com` | 0 | 240 | 3 | 0 |
| CHILD | Lan Nguyen | `lannguyen@test.com` | 200 | 270 | 4 | 0 |

### Tran Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Mai Tran | `maitran@test.com` | 2800 | 6300 | 5 | 1620 |
| PARENT | Duc Tran | `ductran@test.com` | 2000 | 2000 | 6 | 2080 |
| CHILD | Tuan Tran | `tuantran@test.com` | 0 | 260 | 7 | 0 |
| CHILD | Thu Tran | `thutran@test.com` | 200 | 290 | 8 | 0 |

### Pham Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Huong Pham | `huongpham@test.com` | 4750 | 6600 | 9 | 2080 |
| PARENT | Van Pham | `vanpham@test.com` | 3240 | 2200 | 10 | 1420 |
| CHILD | Quang Pham | `quangpham@test.com` | 0 | 280 | 11 | 0 |
| CHILD | Nhi Pham | `nhipham@test.com` | 200 | 310 | 12 | 0 |

### Diallo Family (GBP)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Aminata Diallo | `aminatadiallo@test.com` | 3300 | 6900 | 13 | 1420 |
| PARENT | Ibrahim Diallo | `ibrahimdiallo@test.com` | 2480 | 2400 | 14 | 1750 |
| CHILD | Mamadou Diallo | `mamadoudiallo@test.com` | 0 | 300 | 15 | 0 |
| CHILD | Kadiatou Diallo | `kadiatoudiallo@test.com` | 200 | 330 | 16 | 0 |

### Konaté Family (MAD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Mariam Konaté | `mariamkonate@test.com` | 3250 | 7200 | 17 | 1750 |
| PARENT | Ousmane Konaté | `ousmanekonate@test.com` | 2320 | 2600 | 18 | 2520 |
| CHILD | Seydou Konaté | `seydoukonate@test.com` | 0 | 320 | 19 | 0 |
| CHILD | Fatoumata Konaté | `fatoumatakonate@test.com` | 200 | 350 | 20 | 0 |

### Touré Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Aissatou Touré | `aissatoutoure@test.com` | 3200 | 1500 | 21 | 2520 |
| PARENT | Cheikh Touré | `cheikhtoure@test.com` | 2560 | 2800 | 22 | 1535 |
| CHILD | Moussa Touré | `moussatoure@test.com` | 0 | 140 | 23 | 0 |
| CHILD | Binta Touré | `bintatoure@test.com` | 200 | 170 | 24 | 0 |

### Mbaye Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Khady Mbaye | `khadymbaye@test.com` | 2850 | 1800 | 25 | 1535 |
| PARENT | Abdoulaye Mbaye | `abdoulayembaye@test.com` | 2400 | 3000 | 1 | 1620 |
| CHILD | Ibrahima Mbaye | `ibrahimambaye@test.com` | 0 | 160 | 2 | 0 |
| CHILD | Rokhaya Mbaye | `rokhayambaye@test.com` | 200 | 190 | 3 | 0 |

### Santos Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Mariana Santos | `marianasantos@test.com` | 4100 | 2100 | 4 | 1620 |
| PARENT | Ricardo Santos | `ricardosantos@test.com` | 3000 | 3200 | 5 | 2080 |
| CHILD | Eduardo Santos | `eduardosantos@test.com` | 0 | 180 | 6 | 0 |
| CHILD | Beatriz Santos | `beatrizsantos@test.com` | 200 | 210 | 7 | 0 |
| CHILD | Mateus Santos | `mateussantos@test.com` | 350 | 240 | 8 | 0 |

### Oliveira Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Catarina Oliveira | `catarinaoliveira@test.com` | 3650 | 2400 | 9 | 2080 |
| PARENT | Tiago Oliveira | `tiagooliveira@test.com` | 2840 | 3400 | 10 | 1420 |
| CHILD | Filipe Oliveira | `filipeoliveira@test.com` | 0 | 200 | 11 | 0 |
| CHILD | Inês Oliveira | `inesoliveira@test.com` | 200 | 230 | 12 | 0 |

### Ferreira Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Daniela Ferreira | `danielaferreira@test.com` | 2800 | 2700 | 13 | 1420 |
| PARENT | Bruno Ferreira | `brunoferreira@test.com` | 2080 | 3600 | 14 | 1750 |
| CHILD | Rafael Ferreira | `rafaelferreira@test.com` | 0 | 220 | 15 | 0 |
| CHILD | Joana Ferreira | `joanaferreira@test.com` | 200 | 250 | 16 | 0 |

### Kowalski Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Agnieszka Kowalski | `agnieszkakowalski@test.com` | 4750 | 3000 | 17 | 1750 |
| PARENT | Piotr Kowalski | `piotrkowalski@test.com` | 3320 | 800 | 18 | 2520 |
| CHILD | Kamil Kowalski | `kamilkowalski@test.com` | 0 | 240 | 19 | 0 |
| CHILD | Zofia Kowalski | `zofiakowalski@test.com` | 200 | 270 | 20 | 0 |

### Nowak Family (GBP)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Magdalena Nowak | `magdalenanowak@test.com` | 3300 | 3300 | 21 | 2520 |
| PARENT | Tomasz Nowak | `tomasznowak@test.com` | 2560 | 1000 | 22 | 1535 |
| CHILD | Mateusz Nowak | `mateusznowak@test.com` | 0 | 260 | 23 | 0 |
| CHILD | Natalia Nowak | `natalianowak@test.com` | 200 | 290 | 24 | 0 |

### Wiśniewski Family (MAD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Katarzyna Wiśniewski | `katarzynawisniewski@test.com` | 3250 | 3600 | 25 | 1535 |
| PARENT | Andrzej Wiśniewski | `andrzejwisniewski@test.com` | 2400 | 1200 | 1 | 1620 |
| CHILD | Michał Wiśniewski | `michalwisniewski@test.com` | 0 | 280 | 2 | 0 |
| CHILD | Karolina Wiśniewski | `karolinawisniewski@test.com` | 200 | 310 | 3 | 0 |

### Rossi Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Giulia Rossi | `giuliarossi@test.com` | 3200 | 3900 | 4 | 1620 |
| PARENT | Marco Rossi | `marcorossi@test.com` | 2400 | 1400 | 5 | 2080 |
| CHILD | Luca Rossi | `lucarossi@test.com` | 0 | 300 | 6 | 0 |
| CHILD | Valentina Rossi | `valentinarossi@test.com` | 200 | 330 | 7 | 0 |

### Ferrari Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Francesca Ferrari | `francescaferrari@test.com` | 2850 | 4200 | 8 | 2080 |
| PARENT | Matteo Ferrari | `matteoferrari@test.com` | 2240 | 1600 | 9 | 1420 |
| CHILD | Andrea Ferrari | `andreaferrari@test.com` | 0 | 320 | 10 | 0 |
| CHILD | Chiara Ferrari | `chiaraferrari@test.com` | 200 | 350 | 11 | 0 |
| CHILD | Lorenzo Ferrari | `lorenzoferrari@test.com` | 350 | 380 | 12 | 0 |

### Esposito Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Raffaella Esposito | `raffaellaesposito@test.com` | 4100 | 4500 | 13 | 1420 |
| PARENT | Antonio Esposito | `antonioesposito@test.com` | 3080 | 1800 | 14 | 1750 |
| CHILD | Davide Esposito | `davideesposito@test.com` | 0 | 140 | 15 | 0 |
| CHILD | Silvia Esposito | `silviaesposito@test.com` | 200 | 170 | 16 | 0 |

### Smith Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Emily Smith | `emilysmith@test.com` | 3650 | 4800 | 17 | 1750 |
| PARENT | James Smith | `jamessmith@test.com` | 2920 | 2000 | 18 | 2520 |
| CHILD | Oliver Smith | `oliversmith@test.com` | 0 | 160 | 19 | 0 |
| CHILD | Charlotte Smith | `charlottesmith@test.com` | 200 | 190 | 20 | 0 |
| CHILD | Isla Smith | `islasmith@test.com` | 350 | 220 | 21 | 0 |

### Johnson Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Sarah Johnson | `sarahjohnson@test.com` | 2800 | 5100 | 22 | 2520 |
| PARENT | Michael Johnson | `michaeljohnson@test.com` | 2160 | 2200 | 23 | 1535 |
| CHILD | Ethan Johnson | `ethanjohnson@test.com` | 0 | 180 | 24 | 0 |
| CHILD | Grace Johnson | `gracejohnson@test.com` | 200 | 210 | 25 | 0 |

### Williams Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Jessica Williams | `jessicawilliams@test.com` | 4750 | 5400 | 1 | 1535 |
| PARENT | Robert Williams | `robertwilliams@test.com` | 3400 | 2400 | 2 | 1620 |
| CHILD | Daniel Williams | `danielwilliams@test.com` | 0 | 200 | 3 | 0 |
| CHILD | Chloe Williams | `chloewilliams@test.com` | 200 | 230 | 4 | 0 |

### Brown Family (GBP)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Amanda Brown | `amandabrown@test.com` | 3300 | 5700 | 5 | 1620 |
| PARENT | Christopher Brown | `christopherbrown@test.com` | 2400 | 2600 | 6 | 2080 |
| CHILD | Tyler Brown | `tylerbrown@test.com` | 0 | 220 | 7 | 0 |
| CHILD | Megan Brown | `meganbrown@test.com` | 200 | 250 | 8 | 0 |

### Jones Family (MAD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Jennifer Jones | `jenniferjones@test.com` | 3250 | 6000 | 9 | 2080 |
| PARENT | Matthew Jones | `matthewjones@test.com` | 2240 | 2800 | 10 | 1420 |
| CHILD | Brandon Jones | `brandonjones@test.com` | 0 | 240 | 11 | 0 |
| CHILD | Rachel Jones | `racheljones@test.com` | 200 | 270 | 12 | 0 |
| CHILD | Ashley Jones | `ashleyjones@test.com` | 350 | 300 | 13 | 0 |

### Petit Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Sylvie Petit | `sylviepetit@test.com` | 3200 | 6300 | 14 | 1420 |
| PARENT | Richard Petit | `richardpetit@test.com` | 2480 | 3000 | 15 | 1750 |
| CHILD | Florent Petit | `florentpetit@test.com` | 0 | 260 | 16 | 0 |
| CHILD | Céline Petit | `celinepetit@test.com` | 200 | 290 | 17 | 0 |

### Renard Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Véronique Renard | `veroniquerenard@test.com` | 2850 | 6600 | 18 | 1750 |
| PARENT | Thierry Renard | `thierryrenard@test.com` | 2320 | 3200 | 19 | 2520 |
| CHILD | Kévin Renard | `kevinrenard@test.com` | 0 | 280 | 20 | 0 |
| CHILD | Sandra Renard | `sandrarenard@test.com` | 200 | 310 | 21 | 0 |

### Morin Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Brigitte Morin | `brigittemorin@test.com` | 4100 | 6900 | 22 | 2520 |
| PARENT | Gilles Morin | `gillesmorin@test.com` | 3160 | 3400 | 23 | 1535 |
| CHILD | Julien Morin | `julienmorin@test.com` | 0 | 300 | 24 | 0 |
| CHILD | Valérie Morin | `valeriemorin@test.com` | 200 | 330 | 25 | 0 |

### Fontaine Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Monique Fontaine | `moniquefontaine@test.com` | 3650 | 7200 | 1 | 1535 |
| PARENT | Alain Fontaine | `alainfontaine@test.com` | 3000 | 3600 | 2 | 1620 |
| CHILD | Bastien Fontaine | `bastienfontaine@test.com` | 0 | 320 | 3 | 0 |
| CHILD | Aurélie Fontaine | `aureliefontaine@test.com` | 200 | 350 | 4 | 0 |

### Chevalier Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Joëlle Chevalier | `joellechevalier@test.com` | 2800 | 1500 | 5 | 1620 |
| PARENT | Benoît Chevalier | `benoitchevalier@test.com` | 2000 | 800 | 6 | 2080 |
| CHILD | Guillaume Chevalier | `guillaumechevalier@test.com` | 0 | 140 | 7 | 0 |
| CHILD | Nadège Chevalier | `nadegechevalier@test.com` | 200 | 170 | 8 | 0 |
| CHILD | Dorian Chevalier | `dorianchevalier@test.com` | 350 | 200 | 9 | 0 |

### Rousseau Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Odile Rousseau | `odilerousseau@test.com` | 4750 | 1800 | 10 | 2080 |
| PARENT | Gérard Rousseau | `gerardrousseau@test.com` | 3240 | 1000 | 11 | 1420 |
| CHILD | Tristan Rousseau | `tristanrousseau@test.com` | 0 | 160 | 12 | 0 |
| CHILD | Laure Rousseau | `laurerousseau@test.com` | 200 | 190 | 13 | 0 |

### Vincent Family (GBP)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Muriel Vincent | `murielvincent@test.com` | 3300 | 2100 | 14 | 1420 |
| PARENT | Arnaud Vincent | `arnaudvincent@test.com` | 2480 | 1200 | 15 | 1750 |
| CHILD | Clément Vincent | `clementvincent@test.com` | 0 | 180 | 16 | 0 |
| CHILD | Alice Vincent | `alicevincent@test.com` | 200 | 210 | 17 | 0 |

### Fournier Family (MAD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Delphine Fournier | `delphinefournier@test.com` | 3250 | 2400 | 18 | 1750 |
| PARENT | Xavier Fournier | `xavierfournier@test.com` | 2320 | 1400 | 19 | 2520 |
| CHILD | Simon Fournier | `simonfournier@test.com` | 0 | 200 | 20 | 0 |
| CHILD | Lucie Fournier | `luciefournier@test.com` | 200 | 230 | 21 | 0 |

### Girard Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Aurélie Girard | `aureliegirard@test.com` | 3200 | 2700 | 22 | 2520 |
| PARENT | Sébastien Girard | `sebastiengirard@test.com` | 2560 | 1600 | 23 | 1535 |
| CHILD | Adrien Girard | `adriengirard@test.com` | 0 | 220 | 24 | 0 |
| CHILD | Marine Girard | `marinegirard@test.com` | 200 | 250 | 25 | 0 |

### Bonnet Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Pascale Bonnet | `pascalebonnet@test.com` | 2850 | 3000 | 1 | 1535 |
| PARENT | Yannick Bonnet | `yannickbonnet@test.com` | 2400 | 1800 | 2 | 1620 |
| CHILD | Robin Bonnet | `robinbonnet@test.com` | 0 | 240 | 3 | 0 |
| CHILD | Élodie Bonnet | `elodiebonnet@test.com` | 200 | 270 | 4 | 0 |
| CHILD | Bryan Bonnet | `bryanbonnet@test.com` | 350 | 300 | 5 | 0 |

### Lemaire Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Édith Lemaire | `edithlemaire@test.com` | 4100 | 3300 | 6 | 1620 |
| PARENT | Denis Lemaire | `denislemaire@test.com` | 3000 | 2000 | 7 | 2080 |
| CHILD | Cédric Lemaire | `cedriclemaire@test.com` | 0 | 260 | 8 | 0 |
| CHILD | Audrey Lemaire | `audreylemaire@test.com` | 200 | 290 | 9 | 0 |

### Dupuis Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Martine Dupuis | `martinedupuis@test.com` | 3650 | 3600 | 10 | 2080 |
| PARENT | Frédéric Dupuis | `fredericdupuis@test.com` | 2840 | 2200 | 11 | 1420 |
| CHILD | Nicolas Dupuis | `nicolasdupuis@test.com` | 0 | 280 | 12 | 0 |
| CHILD | Elisa Dupuis | `elisadupuis@test.com` | 200 | 310 | 13 | 0 |

### Lambert Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Carole Lambert | `carolelambert@test.com` | 2800 | 3900 | 14 | 1420 |
| PARENT | Olivier Lambert | `olivierlambert@test.com` | 2080 | 2400 | 15 | 1750 |
| CHILD | Rémi Lambert | `remilambert@test.com` | 0 | 300 | 16 | 0 |
| CHILD | Maëlys Lambert | `maelyslambert@test.com` | 200 | 330 | 17 | 0 |

### Mercier Family (USD)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Michèle Mercier | `michelemercier@test.com` | 4750 | 4200 | 18 | 1750 |
| PARENT | Patrice Mercier | `patricemercier@test.com` | 3320 | 2600 | 19 | 2520 |
| CHILD | Thibault Mercier | `thibaultmercier@test.com` | 0 | 320 | 20 | 0 |
| CHILD | Emilie Mercier | `emiliemercier@test.com` | 200 | 350 | 21 | 0 |

### Elyne's Family (EUR)

| Rôle | Nom | Email | Revenu | Solde | Jour de paie | Dépenses fixes |
|---|---|---|---|---|---|---|
| PARENT | Elyne  | `elyne@test.com` | 2600 | 1200 | 24 | 1880 |
| CHILD | Lucas  | `lucas@test.com` | 20 | 35 | 25 | 0 |

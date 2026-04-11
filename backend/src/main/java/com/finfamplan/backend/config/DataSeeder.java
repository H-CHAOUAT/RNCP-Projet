package com.finfamplan.backend.config;

import com.finfamplan.backend.model.*;
import com.finfamplan.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@org.springframework.context.annotation.Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final FamilyGroupRepository familyGroupRepo;
    private final FinancialProfileRepository financialProfileRepo;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepo,
                      FamilyGroupRepository familyGroupRepo,
                      FinancialProfileRepository financialProfileRepo,
                      PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.familyGroupRepo = familyGroupRepo;
        this.financialProfileRepo = financialProfileRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.count() >= 10) return;

        String hashed = passwordEncoder.encode("Password1234");

        String[][] families = {
            {"Martin",     "Sophie",   "Thomas",   "Emma",    "Lucas",    "Chloé"},
            {"Dupont",     "Marie",    "Pierre",   "Antoine", "Lucie",    ""},
            {"Bernard",    "Claire",   "François", "Mathieu", "Anaïs",    ""},
            {"Laurent",    "Isabelle", "Michel",   "Paul",    "Charlotte",""},
            {"Moreau",     "Julie",    "Nicolas",  "Théo",    "Inès",     ""},
            {"Simon",      "Amélie",   "David",    "Hugo",    "Léa",      "Jade"},
            {"Lefebvre",   "Sandrine", "Christophe","Maxime", "Eva",      ""},
            {"Leroy",      "Caroline", "Stéphane", "Romain",  "Camille",  ""},
            {"Roux",       "Virginie", "Laurent",  "Enzo",    "Manon",    ""},
            {"Michel",     "Nathalie", "Éric",     "Quentin", "Laura",    ""},
            {"Garcia",     "Elena",    "Carlos",   "Diego",   "Isabella", "Sofía"},
            {"Martinez",   "Ana",      "José",     "Pablo",   "Carmen",   ""},
            {"Lopez",      "Rosa",     "Miguel",   "Javier",  "Valeria",  ""},
            {"Sanchez",    "Marta",    "Juan",     "Alejandro","Natalia",  ""},
            {"Gonzalez",   "Patricia", "Francisco","Sergio",  "Raquel",   ""},
            {"Benali",     "Fatima",   "Mohammed", "Youssef", "Meryem",   "Hamza"},
            {"Chaouat",    "Houda",    "Amine",    "Saad",    "Zineb",    ""},
            {"Tahiri",     "Nadia",    "Omar",     "Othmane", "Hanae",    ""},
            {"Guerraoui",  "Rachida",  "Hassan",   "Mehdi",   "Soukaina", ""},
            {"Moukrim",    "Laila",    "Khalid",   "Reda",    "Amina",    "Ilyas"},
            {"Benkirane",  "Widad",    "Karim",    "Adam",    "Hajar",    ""},
            {"Idrissi",    "Siham",    "Tariq",    "Zakaria", "Nour",     ""},
            {"Ouali",      "Samira",   "Mourad",   "Bilal",   "Yasmine",  ""},
            {"Hamdani",    "Karima",   "Abdelkrim","Rayan",   "Imane",    ""},
            {"Belkacem",   "Djamila",  "Rachid",   "Nassim",  "Sabrina",  "Walid"},
            {"Tremblay",   "Stéphanie","Marc",     "Gabriel", "Mathilde", ""},
            {"Roy",        "Mélanie",  "Philippe", "Étienne", "Aurélie",  ""},
            {"Gagnon",     "Véronique","Jean",     "Samuel",  "Noémie",   ""},
            {"Côté",       "Josée",    "Alain",    "Alexis",  "Ariane",   "Vincent"},
            {"Gauthier",   "Hélène",   "Patrick",  "Jonathan","Myriam",   ""},
            {"Müller",     "Lena",     "Klaus",    "Jonas",   "Anna",     "Timo"},
            {"Schmidt",    "Petra",    "Dieter",   "Niklas",  "Katharina",""},
            {"Weber",      "Sabine",   "Markus",   "Felix",   "Julia",    ""},
            {"Meyer",      "Claudia",  "Stefan",   "Florian", "Sophia",   ""},
            {"Wagner",     "Monika",   "Jürgen",   "Tim",     "Hannah",   "Leon"},
            {"Nguyen",     "Linh",     "Minh",     "Hieu",    "Lan",      ""},
            {"Tran",       "Mai",      "Duc",      "Tuan",    "Thu",      ""},
            {"Pham",       "Huong",    "Van",      "Quang",   "Nhi",      ""},
            {"Diallo",     "Aminata",  "Ibrahim",  "Mamadou", "Kadiatou", ""},
            {"Konaté",     "Mariam",   "Ousmane",  "Seydou",  "Fatoumata",""},
            {"Touré",      "Aissatou", "Cheikh",   "Moussa",  "Binta",    ""},
            {"Mbaye",      "Khady",    "Abdoulaye","Ibrahima","Rokhaya",  ""},
            {"Santos",     "Mariana",  "Ricardo",  "Eduardo", "Beatriz",  "Mateus"},
            {"Oliveira",   "Catarina", "Tiago",    "Filipe",  "Inês",     ""},
            {"Ferreira",   "Daniela",  "Bruno",    "Rafael",  "Joana",    ""},
            {"Kowalski",   "Agnieszka","Piotr",    "Kamil",   "Zofia",    ""},
            {"Nowak",      "Magdalena","Tomasz",   "Mateusz", "Natalia",  ""},
            {"Wiśniewski", "Katarzyna","Andrzej",  "Michał",  "Karolina", ""},
            {"Rossi",      "Giulia",   "Marco",    "Luca",    "Valentina",""},
            {"Ferrari",    "Francesca","Matteo",   "Andrea",  "Chiara",   "Lorenzo"},
            {"Esposito",   "Raffaella","Antonio",  "Davide",  "Silvia",   ""},
            {"Smith",      "Emily",    "James",    "Oliver",  "Charlotte","Isla"},
            {"Johnson",    "Sarah",    "Michael",  "Ethan",   "Grace",    ""},
            {"Williams",   "Jessica",  "Robert",   "Daniel",  "Chloe",    ""},
            {"Brown",      "Amanda",   "Christopher","Tyler", "Megan",    ""},
            {"Jones",      "Jennifer", "Matthew",  "Brandon", "Rachel",   "Ashley"},
            {"Petit",      "Sylvie",   "Richard",  "Florent", "Céline",   ""},
            {"Renard",     "Véronique","Thierry",  "Kévin",   "Sandra",   ""},
            {"Morin",      "Brigitte", "Gilles",   "Julien",  "Valérie",  ""},
            {"Fontaine",   "Monique",  "Alain",    "Bastien", "Aurélie",  ""},
            {"Chevalier",  "Joëlle",   "Benoît",   "Guillaume","Nadège",  "Dorian"},
            {"Rousseau",   "Odile",    "Gérard",   "Tristan", "Laure",    ""},
            {"Vincent",    "Muriel",   "Arnaud",   "Clément", "Alice",    ""},
            {"Fournier",   "Delphine", "Xavier",   "Simon",   "Lucie",    ""},
            {"Girard",     "Aurélie",  "Sébastien","Adrien",  "Marine",   ""},
            {"Bonnet",     "Pascale",  "Yannick",  "Robin",   "Élodie",   "Bryan"},
            {"Lemaire",    "Édith",    "Denis",    "Cédric",  "Audrey",   ""},
            {"Dupuis",     "Martine",  "Frédéric", "Nicolas", "Elisa",    ""},
            {"Lambert",    "Carole",   "Olivier",  "Rémi",    "Maëlys",   ""},
            {"Mercier",    "Michèle",  "Patrice",  "Thibault","Emilie",   ""},
        };

        String[] currencies = {"EUR", "EUR", "EUR", "EUR", "EUR", "USD", "GBP", "MAD"};
        int[][] parentSalaries = {
            {3200, 3800}, {2800, 3200}, {4000, 5500}, {3500, 4200},
            {2600, 3000}, {4500, 6000}, {3000, 3600}, {2900, 3400}
        };
        int[][] partnerSalaries = {
            {2400, 3000}, {2200, 2800}, {3000, 4000}, {2800, 3500},
            {2000, 2600}, {3200, 4500}, {2400, 3200}, {2200, 2900}
        };
        String[][] expenseProfiles = {
            {"RENT:900", "BILLS:150", "GROCERIES:400", "TRANSPORT:120", "SUBSCRIPTIONS:50"},
            {"RENT:1200","BILLS:200", "GROCERIES:500", "TRANSPORT:100", "SUBSCRIPTIONS:80"},
            {"RENT:750", "BILLS:130", "GROCERIES:350", "TRANSPORT:150", "SUBSCRIPTIONS:40"},
            {"RENT:1000","BILLS:160", "GROCERIES:450", "TRANSPORT:80",  "SUBSCRIPTIONS:60"},
            {"RENT:1400","BILLS:220", "GROCERIES:600", "TRANSPORT:200", "SUBSCRIPTIONS:100"},
            {"RENT:850", "BILLS:140", "GROCERIES:380", "TRANSPORT:110", "SUBSCRIPTIONS:55"},
        };

        for (int fi = 0; fi < families.length; fi++) {
            String[] fam = families[fi];
            String familyName = fam[0];
            String parentFirstName = fam[1];
            String partnerFirstName = fam[2];

            FamilyGroup group = new FamilyGroup();
            group.setName(familyName + " Family");
            group.setCreatedAt(LocalDateTime.now());
            group.setUpdatedAt(LocalDateTime.now());
            group = familyGroupRepo.save(group);

            int salaryIdx = fi % parentSalaries.length;
            int expIdx    = fi % expenseProfiles.length;
            int currIdx   = fi % currencies.length;
            String currency = currencies[currIdx];

            int parentSal  = parentSalaries[salaryIdx][0] + (fi % 8) * 50;
            int partnerSal = partnerSalaries[salaryIdx][0] + (fi % 6) * 40;
            int parentBal  = 1500 + (fi % 20) * 300;
            int partnerBal = 800  + (fi % 15) * 200;

            User parent = buildUser(parentFirstName, familyName, Role.PARENT, group, hashed);
            parent = userRepo.save(parent);
            createFinancialProfile(parent, parentSal, currency, parentBal, expenseProfiles[expIdx]);

            User partner = buildUser(partnerFirstName, familyName, Role.PARTNER, group, hashed);
            partner = userRepo.save(partner);
            createFinancialProfile(partner, partnerSal, currency, partnerBal, expenseProfiles[(expIdx + 1) % expenseProfiles.length]);

            for (int ci = 3; ci < fam.length; ci++) {
                String childName = fam[ci];
                if (childName == null || childName.isBlank()) continue;
                User child = buildUser(childName, familyName, Role.CHILD, group, hashed);
                child = userRepo.save(child);
                int childBal  = 50 + (ci * 30) + (fi % 10) * 20;
                int childSal  = ci == 3 ? 0 : (ci == 4 ? 200 : 350);
                createFinancialProfile(child, childSal, currency, childBal, new String[0]);
            }
        }
    }

    private User buildUser(String firstName, String lastName, Role role, FamilyGroup group, String hashed) {
        User u = new User();
        u.setFirstName(firstName);
        u.setLastName(lastName);
        String emailFirst = normalize(firstName);
        String emailLast  = normalize(lastName);
        String email = emailFirst + emailLast + "@test.com";
        long count = userRepo.countByEmailStartingWith(emailFirst + emailLast);
        if (count > 0) email = emailFirst + emailLast + count + "@test.com";
        u.setEmail(email);
        u.setPassword(hashed);
        u.setRole(role);
        u.setFamilyGroup(group);
        return u;
    }

    private String normalize(String s) {
        return s.toLowerCase()
                .replace("é", "e").replace("è", "e").replace("ê", "e").replace("ë", "e")
                .replace("à", "a").replace("â", "a").replace("ä", "a")
                .replace("î", "i").replace("ï", "i")
                .replace("ô", "o").replace("ö", "o")
                .replace("ù", "u").replace("û", "u").replace("ü", "u")
                .replace("ç", "c").replace("ñ", "n")
                .replace("ó", "o").replace("á", "a").replace("í", "i").replace("ú", "u")
                .replace("ý", "y").replace("ś", "s").replace("ń", "n").replace("ż", "z")
                .replace("ź", "z").replace("ą", "a").replace("ę", "e").replace("ł", "l")
                .replaceAll("[^a-z0-9]", "");
    }

    private void createFinancialProfile(User user, int salary, String currency, int balance, String[] expLines) {
        FinancialProfile fp = new FinancialProfile();
        fp.setUser(user);
        fp.setMonthlyIncome(BigDecimal.valueOf(salary));
        fp.setCurrency(currency);
        fp.setCurrentBalance(BigDecimal.valueOf(balance));
        fp.setPaydayDay(1 + (user.getUserId().intValue() % 25));
        fp.setBalanceLocked(false);
        fp.setSalaryPendingConfirmation(false);

        List<ExpenseItem> items = new ArrayList<>();
        for (String line : expLines) {
            String[] parts = line.split(":");
            if (parts.length != 2) continue;
            ExpenseItem item = new ExpenseItem();
            item.setFinancialProfile(fp);
            item.setCategory(parts[0]);
            item.setAmount(BigDecimal.valueOf(Long.parseLong(parts[1])));
            items.add(item);
        }
        fp.setExpenses(items);
        financialProfileRepo.save(fp);
    }
}

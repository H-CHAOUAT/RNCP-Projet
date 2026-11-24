// Shared French labels for backend-stored codes (not an i18n library — just
// one place to keep these consistent across every screen that displays them).

export const CATEGORY_LABELS = {
    RENT: "Loyer",
    BILLS: "Factures",
    SUBSCRIPTIONS: "Abonnements",
    GROCERIES: "Courses",
    TRANSPORT: "Transport",
    SAVINGS: "Épargne",
    SALARY: "Salaire",
    ALLOWANCE: "Argent de poche",
    FREELANCE: "Freelance",
    GIFT: "Cadeau",
    SALE: "Vente",
    FIXED_EXPENSES: "Charges fixes",
    BILL_REVERSAL: "Annulation de facture",
    OTHER: "Autre",
};

export const categoryLabel = (code) => CATEGORY_LABELS[code] ?? code;

export const ROLE_LABELS = {
    ADULT: "Adulte",
    PARENT: "Parent",
    CHILD: "Enfant",
    ADMIN: "Administrateur",
};

export const roleLabel = (code) => ROLE_LABELS[code] ?? code;

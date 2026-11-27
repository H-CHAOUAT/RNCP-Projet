const pad = (n) => String(n).padStart(2, "0");

// Built from local date parts: toISOString() would shift the day because of the time zone.
export const isoOf = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

export const todayISO = () => {
    const now = new Date();
    return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
};

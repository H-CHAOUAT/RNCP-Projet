/**
 * DateInput — always shows DD/MM/YYYY regardless of browser locale.
 * Props:
 *   value     — ISO string "yyyy-mm-dd" (what the API expects)
 *   onChange  — called with ISO string "yyyy-mm-dd"
 *   className — optional extra classes
 *   placeholder — defaults to "dd/mm/yyyy"
 */
import { useState, useEffect } from "react";

const toDisplay = (iso) => {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const toISO = (display) => {
    const parts = display.split("/");
    if (parts.length !== 3) return "";
    const [d, m, y] = parts;
    if (y.length !== 4) return "";
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

export default function DateInput({ value = "", onChange, className = "", placeholder = "dd/mm/yyyy" }) {
    const [display, setDisplay] = useState(toDisplay(value));

    useEffect(() => {
        setDisplay(toDisplay(value));
    }, [value]);

    const handleChange = (e) => {
        let raw = e.target.value;

        raw = raw.replace(/[^0-9/]/g, "");
        if (raw.length === 2 && !raw.includes("/")) raw = raw + "/";
        if (raw.length === 5 && raw.split("/").length === 2) raw = raw + "/";

        setDisplay(raw);

        const iso = toISO(raw);
        if (iso) {
            onChange?.(iso);
        } else if (raw === "") {
            onChange?.("");
        }
    };

    return (
        <input
            type="text"
            value={display}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={10}
            className={`border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-wine outline-none text-sm ${className}`}
        />
    );
}
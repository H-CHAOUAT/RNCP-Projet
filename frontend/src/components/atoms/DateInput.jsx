/**
 * DateInput — champ de date avec calendrier (en français, format jj/mm/aaaa).
 * Props:
 *   value       — ISO string "yyyy-mm-dd" (what the API expects)
 *   onChange    — called with ISO string "yyyy-mm-dd", or "" when cleared
 *   min         — optional ISO date; earlier days are disabled
 *   className   — optional extra classes
 *   placeholder — defaults to "jj/mm/aaaa"
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { isoOf, todayISO } from "../../utils/date";

const MONTHS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

const PANEL_WIDTH = 288;
const PANEL_HEIGHT = 340;

const toDisplay = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

const monthOf = (iso) => {
    const [year, month] = (iso || todayISO()).split("-").map(Number);
    return { year, month: month - 1 };
};

export default function DateInput({ value = "", onChange, min, className = "", placeholder = "jj/mm/aaaa" }) {
    // null when closed, otherwise the panel position on screen
    const [position, setPosition] = useState(null);
    const [view, setView] = useState(() => monthOf(value));
    const buttonRef = useRef(null);
    const open = position !== null;

    const close = () => {
        setPosition(null);
        buttonRef.current?.focus();
    };

    const openCalendar = () => {
        const rect = buttonRef.current.getBoundingClientRect();
        const fitsBelow = rect.bottom + PANEL_HEIGHT + 4 <= window.innerHeight;
        setView(monthOf(value || (min && min > todayISO() ? min : "")));
        setPosition({
            left: Math.max(8, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8)),
            top: fitsBelow ? rect.bottom + 4 : Math.max(8, rect.top - PANEL_HEIGHT - 4),
        });
    };

    // The panel has a fixed position, so it would drift away from the field on scroll or resize.
    useEffect(() => {
        if (!open) return undefined;
        const dismiss = () => setPosition(null);
        const onKey = (e) => { if (e.key === "Escape") dismiss(); };
        window.addEventListener("resize", dismiss);
        window.addEventListener("scroll", dismiss, true);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("resize", dismiss);
            window.removeEventListener("scroll", dismiss, true);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const select = (iso) => {
        onChange?.(iso);
        close();
    };

    const shiftMonth = (delta) => {
        const d = new Date(view.year, view.month + delta, 1);
        setView({ year: d.getFullYear(), month: d.getMonth() });
    };

    const today = todayISO();
    const thisYear = Number(today.slice(0, 4));
    const firstYear = min ? Number(min.slice(0, 4)) : Math.min(thisYear - 10, view.year);
    const lastYear = Math.max(thisYear + 30, view.year);
    const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    // getDay() starts on Sunday; the French week starts on Monday.
    const leadingBlanks = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
    const previousDisabled = Boolean(min) && isoOf(view.year, view.month, 1) <= min;

    const navCls = "rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent";
    const selectCls = "rounded-md border border-gray-200 bg-white px-1 py-1 text-sm font-medium text-slate-700";

    return (
        <>
            <button
                type="button"
                ref={buttonRef}
                onClick={openCalendar}
                aria-haspopup="dialog"
                aria-expanded={open}
                className={`flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-3 py-2 w-full bg-white text-left focus:ring-2 focus:ring-wine outline-none text-sm ${className}`}
            >
                <span className={value ? "text-slate-900" : "text-slate-400"}>{toDisplay(value) || placeholder}</span>
                <Calendar size={16} className="shrink-0 text-slate-400" />
            </button>

            {open && createPortal(
                <div className="fixed inset-0 z-[60]" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
                    <div role="dialog" aria-label="Choisir une date"
                         className="fixed rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
                         style={{ ...position, width: PANEL_WIDTH }}>
                        <div className="mb-2 flex items-center justify-between gap-1">
                            <button type="button" className={navCls} onClick={() => shiftMonth(-1)}
                                    disabled={previousDisabled} aria-label="Mois précédent">
                                <ChevronLeft size={18} />
                            </button>
                            <select className={selectCls} value={view.month} aria-label="Mois"
                                    onChange={(e) => setView({ ...view, month: Number(e.target.value) })}>
                                {MONTHS.map((label, i) => <option key={label} value={i}>{label}</option>)}
                            </select>
                            <select className={selectCls} value={view.year} aria-label="Année"
                                    onChange={(e) => setView({ ...view, year: Number(e.target.value) })}>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button type="button" className={navCls} onClick={() => shiftMonth(1)} aria-label="Mois suivant">
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                            {WEEKDAYS.map((d) => <div key={d} className="text-xs font-medium text-slate-400">{d}</div>)}
                            {Array.from({ length: leadingBlanks }, (_, i) => <div key={`blank-${i}`} />)}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const iso = isoOf(view.year, view.month, i + 1);
                                const selected = iso === value;
                                return (
                                    <button key={iso} type="button" onClick={() => select(iso)}
                                            disabled={Boolean(min) && iso < min}
                                            aria-label={toDisplay(iso)} aria-pressed={selected}
                                            className={`h-8 rounded-md text-sm disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent ${
                                                selected
                                                    ? "bg-wine text-white"
                                                    : `text-slate-700 hover:bg-slate-100 ${iso === today ? "font-bold ring-1 ring-wine" : ""}`
                                            }`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-2 flex justify-between text-sm">
                            <button type="button" className="text-slate-500 hover:text-wine" onClick={() => select("")}>
                                Effacer
                            </button>
                            <button type="button" className="font-medium text-wine disabled:opacity-30"
                                    disabled={Boolean(min) && today < min} onClick={() => select(today)}>
                                Aujourd'hui
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

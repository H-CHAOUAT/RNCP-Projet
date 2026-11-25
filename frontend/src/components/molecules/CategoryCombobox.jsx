import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { categoryLabel } from "../../constants/labels";

const fold = (text) =>
    String(text ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();

/**
 * Pick a preset category or type your own.
 * `value` is a preset code (e.g. "RENT") or the free text itself; typing a preset's label yields its code.
 */
export default function CategoryCombobox({ id, value, onChange, presets, takenPresets = [], maxLength }) {
    const listId = useId();
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState(false);
    const [active, setActive] = useState(-1);

    const labelOf = (v) => (presets.includes(v) || v === "OTHER" ? categoryLabel(v) : v);
    const text = labelOf(value);
    const query = typed ? fold(text) : "";
    const presetFor = (input) => presets.find((code) => fold(categoryLabel(code)) === fold(input));

    // Presets used on other rows are hidden. Until the user types, the field's own value doesn't filter the list.
    const options = presets
        .filter((code) => !takenPresets.includes(code) && fold(categoryLabel(code)).includes(query))
        .map((code) => ({ value: code, label: categoryLabel(code) }));
    if (query && !presetFor(text)) {
        options.push({ value: text.trim(), label: `+ Utiliser « ${text.trim()} »` });
    }

    const close = () => {
        setOpen(false);
        setTyped(false);
        setActive(-1);
    };

    const select = (option) => {
        onChange(option.value);
        close();
    };

    const move = (step) => {
        if (!options.length) return;
        const from = active === -1 && step < 0 ? 0 : active;
        setActive((from + step + options.length) % options.length);
    };

    const handleKeyDown = (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) setOpen(true);
            else move(event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key === "Enter" && open) {
            event.preventDefault();
            if (options[active]) select(options[active]);
            else close();
        } else if (event.key === "Escape" && open) {
            event.preventDefault();
            close();
        }
    };

    return (
        <div className="relative">
            <input
                id={id}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
                autoComplete="off"
                value={text}
                maxLength={maxLength}
                placeholder="Choisir ou saisir…"
                onChange={(event) => {
                    const input = event.target.value;
                    onChange(presetFor(input) ?? input);
                    setTyped(true);
                    setOpen(true);
                    setActive(-1);
                }}
                onFocus={(event) => { event.target.select(); setOpen(true); }}
                onClick={() => setOpen(true)}
                onBlur={close}
                onKeyDown={handleKeyDown}
                className="border border-wineLight/40 rounded-lg py-2 pl-3 pr-9 w-full focus:ring-2 focus:ring-wine focus:border-wine outline-none bg-white text-dark placeholder:text-wineLight transition"
            />
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />

            {open && options.length > 0 && (
                <ul id={listId} role="listbox"
                    className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white py-1 text-sm shadow-lg">
                    {options.map((option, i) => (
                        <li
                            key={option.value}
                            id={`${listId}-${i}`}
                            role="option"
                            aria-selected={option.value === value}
                            // preventDefault keeps focus in the input so the click isn't lost to onBlur.
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => select(option)}
                            onMouseEnter={() => setActive(i)}
                            className={`cursor-pointer px-3 py-2 ${i === active ? "bg-winePale text-wine" : "text-dark"}`}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

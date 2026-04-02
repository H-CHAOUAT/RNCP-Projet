export default function Logo({ size = "md", variant = "dark" }) {
    const sizes = {
        sm:   32,
        md:   48,
        lg:   80,
        xl:   120,
        full: 200,
    };
    const s = sizes[size] ?? 48;

    if (variant === "light") {
        return (
            <svg width={s} height={s} viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
                <circle cx="90" cy="90" r="90" fill="white"/>
                <polygon points="26,82 90,34 154,82" fill="#6B2737"/>
                <rect x="40" y="79" width="100" height="72" rx="3" fill="#C9848F"/>
                <rect x="68" y="110" width="44" height="41" rx="5" fill="#6B2737"/>
                <circle cx="106" cy="132" r="2.5" fill="#C9848F"/>
                <rect x="46" y="89" width="26" height="20" rx="4" fill="white" opacity="0.85"/>
                <line x1="59" y1="89" x2="59" y2="109" stroke="#C9848F" strokeWidth="1.5"/>
                <line x1="46" y1="99" x2="72" y2="99" stroke="#C9848F" strokeWidth="1.5"/>
                <rect x="108" y="89" width="26" height="20" rx="4" fill="white" opacity="0.85"/>
                <line x1="121" y1="89" x2="121" y2="109" stroke="#C9848F" strokeWidth="1.5"/>
                <line x1="108" y1="99" x2="134" y2="99" stroke="#C9848F" strokeWidth="1.5"/>
                <circle cx="48" cy="128" r="9" fill="white"/>
                <path d="M34,162 Q48,146 62,162" fill="white"/>
                <circle cx="132" cy="128" r="9" fill="white"/>
                <path d="M118,162 Q132,146 146,162" fill="white"/>
                <circle cx="90" cy="104" r="6" fill="#4CAF82"/>
                <path d="M79,126 Q90,113 101,126" fill="#4CAF82"/>
                <circle cx="148" cy="156" r="22" fill="#4CAF82"/>
                <circle cx="148" cy="156" r="16" fill="#3d9e71"/>
                <text x="148" y="162" textAnchor="middle"
                      fontFamily="system-ui,sans-serif" fontSize="15" fontWeight="700" fill="white">€</text>
                <polyline points="139,163 144,153 148,157 156,146"
                          fill="none" stroke="white" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    }

    return (
        <svg width={s} height={s} viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="90" fill="#6B2737"/>
            <polygon points="26,82 90,34 154,82" fill="#3A0F1C"/>
            <rect x="40" y="79" width="100" height="72" rx="3" fill="#8B3347"/>
            <rect x="68" y="110" width="44" height="41" rx="5" fill="#3A0F1C"/>
            <circle cx="106" cy="132" r="2.5" fill="#C9848F"/>
            <rect x="46" y="89" width="26" height="20" rx="4" fill="#C9848F" opacity="0.8"/>
            <line x1="59" y1="89" x2="59" y2="109" stroke="#8B3347" strokeWidth="1.5"/>
            <line x1="46" y1="99" x2="72" y2="99" stroke="#8B3347" strokeWidth="1.5"/>
            <rect x="108" y="89" width="26" height="20" rx="4" fill="#C9848F" opacity="0.8"/>
            <line x1="121" y1="89" x2="121" y2="109" stroke="#8B3347" strokeWidth="1.5"/>
            <line x1="108" y1="99" x2="134" y2="99" stroke="#8B3347" strokeWidth="1.5"/>
            <circle cx="48" cy="128" r="9" fill="#FDF6F7"/>
            <path d="M34,162 Q48,146 62,162" fill="#FDF6F7"/>
            <circle cx="132" cy="128" r="9" fill="#FDF6F7"/>
            <path d="M118,162 Q132,146 146,162" fill="#FDF6F7"/>
            <circle cx="90" cy="104" r="6" fill="#4CAF82"/>
            <path d="M79,126 Q90,113 101,126" fill="#4CAF82"/>
            <circle cx="148" cy="156" r="22" fill="#4CAF82"/>
            <circle cx="148" cy="156" r="16" fill="#3d9e71"/>
            <text x="148" y="162" textAnchor="middle"
                  fontFamily="system-ui,sans-serif" fontSize="15" fontWeight="700" fill="white">€</text>
            <polyline points="139,163 144,153 148,157 156,146"
                      fill="none" stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
// src/components/FloatingThemeToggle.tsx
import React, { useState, useEffect } from "react";
import Sun from "../assets/sun.svg";
import Moon from "../assets/moon.svg";

export default function FloatingThemeToggle() {
    const [theme, setTheme] = useState<string>(
        document.documentElement.getAttribute("data-theme") || "dark"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <button
            className="floating-theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
        >
            <img src={Sun} className="sun-icon" alt="" />
            <img src={Moon} className="moon-icon" alt="" />
        </button>
    );
}

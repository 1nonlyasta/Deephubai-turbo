// src/components/Footer1.tsx
import React from "react";

export default function Footer() {
    return (
        <footer className='py-8 text-center text-sm text-slate-400'>
            <div>© {new Date().getFullYear()} DeepHubAI. All rights reserved.</div>
        </footer>
    );
}

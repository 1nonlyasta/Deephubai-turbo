// src/components/HeroLanding.tsx
import React from "react";

export default function HeroLanding() {
    return (
        <>
            {/* Background layers */}
            <div className="site-vignette" aria-hidden />
            <div className="site-noise" aria-hidden />

            {/* Foreground */}
            <div className="hero-foreground">
                <section className="hero-center text-center">
                    <div className="max-w-6xl mx-auto px-4">

                        <h1 className="hero-title"></h1>

                        <div className="mt-6 hero-sub">
                            <span className="ml-3 hero-pill"></span>
                        </div>

                    </div>
                </section>
            </div>

        </>
    );
}

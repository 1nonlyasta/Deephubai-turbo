import * as React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FAQ {
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    {
        question: "What is Deephub AI?",
        answer: "Deephub AI is an all-in-one platform offering AI products, personalised assistants, and real-time AI updates. designed to simplify and enhance everyday workflows."
    },
    {
        question: "What type of robots and AI products do you offer?",
        answer: "We offer next-generation robots, smart automation tools, AI assistants, and productivity-focused solutions built for individuals, startups, and businesses."
    },
    {
        question: "Can I customize the AI tools for my needs?",
        answer: "No. Everything is designed to be simple, intuitive, and user-friendly—anyone can start using our AI tools with ease."
    },
    {
        question: "Do I need technical knowledge to use Deephub AI?",
        answer: "No. Everything is designed to be simple, intuitive, and user-friendly—anyone can start using our AI tools with ease."
    },
    {
        question: "How often do you release updates or new products?",
        answer: "We regularly release new features, AI tools, and robotics updates to keep you ahead with the latest innovations."
    },
    {
        question: "Is there a personalized AI assistant available?",
        answer: "Yes. Deephub AI includes a personalised assistant that helps with tasks, learning, recommendations, and real-time support."
    }
];

const Values: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="values" className="py-0 md:py-0 relative bg-[#050505]">
            <div className="container px-6 md:px-12 relative z-10">

                {/* Section header: Replicating Navigation typography and brand colors */}
                <motion.div
                    ref={ref}
                    className="max-w-4xl mb-20"
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >


                    {/* Matches Hero style: Clash Display, tight leading/tracking */}
                    <h2 className="font-clash text-5xl md:text-7xl font-light leading-[0.9] tracking-[-0.04em]">
                        Frequently Asked <br />
                        <span className="font-semibold text-[#b3daff]">Questions</span>
                    </h2>
                </motion.div>

                {/* FAQ Grid: 6 Balanced Boxes */}
                <div className="grid md:grid-cols-2 gap-6">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            /* Glass-morphism style boxes to match 'About' section */
                            className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#b3daff]/40 transition-all duration-500 hover:bg-white/[0.05]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                        >
                            {/* Question: Clash Display font with brand hover effect */}
                            <h3 className="font-clash text-xl font-semibold mb-4 text-white group-hover:text-[#b3daff] transition-colors duration-300">
                                {faq.question}
                            </h3>

                            {/* Answer: Clean sans-serif for maximum readability */}
                            <p className="text-white/50 font-sans leading-relaxed text-sm md:text-base font-light">
                                {faq.answer}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Values;

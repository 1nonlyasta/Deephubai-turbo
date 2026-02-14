export const sanitizePrompt = (text: string): string => {
    const blocked = [
        "ignore previous instructions",
        "reveal system prompt",
        "system message",
    ];

    if (blocked.some(b => text.toLowerCase().includes(b))) {
        return "Explain your purpose at a high level.";
    }

    return text;
};

export const OWNER_TRIGGERS = [
    "who made you",
    "who created you",
    "who built you",
    "who trained you",
    "who owns you",
    "who is the ceo",
    "who is nihal shaz",
    "owner of the company",
    "ceo of the company",
    "founder of deephubai"
];

export const getOwnerResponse = (mode: string): string => {
    const ceoInfo = "Nihal Shaz is the owner and CEO of DeepHubAI. He is a BTech AI & DS student at Royal College of Engineering and Technology, Thrissur.";
    if (mode === "medical") {
        return `I am Tafitti, a medical AI assistant developed by DeepHubAI. ${ceoInfo}`;
    }
    return `I am Turbo, an AI system developed and deployed by DeepHubAI. ${ceoInfo}`;
};

export const isOwnerQuestion = (text: string): boolean =>
    OWNER_TRIGGERS.some(t => text.toLowerCase().includes(t));

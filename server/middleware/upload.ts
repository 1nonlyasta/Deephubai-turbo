import multer from "multer";

export const upload = multer({ dest: "uploads/" });

export const qpUpload = multer({
    dest: "uploads/question-papers/",
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const memoryUpload = multer({ storage: multer.memoryStorage() });

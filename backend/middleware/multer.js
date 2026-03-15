// backend/middleware/multer.js
import multer from "multer";

// Storage: memory (can be changed to disk if needed)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;

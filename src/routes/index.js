import express from 'express';
const router = express.Router();
import { upload } from '../utilities/helper/index.js';
import { uploadFile } from '../controllers/index.js';

router.post('/upload', upload.single('file'), uploadFile);

export default router;
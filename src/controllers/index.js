import fs from 'fs';
import path from 'path';
import { parseCSV } from '../utilities/helper/index.js';
import { asyncHandler, ApiResponse, ApiError } from '../utilities/index.js';

export const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
    }

    const filePath = path.join(req.file.destination, req.file.filename);
    const content = fs.readFileSync(filePath, "utf-8");

    const jsonData = parseCSV(content);

    fs.unlinkSync(filePath);

    return res.status(200).json(
        new ApiResponse(200, jsonData, "CSV processed successfully")
    );
});
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { parseCSV, printAgeGroupReport, calculateAgeGroupDistribution } from '../utilities/helper/index.js';
import { asyncHandler, ApiResponse, ApiError } from '../utilities/index.js';

export const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
    }

    const filePath = path.join(req.file.destination, req.file.filename);
    const content = fs.readFileSync(filePath, "utf-8");

    const jsonData = parseCSV(content);

    const usersToInsert = jsonData.map(u => ({
        name: `${u.name?.firstName || ''} ${u.name?.lastName || ''}`.trim(),
        age: Number(u.age),
        address: u.address || {},
        additionalInfo: { gender: u.gender || null }
    }));

    await prisma.user.createMany({ data: usersToInsert });

    const ageDistribution = calculateAgeGroupDistribution(jsonData);
    printAgeGroupReport(ageDistribution);

    fs.unlinkSync(filePath);

    return res.status(200).json(
        new ApiResponse(200, jsonData, "CSV processed successfully and data inserted into the database.")
    );
});
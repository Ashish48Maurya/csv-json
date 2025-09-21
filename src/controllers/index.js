import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { parseCSV, printAgeGroupReport, calculateAgeGroupDistribution } from '../utilities/helper/index.js';
import { asyncHandler, ApiResponse, ApiError } from '../utilities/index.js';

const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

const processBatchWithDelay = async (batch, batchIndex, totalBatches) => {
    console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} records)`);

    await prisma.user.createMany({
        data: batch,
        skipDuplicates: true
    });

    if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
};

export const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
    }

    const filePath = path.join(req.file.destination, req.file.filename);
    const content = await fs.promises.readFile(filePath, "utf-8");

    console.log('Starting CSV parsing...');
    const jsonData = parseCSV(content);
    console.log(`Parsed ${jsonData.length} records from CSV`);

    const usersToInsert = jsonData.map(u => ({
        name: `${u.name?.firstName || ''} ${u.name?.lastName || ''}`.trim(),
        age: Number(u.age),
        address: u.address || {},
        additionalInfo: { gender: u.gender || null }
    }));

    const BATCH_SIZE = 500;
    const batches = chunkArray(usersToInsert, BATCH_SIZE);

    console.log(`Processing ${usersToInsert.length} records in ${batches.length} batches of ${BATCH_SIZE}`);

    let totalProcessed = 0;

    try {
        for (let i = 0; i < batches.length; i++) {
            await processBatchWithDelay(batches[i], i, batches.length);
            totalProcessed += batches[i].length;
        }

        console.log(`✅ Successfully processed ${totalProcessed} records`);

        const ageDistribution = calculateAgeGroupDistribution(jsonData);
        printAgeGroupReport(ageDistribution);

        await fs.promises.unlink(filePath);

        return res.status(200).json(
            new ApiResponse(200, {
                totalRecords: jsonData.length,
                processedRecords: totalProcessed,
                batchCount: batches.length,
                batchSize: BATCH_SIZE,
                ageDistribution: ageDistribution,
            }, "CSV processed successfully and data inserted into the database in batches.")
        );

    } catch (error) {
        console.error('❌ Batch processing failed:', error);
        try {
            await fs.promises.unlink(filePath);
        } catch (unlinkError) {
            console.error('Failed to cleanup file:', unlinkError);
        }
        throw new ApiError(500, `Batch processing failed after ${totalProcessed} records: ${error.message}`);
    }
});
// src/app/api/crop-data/route.ts
import { promises as fsPromises } from 'fs';
import * as fs from 'fs'; // For createReadStream
import path from 'path';
import csvParser from 'csv-parser';
import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export async function GET(req: NextRequest) {
  const csvFilePath = path.join(process.cwd(), 'public', 'crop-data.csv');
  console.log('[API /api/crop-data] Attempting to read CSV from path:', csvFilePath);

  try {
    await fsPromises.access(csvFilePath); // Check if file exists and is accessible
    console.log('[API /api/crop-data] CSV file access check successful.');

    const results: any[] = [];
    
    await new Promise<void>((resolve, reject) => {
      console.log('[API /api/crop-data] Starting CSV stream parsing...');
      fs.createReadStream(csvFilePath).pipe(csvParser({ headers: true })) // Ensure headers: true to use header names as keys
        .on('data', (data: any) => {
          results.push(data);
        })
        .on('end', () => {
          console.log(`[API /api/crop-data] CSV parsing completed. ${results.length} rows found.`);
          if (results.length === 0) {
            console.warn('[API /api/crop-data] CSV file might be empty or only contain headers.');
          }
          resolve();
        })
        .on('error', (streamError: { message: any; }) => {
          console.error('[API /api/crop-data] Error during CSV stream parsing:', streamError);
          reject(new Error(`Error parsing CSV stream: ${streamError.message}`)); 
        });
    });

    return NextResponse.json(results);

  } catch (error: any) {
    // Log the full error object for more details
    console.error('[API /api/crop-data] Error in GET handler:', error.message);
    console.error('[API /api/crop-data] Full error object:', error);

    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: `CSV file not found. Expected at: ${csvFilePath}. Please ensure 'public/crop-data.csv' exists and is correctly named in your project's public directory.` }, { status: 404 });
    }
    // For other errors (e.g., parsing errors caught by the promise reject)
    return NextResponse.json({ error: 'Failed to read or parse CSV data.', details: error.message || 'Unknown error processing CSV file.' }, { status: 500 });
  }
}

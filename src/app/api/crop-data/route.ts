// src/app/api/crop-data/route.ts
import { promises as fsPromises } from 'fs';
import * as fs from 'fs'; // For createReadStream
import path from 'path';
import { parse } from 'csv-parser';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const csvFilePath = path.join(process.cwd(), 'public', 'crop-data.csv');
  // Log the path the API is trying to access
  console.log('[API /api/crop-data] Attempting to read CSV from path:', csvFilePath);

  try {
    // Check if the file exists and is accessible
    await fsPromises.access(csvFilePath);
    console.log('[API /api/crop-data] CSV file access check successful.');

    const results: any[] = [];
    // Use a promise to handle the stream events for parsing
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(parse({ headers: true }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log('[API /api/crop-data] CSV parsing completed. Rows found:', results.length);
          if (results.length === 0) {
            console.warn('[API /api/crop-data] CSV file might be empty or only contain headers.');
          }
          resolve();
        })
        .on('error', (streamError) => {
          console.error('[API /api/crop-data] Error during CSV stream parsing:', streamError);
          reject(streamError); 
        });
    });

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('[API /api/crop-data] Error in GET handler:', error.message);
    console.error('[API /api/crop-data] Full error object:', error);


    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: `CSV file not found. Expected at: ${csvFilePath}. Please ensure 'public/crop-data.csv' exists and is correctly named in your project's public directory.` }, { status: 404 });
    }
    // For other errors (e.g., parsing errors caught by the promise reject)
    return NextResponse.json({ error: 'Failed to read or parse CSV data.', details: error.message || 'Unknown error processing CSV file.' }, { status: 500 });
  }
}

// src/app/api/crop-data/route.ts
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parser';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const csvFilePath = path.join(process.cwd(), 'public', 'crop-data.csv');
  const results: any[] = [];

  try {
    // Check if the file exists
    await fs.access(csvFilePath);

    // Create a readable stream from the file
    const fileStream = fs.createReadStream(csvFilePath);

    // Pipe the stream to the csv-parser
    const parser = fileStream.pipe(parse({ headers: true }));

    // Collect parsed data
    for await (const chunk of parser) {
      results.push(chunk);
    }

    // Return the data as JSON
    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Error reading or parsing CSV file:', error);

    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to read or parse CSV data', details: error.message }, { status: 500 });
  }
}
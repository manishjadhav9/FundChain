import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

// Configure upload directory
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

/**
 * Generate a secure filename
 * @param {string} originalName - Original filename
 * @returns {string} - Secure filename with random hash
 */
function generateSecureFilename(originalName) {
  // Get file extension
  const ext = originalName.split('.').pop().toLowerCase();
  
  // Generate random hash
  const hash = crypto.randomBytes(16).toString('hex');
  
  // Create timestamp
  const timestamp = Date.now();
  
  return `${timestamp}-${hash}.${ext}`;
}

/**
 * Handle POST requests for file uploads
 */
export async function POST(request) {
  try {
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get file details
    const originalName = file.name;
    const secureFilename = generateSecureFilename(originalName);
    const filePath = join(UPLOAD_DIR, secureFilename);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Save file to disk
    await writeFile(filePath, fileBuffer);
    
    // Return file information
    return NextResponse.json({
      success: true,
      hash: `local:${secureFilename}`,
      filename: secureFilename,
      size: fileBuffer.length,
      url: `/uploads/${secureFilename}`
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests (for CORS)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    console.log('R2 sign GET request:', { key })
    
    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
    }

    // Create the command to get the object
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    })

    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // 1 hour
    })

    console.log('Generated signed URL:', signedUrl)

    return NextResponse.json({ 
      signedUrl: signedUrl,
      url: signedUrl, // Keep both for compatibility
      expires: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    })
    
  } catch (error) {
    console.error('Error in R2 sign API:', error)
    return NextResponse.json({ 
      error: 'Failed to generate signed URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, filename } = await request.json()
    
    console.log('R2 sign request:', { key, filename })
    
    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
    }

    // Create the command to get the object
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    })

    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // 1 hour
    })

    console.log('Generated signed URL:', signedUrl)

    return NextResponse.json({ 
      signedUrl: signedUrl,
      url: signedUrl, // Keep both for compatibility
      expires: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    })
    
  } catch (error) {
    console.error('Error in R2 sign API:', error)
    return NextResponse.json({ 
      error: 'Failed to generate signed URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

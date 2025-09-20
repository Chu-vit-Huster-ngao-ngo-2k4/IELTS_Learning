import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { key, filename } = await request.json()
    
    console.log('Test sign request:', { key, filename })
    
    // For testing, return a mock signed URL
    const mockUrl = `https://example.com/mock-video.mp4?key=${key}&filename=${filename}`
    
    return NextResponse.json({ 
      url: mockUrl,
      expires: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    })
    
  } catch (error) {
    console.error('Error in test-sign API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

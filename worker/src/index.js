// Cloudflare Worker for IELTS LMS signed URLs
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate signed URL endpoint
    if (url.pathname === '/sign-download' && request.method === 'POST') {
      try {
        const { key, expiresIn = 3600 } = await request.json();
        
        if (!key) {
          return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // For now, return a mock signed URL
        // In production, this would generate actual signed URLs
        const signedUrl = `https://ielts-lms-media.3c55205747f46aef43df33eddd39805c.r2.cloudflarestorage.com/${key}?signed=true&expires=${Date.now() + expiresIn * 1000}`;
        
        return new Response(JSON.stringify({ 
          signedUrl,
          key,
          expiresIn,
          expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Get media info endpoint
    if (url.pathname === '/media-info' && request.method === 'GET') {
      const key = url.searchParams.get('key');
      
      if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Mock media info
      const mediaInfo = {
        key,
        type: key.endsWith('.mp4') ? 'video' : key.endsWith('.mp3') ? 'audio' : 'document',
        size: Math.floor(Math.random() * 10000000), // Mock size
        mimeType: key.endsWith('.mp4') ? 'video/mp4' : key.endsWith('.mp3') ? 'audio/mpeg' : 'application/pdf',
        lastModified: new Date().toISOString()
      };

      return new Response(JSON.stringify(mediaInfo), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 404 for unknown endpoints
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
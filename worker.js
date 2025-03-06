// Cloudflare Worker script to handle D1 database access
export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }
    
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const response = await this.handleApiRequest(request, env);
      
      // Add CORS headers to all responses
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      };
      
      // Create a new response with the original response and CORS headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: { ...Object.fromEntries(response.headers.entries()), ...corsHeaders }
      });
    }
    
    // For all other routes, return a simple response
    return new Response('Burrito Rater API', {
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  },
  
  async handleApiRequest(request, env) {
    const url = new URL(request.url);
    
    // Handle ratings API
    if (url.pathname === '/api/ratings') {
      if (request.method === 'GET') {
        return this.handleGetRatings(env.DB);
      } else if (request.method === 'POST') {
        return this.handleCreateRating(request, env.DB);
      }
    }
    
    // Handle rating by ID API
    const ratingIdMatch = url.pathname.match(/^\/api\/ratings\/(\d+)$/);
    if (ratingIdMatch) {
      const ratingId = parseInt(ratingIdMatch[1]);
      if (request.method === 'DELETE') {
        return this.handleDeleteRating(ratingId, env.DB);
      }
    }
    
    return new Response('Not Found', { status: 404 });
  },
  
  async handleGetRatings(db) {
    try {
      const { results } = await db.prepare('SELECT * FROM Rating ORDER BY createdAt DESC').all();
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch ratings', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async handleCreateRating(request, db) {
    try {
      const data = await request.json();
      
      // Create the rating
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      const result = await db
        .prepare(`INSERT INTO Rating (${columns}) VALUES (${placeholders}) RETURNING id`)
        .bind(...values)
        .first();
      
      // Fetch the newly created rating
      const newRating = await db
        .prepare('SELECT * FROM Rating WHERE id = ?')
        .bind(result.id)
        .first();
      
      return new Response(JSON.stringify(newRating), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to create rating', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async handleDeleteRating(ratingId, db) {
    try {
      const result = await db
        .prepare('DELETE FROM Rating WHERE id = ?')
        .bind(ratingId)
        .run();
      
      if (result.success) {
        return new Response(JSON.stringify({ success: true, message: `Successfully deleted rating ${ratingId}` }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Rating not found or could not be deleted' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to delete rating', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}; 
// Cloudflare Worker script to handle D1 database access
export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }
    
    const url = new URL(request.url);
    
    // Add migration endpoint to add confirmed column
    if (url.pathname === '/api/migrate/add-confirmed-column') {
      try {
        // Check if the confirmed column exists
        const tableInfo = await env.DB.prepare("PRAGMA table_info(Rating)").all();
        const hasConfirmedColumn = tableInfo.results.some(column => column.name === 'confirmed');
        
        if (!hasConfirmedColumn) {
          // Add the confirmed column
          await env.DB.prepare("ALTER TABLE Rating ADD COLUMN confirmed INTEGER DEFAULT 0").run();
          return new Response(JSON.stringify({ message: 'Confirmed column added successfully' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ message: 'Confirmed column already exists' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add confirmed column', details: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const response = await this.handleApiRequest(request, env);
      
      // Add CORS headers to all responses
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, PATCH, OPTIONS',
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
        return this.handleGetRatings(env.DB, url);
      } else if (request.method === 'POST') {
        return this.handleCreateRating(request, env.DB);
      }
    }
    
    // Handle bulk confirmation API
    if (url.pathname === '/api/ratings/confirm-bulk') {
      if (request.method === 'POST') {
        return this.handleBulkConfirmRatings(request, env.DB);
      }
    }
    
    // Handle rating by ID API
    const ratingIdMatch = url.pathname.match(/^\/api\/ratings\/(\d+)$/);
    if (ratingIdMatch) {
      const ratingId = parseInt(ratingIdMatch[1]);
      if (request.method === 'DELETE') {
        return this.handleDeleteRating(ratingId, env.DB);
      } else if (request.method === 'PATCH') {
        return this.handleUpdateRating(ratingId, request, env.DB);
      }
    }
    
    // Handle rating confirmation API
    const confirmMatch = url.pathname.match(/^\/api\/ratings\/(\d+)\/confirm$/);
    if (confirmMatch) {
      const ratingId = parseInt(confirmMatch[1]);
      if (request.method === 'POST' || request.method === 'PUT') {
        return this.handleConfirmRating(ratingId, env.DB);
      }
    }
    
    return new Response('Not Found', { status: 404 });
  },
  
  async handleGetRatings(db, url) {
    try {
      // Check if we should filter by confirmation status
      const showConfirmed = url.searchParams.get('confirmed');
      
      // Query with the confirmed column
      let query = 'SELECT *, confirmed FROM Rating';
      
      if (showConfirmed === 'true') {
        query += ' WHERE confirmed = 1';
      } else if (showConfirmed === 'false') {
        query += ' WHERE confirmed = 0';
      }
      
      query += ' ORDER BY createdAt DESC';
      
      const { results } = await db.prepare(query).all();
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
      
      // Set confirmed to false by default
      if (data.confirmed === undefined) {
        data.confirmed = 0;
      }
      
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
        .prepare('SELECT *, COALESCE(confirmed, 0) as confirmed FROM Rating WHERE id = ?')
        .bind(result.id)
        .first();
      
      return new Response(JSON.stringify(newRating), {
        status: 201,
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
      // Check if the rating exists
      const rating = await db
        .prepare('SELECT *, COALESCE(confirmed, 0) as confirmed FROM Rating WHERE id = ?')
        .bind(ratingId)
        .first();
      
      if (!rating) {
        return new Response(JSON.stringify({ error: 'Rating not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Delete the rating
      await db
        .prepare('DELETE FROM Rating WHERE id = ?')
        .bind(ratingId)
        .run();
      
      return new Response(JSON.stringify({ message: 'Rating deleted successfully' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to delete rating', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async handleConfirmRating(ratingId, db) {
    try {
      // Check if the rating exists
      const rating = await db
        .prepare('SELECT * FROM Rating WHERE id = ?')
        .bind(ratingId)
        .first();
      
      if (!rating) {
        return new Response(JSON.stringify({ error: 'Rating not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update the rating to confirmed
      await db
        .prepare('UPDATE Rating SET confirmed = 1 WHERE id = ?')
        .bind(ratingId)
        .run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to confirm rating', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async handleBulkConfirmRatings(request, db) {
    try {
      const { ids } = await request.json();
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid or empty rating IDs' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Convert IDs to a comma-separated string for the SQL query
      const idList = ids.join(',');
      
      // Confirm all ratings in the list
      await db
        .prepare(`UPDATE Rating SET confirmed = 1 WHERE id IN (${idList})`)
        .run();
      
      return new Response(JSON.stringify({ 
        message: 'Ratings confirmed successfully',
        count: ids.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to confirm ratings', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async handleUpdateRating(ratingId, request, db) {
    try {
      // Check if the rating exists
      const rating = await db
        .prepare('SELECT * FROM Rating WHERE id = ?')
        .bind(ratingId)
        .first();
      
      if (!rating) {
        return new Response(JSON.stringify({ error: 'Rating not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const data = await request.json();
      
      // Build the SET clause for the UPDATE query
      const setClause = Object.entries(data)
        .map(([key, _]) => `${key} = ?`)
        .join(', ');
      
      const values = [...Object.values(data), ratingId];
      
      // Update the rating
      await db
        .prepare(`UPDATE Rating SET ${setClause} WHERE id = ?`)
        .bind(...values)
        .run();
      
      // Fetch the updated rating
      const updatedRating = await db
        .prepare('SELECT * FROM Rating WHERE id = ?')
        .bind(ratingId)
        .first();
      
      return new Response(JSON.stringify(updatedRating), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to update rating', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}; 
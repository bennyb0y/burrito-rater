// Cloudflare Worker API for Burrito Rater
// This worker handles all API requests and connects to the D1 database

// Helper function to validate Turnstile token
async function validateTurnstileToken(token, ip, env) {
  try {
    // Accept test tokens that start with "test_verification_token_"
    if (token && token.startsWith('test_verification_token_')) {
      console.log('Accepting test verification token');
      return {
        success: true,
        message: 'Test token accepted'
      };
    }
    
    // For development environment, accept any token that starts with "0."
    if (token && token.startsWith('0.') && !env.PRODUCTION) {
      console.log('Development mode: Accepting token without validation');
      return {
        success: true,
        message: 'Development token accepted'
      };
    }

    // For production environment, validate the token with Cloudflare
    const formData = new FormData();
    formData.append('secret', env.TURNSTILE_SECRET_KEY || 'dummy_secret_for_dev');
    formData.append('response', token);
    
    if (ip) {
      formData.append('remoteip', ip);
    }

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });

    const outcome = await result.json();
    console.log('Turnstile validation result:', outcome);
    
    return {
      success: outcome.success,
      errorCodes: outcome.error_codes || [],
      message: outcome.success ? 'Validation successful' : 'CAPTCHA validation failed'
    };
  } catch (error) {
    console.error('Error validating Turnstile token:', error);
    
    // In development, allow the request to proceed even if validation fails
    if (!env.PRODUCTION) {
      console.log('Development mode: Accepting request despite validation error');
      return {
        success: true,
        errorCodes: ['validation_error_ignored_in_dev'],
        message: 'Error validating CAPTCHA, but accepted in development mode'
      };
    }
    
    return {
      success: false,
      errorCodes: ['validation_error'],
      message: 'Error validating CAPTCHA'
    };
  }
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to handle CORS preflight requests
function handleOptions() {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
}

// Helper function to create a JSON response
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    status,
  });
}

// Helper function to create an error response
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Main worker event handler
const workerHandler = {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }
    
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, '');
    
    // Check if the request is for the API
    if (!path.startsWith('ratings')) {
      return errorResponse('Not found', 404);
    }
    
    try {
      // Handle ratings endpoint
      if (path === 'ratings') {
        if (request.method === 'GET') {
          // Get all ratings
          const { results } = await env.DB.prepare(
            'SELECT * FROM Rating ORDER BY createdAt DESC'
          ).all();
          return jsonResponse(results);
        }
        
        if (request.method === 'POST') {
          const data = await request.json();
          
          // Validate CAPTCHA
          const turnstileValidation = await validateTurnstileToken(
            data.turnstileToken,
            request.headers.get('CF-Connecting-IP'),
            env
          );
          
          if (!turnstileValidation.success) {
            return errorResponse(turnstileValidation.message, 400);
          }
          
          // Insert the rating
          const now = new Date().toISOString();
          const { success } = await env.DB.prepare(`
            INSERT INTO Rating (
              createdAt, updatedAt,
              latitude, longitude, burritoTitle, rating, taste, value, price,
              restaurantName, review, reviewerName, reviewerEmoji,
              hasPotatoes, hasCheese, hasBacon, hasChorizo, hasAvocado, hasVegetables,
              confirmed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            now, now,
            data.latitude,
            data.longitude,
            data.burritoTitle,
            data.rating,
            data.taste,
            data.value,
            data.price,
            data.restaurantName,
            data.review || null,
            data.reviewerName || 'Anonymous',
            data.reviewerEmoji || null,
            data.hasPotatoes ? 1 : 0,
            data.hasCheese ? 1 : 0,
            data.hasBacon ? 1 : 0,
            data.hasChorizo ? 1 : 0,
            data.hasAvocado ? 1 : 0,
            data.hasVegetables ? 1 : 0,
            0 // Default to unconfirmed
          ).run();
          
          if (success) {
            return jsonResponse({ message: 'Rating submitted successfully' });
          } else {
            return errorResponse('Failed to submit rating', 500);
          }
        }
      }
      
      // Handle individual rating endpoints (ratings/:id)
      const ratingMatch = path.match(/^ratings\/(\d+)(\/\w+)?$/);
      if (ratingMatch) {
        const id = parseInt(ratingMatch[1]);
        const action = ratingMatch[2]?.replace('/', '') || '';
        
        // Verify the rating exists
        const rating = await env.DB.prepare('SELECT * FROM Rating WHERE id = ?')
          .bind(id)
          .first();
          
        if (!rating) {
          return errorResponse('Rating not found', 404);
        }

        // Handle DELETE request
        if (request.method === 'DELETE' && !action) {
          const result = await env.DB.prepare('DELETE FROM Rating WHERE id = ?')
            .bind(id)
            .run();
            
          if (result.success) {
            return jsonResponse({ success: true, message: 'Rating deleted successfully' });
          } else {
            return errorResponse('Failed to delete rating', 500);
          }
        }

        // Handle confirmation
        if (request.method === 'PUT' && action === 'confirm') {
          const result = await env.DB.prepare('UPDATE Rating SET confirmed = 1 WHERE id = ?')
            .bind(id)
            .run();
            
          if (result.success) {
            return jsonResponse({ success: true, message: 'Rating confirmed successfully' });
          } else {
            return errorResponse('Failed to confirm rating', 500);
          }
        }
      }
      
      // Handle bulk confirmation
      if (path === 'ratings/confirm-bulk' && request.method === 'POST') {
        const { ids } = await request.json();
        
        if (!Array.isArray(ids) || ids.length === 0) {
          return errorResponse('Invalid or empty ID list', 400);
        }
        
        const placeholders = ids.map(() => '?').join(',');
        const result = await env.DB.prepare(`UPDATE Rating SET confirmed = 1 WHERE id IN (${placeholders})`)
          .bind(...ids)
          .run();
          
        if (result.success) {
          return jsonResponse({ success: true, message: 'Ratings confirmed successfully' });
        } else {
          return errorResponse('Failed to confirm ratings', 500);
        }
      }
      
      return errorResponse('Method not allowed', 405);
    } catch (error) {
      console.error('API Error:', error);
      return errorResponse('Internal server error', 500);
    }
  }
};

export default workerHandler;
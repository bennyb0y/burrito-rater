// Cloudflare Worker API for Burrito Rater
// This worker handles all API requests and connects to the D1 database

// Define the USA bounding box coordinates
const USA_BOUNDS = {
  // Continental US
  continental: {
    north: 49.38,  // Northern border with Canada
    south: 24.52,  // Southern tip of Florida
    west: -124.85, // Western coast
    east: -66.95   // Eastern coast
  },
  // Alaska
  alaska: {
    north: 71.44,
    south: 51.22,
    west: -179.15,
    east: -129.98
  },
  // Hawaii
  hawaii: {
    north: 22.24,
    south: 18.91,
    west: -160.25,
    east: -154.81
  }
};

// Cloudflare Turnstile secret key should be set as a Worker secret using:
// npx wrangler secret put TURNSTILE_SECRET_KEY

// Helper function to check if coordinates are within USA bounds
function isInUSA(lat, lng) {
  // Check continental US
  if (
    lat >= USA_BOUNDS.continental.south &&
    lat <= USA_BOUNDS.continental.north &&
    lng >= USA_BOUNDS.continental.west &&
    lng <= USA_BOUNDS.continental.east
  ) {
    return true;
  }
  
  // Check Alaska
  if (
    lat >= USA_BOUNDS.alaska.south &&
    lat <= USA_BOUNDS.alaska.north &&
    lng >= USA_BOUNDS.alaska.west &&
    lng <= USA_BOUNDS.alaska.east
  ) {
    return true;
  }
  
  // Check Hawaii
  if (
    lat >= USA_BOUNDS.hawaii.south &&
    lat <= USA_BOUNDS.hawaii.north &&
    lng >= USA_BOUNDS.hawaii.west &&
    lng <= USA_BOUNDS.hawaii.east
  ) {
    return true;
  }
  
  return false;
}

// Helper function to validate a restaurant location using Google Maps Geocoding API
async function validateRestaurantLocation(lat, lng) {
  try {
    // For now, we'll just use the bounding box check
    // In the future, we can add the Google Maps API validation
    if (isInUSA(lat, lng)) {
      return { isValid: true, message: "Location is within USA bounds" };
    } else {
      return { isValid: false, message: "Location is not in the USA" };
    }
    
    /* Commented out until we set up the API key as a Worker secret
    // Use Google Maps Geocoding API to get location details
    const apiKey = GOOGLE_MAPS_API_KEY; // This should be set as a Worker secret
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    
    if (!response.ok) {
      console.error('Geocoding API error:', await response.text());
      // Default to allowing submission if API fails
      return { isValid: true, message: "Location validation failed, allowing submission" };
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding API returned no results');
      // Default to allowing submission if API returns no results
      return { isValid: true, message: "Location validation failed, allowing submission" };
    }
    
    // Look for country component in address components
    let isUSA = false;
    for (const result of data.results) {
      for (const component of result.address_components) {
        if (
          component.types.includes('country') && 
          component.short_name === 'US'
        ) {
          isUSA = true;
          break;
        }
      }
      if (isUSA) break;
    }
    
    if (isUSA) {
      return { isValid: true, message: "Location is in the USA" };
    } else {
      // Fallback to bounding box check if geocoding doesn't confirm USA
      if (isInUSA(lat, lng)) {
        return { isValid: true, message: "Location is within USA bounds" };
      } else {
        return { isValid: false, message: "Location is not in the USA" };
      }
    }
    */
  } catch (error) {
    console.error('Error validating location:', error);
    // Default to bounding box check if API call fails
    if (isInUSA(lat, lng)) {
      return { isValid: true, message: "Location is within USA bounds (fallback)" };
    } else {
      return { isValid: false, message: "Location is not in the USA (fallback)" };
    }
  }
}

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
    // This is useful for testing with the production site key
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
function handleOptions(request) {
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
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, '');
    const pathSegments = path.split('/').filter(Boolean);
    
    // Check if the request is for the API
    if (!path.startsWith('ratings') && !path.startsWith('migrate')) {
      return errorResponse('Not found', 404);
    }
    
    try {
      // Handle different API endpoints
      if (pathSegments[0] === 'ratings') {
        // GET /ratings - Get all ratings
        if (request.method === 'GET' && pathSegments.length === 1) {
          const { searchParams } = url;
          const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null;
          const zipcode = searchParams.get('zipcode');
          const confirmed = searchParams.get('confirmed') !== null ? 
            parseInt(searchParams.get('confirmed')) : null;
          
          let query = 'SELECT * FROM Rating';
          const params = [];
          
          const conditions = [];
          if (zipcode) {
            conditions.push('zipcode = ?');
            params.push(zipcode);
          }
          
          if (confirmed !== null) {
            conditions.push('confirmed = ?');
            params.push(confirmed);
          }
          
          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
          }
          
          query += ' ORDER BY createdAt DESC';
          
          if (limit) {
            query += ' LIMIT ?';
            params.push(limit);
          }
          
          const stmt = env.DB.prepare(query);
          const result = await stmt.bind(...params).all();
          
          return jsonResponse(result.results);
        }
        
        // GET /ratings/:id - Get a specific rating
        if (request.method === 'GET' && pathSegments.length === 2) {
          const id = parseInt(pathSegments[1]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          
          const stmt = env.DB.prepare('SELECT * FROM Rating WHERE id = ?');
          const result = await stmt.bind(id).all();
          
          if (result.results.length === 0) {
            return errorResponse('Rating not found', 404);
          }
          
          return jsonResponse(result.results[0]);
        }
        
        // POST /ratings - Create a new rating
        if (request.method === 'POST' && pathSegments.length === 1) {
          const data = await request.json();
          
          // Validate required fields
          if (!data.latitude || !data.longitude || !data.rating || !data.restaurantName) {
            return errorResponse('Missing required fields', 400);
          }
          
          // Validate Turnstile token
          if (!data.turnstileToken) {
            return errorResponse('CAPTCHA verification required', 400);
          }
          
          // Get client IP from Cloudflare headers
          const clientIP = request.headers.get('CF-Connecting-IP');
          
          // Validate the Turnstile token
          const turnstileValidation = await validateTurnstileToken(data.turnstileToken, clientIP, env);
          
          if (!turnstileValidation.success) {
            return errorResponse(`CAPTCHA validation failed: ${turnstileValidation.message}`, 400);
          }
          
          // Validate location is in the USA
          const locationValidation = await validateRestaurantLocation(data.latitude, data.longitude);
          
          if (!locationValidation.isValid) {
            return errorResponse('Location must be in the USA', 400);
          }
          
          // Prepare data for insertion
          const now = new Date().toISOString();
          const fields = [
            'createdAt', 'updatedAt', 'restaurantName', 'burritoTitle', 
            'latitude', 'longitude', 'zipcode', 'rating', 'taste', 'value', 
            'price', 'hasPotatoes', 'hasCheese', 'hasBacon', 'hasChorizo', 
            'hasAvocado', 'hasVegetables', 'review', 'reviewerName', 
            'identityPassword', 'reviewerEmoji', 'confirmed'
          ];
          
          // Remove turnstileToken from data before saving to database
          delete data.turnstileToken;
          
          const placeholders = fields.map(() => '?').join(', ');
          const values = [
            now, now, data.restaurantName, data.burritoTitle,
            data.latitude, data.longitude, data.zipcode || null, data.rating,
            data.taste, data.value, data.price,
            data.hasPotatoes ? 1 : 0, data.hasCheese ? 1 : 0, data.hasBacon ? 1 : 0,
            data.hasChorizo ? 1 : 0, data.hasAvocado ? 1 : 0, data.hasVegetables ? 1 : 0,
            data.review || null, data.reviewerName || 'Anonymous',
            data.identityPassword || null, data.reviewerEmoji || null, 0 // Default to unconfirmed
          ];
          
          const query = `INSERT INTO Rating (${fields.join(', ')}) VALUES (${placeholders})`;
          const stmt = env.DB.prepare(query);
          const result = await stmt.bind(...values).run();
          
          if (result.success) {
            // Get the inserted rating
            const getStmt = env.DB.prepare('SELECT * FROM Rating WHERE id = ?');
            const getResult = await getStmt.bind(result.meta.last_row_id).all();
            
            return jsonResponse(getResult.results[0], 201);
          } else {
            return errorResponse('Failed to create rating', 500);
          }
        }
        
        // PUT /ratings/:id - Update a rating
        if (request.method === 'PUT' && pathSegments.length === 2 && pathSegments[1] !== 'confirm') {
          const id = parseInt(pathSegments[1]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          
          const data = await request.json();
          
          // Check if rating exists
          const checkStmt = env.DB.prepare('SELECT * FROM Rating WHERE id = ?');
          const checkResult = await checkStmt.bind(id).all();
          
          if (checkResult.results.length === 0) {
            return errorResponse('Rating not found', 404);
          }
          
          // Prepare update query
          const updateFields = [];
          const values = [];
          
          // Add updatedAt field
          updateFields.push('updatedAt = ?');
          values.push(new Date().toISOString());
          
          // Add other fields if they exist in the request
          const allowedFields = [
            'restaurantName', 'burritoTitle', 'latitude', 'longitude', 'zipcode',
            'rating', 'taste', 'value', 'price', 'hasPotatoes', 'hasCheese',
            'hasBacon', 'hasChorizo', 'hasAvocado', 'hasVegetables', 'review',
            'reviewerName', 'identityPassword', 'reviewerEmoji', 'confirmed'
          ];
          
          for (const field of allowedFields) {
            if (data[field] !== undefined) {
              updateFields.push(`${field} = ?`);
              
              // Convert boolean fields to integers
              if (['hasPotatoes', 'hasCheese', 'hasBacon', 'hasChorizo', 'hasAvocado', 'hasVegetables'].includes(field)) {
                values.push(data[field] ? 1 : 0);
              } else {
                values.push(data[field]);
              }
            }
          }
          
          if (updateFields.length === 1) {
            return errorResponse('No fields to update', 400);
          }
          
          const query = `UPDATE Rating SET ${updateFields.join(', ')} WHERE id = ?`;
          values.push(id);
          
          const stmt = env.DB.prepare(query);
          const result = await stmt.bind(...values).run();
          
          if (result.success) {
            // Get the updated rating
            const getStmt = env.DB.prepare('SELECT * FROM Rating WHERE id = ?');
            const getResult = await getStmt.bind(id).all();
            
            return jsonResponse(getResult.results[0]);
          } else {
            return errorResponse('Failed to update rating', 500);
          }
        }
        
        // DELETE /ratings/:id - Delete a rating
        if (request.method === 'DELETE' && pathSegments.length === 2) {
          const id = parseInt(pathSegments[1]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          
          // Check if rating exists
          const checkStmt = env.DB.prepare('SELECT * FROM Rating WHERE id = ?');
          const checkResult = await checkStmt.bind(id).all();
          
          if (checkResult.results.length === 0) {
            return errorResponse('Rating not found', 404);
          }
          
          const stmt = env.DB.prepare('DELETE FROM Rating WHERE id = ?');
          const result = await stmt.bind(id).run();
          
          if (result.success) {
            return jsonResponse({ message: 'Rating deleted successfully' });
          } else {
            return errorResponse('Failed to delete rating', 500);
          }
        }
        
        // PUT /ratings/:id/confirm - Confirm a rating
        if (request.method === 'PUT' && pathSegments.length === 3 && pathSegments[2] === 'confirm') {
          const id = parseInt(pathSegments[1]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          
          // Check if rating exists
          const checkStmt = env.DB.prepare('SELECT * FROM Rating WHERE id = ?');
          const checkResult = await checkStmt.bind(id).all();
          
          if (checkResult.results.length === 0) {
            return errorResponse('Rating not found', 404);
          }
          
          const stmt = env.DB.prepare('UPDATE Rating SET confirmed = 1, updatedAt = ? WHERE id = ?');
          const result = await stmt.bind(new Date().toISOString(), id).run();
          
          if (result.success) {
            return jsonResponse({ message: 'Rating confirmed successfully' });
          } else {
            return errorResponse('Failed to confirm rating', 500);
          }
        }
        
        // POST /ratings/confirm - Bulk confirm ratings
        if (request.method === 'POST' && pathSegments.length === 2 && pathSegments[1] === 'confirm') {
          const data = await request.json();
          
          if (!Array.isArray(data.ids) || data.ids.length === 0) {
            return errorResponse('Invalid or missing rating IDs', 400);
          }
          
          const now = new Date().toISOString();
          const stmt = env.DB.prepare('UPDATE Rating SET confirmed = 1, updatedAt = ? WHERE id IN (?)');
          const result = await stmt.bind(now, data.ids.join(',')).run();
          
          if (result.success) {
            return jsonResponse({ message: 'Ratings confirmed successfully' });
          } else {
            return errorResponse('Failed to confirm ratings', 500);
          }
        }
      }
      
      // Handle migration endpoints
      if (pathSegments[0] === 'migrate') {
        // POST /migrate/add-confirmed-column - Add confirmed column to Rating table
        if (request.method === 'POST' && pathSegments.length === 2 && pathSegments[1] === 'add-confirmed-column') {
          try {
            await env.DB.exec('ALTER TABLE Rating ADD COLUMN confirmed INTEGER DEFAULT 0');
            return jsonResponse({ message: 'Migration completed successfully' });
          } catch (error) {
            return errorResponse(`Migration failed: ${error.message}`, 500);
          }
        }
      }
      
      // If no endpoint matched
      return errorResponse('Not found', 404);
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse(`Internal server error: ${error.message}`, 500);
    }
  }
}; 
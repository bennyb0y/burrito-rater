# Image Upload and Transformation System

## Overview

The Burrito Rater application uses Cloudflare Workers and R2 storage for image handling, with Cloudflare's Image Transformation service for on-the-fly image optimization. This document outlines the implementation details and usage guidelines.

## Architecture

### Components
1. **Cloudflare Worker**: Handles image uploads and serves images
2. **R2 Storage**: Stores original images
3. **Cloudflare Image Transformation**: Provides on-the-fly image optimization
4. **API Authentication**: Secures upload endpoints

## API Endpoints

### Image Upload
```
POST ${API_BASE_URL}/images/upload
Authorization: Bearer ${R2_API_TOKEN}
Content-Type: multipart/form-data

Parameters:
- image: File (required) - The image file to upload

Response:
{
  "success": true,
  "filename": "timestamp-randomstring.ext",
  "url": "/images/timestamp-randomstring.ext"
}
```

### Image Retrieval
```
GET ${API_BASE_URL}/images/{filename}
```

## Image Transformations

Images can be transformed using Cloudflare's Image Transformation service. The base URL for transformed images is:
```
${CDN_URL}/cdn-cgi/image/{transformations}/{filename}
```

### Available Transformations

1. **Resize**
   - `width={number}`: Set image width
   - `height={number}`: Set image height
   - `fit=cover`: Maintain aspect ratio while covering dimensions

2. **Format Conversion**
   - `format=webp`: Convert to WebP format
   - `format=jpeg`: Convert to JPEG format

3. **Quality Control**
   - `quality={1-100}`: Set image quality (default: 80)

4. **Additional Options**
   - `blur={number}`: Apply Gaussian blur
   - `rotate={degrees}`: Rotate image
   - `sharpen={number}`: Apply sharpening

### Example Transformations

1. **Basic Resize**
   ```
   https://images.benny.com/cdn-cgi/image/width=400,height=300,fit=cover/image.jpg
   ```

2. **WebP Conversion with Quality**
   ```
   https://images.benny.com/cdn-cgi/image/width=800,height=600,format=webp,quality=80/image.jpg
   ```

3. **Multiple Transformations**
   ```
   https://images.benny.com/cdn-cgi/image/width=400,height=400,fit=cover,format=jpeg,quality=90,blur=5/image.jpg
   ```

## Implementation Notes

### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the API (e.g., https://burrito-rater.bennyfischer.workers.dev)
- `NEXT_PUBLIC_CDN_URL`: Base URL for the CDN (e.g., https://images.benny.com)
- `R2_API_TOKEN`: API token for authentication (set as a secret in Cloudflare)
- `TURNSTILE_SECRET_KEY`: For CAPTCHA validation

### Security Considerations
1. All upload endpoints require authentication
2. File type validation is performed
3. Unique filenames are generated to prevent collisions
4. CORS is properly configured

### Performance Optimization
1. Images are served through Cloudflare's global CDN
2. Transformations are cached at the edge
3. WebP format is supported for modern browsers
4. Original images are preserved in R2 storage

## Usage in Frontend

### Upload Example
```typescript
async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/images/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_R2_API_TOKEN}`
    },
    body: formData
  });

  return await response.json();
}
```

### Display Example
```typescript
// Original image
<img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${filename}`} />

// Transformed image
<img src={`${process.env.NEXT_PUBLIC_CDN_URL}/cdn-cgi/image/width=400,height=300,fit=cover/${filename}`} />
```

## Testing

A test script is available in the `test-images` directory that verifies:
1. Image upload functionality
2. Direct image access
3. Image transformation capabilities
4. Multiple transformation combinations

Run the test script:
```bash
cd test-images
./test-image-flow.sh
```

## Future Improvements
1. Add support for more image formats
2. Implement image compression options
3. Add support for animated GIFs
4. Implement progressive image loading
5. Add support for responsive images
6. Implement image optimization on upload 
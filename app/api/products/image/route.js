import { NextResponse } from 'next/server';

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------
const GHL_CUSTOM_OBJECT_ID = "69a6d83eb206eb7c36275bd5"; 
const GHL_LOCATION_ID = "Dm5yFSciFNH7tur70UZU";

const getGhlHeaders = () => ({
  'Authorization': `Bearer ${process.env.GROWTHMODE_ACCESS_TOKEN}`,
  'Version': '2021-07-28',
  'Location-Id': GHL_LOCATION_ID,
  'Content-Type': 'application/json'
});

/**
 * Helper to find a GHL record by productCode
 */
async function findGhlRecordByCode(productCode) {
  const endpoint = `https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records/search`;
  const cleanProductCode = productCode.trim();

  const requestBody = {
    locationId: GHL_LOCATION_ID,
    page: 1, 
    pageLimit: 10,
    query: cleanProductCode 
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getGhlHeaders(),
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) return null;

    const data = await response.json();
    const records = data.records || [];
    
    if (records.length === 0) return null;

    // Filter strictly to ensure the tool_code matches exactly
    const exactMatch = records.find(record => {
        const props = record.properties || {};
        return props.tool_code === cleanProductCode;
    });

    return exactMatch || null;
  } catch (error) {
    console.error(`❌ [GHL Search Exception]:`, error.message);
    return null;
  }
}

// ----------------------------------------------------------------------
// POST: Upload Image and Attach (or Create) in GHL
// ----------------------------------------------------------------------
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const productCode = formData.get('productCode') || formData.get('product_code');
    const imageFile = formData.get('image'); 

    // 1. Validate Inputs
    if (!productCode) {
      return NextResponse.json({ error: 'Missing productCode' }, { status: 400 });
    }

    if (!imageFile) {
      return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
    }

    // Strict Backend File Type Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
       return NextResponse.json(
         { error: 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.' }, 
         { status: 400 }
       );
    }

    // 2. Upload Image to GHL Media Library
    const mediaFormData = new FormData();
    mediaFormData.append('file', imageFile);

    const mediaResponse = await fetch('https://services.leadconnectorhq.com/medias/upload-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROWTHMODE_ACCESS_TOKEN}`,
        'Version': '2021-07-28'
        // Do NOT set Content-Type here; fetch natively handles multipart/form-data boundaries
      },
      body: mediaFormData
    });

    if (!mediaResponse.ok) {
        const mediaErr = await mediaResponse.text();
        console.error("GHL Media Upload Failed:", mediaErr);
        return NextResponse.json({ error: 'Failed to upload image to GHL Media Library', details: mediaErr }, { status: mediaResponse.status });
    }

    const mediaData = await mediaResponse.json();
    const uploadedImageUrl = mediaData.url; 

    if (!uploadedImageUrl) {
        return NextResponse.json({ error: 'Image uploaded but no URL was returned from GHL' }, { status: 500 });
    }

    // 3. Find Existing Record or Create a New One
    const existingGhlRecord = await findGhlRecordByCode(productCode);

    if (!existingGhlRecord) {
        // --- 4a. FALLBACK CREATION ---
        console.warn(`No existing GHL record found for productCode: ${productCode}. Creating a new record...`);

        const createEndpoint = `https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records`;
        const ghlCreateResponse = await fetch(createEndpoint, {
          method: 'POST',
          headers: getGhlHeaders(),
          body: JSON.stringify({
            locationId: GHL_LOCATION_ID,
            properties: {
              "tool_code": productCode,
              "image": [{ "url": uploadedImageUrl }] 
            }
          })
        });

        if (!ghlCreateResponse.ok) {
            const createErr = await ghlCreateResponse.json();
            return NextResponse.json({ error: 'Failed to create new GHL record with image', details: createErr }, { status: ghlCreateResponse.status });
        }

        const createdRecord = await ghlCreateResponse.json();

        return NextResponse.json({ 
          success: true, 
          message: 'Product created and image successfully attached.',
          imageUrl: uploadedImageUrl,
          record: createdRecord,
          isNewRecord: true
        });

    } else {
        // --- 4b. UPDATE EXISTING ---
        const recordId = existingGhlRecord.id;
        const updateEndpoint = `https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records/${recordId}?locationId=${GHL_LOCATION_ID}`;

        const ghlUpdateResponse = await fetch(updateEndpoint, {
            method: 'PUT', 
            headers: getGhlHeaders(),
            body: JSON.stringify({
              properties: {
                "image": [{ "url": uploadedImageUrl }] 
              }
            })
        });

        if (!ghlUpdateResponse.ok) {
            const updateErr = await ghlUpdateResponse.json();
            return NextResponse.json({ error: 'Failed to update existing GHL record with image', details: updateErr }, { status: ghlUpdateResponse.status });
        }

        const updatedRecord = await ghlUpdateResponse.json();

        return NextResponse.json({ 
          success: true, 
          message: 'Image successfully uploaded and attached to existing product.',
          imageUrl: uploadedImageUrl,
          record: updatedRecord,
          isNewRecord: false
        });
    }

  } catch (error) {
    console.error("Image Attachment POST Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
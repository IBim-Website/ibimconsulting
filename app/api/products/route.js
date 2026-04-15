import { NextResponse } from 'next/server';

// ----------------------------------------------------------------------
// HELPER VARIABLES & CONSTANTS
// ----------------------------------------------------------------------
const GHL_CUSTOM_OBJECT_ID = "69a6d83eb206eb7c36275bd5"; 
const GHL_LOCATION_ID = "Dm5yFSciFNH7tur70UZU";

/**
 * Helper to authenticate and get the dynamic Backoffice Token
 */
async function getBackofficeToken() {
  const authEndpoint = 'https://backoffice.ibimconsulting.com.au/api/authenticate';
  
  const authResponse = await fetch(authEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_name: process.env.BACKOFFICE_USERNAME,
      password: process.env.BACKOFFICE_PASSWORD
    })
  });

  if (!authResponse.ok) {
    throw new Error(`Backoffice authentication failed with status ${authResponse.status}`);
  }

  const authData = await authResponse.json();
  
  if (authData.status === true && authData.data?.token) {
    return authData.data.token;
  } else {
    throw new Error('Failed to retrieve Backoffice token from the response');
  }
}

// Updated to async so it can fetch the token right before making headers
const getBoHeaders = async () => ({
  'Authorization': `Bearer ${await getBackofficeToken()}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

const getGhlHeaders = () => ({
  'Authorization': `Bearer ${process.env.GROWTHMODE_ACCESS_TOKEN}`,
  'Version': '2021-07-28',
  'Location-Id': GHL_LOCATION_ID,
  'Content-Type': 'application/json'
});

// Helper to find a GHL record by productCode
async function findGhlRecordByCode(productCode) {
  const endpoint = `https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records/search`;
  
  // Clean the string to ensure no trailing spaces break the search
  const cleanProductCode = productCode.trim();

  // FIX: 'query' must be a simple text string, not an array of objects
  const requestBody = {
    locationId: GHL_LOCATION_ID,
    page: 1, 
    pageLimit: 10,
    query: cleanProductCode 
  };

  console.log(`\n--- [GHL SEARCH DEBUG] ---`);
  console.log(`Searching for: "${cleanProductCode}"`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getGhlHeaders(),
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [GHL Search Failed] Status: ${response.status}`);
      console.error(`❌ [GHL Error Details]:`, errorText);
      console.log(`--------------------------\n`);
      return null;
    }

    const data = await response.json();
    const records = data.records || [];
    
    console.log(`✅ [GHL Search Success] Found ${records.length} potential matches.`);
    
    if (records.length === 0) {
        console.log(`--------------------------\n`);
        return null;
    }

    // FIX: Because the API does a global text search, we strictly filter 
    // the results on the backend to guarantee the 'tool_code' matches exactly.
    const exactMatch = records.find(record => {
        const props = record.properties || {};
        return props.tool_code === cleanProductCode;
    });

    if (exactMatch) {
        console.log(`✅ [Exact Match Found] GHL Record ID: ${exactMatch.id}`);
    } else {
        console.log(`⚠️ [No Exact Match] Search returned results, but no exact tool_code matched.`);
    }
    
    console.log(`--------------------------\n`);
    
    return exactMatch || null;

  } catch (error) {
    console.error(`❌ [GHL Search Exception]:`, error.message);
    return null;
  }
}

// ----------------------------------------------------------------------
// POST: Create Product
// ----------------------------------------------------------------------
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Core Backoffice Fields
    const productName = formData.get('product_name');
    const productCode = formData.get('productCode') || formData.get('product_code');
    const productPrefix = formData.get('product_prefix');
    const description = formData.get('description');
    const status = formData.get('status') || 'ACTIVE';

    // Secondary GHL Fields
    const imageFile = formData.get('image'); 
    const productPayloadStr = formData.get('productPayload'); 
    
    if (!productCode || !productName) {
      return NextResponse.json({ error: 'Missing productCode or product_name' }, { status: 400 });
    }

    // 1. Strict Backend File Type Validation
    if (imageFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(imageFile.type)) {
         return NextResponse.json(
           { error: 'Invalid file type. Only JPG, PNG, and GIF are allowed.' }, 
           { status: 400 }
         );
      }
    }

    // 2. Create in Backoffice FIRST
    const boPayload = {
      product_name: productName,
      product_code: productCode,
      product_prefix: productPrefix,
      description: description,
      status: status
    };

    const boResponse = await fetch('https://backoffice.ibimconsulting.com.au/api/add/product', {
      method: 'POST',
      headers: await getBoHeaders(), // <-- Await added
      body: JSON.stringify(boPayload)
    });

    if (!boResponse.ok) {
      const boError = await boResponse.json();
      return NextResponse.json({ error: 'Failed to create product in Backoffice', details: boError }, { status: boResponse.status });
    }

    const boData = await boResponse.json();

    // 3. Upload Image to GHL Media Library (if exists)
    let uploadedImageUrl = null;
    if (imageFile) {
      const mediaFormData = new FormData();
      mediaFormData.append('file', imageFile);

      const mediaResponse = await fetch('https://services.leadconnectorhq.com/medias/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROWTHMODE_ACCESS_TOKEN}`,
          'Version': '2021-07-28'
        },
        body: mediaFormData
      });

      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        uploadedImageUrl = mediaData.url; 
      }
    }

    // 4. Parse Extra Payload and Create Record in GHL Custom Object
    let parsedData = {};
    try { parsedData = JSON.parse(productPayloadStr || "{}"); } catch (e) {}

    const ghlEndpoint = `https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records`;
    const ghlResponse = await fetch(ghlEndpoint, {
      method: 'POST',
      headers: getGhlHeaders(),
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID, 
        properties: {
          "tool_code": productCode,
          "data": JSON.stringify(parsedData), 
          ...(uploadedImageUrl && { "image": [{ "url": uploadedImageUrl }] }) 
        }
      })
    });

    // We consider it a success if BO succeeded, even if GHL secondary data fails, 
    // but we return the GHL status for debugging.
    return NextResponse.json({ 
      success: true, 
      backofficeData: boData,
      ghlSuccess: ghlResponse.ok 
    });

  } catch (error) {
    console.error("Integration POST Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// GET: Read Products
// ----------------------------------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productCode = searchParams.get('productCode') || searchParams.get('product_code') || ''; 
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || parseInt(searchParams.get('per_page')) || 10;
    
    // Default to 'ACTIVE' for the storefront
    const status = searchParams.get('status') || 'ACTIVE'; 

    // 1. Fetch from Backoffice API
    const boUrl = new URL('https://backoffice.ibimconsulting.com.au/api/get/products');
    boUrl.searchParams.append('page', page);
    boUrl.searchParams.append('per_page', limit);
    
    if (productCode) boUrl.searchParams.append('product_code', productCode);
    
    // Append status unless 'all' is explicitly requested
    if (status && status.toLowerCase() !== 'all') {
      boUrl.searchParams.append('status', status);
    }

    const boResponse = await fetch(boUrl.toString(), {
      method: 'GET',
      headers: await getBoHeaders() // <-- Await added
    });

    if (!boResponse.ok) {
      const errorData = await boResponse.json();
      return NextResponse.json({ error: 'Failed to fetch products from Backoffice', details: errorData }, { status: boResponse.status });
    }

    const boResult = await boResponse.json();

    // --- CRITICAL FIX: Unpack the Laravel Pagination ---
    let boRecords = [];
    let boPagination = null;
    
    // 1. Check if it's nested (e.g., { status: true, data: { current_page: 1, data: [...] } })
    if (boResult.data && boResult.data.data && Array.isArray(boResult.data.data)) {
        boRecords = boResult.data.data; // The actual array of products
        boPagination = boResult.data;   // Keep reference to pagination (total, last_page, etc.)
    } 
    // 2. Fallback if it's at the root (e.g., { current_page: 1, data: [...] })
    else if (boResult.data && Array.isArray(boResult.data)) {
        boRecords = boResult.data;
        boPagination = boResult;
    } 
    // 3. Fallback if it's just a raw array
    else if (Array.isArray(boResult)) {
        boRecords = boResult;
    }

    // 2. Fetch GHL data to merge in the extra info
    const ghlSearchBody = {
      locationId: GHL_LOCATION_ID, 
      page: 1, 
      pageLimit: 100 
    };
    
    if (productCode) {
      ghlSearchBody.query = [{ field: "tool_code", operator: "EQUALS", value: productCode }];
    }

    const ghlResponse = await fetch(`https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records/search`, {
      method: 'POST',
      headers: getGhlHeaders(), 
      body: JSON.stringify(ghlSearchBody)
    });

    let ghlRecordsMap = {};
    if (ghlResponse.ok) {
      const ghlData = await ghlResponse.json();
      // Create a map of productCode -> GHL properties for O(1) merge
      (ghlData.records || []).forEach(record => {
        const props = record.properties || {};
        if (props.tool_code) {
          ghlRecordsMap[props.tool_code] = props;
        }
      });
    }

    // 3. Merge Data (Iterating over the securely unpacked boRecords array)
    const mergedRecords = boRecords.map(boRecord => {
      const ghlData = ghlRecordsMap[boRecord.product_code] || {};
      
      let parsedExtraData = {};
      try { parsedExtraData = JSON.parse(ghlData.data || "{}"); } catch (e) {}

      return {
        ...boRecord,
        extraPayload: parsedExtraData,
        image: ghlData.image || null
      };
    });

    // If searching for a specific product code
    if (productCode && mergedRecords.length > 0) {
        return NextResponse.json({ success: true, record: mergedRecords[0] });
    } else if (productCode && mergedRecords.length === 0) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // 4. Calculate pagination securely on the backend
    let hasMore = false;
    if (boPagination && boPagination.last_page) {
        hasMore = boPagination.current_page < boPagination.last_page;
    } else {
        hasMore = mergedRecords.length === limit;
    }

    // Return a clean flat array inside `records`
    return NextResponse.json({ 
      success: true, 
      records: mergedRecords,
      hasMore: hasMore,
      total: boPagination ? boPagination.total : null
    });

  } catch (error) {
    console.error("CRM Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const formData = await request.formData();
    
    // Core BO fields required to update
    const id = formData.get('id'); // Backoffice ID
    const productName = formData.get('product_name');
    const productPrefix = formData.get('product_prefix');
    const description = formData.get('description');
    const status = formData.get('status');
    
    // Added fallback for productCode to match POST behavior
    const productCode = formData.get('productCode') || formData.get('product_code'); 
    
    // GHL fields
    const productPayload = formData.get('productPayload');
    const imageFile = formData.get('image'); // Extracted just in case the fallback needs to create an image

    if (!id) {
      return NextResponse.json({ error: 'Missing required Backoffice "id" for update' }, { status: 400 });
    }

    // 1. Update Backoffice
    const boPayload = { id };
    if (productName) boPayload.product_name = productName;
    if (productPrefix) boPayload.product_prefix = productPrefix;
    if (description) boPayload.description = description;
    if (status) boPayload.status = status;

    const boUpdateRes = await fetch('https://backoffice.ibimconsulting.com.au/api/update/product', {
      method: 'POST', // Note: BO uses POST for updates
      headers: await getBoHeaders(),
      body: JSON.stringify(boPayload)
    });

    if (!boUpdateRes.ok) {
      const errorData = await boUpdateRes.json();
      return NextResponse.json({ error: 'Failed to update Backoffice', details: errorData }, { status: 400 });
    }

    // 2. Update GHL Extra Payload (or Create if missing)
    let ghlUpdateSuccess = true;
    let ghlErrorDetails = null;

    if (productPayload && productCode) {
      const parsedNewData = JSON.parse(productPayload);
      
      // Find the existing GHL record by productCode
      const existingGhlRecord = await findGhlRecordByCode(productCode);

      if (existingGhlRecord) {
        const recordId = existingGhlRecord.id;
        const existingProperties = existingGhlRecord.properties || {};
        
        let existingPayload = {};
        try { existingPayload = JSON.parse(existingProperties.data || "{}"); } catch (e) {}

        // Deep Merge Payload
        const finalPayload = {
          ...existingPayload, 
          ...parsedNewData,  
          pricing: {
            ...(existingPayload.pricing || {}),
            ...(parsedNewData.pricing || {})
          }
        };

        const updateEndpoint = `https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records/${recordId}?locationId=${GHL_LOCATION_ID}`;

        const ghlUpdate = await fetch(updateEndpoint, {
            method: 'PUT', 
            headers: getGhlHeaders(),
            body: JSON.stringify({
              properties: {
                data: JSON.stringify(finalPayload)
              }
            })
        });

        if (!ghlUpdate.ok) {
           ghlUpdateSuccess = false;
           ghlErrorDetails = await ghlUpdate.json();
           console.error("GHL Update Failed:", ghlErrorDetails);
        } else {
           const ghlUpdateData = await ghlUpdate.json();
           console.log("GHL Update Success:", ghlUpdateData);
        }
      } else {
        // --- NEW FALLBACK CREATION LOGIC ---
        console.warn(`No existing GHL record found for productCode: ${productCode}. Creating a new record...`);

        // Upload Image to GHL Media Library (if passed during PATCH)
        let uploadedImageUrl = null;
        if (imageFile) {
          const mediaFormData = new FormData();
          mediaFormData.append('file', imageFile);

          const mediaResponse = await fetch('https://services.leadconnectorhq.com/medias/upload-file', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROWTHMODE_ACCESS_TOKEN}`,
              'Version': '2021-07-28'
            },
            body: mediaFormData
          });

          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            uploadedImageUrl = mediaData.url; 
          }
        }

        const createEndpoint = `https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records`;
        const ghlCreate = await fetch(createEndpoint, {
          method: 'POST',
          headers: getGhlHeaders(),
          body: JSON.stringify({
            locationId: GHL_LOCATION_ID, 
            properties: {
              "tool_code": productCode,
              "data": JSON.stringify(parsedNewData), 
              ...(uploadedImageUrl && { "image": [{ "url": uploadedImageUrl }] }) 
            }
          })
        });

        if (!ghlCreate.ok) {
           ghlUpdateSuccess = false;
           ghlErrorDetails = await ghlCreate.json();
           console.error("GHL Fallback Creation Failed:", ghlErrorDetails);
        } else {
           const ghlCreateData = await ghlCreate.json();
           console.log("GHL Fallback Creation Success:", ghlCreateData);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Product updated (or created) successfully!',
      ghlUpdateSuccess,
      ...(ghlErrorDetails && { ghlErrorDetails })
    });

  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// DELETE: Delete Product
// ----------------------------------------------------------------------
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Backoffice ID
    const productCode = searchParams.get('productCode'); // Needed to cleanup GHL

    if (!id) {
      return NextResponse.json({ error: 'Missing Backoffice ID' }, { status: 400 });
    }

    // 1. Delete from Backoffice
    const boDeleteRes = await fetch('https://backoffice.ibimconsulting.com.au/api/delete/product', {
      method: 'POST', // Note: BO uses POST for delete
      headers: await getBoHeaders(), // <-- Await added
      body: JSON.stringify({ id: id })
    });

    if (!boDeleteRes.ok) {
      const errorData = await boDeleteRes.json();
      return NextResponse.json({ error: 'Failed to delete from Backoffice', details: errorData }, { status: boDeleteRes.status });
    }

    // 2. Delete from GHL (Cleanup)
    if (productCode) {
      const existingGhlRecord = await findGhlRecordByCode(productCode);
      if (existingGhlRecord) {
        const deleteEndpoint = `https://services.leadconnectorhq.com/objects/${GHL_CUSTOM_OBJECT_ID}/records/${existingGhlRecord.id}`;
        await fetch(deleteEndpoint, {
          method: 'DELETE',
          headers: getGhlHeaders()
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Product successfully deleted from Backoffice and CRM.' });

  } catch (error) {
    console.error("Integration Delete Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
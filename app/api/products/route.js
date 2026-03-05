import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const imageFile = formData.get('image'); 
    const productCode = formData.get('productCode');
    const productPayloadStr = formData.get('productPayload'); 
    
    if (!productCode) {
      return NextResponse.json({ error: 'Missing productCode' }, { status: 400 });
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

    const customObjectId = "69a6d83eb206eb7c36275bd5"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    let uploadedImageUrl = null;

    if (imageFile) {
      const mediaFormData = new FormData();
      mediaFormData.append('file', imageFile);

      const mediaResponse = await fetch('https://services.leadconnectorhq.com/medias/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28'
        },
        body: mediaFormData
      });

      if (!mediaResponse.ok) {
        const mediaError = await mediaResponse.json();
        return NextResponse.json(
          { error: 'Failed to upload image to CRM media library', details: mediaError }, 
          { status: mediaResponse.status }
        );
      }

      const mediaData = await mediaResponse.json();
      uploadedImageUrl = mediaData.url; 
    }

    const endpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Location-Id': locationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: locationId, 
        properties: {
          "tool_code": productCode,
          "data": productPayloadStr || "{}", 
          // 2. FIX: Wrap the URL in an object inside the array
          ...(uploadedImageUrl && { 
            "image": [
              { "url": uploadedImageUrl } 
            ] 
          }) 
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to create product in CRM', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("CRM Integration Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const customObjectId = "69a6d83eb206eb7c36275bd5"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    // 1. Point to the /records/search endpoint instead
    const endpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/search`;

    const response = await fetch(endpoint, {
      method: 'POST', // 2. GHL strictly requires POST here
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: locationId,
        page: 1,           // Required by GHL
        pageLimit: 100     // Required by GHL (Adjust if you have more than 100 tools)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch products from CRM', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // GHL's search endpoint returns an object like: { total: X, records: [...] }
    return NextResponse.json({ success: true, records: data.records || [] });

  } catch (error) {
    console.error("CRM Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
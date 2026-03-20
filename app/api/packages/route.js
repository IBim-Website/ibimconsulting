import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const packageCode = formData.get('packageCode');
    const packagePayloadStr = formData.get('packagePayload'); 
    
    if (!packageCode) {
      return NextResponse.json({ error: 'Missing packageCode' }, { status: 400 });
    }

    const customObjectId = "69bca8aea9a868c2ba27a4a6"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    // 1. Parse Payload
    let parsedData = {};
    try {
      parsedData = JSON.parse(packagePayloadStr || "{}");
    } catch (e) {
      console.error("Failed to parse package payload", e);
    }

    // Stringify the payload for GHL
    const finalPayloadStr = JSON.stringify(parsedData);

    // 2. Create Record in GHL Custom Object
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
          "package_code": packageCode,
          "data": finalPayloadStr 
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to create package in CRM', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Integration Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // 1. Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const packageCode = searchParams.get('packageCode'); 
    const page = parseInt(searchParams.get('page')) || 1;    // Default to page 1
    const limit = parseInt(searchParams.get('limit')) || 10; // Default to 10 items

    const customObjectId = "69bca8aea9a868c2ba27a4a6"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    const endpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/search`;

    // 2. Build the dynamic search payload with backend pagination
    const searchBody = {
      locationId: locationId,
      page: page,          
      pageLimit: packageCode ? 1 : limit // If searching by code, limit to 1. Otherwise, use our limit.
    };

    if (packageCode) {
      searchBody.query = [
        {
          field: "package_code",
          operator: "EQUALS",
          value: packageCode
        }
      ];
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch packages from CRM', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (packageCode && data.records?.length > 0) {
        return NextResponse.json({ success: true, record: data.records[0] });
    } else if (packageCode && data.records?.length === 0) {
        return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    // 3. Return the specific page of records, plus a boolean to help the frontend know if there are more pages
    const records = data.records || [];
    return NextResponse.json({ 
      success: true, 
      records: records,
      hasMore: records.length === limit 
    });

  } catch (error) {
    console.error("CRM Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const formData = await request.formData();
    const recordId = formData.get('recordId');
    const packagePayload = formData.get('packagePayload');

    if (!recordId || !packagePayload) {
      return NextResponse.json({ error: 'Missing required update data' }, { status: 400 });
    }

    const parsedNewData = JSON.parse(packagePayload);
    const customObjectId = "69bca8aea9a868c2ba27a4a6";
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    // 1. Fetch the EXISTING record
    const getResponse = await fetch(
      `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Version': '2021-07-28',
          'Location-Id': locationId,
        }
      }
    );

    if (!getResponse.ok) throw new Error('Failed to fetch existing record from CRM');
    const existingRecord = await getResponse.json();
    const existingProperties = existingRecord?.record?.properties || {};
    
    let existingPayload = {};
    try {
      existingPayload = JSON.parse(existingProperties.data || "{}");
    } catch (e) {
      existingPayload = {};
    }

    // 2. Deep Merge Payload
    const finalPayload = {
      ...existingPayload, 
      ...parsedNewData
    };

    // 3. Push Update to GoHighLevel
    const updateEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${recordId}?locationId=${locationId}`;

    const updateResponse = await fetch(updateEndpoint, {
        method: 'PUT', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          properties: {
            data: JSON.stringify(finalPayload)
          }
        })
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return NextResponse.json({ error: 'Failed to update CRM', details: errorData }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Package updated successfully!' });

  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // 1. Get the parameters from the URL
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('id');

    if (!recordId) {
      return NextResponse.json({ error: 'Missing CRM record ID' }, { status: 400 });
    }

    const customObjectId = "69bca8aea9a868c2ba27a4a6"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

    // 2. Delete from GoHighLevel
    const deleteEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${recordId}`;
    
    const response = await fetch(deleteEndpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Location-Id': locationId,
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to delete from CRM', details: errorData }, 
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Package successfully deleted.' });

  } catch (error) {
    console.error("Integration Delete Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
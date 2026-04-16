import { NextResponse } from 'next/server';

// Define the core fields that belong exclusively to the Backoffice
const BACKOFFICE_FIELDS = [
  'id',
  'package_name',
  'package_code',
  'product_codes',
  'exclusive_package',
  'status'
];

/**
 * Helper to split payload into Backoffice data and GHL (Extra) data
 */
function splitPayload(payload) {
  const backofficeData = {};
  const ghlData = {};

  for (const [key, value] of Object.entries(payload)) {
    if (BACKOFFICE_FIELDS.includes(key)) {
      backofficeData[key] = value;
    } else {
      ghlData[key] = value;
    }
  }
  return { backofficeData, ghlData };
}

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

  console.log(authData)
  
  if (authData.status === true && authData.data?.token) {
    return authData.data.token;
  } else {
    throw new Error('Failed to retrieve Backoffice token from the response');
  }
}

// ----------------------------------------------------------------------
// POST - Create Package
// ----------------------------------------------------------------------
export async function POST(request) {
  try {
    const formData = await request.formData();
    const packageCodeForm = formData.get('packageCode');
    const packagePayloadStr = formData.get('packagePayload'); 

    let parsedData = {};
    try {
      parsedData = JSON.parse(packagePayloadStr || "{}");
    } catch (e) {
      console.error("Failed to parse package payload", e);
    }

    // Split data
    const { backofficeData, ghlData } = splitPayload(parsedData);
    const finalPackageCode = backofficeData.package_code || packageCodeForm;

    if (!finalPackageCode) {
      return NextResponse.json({ error: 'Missing package code' }, { status: 400 });
    }

    // Ensure package_code is attached to backoffice payload
    backofficeData.package_code = finalPackageCode;

    // 1. Create Record in Backoffice (Main Data)
    const boToken = await getBackofficeToken();
    const boEndpoint = `https://backoffice.ibimconsulting.com.au/api/add/package`;
    
    const boResponse = await fetch(boEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${boToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backofficeData)
    });

    if (!boResponse.ok) {
      const boError = await boResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to create package in Backoffice', details: boError }, 
        { status: boResponse.status }
      );
    }

    // 2. Create Record in GHL Custom Object (Supplemental Data)
    const customObjectId = "69bca8aea9a868c2ba27a4a6"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const ghlToken = process.env.GROWTHMODE_ACCESS_TOKEN;
    const ghlEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records`;

    const ghlResponse = await fetch(ghlEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlToken}`,
        'Version': '2021-07-28',
        'Location-Id': locationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: locationId, 
        properties: {
          "package_code": finalPackageCode,
          "data": JSON.stringify(ghlData) // Only save non-backoffice data to GHL
        }
      })
    });

    if (!ghlResponse.ok) {
      const errorData = await ghlResponse.json();
      return NextResponse.json(
        { error: 'Failed to save supplemental data in CRM. Backoffice save succeeded.', details: errorData }, 
        { status: ghlResponse.status }
      );
    }

    const ghlResponseData = await ghlResponse.json();
    return NextResponse.json({ success: true, backoffice_saved: true, ghl_data: ghlResponseData });

  } catch (error) {
    console.error("Integration Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// GET - Read Packages
// ----------------------------------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const packageCode = searchParams.get('packageCode') || ''; 
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';

    // 1. Fetch Main Data from Backoffice
    const boToken = await getBackofficeToken();
    const boUrl = `https://backoffice.ibimconsulting.com.au/api/get/packages?package_code=${packageCode}&page=${page}&per_page=${limit}${status != '' ? '&status=' + status : ''}`;
    
    const boResponse = await fetch(boUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${boToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!boResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch packages from Backoffice' }, { status: boResponse.status });
    }

    const boData = await boResponse.json();
    
    // UPDATED: Extract from the nested data.data structure
    const backofficeRecords = boData?.data?.data || [];

    if (packageCode && backofficeRecords.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found in Backoffice' }, { status: 404 });
    }

    // UPDATED: Use explicit pagination properties provided by the backoffice
    const currentPage = boData?.data?.current_page || 1;
    const lastPage = boData?.data?.last_page || 1;
    const hasMore = currentPage < lastPage;

    // 2. Fetch Supplemental Data from GHL
    const customObjectId = "69bca8aea9a868c2ba27a4a6"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const ghlToken = process.env.GROWTHMODE_ACCESS_TOKEN;
    const ghlEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/search`;

    const searchBody = {
      locationId: locationId,
      page: 1, 
      pageLimit: packageCode ? 1 : 100 
    };

    if (packageCode) {
      searchBody.query = [{ field: "package_code", operator: "EQUALS", value: packageCode }];
    }

    const ghlResponse = await fetch(ghlEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlToken}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody)
    });

    let ghlRecords = [];
    if (ghlResponse.ok) {
      const ghlData = await ghlResponse.json();
      ghlRecords = ghlData.records || [];
    }

    // 3. Merge Backoffice and GHL data based on package_code
    const mergedRecords = backofficeRecords.map(boRecord => {
      const matchingGhl = ghlRecords.find(g => g.properties?.package_code === boRecord.package_code);
      let parsedGhlData = {};
      
      if (matchingGhl && matchingGhl.properties?.data) {
        try {
          parsedGhlData = JSON.parse(matchingGhl.properties.data);
        } catch (e) {
          console.error("Error parsing GHL JSON data for record", boRecord.package_code);
        }
      }

      // UPDATED: Parse the stringified product_codes back into a normal array
      let parsedProductCodes = [];
      if (typeof boRecord.product_codes === 'string') {
        try {
          parsedProductCodes = JSON.parse(boRecord.product_codes);
        } catch (e) {
          parsedProductCodes = [boRecord.product_codes]; // Fallback just in case
        }
      } else if (Array.isArray(boRecord.product_codes)) {
        parsedProductCodes = boRecord.product_codes;
      }

      return {
        ...parsedGhlData, // 1. Spread GHL extra data first (Pricing, YouTube, Description)
        ...boRecord,      // 2. Spread Backoffice data LAST (Overwrites any GHL data if there's a conflict)
        product_codes: parsedProductCodes, // 3. Explicitly force the Backoffice product array
        _ghlRecordId: matchingGhl?.id || null 
      };
    });

    if (packageCode) {
      return NextResponse.json({ success: true, record: mergedRecords[0] });
    }

    return NextResponse.json({ 
      success: true, 
      records: mergedRecords,
      hasMore: hasMore // UPDATED: Use the boolean evaluated from backoffice pagination
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// PATCH - Update Package
// ----------------------------------------------------------------------
export async function PATCH(request) {
  try {
    const formData = await request.formData();
    const recordId = formData.get('recordId'); // GHL Record ID
    const packagePayload = formData.get('packagePayload');

    if (!packagePayload) {
      return NextResponse.json({ error: 'Missing update payload' }, { status: 400 });
    }

    const parsedNewData = JSON.parse(packagePayload);
    const { backofficeData, ghlData } = splitPayload(parsedNewData);

    // Ensure Backoffice ID exists for the backoffice update
    if (!backofficeData.id) {
      return NextResponse.json({ error: 'Missing Backoffice ID in payload for update' }, { status: 400 });
    }

    // 1. Update Backoffice (Main Data)
    const boToken = await getBackofficeToken();
    const boUpdateEndpoint = `https://backoffice.ibimconsulting.com.au/api/update/package`;
    
    const boResponse = await fetch(boUpdateEndpoint, {
      method: 'POST', // Provided spec says Backoffice update uses POST
      headers: {
        'Authorization': `Bearer ${boToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backofficeData)
    });

    if (!boResponse.ok) {
      const boError = await boResponse.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to update Backoffice', details: boError }, { status: boResponse.status });
    }

    // 2. Update OR Create GHL (Supplemental Data)
    let ghlUpdateSuccess = true;
    let ghlErrorDetails = null;

    const customObjectId = "69bca8aea9a868c2ba27a4a6";
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const ghlToken = process.env.GROWTHMODE_ACCESS_TOKEN;

    // UPSERT LOGIC: If the package exists in BO but has no GHL record yet, CREATE it.
    if (!recordId || recordId === 'null' || recordId === 'undefined' || recordId === '') {
      console.warn(`⚠️ [GHL UPSERT] No 'recordId' found for package. Creating a NEW GHL record...`);
      
      const createEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records`;
      const createResponse = await fetch(createEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlToken}`,
          'Version': '2021-07-28',
          'Location-Id': locationId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: locationId, 
          properties: {
            "package_code": backofficeData.package_code || parsedNewData.packageCode,
            "data": JSON.stringify(ghlData) 
          }
        })
      });

      if (!createResponse.ok) {
        ghlUpdateSuccess = false;
        ghlErrorDetails = await createResponse.json();
        console.error(`❌ [GHL Create Failed] Status: ${createResponse.status}`);
        console.error(`❌ [GHL Error Details]:`, JSON.stringify(ghlErrorDetails, null, 2));
      } else {
        console.log(`✅ [GHL Create Success] Missing record was successfully created in CRM.`);
      }

    } else {
      // NORMAL UPDATE LOGIC (If recordId exists)
      const getEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${recordId}?locationId=${locationId}`;
      const getResponse = await fetch(getEndpoint, {
          headers: {
            'Authorization': `Bearer ${ghlToken}`,
            'Version': '2021-07-28',
            'Location-Id': locationId,
          }
      });

      if (!getResponse.ok) {
         const getError = await getResponse.text();
         console.error(`❌ [GHL GET Failed] Status: ${getResponse.status}`, getError);
      } else {
        const existingRecord = await getResponse.json();
        const existingProperties = existingRecord?.record?.properties || {};
        
        let existingPayload = {};
        try { existingPayload = JSON.parse(existingProperties.data || "{}"); } catch (e) {}

        const finalGhlPayload = {
          ...existingPayload, 
          ...ghlData
        };

        const updateEndpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/${recordId}?locationId=${locationId}`;
        const updateResponse = await fetch(updateEndpoint, {
            method: 'PUT', 
            headers: {
              'Authorization': `Bearer ${ghlToken}`,
              'Content-Type': 'application/json',
              'Version': '2021-07-28',
            },
            body: JSON.stringify({
              properties: {
                data: JSON.stringify(finalGhlPayload)
              }
            })
          }
        );

        if (!updateResponse.ok) {
          ghlUpdateSuccess = false;
          ghlErrorDetails = await updateResponse.json();
          console.error(`❌ [GHL Update Failed] Status: ${updateResponse.status}`);
          console.error(`❌ [GHL Error Details]:`, JSON.stringify(ghlErrorDetails, null, 2));
        } else {
          console.log(`✅ [GHL Update Success] Record ${recordId} updated.`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Package updated successfully!',
      ghlUpdateSuccess,
      ...(ghlErrorDetails && { ghlErrorDetails })
    });

  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// DELETE - Delete Package
// ----------------------------------------------------------------------
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('id'); // GHL Record ID

    // Note: Backoffice DELETE endpoint was not provided in spec. 
    // If Backoffice has a delete endpoint, it should be triggered here first before CRM deletion.

    if (!recordId) {
      return NextResponse.json({ error: 'Missing CRM record ID' }, { status: 400 });
    }

    const customObjectId = "69bca8aea9a868c2ba27a4a6"; 
    const locationId = "Dm5yFSciFNH7tur70UZU";
    const token = process.env.GROWTHMODE_ACCESS_TOKEN;

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
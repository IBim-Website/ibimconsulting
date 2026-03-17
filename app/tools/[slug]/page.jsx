// app/tools/[slug]/page.jsx
import ToolClient from './ToolClient';

// 1. Create a shared data fetching function
async function getProductData() {
  const customObjectId = "69a6d83eb206eb7c36275bd5";
  const locationId = "Dm5yFSciFNH7tur70UZU";
  const token = process.env.GROWTHMODE_ACCESS_TOKEN;

  // We hit GHL directly instead of hitting our own /api/products
  const endpoint = `https://services.leadconnectorhq.com/objects/${customObjectId}/records/search`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId: locationId,
      page: 1,
      pageLimit: 100 // Adjust as needed
    })
  });

  if (!response.ok) return [];
  const data = await response.json();
  return data.records || [];
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    // 2. Call the function directly instead of fetch(`${baseUrl}/api/products`)
    const fetchedRecords = await getProductData();
    
    const foundRecord = fetchedRecords.find(record => {
      const rawToolCode = record.properties.tool_code || "";
      return rawToolCode.toLowerCase().replace(/[_ ]+/g, '-') === slug;
    });

    if (foundRecord) {
      let parsedData = {};
      try { parsedData = JSON.parse(foundRecord.properties.data || "{}"); } catch(e) {}

      const name = parsedData.productName || "Structural Automation Tool";
      const rawDesc = parsedData.description || "";
      const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
      const imageUrl = foundRecord.properties.image?.[0]?.url || "";
      const categories = Array.isArray(parsedData.category) ? parsedData.category : [parsedData.category || "General"];

      return {
        title: `${name} | Structural Detailing Tools`,
        description: cleanDesc,
        keywords: [name, ...categories, "Tekla structures", "BIM plugins"].join(', '),
        openGraph: {
          title: name,
          description: cleanDesc,
          images: imageUrl ? [{ url: imageUrl }] : [],
        }
      };
    }
  } catch (error) {
    console.error("Metadata Error:", error);
  }

  return { title: 'Tool Not Found' };
}

export default async function ToolDetailsPage({ params }) {
  const resolvedParams = await params;
  return <ToolClient slug={resolvedParams.slug} />;
}
// app/tools/[slug]/page.jsx
import ToolClient from './ToolClient';

// CHANGED: Added await to params
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; 
  
  try {
    const response = await fetch(`${baseUrl}/api/products`);
    const result = await response.json();
    const fetchedRecords = result.records || [];
    
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

      const keywords = [
        name, 
        ...categories, 
        "Tekla structures", 
        "steel detailing automation", 
        "precast tools", 
        "BIM plugins"
      ];

      return {
        title: `${name} | Structural Detailing Tools`,
        description: cleanDesc,
        keywords: keywords.join(', '),
        openGraph: {
          title: name,
          description: cleanDesc,
          images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: name,
          description: cleanDesc,
          images: imageUrl ? [imageUrl] : [],
        }
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: 'Tool Not Found | Structural Detailing Tools',
    description: 'Explore our library of automation tools for structural steel and precast detailing.',
  };
}

// CHANGED: Made the component async and awaited the params
export default async function ToolDetailsPage({ params }) {
  const resolvedParams = await params;
  return <ToolClient slug={resolvedParams.slug} />;
}
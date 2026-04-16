export const exportToExcel = (products, filename = 'products_export.csv') => {
  // 1. Define the Excel headers
  const headers = [
    "Product Name", "Status", "Category", 
    "One Time Price", "Monthly Price", "Annual Price", "Single System Price", 
    "Act. One Time Price", "Act. Monthly Price", "Act. Annual Price", 
    "Youtube Link", "Download URL"
  ];

  // 2. Format the data rows
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add headers as first row

  products.forEach(product => {
    // Escape quotes and wrap text fields in quotes to handle commas inside the text (e.g., categories)
    const row = [
      `"${(product.productName || '').replace(/"/g, '""')}"`,
      `"${product.status || ''}"`,
      `"${(product.category || '').replace(/"/g, '""')}"`,
      product.oneTimePrice || '',
      product.monthlyPrice || '',
      product.annualPrice || '',
      product.singleSystemPrice || '',
      product.actualOneTimePrice || '',
      product.actualMonthlyPrice || '',
      product.actualAnnualPrice || '',
      `"${product.youtubeLink || ''}"`,
      `"${product.downloadUrl || ''}"`
    ];
    csvRows.push(row.join(','));
  });

  // 3. Create a Blob and trigger the browser download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
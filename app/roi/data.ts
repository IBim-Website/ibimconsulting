export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxS7v_zzUTnneTt2IdULA2KvACXYzpj6dsebLe8R6HIeXyy7jN25DhQY5G-2lltJt0/exec";

export interface Currency {
  flag: string;
  name: string;
  code: string;
  sym: string;
  xr: number;
  rMin: number;
  rMax: number;
  rDef: number;
}

export interface Category {
  min: number;
  def: number;
  invest: number;
  lbl: string;
  title: string;
  body: string;
}

export const CURRENCIES: Currency[] = [
  { flag: "🇦🇺", name: "Australia", code: "AUD", sym: "A$", xr: 1, rMin: 5, rMax: 500, rDef: 75 },
  { flag: "🇦🇪", name: "UAE", code: "AED", sym: "AED ", xr: 2.4, rMin: 5, rMax: 1300, rDef: 200 },
  { flag: "🇧🇪", name: "Belgium", code: "EUR", sym: "€", xr: 0.6125, rMin: 5, rMax: 300, rDef: 50 },
  { flag: "🇧🇷", name: "Brazil", code: "BRL", sym: "R$", xr: 3.375, rMin: 5, rMax: 1800, rDef: 250 },
  { flag: "🇨🇦", name: "Canada", code: "CAD", sym: "CA$", xr: 0.888, rMin: 5, rMax: 380, rDef: 60 },
  { flag: "🇩🇰", name: "Denmark", code: "DKK", sym: "kr ", xr: 4.5, rMin: 5, rMax: 2500, rDef: 400 },
  { flag: "🇫🇷", name: "France", code: "EUR", sym: "€", xr: 0.6125, rMin: 5, rMax: 300, rDef: 50 },
  { flag: "🇩🇪", name: "Germany", code: "EUR", sym: "€", xr: 0.6125, rMin: 5, rMax: 300, rDef: 52 },
  { flag: "🇮🇳", name: "India", code: "INR", sym: "₹", xr: 53.75, rMin: 5, rMax: 15000, rDef: 2000 },
  { flag: "🇮🇩", name: "Indonesia", code: "IDR", sym: "Rp", xr: 10250, rMin: 5, rMax: 5000000, rDef: 600000 },
  { flag: "🇮🇹", name: "Italy", code: "EUR", sym: "€", xr: 0.6125, rMin: 5, rMax: 300, rDef: 45 },
  { flag: "🇯🇵", name: "Japan", code: "JPY", sym: "¥", xr: 97.5, rMin: 5, rMax: 50000, rDef: 5000 },
  { flag: "🇲🇾", name: "Malaysia", code: "MYR", sym: "RM", xr: 3.0625, rMin: 5, rMax: 1600, rDef: 200 },
  { flag: "🇲🇽", name: "Mexico", code: "MXN", sym: "MX$", xr: 11.25, rMin: 5, rMax: 6000, rDef: 800 },
  { flag: "🇳🇱", name: "Netherlands", code: "EUR", sym: "€", xr: 0.6125, rMin: 5, rMax: 300, rDef: 55 },
  { flag: "🇳🇿", name: "New Zealand", code: "NZD", sym: "NZ$", xr: 1.1, rMin: 5, rMax: 550, rDef: 80 },
  { flag: "🇳🇴", name: "Norway", code: "NOK", sym: "kr ", xr: 7, rMin: 5, rMax: 3800, rDef: 550 },
  { flag: "🇵🇭", name: "Philippines", code: "PHP", sym: "₱", xr: 36.25, rMin: 5, rMax: 18000, rDef: 2000 },
  { flag: "🇵🇱", name: "Poland", code: "PLN", sym: "zł", xr: 2.625, rMin: 5, rMax: 1200, rDef: 150 },
  { flag: "🇵🇹", name: "Portugal", code: "EUR", sym: "€", xr: 0.6125, rMin: 5, rMax: 300, rDef: 40 },
  { flag: "🇸🇦", name: "Saudi Arabia", code: "SAR", sym: "SAR ", xr: 2.4375, rMin: 5, rMax: 1300, rDef: 200 },
  { flag: "🇸🇬", name: "Singapore", code: "SGD", sym: "S$", xr: 0.875, rMin: 5, rMax: 450, rDef: 65 },
  { flag: "🇿🇦", name: "South Africa", code: "ZAR", sym: "R", xr: 12, rMin: 5, rMax: 6000, rDef: 800 },
  { flag: "🇰🇷", name: "South Korea", code: "KRW", sym: "₩", xr: 875, rMin: 5, rMax: 450000, rDef: 50000 },
  { flag: "🇪🇸", name: "Spain", code: "EUR", sym: "€", xr: 0.6125, rMin: 5, rMax: 300, rDef: 42 },
  { flag: "🇸🇪", name: "Sweden", code: "SEK", sym: "kr ", xr: 6.875, rMin: 5, rMax: 3500, rDef: 500 },
  { flag: "🇨🇭", name: "Switzerland", code: "CHF", sym: "CHF ", xr: 0.5875, rMin: 5, rMax: 350, rDef: 80 },
  { flag: "🇹🇷", name: "Turkey", code: "TRY", sym: "₺", xr: 21, rMin: 5, rMax: 10000, rDef: 1500 },
  { flag: "🇬🇧", name: "United Kingdom", code: "GBP", sym: "£", xr: 0.52, rMin: 5, rMax: 280, rDef: 45 },
  { flag: "🇺🇸", name: "United States", code: "USD", sym: "US$", xr: 0.65, rMin: 5, rMax: 350, rDef: 55 },
  { flag: "🇻🇳", name: "Vietnam", code: "VND", sym: "₫", xr: 16500, rMin: 5, rMax: 8000000, rDef: 800000 },
];

export const SORTED_CURRENCIES: Currency[] = [
  CURRENCIES[0],
  ...CURRENCIES.slice(1).sort((a, b) => a.name.localeCompare(b.name)),
];

export const COUNTRIES: string[]= CURRENCIES.map(x=>x.name)

export const CATEGORIES: Record<string, Category> = {
  all: {
    min: 8, def: 15, invest: 749,
    lbl: "Manual Task Hours / Week",
    title: "🗂️ All Packages",
    body: "The All package delivers IBim's complete Tekla automation toolkit, spanning connections, drawing production, model checking, precast, steel, warehouse, and residential workflows. It is the ideal solution for multi-disciplined detailing businesses seeking to eliminate repetitive manual tasks across every project type. All future tools are automatically included at no extra cost, ensuring your toolkit grows with the industry.",
  },
  checking: {
    min: 5, def: 7, invest: 249,
    lbl: "Manual Checking Hours / Week",
    title: "✅ Checking",
    body: "IBim's Checking package delivers powerful quality control automation for both Tekla models and drawings, including dimension and part property checks, drawing content verification, and weld and bolt validation. Integrated with Tekla Excel Live Link, it enables fast, accurate model auditing that reduces costly errors before fabrication.",
  },
  drawing: {
    min: 6, def: 8, invest: 249,
    lbl: "Manual Drawing Hours / Week",
    title: "📐 Drawing",
    body: "This package automates Tekla's most time-intensive drawing tasks, including single part drawing generation, GA and shop drawing dimensioning, checking dimension placement, view alignment, and section view creation. It ensures shop and erection drawings are produced consistently, accurately, and to professional standards with minimal manual effort.",
  },
  precast: {
    min: 8, def: 15, invest: 649,
    lbl: "Manual Precast Hours / Week",
    title: "🏗️ Precast",
    body: "Designed for precast concrete detailers, this package automates panel modelling, sub-assembly component placement, erection sequence generation, casting drawing production, and model checking. It includes six drawing tools, two checking tools, a Transmittal Pack, and Tekla Excel Live Link for seamless data management.",
  },
  residential: {
    min: 8, def: 10, invest: 549,
    lbl: "Manual Residential Hours / Week",
    title: "🏠 Residential",
    body: "Purpose-built for residential detailing workflows in Tekla, this package includes optimised connection tools, drawing automation, and model checking tailored to residential project requirements. It provides a streamlined, ready-to-use toolkit that helps residential detailers reduce manual effort and deliver projects faster.",
  },
  steel: {
    min: 8, def: 8, invest: 649,
    lbl: "Manual Steel Detailing Hours / Week",
    title: "🔩 Steel Detailing",
    body: "The Steel package is a comprehensive automation solution for professional steel detailing businesses, covering 50+ common and steel-specific connections, residential tools, checking tools, drawing tools, miscellaneous utilities, and Tekla Excel Live Link. It is engineered to dramatically reduce modelling and drawing time across complex steel projects.",
  },
  warehouse: {
    min: 8, def: 15, invest: 649,
    lbl: "Manual Warehouse Hours / Week",
    title: "🏭 Warehouse",
    body: "IBim's Warehouse package streamlines the modelling of portal frames, truss connections, rod bracing, purlins, bracings, cladding, and sliding and roller door sheeting rails in Tekla Structures. It eliminates the repetitive element-by-element modelling that warehouse projects demand.",
  },
};

export const PACKAGE_OPTIONS = [
  { value: "all", label: "🗂️ All Packages — A$749" },
  { value: "checking", label: "✅ Checking — A$249" },
  { value: "drawing", label: "📐 Drawing — A$249" },
  { value: "precast", label: "🏗️ Precast — A$649" },
  { value: "residential", label: "🏠 Residential — A$549" },
  { value: "steel", label: "🔩 Steel Detailing — A$649" },
  { value: "warehouse", label: "🏭 Warehouse — A$649" },
];

export function convertInvest(basePrice: number, xr: number): number {
  return Math.round(basePrice * xr);
}

export function fmtFull(n: number, sym: string): string {
  return sym + Math.round(n).toLocaleString();
}

export function fmtShort(n: number, sym: string): string {
  if (Math.abs(n) >= 1e6) return sym + (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e4) return sym + Math.round(n / 1e3) + "k";
  return sym + Math.round(n).toLocaleString();
}

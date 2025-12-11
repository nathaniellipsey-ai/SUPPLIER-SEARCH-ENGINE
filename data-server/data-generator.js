// Seeded random number generator (for consistent data across sessions)
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const SEED = 1962; // Walmart's founding year

// 55+ Categories matching the frontend!
const categories = [
  'Personal Protective Equipment',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Steel & Metal',
  'Concrete & Cement',
  'Lumber & Wood',
  'Flooring',
  'Roofing Materials',
  'Windows & Doors',
  'Tools & Equipment',
  'Safety & Security Fixtures',
  'Insulation',
  'Paint & Coatings',
  'Fasteners & Hardware',
  'Lighting Fixtures',
  'Drywall & Gypsum',
  'Masonry',
  'Adhesives & Sealants',
  'Commercial Refrigeration',
  'Commercial Kitchen Equipment',
  'Retail Fixtures & Displays',
  'Material Handling Equipment',
  'Waste Management Systems',
  'Signage & Wayfinding',
  'Landscape & Site Work',
  'Emergency Power Systems',
  'Building Automation & Controls',
  'Janitorial Supplies',
  'Office Furniture',
  'Textiles & Fabrics',
  'Food & Beverage Supplies',
  'Packaging Materials',
  'Industrial Chemicals',
  'Cleaning Equipment',
  'HVAC Equipment',
  'Electrical Wiring',
  'Plumbing Fixtures',
  'Construction Hardware',
  'Safety Equipment',
  'Lumber Products',
  'Glass & Glazing',
  'Carpet & Rugs',
  'Tile & Stone',
  'Doors & Frames',
  'Cabinets & Storage',
  'Countertops',
  'Paint & Stain',
  'Outdoor Furniture',
  'Shelving Systems',
  'Lockers & Benches',
  'Ladders & Scaffolding',
  'Safety Signs',
  'First Aid Supplies',
  'Lighting Controls'
];

const baseSupplierNames = [
  'Advanced Industries', 'Alliance Group', 'Apex Manufacturing', 'Artistic Enterprises',
  'Atlas Corporation', 'Aurora Solutions', 'Axel Distributors', 'Beacon Industries',
  'Blue Sky Systems', 'Bravo Supply', 'Bright Future Co', 'Cardinal Distribution',
  'Catalyst Systems', 'Century Enterprises', 'Chrome Logistics', 'Citadel Supply',
  'Coastal Traders', 'Compass Solutions', 'Concord Industries', 'Conquest Corp',
  'Crown Distributors', 'Crystal Supply', 'Cubic Systems', 'Dagger Technologies',
  'Delta Supply', 'Diamond Distribution', 'Dimension Logistics', 'Direct Industries',
  'Distinction Corp', 'Dynamo Systems', 'Eagle Enterprises', 'East Coast Supply',
  'Elite Distribution', 'Emerald Group', 'Empire Logistics', 'Epic Systems',
  'Equity Supply', 'Essence Industries', 'Eternal Enterprises', 'Ether Corp',
  'Euphoria Group', 'Evolution Supply', 'Exalt Industries', 'Excellence Corp',
  'Excite Systems', 'Executive Distributors', 'Exemplar Supply', 'Falcon Industries',
  'Fathom Systems', 'Favor Enterprises', 'Federal Supply', 'Festival Group',
  'First Class Distributors', 'Fixture Solutions', 'Flagship Enterprises', 'Focus Industries'
];

const cities = [
  { city: 'San Francisco', state: 'CA' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Houston', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'New York', state: 'NY' },
  { city: 'Boston', state: 'MA' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Pittsburgh', state: 'PA' },
  { city: 'Washington', state: 'DC' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Memphis', state: 'TN' },
  { city: 'New Orleans', state: 'LA' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'St Paul', state: 'MN' },
  { city: 'Kansas City', state: 'MO' },
  { city: 'St Louis', state: 'MO' },
  { city: 'Indianapolis', state: 'IN' },
  { city: 'Detroit', state: 'MI' },
  { city: 'Cleveland', state: 'OH' },
  { city: 'Cincinnati', state: 'OH' },
  { city: 'Columbus', state: 'OH' },
  { city: 'Louisville', state: 'KY' },
  { city: 'Milwaukee', state: 'WI' },
  { city: 'Grand Rapids', state: 'MI' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'Long Beach', state: 'CA' },
];

const products = [
  'Hard Hats', 'Safety Glasses', 'Work Gloves', 'Steel Toe Boots',
  'High Visibility Vests', 'Respirators', 'Safety Harnesses',
  'Electrical Wire', 'Circuit Breakers', 'Power Distribution', 'LED Lighting',
  'Copper Pipes', 'PVC Fittings', 'Water Heaters', 'Drain Valves',
  'Air Handlers', 'Ductwork', 'Thermostats', 'Refrigerant',
  'Steel Beams', 'Steel Plates', 'Rebar', 'Metal Studs',
  'Concrete Mix', 'Portland Cement', 'Aggregate', 'Concrete Blocks',
  'Lumber', 'Plywood', 'Particle Board', 'MDF Sheets',
  'Tile Flooring', 'Vinyl Flooring', 'Carpet', 'Laminate',
  'Roofing Shingles', 'Metal Roofing', 'Roofing Felt', 'Flashing',
  'Windows', 'Doors', 'Door Frames', 'Window Frames',
  'Power Tools', 'Hand Tools', 'Tool Kits', 'Drill Bits',
  'Door Locks', 'Hinges', 'Latches', 'Handles',
  'Insulation Batts', 'Spray Foam', 'Foam Boards', 'Rigid Insulation',
  'Interior Paint', 'Exterior Paint', 'Primers', 'Clear Coats',
  'Screws', 'Bolts', 'Nuts', 'Washers',
  'Ceiling Lights', 'Wall Lights', 'Pendant Lights', 'Spotlights',
  'Drywall Sheets', 'Joint Compound', 'Drywall Tape', 'Primers',
  'Bricks', 'Mortar', 'Grout', 'Sealants'
];

const descriptions = [
  'Leading supplier of premium materials',
  'Trusted partner for manufacturing',
  'Specializing in bulk distribution',
  'Custom solutions for industry leaders',
  'Quality assured production facility',
  'ISO certified operations',
  'Serving Walmart since 2010',
  'Advanced supply chain capabilities',
  'Same-day delivery available',
  'Global sourcing expertise',
  'Competitive pricing on bulk orders',
  'Expert customer service team',
  'Rapid order fulfillment',
  'State-of-the-art warehousing',
  'Strategic distribution network',
  'Reliable delivery track record',
  'Dedicated account managers',
  'Flexible payment terms',
  'Sustainable sourcing practices',
  'Industry-leading quality standards'
];

const certifications = [
  ['ISO 9001', 'ISO 14001', 'OSHA Certified'],
  ['ISO 9001', 'LEED Certified'],
  ['ISO 9001', 'ANSI Certified'],
  ['ISO 9001'],
  ['ISO 9001', 'ISO 14001'],
  ['OSHA Certified'],
  ['LEED Certified', 'Green Business'],
  ['ISO 9001', 'OSHA Certified', 'ANSI Certified'],
  ['ISO 14001', 'Environmental Certified'],
  ['Industry Certified'],
];

export function generateSupplierData(count = 5000) {
  const rng = new SeededRandom(SEED);
  const suppliers_data = [];

  for (let i = 1; i <= count; i++) {
    const locationIndex = Math.floor(rng.next() * cities.length);
    const location = cities[locationIndex];
    
    const categoryIndex = Math.floor(rng.next() * categories.length);
    const category = categories[categoryIndex];
    
    const supplierNameIndex = Math.floor(rng.next() * baseSupplierNames.length);
    const supplierSuffix = Math.floor(rng.next() * 1000);
    const supplierName = `${baseSupplierNames[supplierNameIndex]} ${supplierSuffix}`;
    
    const productCount = Math.floor(rng.next() * 8) + 3;
    const selectedProducts = [];
    for (let j = 0; j < productCount; j++) {
      const productIndex = Math.floor(rng.next() * products.length);
      const product = products[productIndex];
      if (!selectedProducts.includes(product)) {
        selectedProducts.push(product);
      }
    }

    const certIndex = Math.floor(rng.next() * certifications.length);
    const certs = certifications[certIndex];
    
    suppliers_data.push({
      id: `SUP-${String(i).padStart(5, '0')}`,
      name: supplierName,
      category: category,
      location: `${location.city}, ${location.state}`,
      city: location.city,
      state: location.state,
      rating: parseFloat((rng.next() * 2 + 3).toFixed(2)), // 3.0 - 5.0
      reviews: Math.floor(rng.next() * 500) + 20,
      description: descriptions[Math.floor(rng.next() * descriptions.length)],
      products: selectedProducts,
      inStock: rng.next() > 0.15,
      stockLevel: Math.floor(rng.next() * 15000),
      minimumOrder: Math.floor(rng.next() * 500) + 50,
      leadTime: `${Math.floor(rng.next() * 14) + 1}-${Math.floor(rng.next() * 7) + 8} days`,
      certifications: certs,
      responseTime: `${Math.floor(rng.next() * 12) + 1} hours`,
      contractTerms: `${Math.floor(rng.next() * 24) + 12} months`,
      yearsInBusiness: Math.floor(rng.next() * 40) + 5,
      employees: Math.floor(rng.next() * 1000) + 50,
      website: `https://www.${supplierName.toLowerCase().replace(/\s+/g, '')}.com`,
      email: `info@${supplierName.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `${Math.floor(rng.next() * 900) + 200}-${Math.floor(rng.next() * 900) + 100}-${Math.floor(rng.next() * 9000) + 1000}`,
      lastUpdated: Date.now() - Math.floor(rng.next() * 7 * 24 * 60 * 60 * 1000),
      lastStockCheck: Date.now(),
      walmartVerified: rng.next() > 0.3,
      aiScore: Math.floor(rng.next() * 40) + 60, // 60-100
      verified: rng.next() > 0.1
    });
  }

  return suppliers_data;
}

export function getCategories() {
  return categories;
}

export function getStats(suppliers) {
  return {
    total: suppliers.length,
    inStock: suppliers.filter(s => s.inStock).length,
    verified: suppliers.filter(s => s.verified).length,
    walmartVerified: suppliers.filter(s => s.walmartVerified).length,
    averageRating: (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(2),
    categories: [...new Set(suppliers.map(s => s.category))].length,
    totalProducts: suppliers.reduce((sum, s) => sum + s.products.length, 0)
  };
}

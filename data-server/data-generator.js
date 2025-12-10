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
const categories = [
  'Construction Materials',
  'Electronics',
  'Textiles',
  'Food & Beverage',
  'Packaging',
  'Hardware',
  'Furniture',
  'Home & Garden'
];

const suppliers = [
  { name: 'TechCorp Industries', city: 'San Francisco', state: 'CA' },
  { name: 'Global Materials Ltd', city: 'Dallas', state: 'TX' },
  { name: 'Premium Textiles Inc', city: 'Charlotte', state: 'NC' },
  { name: 'Apex Manufacturing', city: 'Chicago', state: 'IL' },
  { name: 'Summit Supply Chain', city: 'Denver', state: 'CO' },
  { name: 'EliteGoods Distributors', city: 'Houston', state: 'TX' },
  { name: 'Quantum Logistics', city: 'Atlanta', state: 'GA' },
  { name: 'ValueMax Enterprises', city: 'Phoenix', state: 'AZ' },
  { name: 'Pinnacle Products', city: 'Miami', state: 'FL' },
  { name: 'Zenith Trading', city: 'Seattle', state: 'WA' },
  { name: 'ProSource Distribution', city: 'Boston', state: 'MA' },
  { name: 'Nexus Components', city: 'Austin', state: 'TX' },
  { name: 'Stellar Manufacturing', city: 'Portland', state: 'OR' },
  { name: 'Titan Industrial Group', city: 'Cleveland', state: 'OH' },
  { name: 'Horizon Supplies', city: 'Minneapolis', state: 'MN' }
];

const products = [
  'Steel Beams',
  'Concrete Mix',
  'Lumber & Wood',
  'Industrial Fasteners',
  'Electrical Components',
  'HVAC Systems',
  'Safety Equipment',
  'Tools & Hardware',
  'Packaging Materials',
  'Raw Textiles',
  'Electronic Modules',
  'Chemical Compounds',
  'Industrial Oils',
  'Sensors & Controls',
  'Custom Components'
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
  'Global sourcing expertise'
];

export function generateSupplierData(count = 150) {
  const rng = new SeededRandom(SEED);
  const suppliers_data = [];

  for (let i = 1; i <= count; i++) {
    const supplier = suppliers[Math.floor(rng.next() * suppliers.length)];
    const category = categories[Math.floor(rng.next() * categories.length)];
    const productCount = Math.floor(rng.next() * 5) + 1;
    const selectedProducts = [];
    
    for (let j = 0; j < productCount; j++) {
      selectedProducts.push(products[Math.floor(rng.next() * products.length)]);
    }

    suppliers_data.push({
      id: `SUP-${String(i).padStart(4, '0')}`,
      name: supplier.name,
      category: category,
      location: `${supplier.city}, ${supplier.state}`,
      rating: parseFloat((rng.next() * 2 + 3).toFixed(2)), // 3.0 - 5.0
      reviews: Math.floor(rng.next() * 1000) + 50,
      description: descriptions[Math.floor(rng.next() * descriptions.length)],
      products: selectedProducts,
      inStock: rng.next() > 0.2,
      stockLevel: Math.floor(rng.next() * 10000),
      minimumOrder: Math.floor(rng.next() * 100) + 10,
      leadTime: `${Math.floor(rng.next() * 14) + 1}-${Math.floor(rng.next() * 7) + 8} days`,
      certifications: [
        'ISO 9001',
        'ISO 14001',
        'OSHA Certified'
      ].filter(() => rng.next() > 0.3),
      responseTime: `${Math.floor(rng.next() * 12) + 1} hours`,
      contractTerms: `${Math.floor(rng.next() * 24) + 12} months`,
      lastUpdated: Date.now() - Math.floor(rng.next() * 7 * 24 * 60 * 60 * 1000),
      lastStockCheck: Date.now(),
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
    averageRating: (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(2),
    categories: [...new Set(suppliers.map(s => s.category))].length
  };
}

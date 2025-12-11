/**
 * Chatbot Service
 * Handles AI-powered Q&A for supplier navigation and info
 * Uses built-in knowledge + optional AI API
 */

// Navigation help database
const navigationHelp = {
  'how do i search': 'Use the search bar at the top to find suppliers by name, ID, or category.',
  'how do i add favorite': 'Click the star icon on any supplier card to add them to favorites.',
  'how do i see my favorites': 'Click "My Favorites" in the left sidebar to view all your saved suppliers.',
  'how do i add notes': 'Click a supplier to view details, then use the Notes section to add your own notes.',
  'how do i filter suppliers': 'Use the Category dropdown filter at the top to filter by supplier type.',
  'how do i navigate': 'Use the left sidebar to navigate between different sections: Dashboard, My Favorites, My Notes, and Inbox.',
  'what is inbox': 'Inbox shows messages and notifications from suppliers.',
  'how do i contact supplier': 'Click on a supplier to view their contact information.',
};

// Knowledge base for supplier info
function buildSupplierKnowledge(suppliers) {
  const knowledge = {};
  suppliers.forEach(supplier => {
    const key = supplier.name.toLowerCase();
    knowledge[key] = supplier;
  });
  return knowledge;
}

// Simple keyword extraction
function extractKeywords(text) {
  const cleaned = text.toLowerCase().trim();
  return cleaned.split(/\s+/);
}

// Search supplier knowledge
function searchSupplierKnowledge(query, suppliers) {
  const lowerQuery = query.toLowerCase();
  
  // Exact name match
  const exactMatch = suppliers.find(s => s.name.toLowerCase() === lowerQuery);
  if (exactMatch) return exactMatch;
  
  // Partial name match
  const partialMatch = suppliers.find(s => s.name.toLowerCase().includes(lowerQuery));
  if (partialMatch) return partialMatch;
  
  // Category match
  const categoryMatch = suppliers.filter(s => s.category.toLowerCase().includes(lowerQuery));
  if (categoryMatch.length > 0) return categoryMatch;
  
  return null;
}

// Format supplier info for chat
function formatSupplierResponse(supplier) {
  if (Array.isArray(supplier)) {
    // Multiple suppliers
    const list = supplier.map(s => `${s.name} (${s.category})`).join(', ');
    return `I found ${supplier.length} suppliers in that category: ${list}`;
  }
  
  // Single supplier
  return `
${supplier.name}
Category: ${supplier.category}
Rating: ${supplier.rating}/5.0
Location: ${supplier.location}
Contact: ${supplier.contact}
Website: ${supplier.website}
Description: ${supplier.description}
  `.trim();
}

// Main chatbot function
export async function chatbotResponse(userMessage, suppliers, useAI = false) {
  const message = userMessage.trim();
  
  if (!message) {
    return {
      success: false,
      message: 'Please ask me something!',
      suggestions: [
        'How do I search for suppliers?',
        'Tell me about electronics suppliers',
        'How do I add favorites?',
        'What suppliers are available?'
      ]
    };
  }
  
  // Check navigation help
  for (const [keyword, answer] of Object.entries(navigationHelp)) {
    if (message.toLowerCase().includes(keyword)) {
      return {
        success: true,
        message: answer,
        type: 'navigation',
        suggestions: [
          'How do I search?',
          'How do I add favorites?',
          'Tell me about a supplier'
        ]
      };
    }
  }
  
  // Check for supplier queries
  const keywords = extractKeywords(message);
  
  // Look for supplier mentions
  for (const keyword of keywords) {
    if (keyword.length > 2) {
      const result = searchSupplierKnowledge(keyword, suppliers);
      if (result) {
        return {
          success: true,
          message: formatSupplierResponse(result),
          type: 'supplier',
          suggestions: [
            'Tell me more about this supplier',
            'What other suppliers are available?',
            'How do I add this to favorites?'
          ]
        };
      }
    }
  }
  
  // Category filter - extract category from message
  if (message.toLowerCase().includes('supplier') || message.toLowerCase().includes('show')) {
    // Get all unique categories from suppliers
    const allCategories = [...new Set(suppliers.map(s => s.category))];
    
    // Check which categories match the user's query
    for (const category of allCategories) {
      const categoryLower = category.toLowerCase();
      const messageLower = message.toLowerCase();
      
      if (messageLower.includes(categoryLower) || 
          messageLower.includes(category.split(' ')[0].toLowerCase())) {
        const matching = suppliers.filter(s => s.category.toLowerCase().includes(categoryLower));
        if (matching.length > 0) {
          return {
            success: true,
            message: `I found ${matching.length} ${category} suppliers. Here are some: ${matching.slice(0, 3).map(s => s.name).join(', ')}`,
            type: 'supplier_list',
            suggestions: [
              `Show me all ${category} suppliers`,
              'Tell me about one of these',
              'Filter by category'
            ]
          };
        }
      }
    }
  }
  
  // Check for general questions
  if (message.toLowerCase().includes('what') || message.toLowerCase().includes('how') || message.toLowerCase().includes('tell')) {
    return {
      success: true,
      message: `I can help you with:\n- Searching for suppliers\n- Finding suppliers by category\n- Navigation help\n- Supplier information\n\nWhat would you like to know?`,
      type: 'help',
      suggestions: [
        'How do I search?',
        'Show me electronics suppliers',
        'How do I add favorites?',
        'What suppliers do you have?'
      ]
    };
  }
  
  // Fallback
  return {
    success: true,
    message: `I didn't quite understand that. I can help you with:\n- Finding suppliers by name or category\n- Navigation tips\n- Supplier information\n\nTry asking: "Show me electronics suppliers" or "How do I add favorites?"`,
    type: 'fallback',
    suggestions: [
      'Show me all suppliers',
      'How do I search?',
      'Tell me about a specific supplier',
      'How do I navigate the portal?'
    ]
  };
}

// Optional: Call external AI API (OpenAI, etc.)
// To use, install node-fetch and set OPENAI_API_KEY environment variable
export async function callAIAPI(userMessage, context = {}) {
  // AI API support disabled by default to avoid dependency issues
  // To enable: npm install node-fetch, set OPENAI_API_KEY env var
  return null;
}

export default {
  chatbotResponse,
  callAIAPI,
  buildSupplierKnowledge
};

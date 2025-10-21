const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
const stringStore = new Map();

// Helper functions
function computeSHA256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

function countUniqueCharacters(str) {
  return new Set(str).size;
}

function countWords(str) {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function getCharacterFrequencyMap(str) {
  const frequencyMap = {};
  for (const char of str) {
    frequencyMap[char] = (frequencyMap[char] || 0) + 1;
  }
  return frequencyMap;
}

function analyzeString(value) {
  return {
    length: value.length,
    is_palindrome: isPalindrome(value),
    unique_characters: countUniqueCharacters(value),
    word_count: countWords(value),
    sha256_hash: computeSHA256(value),
    character_frequency_map: getCharacterFrequencyMap(value)
  };
}

function parseNaturalLanguageQuery(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Parse word count
  if (lowerQuery.includes('single word')) {
    filters.word_count = 1;
  }
  const wordCountMatch = lowerQuery.match(/(\d+)\s+words?/);
  if (wordCountMatch) {
    filters.word_count = parseInt(wordCountMatch[1]);
  }

  // Parse palindrome
  if (lowerQuery.includes('palindrom')) {
    filters.is_palindrome = true;
  }

  // Parse length constraints
  const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerThanMatch) {
    filters.min_length = parseInt(longerThanMatch[1]) + 1;
  }
  const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterThanMatch) {
    filters.max_length = parseInt(shorterThanMatch[1]) - 1;
  }

  // Parse character containment
  const containsMatch = lowerQuery.match(/contain(?:ing|s)?\s+(?:the\s+)?(?:letter\s+)?([a-z])/);
  if (containsMatch) {
    filters.contains_character = containsMatch[1];
  }

  // Parse first vowel
  if (lowerQuery.includes('first vowel')) {
    filters.contains_character = 'a';
  }

  return filters;
}

function applyFilters(stringData, filters) {
  let results = Array.from(stringStore.values());

  if (filters.is_palindrome !== undefined) {
    const isPalin = filters.is_palindrome === 'true' || filters.is_palindrome === true;
    results = results.filter(item => item.properties.is_palindrome === isPalin);
  }

  if (filters.min_length !== undefined) {
    const minLen = parseInt(filters.min_length);
    results = results.filter(item => item.properties.length >= minLen);
  }

  if (filters.max_length !== undefined) {
    const maxLen = parseInt(filters.max_length);
    results = results.filter(item => item.properties.length <= maxLen);
  }

  if (filters.word_count !== undefined) {
    const wordCount = parseInt(filters.word_count);
    results = results.filter(item => item.properties.word_count === wordCount);
  }

  if (filters.contains_character !== undefined) {
    const char = filters.contains_character;
    results = results.filter(item => item.value.includes(char));
  }

  return results;
}

// Routes
// 1. Create/Analyze String
app.post('/strings', (req, res) => {
  const { value } = req.body;

  // Validation
  if (value === undefined || value === null) {
    return res.status(400).json({ error: 'Missing "value" field' });
  }

  if (typeof value !== 'string') {
    return res.status(422).json({ error: 'Invalid data type for "value" (must be string)' });
  }

  // Check if string already exists
  const sha256Hash = computeSHA256(value);
  if (stringStore.has(value)) {
    return res.status(409).json({ error: 'String already exists in the system' });
  }

  // Analyze and store
  const properties = analyzeString(value);
  const stringData = {
    id: sha256Hash,
    value: value,
    properties: properties,
    created_at: new Date().toISOString()
  };

  stringStore.set(value, stringData);

  res.status(201).json(stringData);
});

// 2. Get Specific String
app.get('/strings/:string_value', (req, res) => {
  const { string_value } = req.params;
  const decodedValue = decodeURIComponent(string_value);

  const stringData = stringStore.get(decodedValue);

  if (!stringData) {
    return res.status(404).json({ error: 'String does not exist in the system' });
  }

  res.status(200).json(stringData);
});

// 4. Natural Language Filtering (must come before generic /strings route)
app.get('/strings/filter-by-natural-language', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const parsedFilters = parseNaturalLanguageQuery(query);
    
    if (Object.keys(parsedFilters).length === 0) {
      return res.status(400).json({ error: 'Unable to parse natural language query' });
    }

    const results = applyFilters(stringStore, parsedFilters);

    res.status(200).json({
      data: results,
      count: results.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Unable to parse natural language query' });
  }
});

// 3. Get All Strings with Filtering
app.get('/strings', (req, res) => {
  try {
    const filters = { ...req.query };

    // Validate filter types
    if (filters.is_palindrome && !['true', 'false'].includes(filters.is_palindrome)) {
      return res.status(400).json({ error: 'Invalid value for is_palindrome parameter' });
    }

    if (filters.min_length && isNaN(parseInt(filters.min_length))) {
      return res.status(400).json({ error: 'Invalid value for min_length parameter' });
    }

    if (filters.max_length && isNaN(parseInt(filters.max_length))) {
      return res.status(400).json({ error: 'Invalid value for max_length parameter' });
    }

    if (filters.word_count && isNaN(parseInt(filters.word_count))) {
      return res.status(400).json({ error: 'Invalid value for word_count parameter' });
    }

    const results = applyFilters(stringStore, filters);

    res.status(200).json({
      data: results,
      count: results.length,
      filters_applied: filters
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid query parameters' });
  }
});

// 5. Delete String
app.delete('/strings/:string_value', (req, res) => {
  const { string_value } = req.params;
  const decodedValue = decodeURIComponent(string_value);

  if (!stringStore.has(decodedValue)) {
    return res.status(404).json({ error: 'String does not exist in the system' });
  }

  stringStore.delete(decodedValue);
  res.status(204).send();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'String Analyzer API is running',
    endpoints: {
      'POST /strings': 'Create/analyze a string',
      'GET /strings/:string_value': 'Get specific string',
      'GET /strings': 'Get all strings with optional filters',
      'GET /strings/filter-by-natural-language': 'Natural language filtering',
      'DELETE /strings/:string_value': 'Delete a string'
    }
  });
});

app.listen(PORT, () => {
  console.log(`String Analyzer API running on port ${PORT}`);
});

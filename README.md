# backend-wizards-stage1
# String Analyzer API

A RESTful API service that analyzes strings and stores their computed properties including length, palindrome detection, unique character count, word count, SHA-256 hash, and character frequency mapping.

## Features

- ✅ Create and analyze strings with automatic property computation
- ✅ Retrieve specific strings by value
- ✅ Filter strings using multiple query parameters
- ✅ Natural language query support
- ✅ Delete strings from the system
- ✅ SHA-256 hash-based unique identification
- ✅ Comprehensive error handling

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Storage**: In-memory (Map data structure)
- **Deployment**: Railway / Heroku / AWS

## API Endpoints

### 1. Create/Analyze String
```http
POST /strings
Content-Type: application/json

{
  "value": "string to analyze"
}
```

**Response (201 Created)**:
```json
{
  "id": "sha256_hash_value",
  "value": "string to analyze",
  "properties": {
    "length": 17,
    "is_palindrome": false,
    "unique_characters": 12,
    "word_count": 3,
    "sha256_hash": "abc123...",
    "character_frequency_map": {
      "s": 2,
      "t": 3,
      "r": 2
    }
  },
  "created_at": "2025-08-27T10:00:00Z"
}
```

### 2. Get Specific String
```http
GET /strings/{string_value}
```

### 3. Get All Strings with Filtering
```http
GET /strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a
```

**Query Parameters**:
- `is_palindrome`: boolean (true/false)
- `min_length`: integer
- `max_length`: integer
- `word_count`: integer
- `contains_character`: single character

### 4. Natural Language Filtering
```http
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

**Example Queries**:
- "all single word palindromic strings"
- "strings longer than 10 characters"
- "palindromic strings that contain the first vowel"
- "strings containing the letter z"

### 5. Delete String
```http
DELETE /strings/{string_value}
```

## Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Olu433/string-analyzer-api 
cd string-analyzer-api 
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` by default.

### Environment Variables

Create a `.env` file (optional):
```env
PORT=3000
```

## Testing the API

### Using cURL

**Create a string**:
```bash
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}'
```

**Get a string**:
```bash
curl http://localhost:3000/strings/racecar
```

**Get all strings with filters**:
```bash
curl "http://localhost:3000/strings?is_palindrome=true&word_count=1"
```

**Natural language query**:
```bash
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"
```

**Delete a string**:
```bash
curl -X DELETE http://localhost:3000/strings/racecar
```

### Using Postman

1. Import the API endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. Test each endpoint with sample data

## Deployment

### Railway Deployment

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

3. **Login and deploy**:
```bash
railway login
railway init
railway up
```

4. **Get your deployment URL**:
```bash
railway domain
```

### Alternative: Heroku Deployment

1. **Create a Heroku account** at [heroku.com](https://heroku.com)

2. **Install Heroku CLI** and login:
```bash
heroku login
```

3. **Create and deploy**:
```bash
heroku create your-app-name
git push heroku main
```

## Project Structure

```
string-analyzer-api/
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Invalid data type

## Dependencies

- **express**: Web framework for Node.js
- **cors**: Enable CORS for cross-origin requests
- **crypto**: Built-in Node.js module for SHA-256 hashing

## Development

For development with auto-reload:
```bash
npm run dev
```

## Notes

- This implementation uses in-memory storage. Data will be lost on server restart.
- For production, consider using a database (PostgreSQL, MongoDB, etc.)
- The API supports URL-encoded string values in GET/DELETE requests
- Natural language parsing supports common patterns but may need extension for complex queries

## Author

Awe Caleb

## License

MIT

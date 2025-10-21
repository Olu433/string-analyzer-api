// Simple test file to verify API functionality
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting String Analyzer API Tests\n');
  
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Create a string
  try {
    console.log('Test 1: POST /strings - Create a palindrome');
    const response = await fetch(`${BASE_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'racecar' })
    });
    
    const data = await response.json();
    
    if (response.status === 201 && 
        data.value === 'racecar' && 
        data.properties.is_palindrome === true &&
        data.properties.word_count === 1) {
      console.log('✅ PASSED: String created successfully\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Unexpected response\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 2: Try to create duplicate string
  try {
    console.log('Test 2: POST /strings - Try creating duplicate');
    const response = await fetch(`${BASE_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'racecar' })
    });
    
    if (response.status === 409) {
      console.log('✅ PASSED: Correctly rejected duplicate\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Should return 409 Conflict\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 3: Get specific string
  try {
    console.log('Test 3: GET /strings/racecar - Retrieve string');
    const response = await fetch(`${BASE_URL}/strings/racecar`);
    const data = await response.json();
    
    if (response.status === 200 && data.value === 'racecar') {
      console.log('✅ PASSED: String retrieved successfully\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Could not retrieve string\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 4: Create more test strings
  try {
    console.log('Test 4: Creating multiple test strings');
    await fetch(`${BASE_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'hello world' })
    });
    
    await fetch(`${BASE_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'a' })
    });
    
    console.log('✅ PASSED: Additional strings created\n');
    passedTests++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 5: Get all strings with filter
  try {
    console.log('Test 5: GET /strings?is_palindrome=true - Filter by palindrome');
    const response = await fetch(`${BASE_URL}/strings?is_palindrome=true`);
    const data = await response.json();
    
    if (response.status === 200 && 
        data.count >= 2 && 
        data.data.every(item => item.properties.is_palindrome === true)) {
      console.log('✅ PASSED: Filter working correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Filter not working as expected\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 6: Natural language query
  try {
    console.log('Test 6: GET /strings/filter-by-natural-language - Natural language query');
    const response = await fetch(
      `${BASE_URL}/strings/filter-by-natural-language?query=all single word palindromic strings`
    );
    const data = await response.json();
    
    if (response.status === 200 && 
        data.interpreted_query.parsed_filters.is_palindrome === true &&
        data.interpreted_query.parsed_filters.word_count === 1) {
      console.log('✅ PASSED: Natural language parsing works\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Natural language query failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 7: Invalid request (missing value)
  try {
    console.log('Test 7: POST /strings - Invalid request without value');
    const response = await fetch(`${BASE_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (response.status === 400) {
      console.log('✅ PASSED: Correctly rejected invalid request\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Should return 400 Bad Request\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 8: Invalid data type
  try {
    console.log('Test 8: POST /strings - Invalid data type (number instead of string)');
    const response = await fetch(`${BASE_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 12345 })
    });
    
    if (response.status === 422) {
      console.log('✅ PASSED: Correctly rejected invalid data type\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Should return 422 Unprocessable Entity\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 9: Delete string
  try {
    console.log('Test 9: DELETE /strings/hello%20world - Delete string');
    const response = await fetch(`${BASE_URL}/strings/hello%20world`, {
      method: 'DELETE'
    });
    
    if (response.status === 204) {
      console.log('✅ PASSED: String deleted successfully\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Delete operation failed\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Test 10: Get non-existent string
  try {
    console.log('Test 10: GET /strings/nonexistent - Get non-existent string');
    const response = await fetch(`${BASE_URL}/strings/nonexistent`);
    
    if (response.status === 404) {
      console.log('✅ PASSED: Correctly returned 404\n');
      passedTests++;
    } else {
      console.log('❌ FAILED: Should return 404 Not Found\n');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    failedTests++;
  }

  // Summary
  console.log('='.repeat(50));
  console.log(`\n📊 Test Summary:`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Total: ${passedTests + failedTests}`);
  console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`);
  
  process.exit(failedTests > 0 ? 1 : 0);
}

runTests();

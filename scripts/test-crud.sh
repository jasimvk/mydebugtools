#!/bin/bash

# Test CRUD Operations for Collections and Requests
# Run this after signing in to test if everything works

echo "🧪 Testing CRUD Operations..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Note: You need to be signed in and have a valid session cookie
echo "${YELLOW}Note: You must be signed in first!${NC}"
echo "1. Go to http://localhost:3000/tools/api"
echo "2. Sign in with Google"
echo "3. Then run this script"
echo ""
read -p "Press Enter when you're signed in..."

BASE_URL="http://localhost:3000"

echo ""
echo "📝 Test 1: GET Collections (should return empty array or existing collections)"
COLLECTIONS=$(curl -s -b cookies.txt "$BASE_URL/api/collections")
echo "Response: $COLLECTIONS"

if echo "$COLLECTIONS" | grep -q "Unauthorized"; then
    echo "${RED}❌ Test 1 Failed: Not authorized. Please sign in first!${NC}"
    echo ""
    echo "To get cookies:"
    echo "1. Sign in at http://localhost:3000/tools/api"
    echo "2. Open DevTools (F12) → Application → Cookies"
    echo "3. Copy the 'next-auth.session-token' cookie"
    echo "4. Create cookies.txt file with:"
    echo "   localhost:3000	FALSE	/	FALSE	0	next-auth.session-token	YOUR_TOKEN_HERE"
    exit 1
fi

echo "${GREEN}✅ Test 1 Passed${NC}"
echo ""

echo "📝 Test 2: CREATE Collection"
CREATE_RESPONSE=$(curl -s -b cookies.txt -X POST "$BASE_URL/api/collections" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Collection","description":"Testing CRUD","color":"#FF6C37"}')

echo "Response: $CREATE_RESPONSE"

if echo "$CREATE_RESPONSE" | grep -q "id"; then
    COLLECTION_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "${GREEN}✅ Test 2 Passed - Collection ID: $COLLECTION_ID${NC}"
else
    echo "${RED}❌ Test 2 Failed${NC}"
    echo "$CREATE_RESPONSE"
    exit 1
fi

echo ""
echo "📝 Test 3: CREATE Request in Collection"
REQUEST_RESPONSE=$(curl -s -b cookies.txt -X POST "$BASE_URL/api/requests" \
  -H "Content-Type: application/json" \
  -d "{\"collectionId\":\"$COLLECTION_ID\",\"name\":\"Test Request\",\"method\":\"GET\",\"url\":\"https://api.example.com/test\",\"headers\":[],\"body\":\"\",\"authConfig\":{\"type\":\"none\"},\"description\":\"Test request\"}")

echo "Response: $REQUEST_RESPONSE"

if echo "$REQUEST_RESPONSE" | grep -q "id"; then
    REQUEST_ID=$(echo "$REQUEST_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "${GREEN}✅ Test 3 Passed - Request ID: $REQUEST_ID${NC}"
else
    echo "${RED}❌ Test 3 Failed${NC}"
    echo "$REQUEST_RESPONSE"
    exit 1
fi

echo ""
echo "📝 Test 4: GET Collections (should now include the new collection)"
COLLECTIONS_WITH_NEW=$(curl -s -b cookies.txt "$BASE_URL/api/collections")
echo "Response: $COLLECTIONS_WITH_NEW"

if echo "$COLLECTIONS_WITH_NEW" | grep -q "Test Collection"; then
    echo "${GREEN}✅ Test 4 Passed${NC}"
else
    echo "${RED}❌ Test 4 Failed - Collection not found in list${NC}"
    exit 1
fi

echo ""
echo "📝 Test 5: DELETE Request"
DELETE_REQUEST_RESPONSE=$(curl -s -b cookies.txt -X DELETE "$BASE_URL/api/requests?id=$REQUEST_ID")
echo "Response: $DELETE_REQUEST_RESPONSE"

if echo "$DELETE_REQUEST_RESPONSE" | grep -q "success"; then
    echo "${GREEN}✅ Test 5 Passed${NC}"
else
    echo "${RED}❌ Test 5 Failed${NC}"
    exit 1
fi

echo ""
echo "📝 Test 6: DELETE Collection"
DELETE_COLLECTION_RESPONSE=$(curl -s -b cookies.txt -X DELETE "$BASE_URL/api/collections?id=$COLLECTION_ID")
echo "Response: $DELETE_COLLECTION_RESPONSE"

if echo "$DELETE_COLLECTION_RESPONSE" | grep -q "success"; then
    echo "${GREEN}✅ Test 6 Passed${NC}"
else
    echo "${RED}❌ Test 6 Failed${NC}"
    exit 1
fi

echo ""
echo "${GREEN}🎉 All CRUD tests passed!${NC}"
echo ""
echo "Summary:"
echo "✅ GET Collections - Working"
echo "✅ CREATE Collection - Working"
echo "✅ CREATE Request - Working"
echo "✅ DELETE Request - Working"
echo "✅ DELETE Collection - Working"

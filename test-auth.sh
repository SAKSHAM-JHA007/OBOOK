#!/bin/bash
# OBOOK Debugging Script
# Run this to test signup and login functionality

echo "=== OBOOK Auth Testing Guide ==="
echo ""

# Test 1: Verify server is running
echo "Test 1: Check if server is running..."
curl -s http://localhost:3000/api | jq .
echo ""

# Test 2: Test signup
echo "Test 2: Test Signup Endpoint"
echo "Creating user: testuser@example.com"
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123"
  }' | jq .
echo ""

# Test 3: Test login
echo "Test 3: Test Login Endpoint"
echo "Logging in with: testuser@example.com"
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }' | jq .
echo ""

# Test 4: Test posts endpoint
echo "Test 4: Test Posts API"
curl http://localhost:3000/api/posts -b cookies.txt | jq .
echo ""

echo "=== Testing Complete ==="

#!/bin/bash

curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Ali", "lastName": "Test", "email": "ali@test.com", "password": "MyPass123"}' | jq
#!/bin/bash

curl -X PUT -i http://localhost:3000/profiles/e795a898-749a-493a-a229-934d8223804f \
  -H "Content-Type: application/json" \
  -d '{"name": "ali", "description": "chi haja khra"}' ; echo

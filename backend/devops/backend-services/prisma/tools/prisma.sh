#!/bin/sh

set -eu

npm install -g prisma @types/node @types/pg --save-dev 
npm install @prisma/client @prisma/adapter-pg pg dotenv

exec 
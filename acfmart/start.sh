#!/bin/bash
echo "Starting ACFMart application..."
git pull origin main
npm install
npm run dev

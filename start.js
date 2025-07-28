#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('=== Startup Script Debug Info ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Process argv:', process.argv);

// Check if main.js exists
const mainPath = path.join(__dirname, 'dist', 'main.js');
console.log('Looking for main.js at:', mainPath);
console.log('File exists:', fs.existsSync(mainPath));

if (fs.existsSync(mainPath)) {
  console.log('Starting application...');
  require(mainPath);
} else {
  console.error('main.js not found at:', mainPath);
  console.log('Listing current directory:');
  fs.readdirSync(__dirname).forEach(file => {
    console.log('-', file);
  });
  
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('Listing dist directory:');
    fs.readdirSync(distPath).forEach(file => {
      console.log('- dist/', file);
    });
  }
  process.exit(1);
} 
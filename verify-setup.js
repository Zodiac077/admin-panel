#!/usr/bin/env node

/**
 * MongoDB Atlas Admin Panel - Installation Verification Script
 * Run: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  MongoDB Atlas Admin Panel - Setup Verification          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checks = {
  'project_files': {
    name: 'Project Files',
    items: {
      'package.json': 'package.json',
      'server.js': 'server.js',
      'src/components/AdminPanel.tsx': 'src/components/AdminPanel.tsx',
      'src/components/AdminLogin.tsx': 'src/components/AdminLogin.tsx',
    }
  },
  'documentation': {
    name: 'Documentation Files',
    items: {
      'START_HERE.md': 'START_HERE.md',
      'QUICK_REFERENCE.md': 'QUICK_REFERENCE.md',
      'SETUP_CHECKLIST.md': 'SETUP_CHECKLIST.md',
      'MONGODB_SETUP.md': 'MONGODB_SETUP.md',
      'MONGODB_COMPLETE_GUIDE.md': 'MONGODB_COMPLETE_GUIDE.md',
      'ARCHITECTURE.md': 'ARCHITECTURE.md',
    }
  },
  'configuration': {
    name: 'Configuration Files',
    items: {
      '.env.example': '.env.example',
      '.gitignore': '.gitignore',
    }
  },
};

let totalPass = 0;
let totalFail = 0;

// Check files
Object.entries(checks).forEach(([category, data]) => {
  console.log(`\n📁 ${data.name}`);
  console.log('─'.repeat(40));

  Object.entries(data.items).forEach(([display, filePath]) => {
    const fullPath = path.join(__dirname, filePath);
    const exists = fs.existsSync(fullPath);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${display}`);
    if (exists) totalPass++; else totalFail++;
  });
});

// Check environment
console.log(`\n🔧 Environment Setup`);
console.log('─'.repeat(40));

const envExists = fs.existsSync(path.join(__dirname, '.env'));
const envStatus = envExists ? '✅' : '⚠️';
console.log(`  ${envStatus} .env file${envExists ? '' : ' (Not yet created - run setup)'}`);

// Check package.json dependencies
console.log(`\n📦 Dependencies Installed`);
console.log('─'.repeat(40));

try {
  const packageJson = require(path.join(__dirname, 'package.json'));
  const requiredDeps = {
    'mongoose': 'mongodb-odm',
    'dotenv': 'env-config',
    'express': 'api-framework',
    'cors': 'cors-middleware',
  };

  Object.entries(requiredDeps).forEach(([dep, desc]) => {
    const exists = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${dep} (${desc})`);
    if (exists) totalPass++; else totalFail++;
  });
} catch (err) {
  console.log(`  ❌ Could not read package.json`);
  totalFail++;
}

// Summary
console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║  Setup Status                                              ║`);
console.log(`╚════════════════════════════════════════════════════════════╝\n`);

const total = totalPass + totalFail;
const percentage = ((totalPass / total) * 100).toFixed(0);

console.log(`  ✅ Passed: ${totalPass}`);
console.log(`  ❌ Failed: ${totalFail}`);
console.log(`  📊 Overall: ${percentage}%\n`);

if (totalFail === 0 && !envExists) {
  console.log('✨ All files in place! Next steps:\n');
  console.log('  1. Create .env file in project root');
  console.log('  2. Add your MongoDB Atlas connection string');
  console.log('  3. Run: npm run server\n');
} else if (totalFail === 0 && envExists) {
  console.log('🎉 Setup Complete! You\'re ready to run the application!\n');
  console.log('  Start the backend:  npm run server');
  console.log('  Start the frontend: npm run dev\n');
} else if (totalFail > 0) {
  console.log('⚠️  Some files are missing. Please run:\n');
  console.log('  npm install\n');
}

// Additional checks
console.log('─'.repeat(60));
console.log('\n📋 Next: Read "START_HERE.md" for quick setup guide!\n');

process.exit(totalFail > 0 ? 1 : 0);

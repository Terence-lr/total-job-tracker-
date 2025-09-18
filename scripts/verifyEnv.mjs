#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * This script verifies that all required environment variables are present
 * before building the application. It will fail the build if any required
 * variables are missing.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Required environment variables
const REQUIRED_ENV_VARS = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY'
];

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = join(projectRoot, '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error loading .env file:', error.message);
    return {};
  }
}

// Check if environment variables are set
function verifyEnvironmentVariables() {
  console.log('🔍 Verifying environment variables...\n');
  
  const envVars = loadEnvFile();
  const missingVars = [];
  const invalidVars = [];
  
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName] || envVars[varName];
    
    if (!value) {
      missingVars.push(varName);
      console.log(`❌ Missing: ${varName}`);
    } else if (value.includes('your-') || value.includes('here')) {
      invalidVars.push(varName);
      console.log(`❌ Invalid placeholder value: ${varName}`);
    } else {
      console.log(`✅ Found: ${varName}`);
    }
  });
  
  console.log('');
  
  if (missingVars.length > 0) {
    console.error('❌ Build failed: Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file or environment.');
    process.exit(1);
  }
  
  if (invalidVars.length > 0) {
    console.error('❌ Build failed: Invalid environment variable values:');
    invalidVars.forEach(varName => {
      console.error(`   - ${varName} (contains placeholder value)`);
    });
    console.error('\nPlease replace placeholder values with actual Supabase configuration.');
    process.exit(1);
  }
  
  console.log('✅ All environment variables are properly configured!');
  console.log('🚀 Ready to build and deploy.');
}

// Run verification
verifyEnvironmentVariables();

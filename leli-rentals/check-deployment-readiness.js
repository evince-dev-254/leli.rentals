#!/usr/bin/env node

/**
 * Deployment Readiness Checker
 * Checks for common issues before deploying to Vercel
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const issues = []
const warnings = []
const success = []

console.log('🔍 Checking deployment readiness...\n')

// 1. Check for .env.local
console.log('📋 Checking environment configuration...')
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  success.push('✅ .env.local file exists')
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
  ]
  
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName) && !envContent.includes(`${varName}=your_`)) {
      success.push(`✅ ${varName} is configured`)
    } else if (envContent.includes(varName)) {
      warnings.push(`⚠️ ${varName} appears to have placeholder value`)
    } else {
      issues.push(`❌ ${varName} is missing`)
    }
  })
} else {
  issues.push('❌ .env.local file not found - run create-env-file.bat')
}

// 2. Check proxy.ts for commented code
console.log('\n📋 Checking middleware/proxy...')
const proxyPath = path.join(__dirname, 'proxy.ts')
if (fs.existsSync(proxyPath)) {
  const proxyContent = fs.readFileSync(proxyPath, 'utf8')
  
  if (proxyContent.includes('TEMPORARILY DISABLED')) {
    warnings.push('⚠️ proxy.ts has disabled authentication checks - enable for production')
  } else {
    success.push('✅ proxy.ts authentication checks are enabled')
  }
  
  if (proxyContent.includes('clerkMiddleware')) {
    success.push('✅ Using clerkMiddleware (Next.js 16 compatible)')
  }
} else {
  issues.push('❌ proxy.ts file not found')
}

// 3. Check next.config.mjs
console.log('\n📋 Checking Next.js configuration...')
const configPath = path.join(__dirname, 'next.config.mjs')
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8')
  
  if (configContent.includes('ignoreBuildErrors: true')) {
    warnings.push('⚠️ TypeScript build errors are ignored - fix them for production')
  }
  
  if (configContent.includes('ignoreDuringBuilds: true')) {
    warnings.push('⚠️ ESLint errors are ignored - fix them for production')
  }
  
  if (configContent.includes('unoptimized: true')) {
    warnings.push('⚠️ Image optimization is disabled - consider enabling for production')
  }
  
  if (configContent.includes('trailingSlash: true')) {
    warnings.push('⚠️ Trailing slashes required - all URLs must end with /')
  }
  
  success.push('✅ next.config.mjs found')
} else {
  issues.push('❌ next.config.mjs not found')
}

// 4. Check package.json
console.log('\n📋 Checking dependencies...')
const packagePath = path.join(__dirname, 'package.json')
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  const requiredDeps = [
    '@clerk/nextjs',
    '@supabase/supabase-js',
    'next',
    'react',
    'react-dom'
  ]
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      success.push(`✅ ${dep} is installed`)
    } else {
      issues.push(`❌ ${dep} is missing`)
    }
  })
  
  // Check Next.js version
  const nextVersion = packageJson.dependencies.next
  if (nextVersion.includes('16')) {
    success.push('✅ Using Next.js 16')
    warnings.push('⚠️ Next.js 16: Ensure params are awaited in all dynamic routes')
  }
} else {
  issues.push('❌ package.json not found')
}

// 5. Check for dynamic route params issues
console.log('\n📋 Checking API routes...')
const apiPath = path.join(__dirname, 'app', 'api')
if (fs.existsSync(apiPath)) {
  let checkedRoutes = 0
  let routesWithIssues = 0
  
  function checkRoutes(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    
    files.forEach(file => {
      if (file.isDirectory()) {
        checkRoutes(path.join(dir, file.name))
      } else if (file.name === 'route.ts') {
        checkedRoutes++
        const filePath = path.join(dir, file.name)
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Check if it's a dynamic route
        if (dir.includes('[') && dir.includes(']')) {
          if (content.includes('params') && !content.includes('await params')) {
            routesWithIssues++
            const relativePath = path.relative(__dirname, filePath)
            warnings.push(`⚠️ ${relativePath} - params may not be awaited (Next.js 16 issue)`)
          }
        }
        
        // Check for missing return statements
        const functionMatches = content.match(/export async function (GET|POST|PUT|DELETE|PATCH)/g)
        if (functionMatches && !content.includes('return NextResponse')) {
          const relativePath = path.relative(__dirname, filePath)
          warnings.push(`⚠️ ${relativePath} - may be missing return statement`)
        }
      }
    })
  }
  
  checkRoutes(apiPath)
  success.push(`✅ Checked ${checkedRoutes} API routes`)
  
  if (routesWithIssues > 0) {
    warnings.push(`⚠️ ${routesWithIssues} routes may have Next.js 16 params issues`)
  }
}

// 6. Check for build artifacts
console.log('\n📋 Checking build artifacts...')
const nextDir = path.join(__dirname, '.next')
if (fs.existsSync(nextDir)) {
  warnings.push('⚠️ .next folder exists - consider cleaning before deployment')
  console.log('   Run: rm -rf .next (or delete .next folder)')
}

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 DEPLOYMENT READINESS SUMMARY')
console.log('='.repeat(60))

if (success.length > 0) {
  console.log('\n✅ SUCCESS:')
  success.forEach(s => console.log('  ' + s))
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:')
  warnings.forEach(w => console.log('  ' + w))
}

if (issues.length > 0) {
  console.log('\n❌ CRITICAL ISSUES:')
  issues.forEach(i => console.log('  ' + i))
}

console.log('\n' + '='.repeat(60))

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ Your app is ready to deploy to Vercel!')
  console.log('\nNext steps:')
  console.log('1. Push to GitHub')
  console.log('2. Connect to Vercel')
  console.log('3. Add environment variables in Vercel dashboard')
  console.log('4. Deploy!')
  process.exit(0)
} else if (issues.length === 0) {
  console.log('⚠️  Your app can deploy, but review the warnings above')
  console.log('\nRecommended:')
  console.log('1. Fix warnings before deploying')
  console.log('2. Test build locally: npm run build')
  console.log('3. Review VERCEL_DEPLOYMENT_GUIDE.md')
  process.exit(0)
} else {
  console.log('❌ Fix critical issues before deploying')
  console.log('\nRequired actions:')
  console.log('1. Fix all critical issues listed above')
  console.log('2. Run this script again')
  console.log('3. See DATABASE_SETUP_COMPLETE_GUIDE.md for database setup')
  console.log('4. See VERCEL_DEPLOYMENT_GUIDE.md for deployment help')
  process.exit(1)
}


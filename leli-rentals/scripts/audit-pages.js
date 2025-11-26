const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Get all page.tsx files in app directory
function getAllPages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'out'].includes(file)) {
        getAllPages(filePath, fileList);
      }
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check if a page is imported/linked in other files
function findReferences(pagePath, allFiles) {
  const references = [];
  const fileName = path.dirname(pagePath).split(path.sep).pop();
  const routePath = pagePath.replace(/\\/g, '/').match(/app\/(.+)\/page\.tsx/)?.[1] || '';
  
  allFiles.forEach(file => {
    if (file === pagePath) return; // Skip self
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for route references
      const patterns = [
        new RegExp(`['"\`]/${routePath}['"\`]`, 'g'),
        new RegExp(`router\\.push\\(['"\`]/${routePath}`, 'g'),
        new RegExp(`href=['"\`]/${routePath}`, 'g'),
        new RegExp(`Link.*to=['"\`]/${routePath}`, 'g'),
      ];
      
      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          references.push({
            file: file.replace(process.cwd(), ''),
            type: 'route reference'
          });
        }
      });
    } catch (err) {
      // Skip files that can't be read
    }
  });
  
  return references;
}

// Main audit function
function auditPages() {
  console.log(`\n${colors.bright}${colors.cyan}==================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}📋 Leli Rentals - Page Audit Report${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}==================================${colors.reset}\n`);
  
  const appDir = path.join(process.cwd(), 'app');
  const allPages = getAllPages(appDir);
  const allFiles = [];
  
  // Get all source files for reference checking
  function collectAllFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(file)) {
        collectAllFiles(filePath);
      } else if (['.tsx', '.ts', '.jsx', '.js'].includes(path.extname(file))) {
        allFiles.push(filePath);
      }
    });
  }
  
  collectAllFiles(process.cwd());
  
  const report = {
    unused: [],
    duplicates: [],
    active: [],
  };
  
  // Analyze each page
  allPages.forEach(pagePath => {
    const relativePath = pagePath.replace(process.cwd(), '').replace(/\\/g, '/');
    const routePath = pagePath.replace(/\\/g, '/').match(/app\/(.+)\/page\.tsx/)?.[1] || '';
    const references = findReferences(pagePath, allFiles);
    
    const pageInfo = {
      path: relativePath,
      route: `/${routePath}`,
      references: references.length,
    };
    
    // Categorize pages
    if (references.length === 0) {
      // Check if it's a core page that should always be kept
      const corePaths = ['page.tsx', 'layout.tsx', 'error.tsx', 'loading.tsx', 'not-found.tsx'];
      const isCore = corePaths.some(p => relativePath.endsWith(p)) && routePath === '';
      
      if (!isCore) {
        report.unused.push(pageInfo);
      } else {
        report.active.push(pageInfo);
      }
    } else {
      report.active.push(pageInfo);
    }
  });
  
  // Identify potential duplicates based on similarity
  const duplicateCandidates = [
    {
      pages: ['/app/onboarding/page.tsx', '/app/get-started/page.tsx'],
      reason: 'Both handle account onboarding - get-started is newer',
      recommendation: 'Delete onboarding/page.tsx'
    },
    {
      pages: ['/app/onboarding/account-type/page.tsx', '/app/get-started/page.tsx'],
      reason: 'Both handle account type selection - get-started includes this',
      recommendation: 'Delete onboarding/account-type/page.tsx'
    },
    {
      pages: ['/app/verification/page.tsx', '/app/dashboard/owner/verification/page.tsx'],
      reason: 'Both handle ID verification - dashboard version is active',
      recommendation: 'Delete verification/page.tsx if not used for renters'
    },
    {
      pages: ['/app/profile/create-listing/page.tsx', '/app/list-item/page.tsx'],
      reason: 'Both handle listing creation - list-item is the active version',
      recommendation: 'Delete profile/create-listing/page.tsx'
    },
  ];
  
  report.duplicates = duplicateCandidates.filter(dup => 
    dup.pages.every(p => allPages.some(page => page.replace(process.cwd(), '').replace(/\\/g, '/') === p))
  );
  
  // Print report
  console.log(`${colors.bright}📊 Summary${colors.reset}`);
  console.log(`Total pages found: ${colors.bright}${allPages.length}${colors.reset}`);
  console.log(`Active pages: ${colors.green}${report.active.length}${colors.reset}`);
  console.log(`Potentially unused: ${colors.yellow}${report.unused.length}${colors.reset}`);
  console.log(`Potential duplicates: ${colors.red}${report.duplicates.length}${colors.reset}\n`);
  
  // Unused pages section
  if (report.unused.length > 0) {
    console.log(`${colors.bright}${colors.yellow}⚠️  Potentially Unused Pages${colors.reset}`);
    console.log(`${colors.yellow}These pages have no detected references in the codebase:${colors.reset}\n`);
    
    report.unused.forEach((page, index) => {
      console.log(`${index + 1}. ${colors.yellow}${page.path}${colors.reset}`);
      console.log(`   Route: ${page.route}`);
      console.log(`   References: ${page.references}\n`);
    });
  }
  
  // Duplicate pages section
  if (report.duplicates.length > 0) {
    console.log(`${colors.bright}${colors.red}🔄 Potential Duplicate Functionality${colors.reset}`);
    console.log(`${colors.red}These pages may have overlapping functionality:${colors.reset}\n`);
    
    report.duplicates.forEach((dup, index) => {
      console.log(`${index + 1}. ${colors.red}${dup.pages.join(' vs ')}${colors.reset}`);
      console.log(`   Reason: ${dup.reason}`);
      console.log(`   ${colors.bright}Recommendation: ${dup.recommendation}${colors.reset}\n`);
    });
  }
  
  // Active pages section
  console.log(`${colors.bright}${colors.green}✅ Active Pages (Keep These)${colors.reset}`);
  const keyPages = report.active.filter(p => p.references > 5 || p.route === '/');
  keyPages.forEach(page => {
    console.log(`• ${colors.green}${page.route}${colors.reset} (${page.references} references)`);
  });
  
  // Generate markdown report
  const mdReport = generateMarkdownReport(report, duplicateCandidates);
  fs.writeFileSync('UNUSED_PAGES_REPORT.md', mdReport);
  
  console.log(`\n${colors.bright}${colors.cyan}==================================${colors.reset}`);
  console.log(`${colors.green}✅ Full report saved to: UNUSED_PAGES_REPORT.md${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}==================================${colors.reset}\n`);
}

function generateMarkdownReport(report, duplicates) {
  let md = '# Leli Rentals - Unused Pages Audit Report\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;
  
  md += '## Summary\n\n';
  md += `- **Total Pages**: ${report.active.length + report.unused.length}\n`;
  md += `- **Active Pages**: ${report.active.length}\n`;
  md += `- **Potentially Unused**: ${report.unused.length}\n`;
  md += `- **Potential Duplicates**: ${duplicates.length}\n\n`;
  
  if (report.unused.length > 0) {
    md += '## ⚠️ Potentially Unused Pages\n\n';
    md += 'These pages have no detected references in the codebase:\n\n';
    report.unused.forEach((page, i) => {
      md += `### ${i + 1}. \`${page.path}\`\n\n`;
      md += `- **Route**: \`${page.route}\`\n`;
      md += `- **References**: ${page.references}\n`;
      md += `- **Action**: Review and delete if truly unused\n\n`;
    });
  }
  
  if (duplicates.length > 0) {
    md += '## 🔄 Potential Duplicate Functionality\n\n';
    duplicates.forEach((dup, i) => {
      md += `### ${i + 1}. Duplicate Set\n\n`;
      md += '**Pages**:\n';
      dup.pages.forEach(p => md += `- \`${p}\`\n`);
      md += `\n**Reason**: ${dup.reason}\n\n`;
      md += `**Recommendation**: ${dup.recommendation}\n\n`;
    });
  }
  
  md += '## ✅ Active Pages\n\n';
  md += 'Pages with detected usage (keep these):\n\n';
  report.active.forEach(page => {
    md += `- \`${page.route}\` - ${page.references} reference(s)\n`;
  });
  
  md += '\n## 🎯 Recommended Actions\n\n';
  md += '1. Review each "potentially unused" page manually\n';
  md += '2. Check if pages are accessed via direct URL or external links\n';
  md += '3. Delete duplicate pages after verifying the recommended version works\n';
  md += '4. Update any hardcoded URLs or bookmarks before deletion\n';
  md += '5. Consider archiving instead of deleting if unsure\n\n';
  
  return md;
}

// Run the audit
if (require.main === module) {
  auditPages();
}

module.exports = { auditPages };


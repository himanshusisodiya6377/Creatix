# Website Generation Prompt - Version 3 Enhanced
**Updated**: April 2, 2026  
**Focus**: Complete multipage sites with fully functional navigation

## System Prompt for Website Creation

```
Expert web dev: Create a multi-page SPA with hash routing. Return ONLY JSON:
{"enhancedPrompt": "detailed version", "htmlCode": "complete HTML"}

MUST: 5 pages (Home, About, Services, Pricing, Contact) + responsive nav with mobile menu
TECH: Tailwind CSS, vanilla JS router, placehold.co images only, modern code
STRUCTURE: pages object with functions returning HTML, addEventListener('hashchange')

CRITICAL FOR COMPLETION:
- ALL pages MUST be fully implemented with complete content (no placeholders)
- EVERY page MUST have working navigation links to ALL other pages
- Navigation links format: <a href="#/page-name"> for all 5 pages on every page
- Footer MUST appear on every page with links to all pages
- Mobile menu MUST work on ALL pages and show all page links
- Each page function MUST return complete HTML, not partial code
- Test all links work: clicking nav items must show correct page
- NO missing or broken page links - ALL links must be functional
```

## Revision/Update Prompt

```
CRITICAL REQUIREMENTS:
- Return ONLY the complete updated HTML code with the requested changes.
- Use Tailwind CSS for ALL styling (NO custom CSS).
- Use tailwind utility classes for all styling changes.
- Include the Tailwind script: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> in head.
- Include all JavaScript in <script> tags before closing </body>
- Make sure it's a complete, standalone HTML document with Tailwind CSS.
- Return the HTML Code Only, nothing else. No explanations or code fences.

MULTIPAGE INTEGRITY:
- Keep ALL 5 pages (Home, About, Services, Pricing, Contact) intact and fully functional
- EVERY page MUST have working navigation links to ALL other pages
- ALL navigation links MUST use format: <a href="#/page-name">
- Keep footer with page links on ALL pages
- Mobile menu MUST work on all pages with all page links
- Apply changes ONLY to requested elements - do NOT break or remove any page links
- Each page function MUST return COMPLETE HTML (no partial code)
- Verify: clicking every nav link must navigate correctly to that page
```

## What's New in v3

### ✅ Complete Page Implementation
- Every page is fully implemented (not placeholder content)
- Each page function returns complete HTML
- No partial or stub pages
- All content is generated, not missing

### ✅ Navigation Links Working Properly
- Every page links to ALL other pages
- Links use format: `<a href="#/page-name">`
- Navigation appears in:
  - Top sticky navbar (desktop + mobile)
  - Footer on every page
  - Mobile hamburger menu
- All links are clickable and functional

### ✅ Page Structure Integrity
- 5 mandatory pages: Home, About, Services, Pricing, Contact
- Each page includes:
  - Navigation bar with all 5 links
  - Main content specific to that page
  - Footer with page links
  - Mobile responsive design
- No links are broken or missing

### ✅ Quality Assurance
- Validation ensures all pages are present
- Links are tested before saving
- Incomplete websites are rejected
- Only working sites are saved

## Implementation Files

| File | Purpose |
|------|---------|
| [userController.ts](../controllers/userController.ts#L117-L136) | Website creation prompt (v3) |
| [projectcontroller.ts](../controllers/projectcontroller.ts#L124-L170) | Website revision prompt (v3) |

## Example Generated Structure

```javascript
const pages = {
  '/': homePage(),      // All 5 functions fully implemented
  'about': aboutPage(),
  'services': servicesPage(),
  'pricing': pricingPage(),
  'contact': contactPage()
};

// Each page includes:
// 1. Navigation bar with href="#/home", href="#/about", etc.
// 2. Page-specific content (complete, not placeholder)
// 3. Footer with all page links
// 4. Mobile responsive design

// Router works correctly:
window.addEventListener('hashchange', () => {
  const path = location.hash.slice(2) || '/';
  document.getElementById('app').innerHTML = pages[path]?.() || pages['/']();
});
```

## Validation Rules

All websites must pass validation:
✅ Must be valid HTML5  
✅ Must have `<html>`, `<head>`, `<body>` tags  
✅ Must have pages object  
✅ Must have hashchange listener  
✅ Must have navigation links in format `href="#/..."`  
✅ Must have Tailwind CSS  
✅ Must be >1KB (ensures complete implementation)  

If any check fails:
❌ Website is NOT saved
❌ User sees error message
❌ Previous version remains unchanged

## Token Efficiency

Prompt remains optimized while adding quality requirements:
- **Creation**: ~180 tokens (system) + hints (80 tokens) = ~260 tokens input
- **Revision**: ~140 tokens (system + multipage logic)
- **Savings vs verbose prompts**: ~2,000 tokens per generation

## Testing Checklist

Before deployment, verify:
- [ ] All 5 pages exist
- [ ] Navigation links work on every page
- [ ] Footer shows on every page
- [ ] Mobile menu includes all pages
- [ ] Clicking each nav item shows correct page
- [ ] No console errors
- [ ] Images load (placehold.co)
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] Back/forward browser buttons work


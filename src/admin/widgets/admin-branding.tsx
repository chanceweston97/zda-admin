// Admin Branding Widget
// Simple widget to replace "Welcome to Medusa" with "ZDA Communications" and customize button colors

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

const AdminBranding = () => {
  useEffect(() => {
    // Inject custom CSS for buttons
    const styleId = 'zda-admin-branding'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.textContent = `
        /* ZDA Communications Branding */
        :root {
          --zda-brand-color: #2958A4;
          --zda-brand-color-dark: #1e4a7a;
        }
        
        /* Button brand colors */
        button[type="submit"],
        button[class*="Button"][class*="primary"],
        [class*="button"][class*="primary"] {
          background-color: var(--zda-brand-color) !important;
          border-color: var(--zda-brand-color) !important;
          color: white !important;
        }
        
        button[type="submit"]:hover,
        button[type="submit"]:focus,
        button[type="submit"]:active,
        button[class*="Button"][class*="primary"]:hover,
        button[class*="Button"][class*="primary"]:focus,
        button[class*="Button"][class*="primary"]:active {
          background-color: var(--zda-brand-color-dark) !important;
          border-color: var(--zda-brand-color-dark) !important;
        }
        
        /* Hide Medusa logo */
        img[src*="medusa"],
        img[alt*="medusa" i],
        svg[class*="logo"],
        svg[class*="Logo"],
        [class*="Logo"] svg,
        [class*="logo"] svg {
          display: none !important;
        }
      `
      document.head.appendChild(styleElement)
    }

    // Simple function to replace text
    const replaceText = () => {
      // Replace "Welcome to Medusa" with "ZDA Communications"
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      )

      let node
      while (node = walker.nextNode()) {
        if (node.textContent?.includes('Welcome to Medusa')) {
          node.textContent = node.textContent.replace(/Welcome to Medusa/gi, 'ZDA Communications')
        }
      }

      // Also replace in headings and other elements
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, label')
      headings.forEach((el) => {
        if (el.textContent?.includes('Welcome to Medusa')) {
          el.textContent = el.textContent.replace(/Welcome to Medusa/gi, 'ZDA Communications')
        }
      })
    }

    // Run immediately
    replaceText()
    
    // Run after a short delay to catch dynamically loaded content
    setTimeout(replaceText, 300)
    
    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      replaceText()
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default AdminBranding


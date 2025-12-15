// Admin Widget: Custom Cable Display for Orders
// Displays custom cable metadata prominently in order line items
// Instead of showing just "Custom Product - $100", shows the actual custom cable details

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Container, Heading, Badge, Text } from "@medusajs/ui"

const OrderCustomCableDisplay = () => {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [customItems, setCustomItems] = useState<any[]>([])

  // Get order ID from URL
  useEffect(() => {
    const updateOrderId = () => {
      const path = window.location.pathname
      // Match URLs like /orders/order_xxx or /app/orders/order_xxx
      const match = path.match(/\/orders\/([^\/]+)/)
      if (match && match[1]) {
        setOrderId(match[1])
      }
    }

    updateOrderId()
    const interval = setInterval(updateOrderId, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load order data
  useEffect(() => {
    if (!orderId) return

    const loadOrder = async () => {
      try {
        const response = await fetch(`/admin/orders/${orderId}`, {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          const orderData = data.order

          // Find items with custom cable metadata
          const items = orderData?.items || []
          const customCableItems = items.filter((item: any) => {
            const metadata = item.metadata || {}
            return metadata.isCustomCable || 
                   metadata.customTitle || 
                   metadata.customCableCount > 0 ||
                   item.variant?.product?.title === "Custom Product"
          })
          setCustomItems(customCableItems)
        }
      } catch (error) {
        console.error("Error loading order:", error)
      }
    }

    loadOrder()
  }, [orderId])

  // Inject CSS to enhance order items display
  useEffect(() => {
    const styleId = 'custom-cable-display-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.textContent = `
        /* Custom Cable Display Styles */
        [data-custom-cable-display] {
          padding: 12px;
          margin: 8px 0;
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 8px;
          font-size: 14px;
        }
        
        [data-custom-cable-display] .custom-cable-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 4px;
        }
        
        [data-custom-cable-display] .custom-cable-price {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
          margin: 8px 0;
        }
        
        /* Enhance order items table rows that contain custom cables */
        tr[data-custom-cable-item="true"] {
          background-color: #fef3c7 !important;
        }
        
        tr[data-custom-cable-item="true"] td:first-child::before {
          content: "📦 ";
          margin-right: 4px;
        }
        
        /* Custom cable price in Summary section - white text */
        [data-custom-cable-price="true"] {
          color: white !important;
          font-weight: 600;
        }
      `
      document.head.appendChild(styleElement)
    }
  }, [])

  // Inject custom cable details into Summary section
  useEffect(() => {
    if (customItems.length === 0) return

    const updateSummarySection = () => {
      // Find all table rows in the Summary section
      // Look for rows containing "Custom Cable" or "Custom Product"
      const allRows = document.querySelectorAll('table tbody tr, [role="row"]')
      
      allRows.forEach((row) => {
        const rowText = row.textContent || ''
        
        // Check if this row contains a custom cable item
        const matchingItem = customItems.find((item: any) => {
          const metadata = item.metadata || {}
          const variantTitle = item.variant?.title || ''
          const productTitle = item.variant?.product?.title || ''
          
          // Match if row contains default product name or variant title
          return rowText.includes("Custom Product") || 
                 rowText.includes("Custom Cable") ||
                 rowText.includes(variantTitle) ||
                 (productTitle === "Custom Product" && rowText.includes(productTitle))
        })

        if (matchingItem) {
          const metadata = matchingItem.metadata || {}
          
          // Check if we've already updated this row
          if (row.getAttribute('data-custom-cable-updated') === 'true') {
            return
          }

          // Find the product name cell (usually first cell)
          const firstCell = row.querySelector('td:first-child, [class*="cell"]:first-child')
          if (firstCell && metadata.customTitle) {
            // Replace the product name with custom title
            const titleElement = firstCell.querySelector('span, div, p') || firstCell
            if (titleElement) {
              titleElement.textContent = metadata.customTitle
              // Also add description if available
              if (metadata.customDescription) {
                const descElement = document.createElement('div')
                descElement.style.cssText = 'font-size: 12px; color: #64748b; margin-top: 4px;'
                descElement.textContent = metadata.customDescription
                titleElement.appendChild(descElement)
              }
            }
          }

          // Find and update price cells (look for cells with $0.00 or price format)
          const priceCells = row.querySelectorAll('td')
          priceCells.forEach((cell) => {
            const cellText = cell.textContent || ''
            // Check if this cell contains a price (format: $X.XX)
            if (cellText.match(/\$[\d,]+\.\d{2}/) && metadata.unitCustomCablePriceDollars) {
              const priceValue = parseFloat(metadata.unitCustomCablePriceDollars)
              if (priceValue > 0) {
                // Update price with custom price
                const formattedPrice = `$${priceValue.toFixed(2)}`
                cell.textContent = formattedPrice
                cell.setAttribute('data-custom-cable-price', 'true')
                // Make text white
                cell.style.color = 'white'
                cell.style.fontWeight = '600'
              }
            }
          })

          // Mark row as updated
          row.setAttribute('data-custom-cable-updated', 'true')
          row.setAttribute('data-custom-cable-item', 'true')
        }
      })
    }

    // Run immediately and then watch for DOM changes
    setTimeout(updateSummarySection, 500)
    setTimeout(updateSummarySection, 1500)
    setTimeout(updateSummarySection, 3000)

    // Watch for DOM changes (order page loads dynamically)
    const observer = new MutationObserver(() => {
      updateSummarySection()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [customItems])

  // Also render a summary widget if we're on an order page
  if (!orderId || customItems.length === 0) {
    return null
  }

  return (
    <Container className="mt-4">
      <div style={{ 
        padding: '16px', 
        background: '#fef3c7', 
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        marginTop: '16px'
      }}>
        <Heading level="h3" style={{ color: '#92400e', marginBottom: '12px' }}>
          📦 Custom Cable Order ({customItems.length} item{customItems.length !== 1 ? 's' : ''})
        </Heading>
        {customItems.map((item, idx) => {
          const metadata = item.metadata || {}
          return (
            <div key={idx} style={{ 
              marginTop: idx > 0 ? '16px' : '0',
              padding: '12px',
              background: 'white',
              borderRadius: '4px'
            }}>
              <Text size="small" weight="plus" style={{ color: '#1e40af' }}>
                {metadata.customTitle || item.variant?.title || "Custom Cable"}
              </Text>
              {metadata.unitCustomCablePriceDollars && (
                <Badge style={{ marginLeft: '8px', background: '#059669', color: 'white' }}>
                  ${metadata.unitCustomCablePriceDollars}
                </Badge>
              )}
              {metadata.customDescription && (
                <div style={{ marginTop: '8px', color: '#64748b', fontSize: '14px' }}>
                  {metadata.customDescription}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderCustomCableDisplay


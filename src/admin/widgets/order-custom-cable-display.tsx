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
      `
      document.head.appendChild(styleElement)
    }
  }, [])

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
                <Badge style={{ marginLeft: '8px', background: '#059669' }}>
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


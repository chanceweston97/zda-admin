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


  // Removed DOM manipulation - now displaying above Summary section instead

  // Render widget above Summary section
  if (!orderId || customItems.length === 0) {
    return null
  }

  return (
    <Container className="mb-4">
      <div style={{ 
        padding: '16px', 
        background: '#fef3c7', 
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <Heading level="h3" style={{ color: '#92400e', marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>
          📦 Custom Cable Order ({customItems.length} item{customItems.length !== 1 ? 's' : ''})
        </Heading>
        {customItems.map((item, idx) => {
          const metadata = item.metadata || {}
          return (
            <div key={idx} style={{ 
              marginTop: idx > 0 ? '16px' : '0',
              padding: '12px',
              background: 'white',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text size="small" weight="plus" style={{ color: '#1e40af', fontSize: '16px', fontWeight: '600' }}>
                  {metadata.customTitle || item.variant?.title || "Custom Cable"}
                </Text>
                {metadata.unitCustomCablePriceDollars && (
                  <Badge style={{ 
                    background: '#059669', 
                    color: 'white', 
                    fontSize: '16px',
                    fontWeight: '700',
                    padding: '6px 12px'
                  }}>
                    ${metadata.unitCustomCablePriceDollars}
                  </Badge>
                )}
              </div>
              {metadata.customDescription && (
                <div style={{ marginTop: '8px', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                  {metadata.customDescription}
                </div>
              )}
              {metadata.summary && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px', 
                  background: '#f9fafb', 
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#4b5563'
                }}>
                  <strong>Details:</strong> {metadata.summary}
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
  zone: "order.details.before",
})

export default OrderCustomCableDisplay


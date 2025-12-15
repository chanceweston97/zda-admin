// Admin Widget: Custom Cable Display for Orders
// Hides default Summary and creates a custom Summary section with correct custom cable pricing

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"

const OrderCustomCableDisplay = () => {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any>(null)
  const [customItems, setCustomItems] = useState<any[]>([])

  // Get order ID from URL
  useEffect(() => {
    const updateOrderId = () => {
      const path = window.location.pathname
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
          const order = data.order
          setOrderData(order)

          // Find items with custom cable metadata
          const items = order?.items || []
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

    // Hide default Summary and inject custom Summary
    useEffect(() => {
      if (!orderData || customItems.length === 0) return

      // Find and hide the default Summary section
      const hideDefaultSummary = () => {
        // Strategy: Look for elements containing "Summary" text, then find their parent containers
        // that contain order total/subtotal indicators
        
        const findSummarySection = () => {
          // Look for headings with "Summary" text
          const headings = Array.from(document.querySelectorAll('h2, h3, h4'))
          for (const heading of headings) {
            if (heading.textContent?.trim().toLowerCase() === 'summary') {
              // Walk up the DOM tree to find the containing card/section
              let current: Element | null = heading.parentElement
              let depth = 0
              const maxDepth = 5
              
              while (current && depth < maxDepth) {
                // Check if this container has summary-like content
                const text = current.textContent || ''
                const hasSummaryContent = 
                  text.includes('Item Subtotal') ||
                  text.includes('Order Total') ||
                  text.includes('Shipping Subtotal') ||
                  current.querySelector('[data-testid*="summary"]') ||
                  current.querySelector('[class*="Summary"]')
                
                if (hasSummaryContent) {
                  return current as HTMLElement
                }
                current = current.parentElement
                depth++
              }
            }
          }
          return null
        }

        const summarySection = findSummarySection()
        if (summarySection) {
          summarySection.style.display = 'none'
          summarySection.setAttribute('data-hidden-by-custom-cable', 'true')
        }
      }

    // Create custom Summary section
    const createCustomSummary = () => {
      // Check if we already created it
      if (document.getElementById('custom-cable-summary')) {
        return
      }

      // Calculate totals from custom cable metadata
      let itemSubtotal = 0
      customItems.forEach((item: any) => {
        const metadata = item.metadata || {}
        const price = parseFloat(metadata.unitCustomCablePriceDollars || '0')
        const quantity = item.quantity || 1
        itemSubtotal += price * quantity
      })

      // Get other totals from order (shipping, tax, etc.) - these are in cents
      const shippingTotal = (orderData.shipping_total || 0) / 100
      const taxTotal = (orderData.tax_total || 0) / 100
      const discountTotal = (orderData.discount_total || 0) / 100
      const orderTotal = (orderData.total || 0) / 100
      const paidTotal = (orderData.paid_total || 0) / 100
      const outstandingAmount = orderTotal - paidTotal

      // Find where to insert the custom summary (where the hidden Summary section was)
      const findInsertionPoint = () => {
        // Look for the hidden summary section's parent
        const hiddenSummary = document.querySelector('[data-hidden-by-custom-cable="true"]')
        if (hiddenSummary?.parentElement) {
          return hiddenSummary.parentElement
        }
        
        // Fallback: look for the left column or summary area
        const leftColumn = document.querySelector('[class*="flex"]:has([data-hidden-by-custom-cable])')
        if (leftColumn) return leftColumn as HTMLElement
        
        // Another fallback: find container with order details
        const orderDetails = document.querySelector('section, [class*="grid"], [class*="flex"]')
        return orderDetails as HTMLElement || document.body
      }

      const insertionPoint = findInsertionPoint()
      if (!insertionPoint) return

      // Insert custom summary where the hidden summary was (or at the insertion point)
      const hiddenSummary = document.querySelector('[data-hidden-by-custom-cable="true"]')
      const customSummary = document.createElement('div')
      customSummary.id = 'custom-cable-summary'
      customSummary.setAttribute('data-custom-cable-summary', 'true')
      customSummary.innerHTML = generateSummaryHTML(itemSubtotal, shippingTotal, taxTotal, discountTotal, orderTotal, paidTotal, outstandingAmount, customItems)
      
      if (hiddenSummary && hiddenSummary.parentElement) {
        // Insert right where the hidden summary was
        hiddenSummary.parentElement.insertBefore(customSummary, hiddenSummary)
      } else {
        // Insert at the insertion point
        insertionPoint.insertBefore(customSummary, insertionPoint.firstChild)
      }
    }

    const generateSummaryHTML = (
      itemSubtotal: number,
      shippingTotal: number,
      taxTotal: number,
      discountTotal: number,
      orderTotal: number,
      paidTotal: number,
      outstandingAmount: number,
      items: any[]
    ) => {
      const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(amount)
      }

      return `
        <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #111827; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">Summary</h2>
          
          <!-- Order Items -->
          <div style="margin-bottom: 16px;">
            ${items.map((item: any) => {
              const metadata = item.metadata || {}
              const title = metadata.customTitle || item.variant?.title || "Custom Cable"
              const price = parseFloat(metadata.unitCustomCablePriceDollars || '0')
              const quantity = item.quantity || 1
              const variantTitle = item.variant?.title || "Default option value"
              
              return `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div style="flex: 1;">
                      <div style="font-weight: 500; color: #111827; margin-bottom: 4px;">${title}</div>
                      <div style="font-size: 14px; color: #6b7280;">${variantTitle}</div>
                    </div>
                    <div style="margin-left: 16px; text-align: right;">
                      <div style="color: #111827; font-weight: 500;">${formatPrice(price)} ${quantity}x</div>
                    </div>
                  </div>
                </div>
              `
            }).join('')}
          </div>

          <!-- Totals -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Item Subtotal</span>
              <span style="color: #111827; font-weight: 500;">${formatPrice(itemSubtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Shipping Subtotal</span>
              <span style="color: #111827; font-weight: 500;">${formatPrice(shippingTotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Tax Total</span>
              <span style="color: #111827; font-weight: 500;">${formatPrice(taxTotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <span style="color: #111827; font-weight: 600; font-size: 16px;">Order Total</span>
              <span style="color: #111827; font-weight: 600; font-size: 16px;">${formatPrice(orderTotal)}</span>
            </div>
            ${discountTotal > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Discount Total</span>
                <span style="color: #111827; font-weight: 500;">${formatPrice(discountTotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Total After Discount</span>
                <span style="color: #111827; font-weight: 500;">${formatPrice(orderTotal)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Paid Total</span>
              <span style="color: #111827; font-weight: 500;">${formatPrice(paidTotal)} USD</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Outstanding amount</span>
              <span style="color: #111827; font-weight: 500;">${formatPrice(outstandingAmount)} USD</span>
            </div>
          </div>
        </div>
      `
    }

    // Run after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      hideDefaultSummary()
      createCustomSummary()
    }, 500)

    return () => {
      clearTimeout(timer)
      // Cleanup: show default summary again and remove custom one
      const hiddenSummary = document.querySelector('[data-hidden-by-custom-cable="true"]')
      if (hiddenSummary) {
        (hiddenSummary as HTMLElement).style.display = ''
        hiddenSummary.removeAttribute('data-hidden-by-custom-cable')
      }
      const customSummary = document.getElementById('custom-cable-summary')
      if (customSummary) {
        customSummary.remove()
      }
    }
  }, [orderData, customItems])

  // This widget doesn't render anything visible - it only manipulates DOM
  return null
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderCustomCableDisplay

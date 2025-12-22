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

    // Helper function to get price from metadata.price (in cents) or fallback (shared across all functions)
    const getCustomCablePrice = (item: any): number => {
        const metadata = item.metadata || {}
        // Get price from metadata.price (in cents) or fallback to other fields
        if (metadata.price) {
          // Price is in cents, convert to dollars
          const priceValue = typeof metadata.price === 'number' ? metadata.price : parseFloat(String(metadata.price))
          return priceValue / 100
        } else if (metadata.unitCustomCablePriceDollars) {
          const priceStr = String(metadata.unitCustomCablePriceDollars)
          return parseFloat(priceStr) || 0
        } else if (metadata.unitCustomCablePrice) {
          // Price is in cents, convert to dollars
          const priceValue = typeof metadata.unitCustomCablePrice === 'number' ? metadata.unitCustomCablePrice : parseFloat(String(metadata.unitCustomCablePrice))
          return priceValue / 100
        }
        return 0
    }

    // Create custom Summary section
    const createCustomSummary = () => {
      // Check if we already created it
      if (document.getElementById('custom-cable-summary')) {
        return
      }

      // Calculate totals from custom cable metadata
      let itemSubtotal = 0
      const itemPriceMap = new Map<string, number>() // Map item ID to price
      
      customItems.forEach((item: any) => {
        const price = getCustomCablePrice(item)
        const quantity = item.quantity || 1
        itemSubtotal += price * quantity
        itemPriceMap.set(item.id, price)
      })

      // Get other totals from order (shipping, tax, etc.) - these are in cents
      const shippingTotal = (orderData.shipping_total || 0) / 100
      const taxTotal = (orderData.tax_total || 0) / 100
      const discountTotal = (orderData.discount_total || 0) / 100
      
      // Use calculated itemSubtotal + shipping + tax - discount for order total
      const calculatedOrderTotal = itemSubtotal + shippingTotal + taxTotal - discountTotal
      const orderTotal = calculatedOrderTotal > 0 ? calculatedOrderTotal : ((orderData.total || 0) / 100)
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
              const price = getCustomCablePrice(item)
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
              <span style="color: #111827; font-weight: 600; font-size: 16px;">${formatPrice(itemSubtotal + shippingTotal + taxTotal - discountTotal)}</span>
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

    // Hide default Payments section and create custom one
    const hideDefaultPayments = () => {
      const headings = Array.from(document.querySelectorAll('h2, h3, h4, div[class*="Heading"]'))
      for (const heading of headings) {
        if (heading.textContent?.trim().toLowerCase() === 'payments') {
          let current: Element | null = heading.parentElement
          let depth = 0
          const maxDepth = 5
          
          while (current && depth < maxDepth) {
            const currentText = current.textContent || ''
            if (currentText.includes('Total paid') || currentText.includes('paid by customer') || 
                current.querySelector('[class*="Payment"]') || 
                current.querySelector('[data-testid*="payment"]')) {
              (current as HTMLElement).style.display = 'none'
              (current as HTMLElement).setAttribute('data-hidden-by-custom-cable-payments', 'true')
              return
            }
            current = current.parentElement
            depth++
          }
        }
      }
    }

    const createCustomPayments = () => {
      if (document.getElementById('custom-cable-payments')) return

      // Calculate correct total
      let totalAmount = 0
      customItems.forEach((item: any) => {
        const price = getCustomCablePrice(item)
        const quantity = item.quantity || 1
        totalAmount += price * quantity
      })

      const shippingTotal = (orderData.shipping_total || 0) / 100
      const taxTotal = (orderData.tax_total || 0) / 100
      const discountTotal = (orderData.discount_total || 0) / 100
      const orderTotal = totalAmount + shippingTotal + taxTotal - discountTotal
      const paidTotal = (orderData.paid_total || 0) / 100

      const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(amount)
      }

      const hiddenPayments = document.querySelector('[data-hidden-by-custom-cable-payments="true"]')
      const insertionPoint = hiddenPayments?.parentElement || document.body
      
      const customPayments = document.createElement('div')
      customPayments.id = 'custom-cable-payments'
      customPayments.setAttribute('data-custom-cable-payments', 'true')
      customPayments.innerHTML = `
        <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #111827; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">Payments</h2>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: #6b7280;">Total paid by customer</span>
            <span style="color: #111827; font-weight: 500;">${formatPrice(orderTotal)} USD</span>
          </div>
          ${paidTotal > 0 ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span style="color: #6b7280;">Paid Total</span>
              <span style="color: #10b981; font-weight: 500;">${formatPrice(paidTotal)} USD</span>
            </div>
          ` : ''}
        </div>
      `

      if (hiddenPayments?.parentElement) {
        hiddenPayments.parentElement.insertBefore(customPayments, hiddenPayments)
      } else {
        insertionPoint.insertBefore(customPayments, insertionPoint.firstChild)
      }
    }

    // Hide default Unfulfilled Items section and create custom one
    const hideDefaultUnfulfilledItems = () => {
      const headings = Array.from(document.querySelectorAll('h2, h3, h4, div[class*="Heading"]'))
      for (const heading of headings) {
        const headingText = heading.textContent?.trim().toLowerCase() || ''
        if (headingText.includes('unfulfilled') || headingText.includes('fulfillment')) {
          let current: Element | null = heading.parentElement
          let depth = 0
          const maxDepth = 5
          
          while (current && depth < maxDepth) {
            const currentText = current.textContent || ''
            if (currentText.includes('Custom Cable') || 
                current.querySelector('[class*="Fulfillment"]') ||
                current.querySelector('[class*="Unfulfilled"]')) {
              (current as HTMLElement).style.display = 'none'
              (current as HTMLElement).setAttribute('data-hidden-by-custom-cable-fulfillment', 'true')
              return
            }
            current = current.parentElement
            depth++
          }
        }
      }
    }

    const createCustomUnfulfilledItems = () => {
      if (document.getElementById('custom-cable-unfulfilled')) return

      const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(amount)
      }

      const hiddenFulfillment = document.querySelector('[data-hidden-by-custom-cable-fulfillment="true"]')
      const insertionPoint = hiddenFulfillment?.parentElement || document.body
      
      const customUnfulfilled = document.createElement('div')
      customUnfulfilled.id = 'custom-cable-unfulfilled'
      customUnfulfilled.setAttribute('data-custom-cable-unfulfilled', 'true')
      customUnfulfilled.innerHTML = `
        <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #111827; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">Unfulfilled Items</h2>
          ${customItems.map((item: any) => {
            const metadata = item.metadata || {}
            const title = metadata.customTitle || item.variant?.title || "Custom Cable"
            const price = getCustomCablePrice(item)
            const quantity = item.quantity || 1
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <div style="flex: 1;">
                  <div style="font-weight: 500; color: #111827;">${title}</div>
                  <div style="font-size: 14px; color: #6b7280;">Quantity: ${quantity}</div>
                </div>
                <div style="margin-left: 16px; text-align: right;">
                  <div style="color: #111827; font-weight: 500;">${formatPrice(price)}</div>
                </div>
              </div>
            `
          }).join('')}
        </div>
      `

      if (hiddenFulfillment?.parentElement) {
        hiddenFulfillment.parentElement.insertBefore(customUnfulfilled, hiddenFulfillment)
      } else {
        insertionPoint.insertBefore(customUnfulfilled, insertionPoint.firstChild)
      }
    }

    // Hide default Activity section and create custom one
    const hideDefaultActivity = () => {
      const headings = Array.from(document.querySelectorAll('h2, h3, h4, div[class*="Heading"]'))
      for (const heading of headings) {
        const headingText = heading.textContent?.trim().toLowerCase() || ''
        if (headingText === 'activity') {
          let current: Element | null = heading.parentElement
          let depth = 0
          const maxDepth = 5
          
          while (current && depth < maxDepth) {
            const currentText = current.textContent || ''
            if (currentText.includes('Order placed') || 
                current.querySelector('[class*="Activity"]') ||
                current.querySelector('[data-testid*="activity"]')) {
              (current as HTMLElement).style.display = 'none'
              (current as HTMLElement).setAttribute('data-hidden-by-custom-cable-activity', 'true')
              return
            }
            current = current.parentElement
            depth++
          }
        }
      }
    }

    const createCustomActivity = () => {
      if (document.getElementById('custom-cable-activity')) return

      // Calculate correct order total
      let totalAmount = 0
      customItems.forEach((item: any) => {
        const price = getCustomCablePrice(item)
        const quantity = item.quantity || 1
        totalAmount += price * quantity
      })

      const shippingTotal = (orderData.shipping_total || 0) / 100
      const taxTotal = (orderData.tax_total || 0) / 100
      const discountTotal = (orderData.discount_total || 0) / 100
      const finalTotal = totalAmount + shippingTotal + taxTotal - discountTotal

      const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(amount)
      }

      // Get order created date
      const orderDate = orderData.created_at ? new Date(orderData.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'

      const hiddenActivity = document.querySelector('[data-hidden-by-custom-cable-activity="true"]')
      const insertionPoint = hiddenActivity?.parentElement || document.body
      
      const customActivity = document.createElement('div')
      customActivity.id = 'custom-cable-activity'
      customActivity.setAttribute('data-custom-cable-activity', 'true')
      customActivity.innerHTML = `
        <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #111827; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">Activity</h2>
          <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 500; color: #111827;">Order placed</div>
                <div style="font-size: 12px; color: #6b7280;">${orderDate}</div>
              </div>
              <div style="color: #111827; font-weight: 500;">${formatPrice(finalTotal)} USD</div>
            </div>
          </div>
        </div>
      `

      if (hiddenActivity?.parentElement) {
        hiddenActivity.parentElement.insertBefore(customActivity, hiddenActivity)
      } else {
        insertionPoint.insertBefore(customActivity, insertionPoint.firstChild)
      }
    }

    // Run initial updates after a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      hideDefaultSummary()
      createCustomSummary()
      hideDefaultPayments()
      createCustomPayments()
      hideDefaultUnfulfilledItems()
      createCustomUnfulfilledItems()
      hideDefaultActivity()
      createCustomActivity()
      
      // Run updates again after a longer delay to catch late-loading content
      setTimeout(() => {
        hideDefaultSummary()
        createCustomSummary()
        hideDefaultPayments()
        createCustomPayments()
        hideDefaultUnfulfilledItems()
        createCustomUnfulfilledItems()
        hideDefaultActivity()
        createCustomActivity()
      }, 1500)
    }, 500)

    return () => {
      clearTimeout(timer)
      // Cleanup: show default sections again and remove custom ones
      const hiddenSummary = document.querySelector('[data-hidden-by-custom-cable="true"]')
      if (hiddenSummary) {
        (hiddenSummary as HTMLElement).style.display = ''
        hiddenSummary.removeAttribute('data-hidden-by-custom-cable')
      }
      const customSummary = document.getElementById('custom-cable-summary')
      if (customSummary) {
        customSummary.remove()
      }
      const hiddenPayments = document.querySelector('[data-hidden-by-custom-cable-payments="true"]')
      if (hiddenPayments) {
        (hiddenPayments as HTMLElement).style.display = ''
        hiddenPayments.removeAttribute('data-hidden-by-custom-cable-payments')
      }
      const customPayments = document.getElementById('custom-cable-payments')
      if (customPayments) {
        customPayments.remove()
      }
      const hiddenFulfillment = document.querySelector('[data-hidden-by-custom-cable-fulfillment="true"]')
      if (hiddenFulfillment) {
        (hiddenFulfillment as HTMLElement).style.display = ''
        hiddenFulfillment.removeAttribute('data-hidden-by-custom-cable-fulfillment')
      }
      const customUnfulfilled = document.getElementById('custom-cable-unfulfilled')
      if (customUnfulfilled) {
        customUnfulfilled.remove()
      }
      const hiddenActivity = document.querySelector('[data-hidden-by-custom-cable-activity="true"]')
      if (hiddenActivity) {
        (hiddenActivity as HTMLElement).style.display = ''
        hiddenActivity.removeAttribute('data-hidden-by-custom-cable-activity')
      }
      const customActivity = document.getElementById('custom-cable-activity')
      if (customActivity) {
        customActivity.remove()
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

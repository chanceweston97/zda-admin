// Admin API for FAQs
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { CMS_MODULE } from "../../../../modules/cms"
import type CMSService from "../../../../modules/cms/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cmsService: CMSService = req.scope.resolve(CMS_MODULE)
    const { is_active } = req.query
    
    const faq = await cmsService.getFAQ(
      is_active !== undefined ? { is_active: is_active === "true" } : undefined
    )
    
    res.json({ faq })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch FAQ",
      error: error.message,
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cmsService: CMSService = req.scope.resolve(CMS_MODULE)
    const faq = await cmsService.createOrUpdateFAQ(req.body)
    res.json({ faq })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to save FAQ",
      error: error.message,
    })
  }
}

export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cmsService: CMSService = req.scope.resolve(CMS_MODULE)
    const faq = await cmsService.createOrUpdateFAQ(req.body)
    res.json({ faq })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update FAQ",
      error: error.message,
    })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cmsService: CMSService = req.scope.resolve(CMS_MODULE)
    const { id } = req.query as { id: string }
    await cmsService.deleteFAQ(id)
    res.json({ message: "FAQ deleted successfully" })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete FAQ",
      error: error.message,
    })
  }
}


// Admin API for What We Offer
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
    
    const offer = await cmsService.getWhatWeOffer(
      is_active !== undefined ? { is_active: is_active === "true" } : undefined
    )
    
    res.json({ offer })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch what we offer",
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
    const offer = await cmsService.createOrUpdateWhatWeOffer(req.body)
    res.json({ offer })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to save what we offer",
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
    const offer = await cmsService.createOrUpdateWhatWeOffer(req.body)
    res.json({ offer })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update what we offer",
      error: error.message,
    })
  }
}


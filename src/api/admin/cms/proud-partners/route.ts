// Admin API for Proud Partners
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
    
    const partners = await cmsService.getProudPartners(
      is_active !== undefined ? { is_active: is_active === "true" } : undefined
    )
    
    res.json({ partners })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch proud partners",
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
    const partners = await cmsService.createOrUpdateProudPartners(req.body)
    res.json({ partners })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to save proud partners",
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
    const partners = await cmsService.createOrUpdateProudPartners(req.body)
    res.json({ partners })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update proud partners",
      error: error.message,
    })
  }
}


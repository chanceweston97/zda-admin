// Admin API for Our Story
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
    
    const story = await cmsService.getOurStory(
      is_active !== undefined ? { is_active: is_active === "true" } : undefined
    )
    
    res.json({ story })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch our story",
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
    const story = await cmsService.createOrUpdateOurStory(req.body)
    res.json({ story })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to save our story",
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
    const story = await cmsService.createOrUpdateOurStory(req.body)
    res.json({ story })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update our story",
      error: error.message,
    })
  }
}


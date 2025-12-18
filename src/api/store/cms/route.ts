// Store API for CMS content (Public - Frontend consumption)
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { CMS_MODULE } from "../../../modules/cms"
import type CMSService from "../../../modules/cms/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cmsService: CMSService = req.scope.resolve(CMS_MODULE)
    
    // Only return active content for frontend
    const [heroes, instructions, faqs] = await Promise.all([
      cmsService.listHeroes({ is_active: true }),
      cmsService.listInstructions({ is_active: true }),
      cmsService.getFAQs({ is_active: true }),
    ])
    
    res.json({
      heroes,
      instructions,
      faqs,
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch CMS content",
      error: error.message,
    })
  }
}


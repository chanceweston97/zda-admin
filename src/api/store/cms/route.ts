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
    const [heroes, instructions, proudPartners, whatWeOffer, ourStory, faq] = await Promise.all([
      cmsService.listHeroes({ is_active: true }),
      cmsService.listInstructions({ is_active: true }),
      cmsService.getProudPartners({ is_active: true }),
      cmsService.getWhatWeOffer({ is_active: true }),
      cmsService.getOurStory({ is_active: true }),
      cmsService.getFAQ({ is_active: true }),
    ])
    
    res.json({
      heroes,
      instructions: instructions[0] || null,
      proudPartners,
      whatWeOffer,
      ourStory,
      faq: faq ? { items: faq.items || [] } : null,
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch CMS content",
      error: error.message,
    })
  }
}


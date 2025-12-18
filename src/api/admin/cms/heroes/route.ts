// Admin API for Hero Banners
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
    
    const heroes = await cmsService.listHeroes(
      is_active !== undefined ? { is_active: is_active === "true" } : undefined
    )
    
    res.json({ heroes })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch heroes",
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
    const hero = await cmsService.createHero(req.body)
    res.json({ hero })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create hero",
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
    const { id, ...data } = req.body
    const hero = await cmsService.updateHero(id, data)
    res.json({ hero })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update hero",
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
    await cmsService.deleteHero(id)
    res.json({ message: "Hero deleted successfully" })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete hero",
      error: error.message,
    })
  }
}


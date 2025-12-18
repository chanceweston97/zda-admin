// Admin API for Hero Instructions
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
    
    const instructions = await cmsService.listInstructions(
      is_active !== undefined ? { is_active: is_active === "true" } : undefined
    )
    
    res.json({ instructions })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch instructions",
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
    const instruction = await cmsService.createInstruction(req.body)
    res.json({ instruction })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create instruction",
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
    const instruction = await cmsService.updateInstruction(id, data)
    res.json({ instruction })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update instruction",
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
    await cmsService.deleteInstruction(id)
    res.json({ message: "Instruction deleted successfully" })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete instruction",
      error: error.message,
    })
  }
}


// Admin API Route for Cable Customizer Management
// Allows admin to manage cable series, types, and connectors

import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { CABLE_CUSTOMIZER_MODULE } from "../../../modules/cable-customizer"
import type CableCustomizerService from "../../../modules/cable-customizer/service"

// GET - List all cable customizer data
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cableCustomizerService: CableCustomizerService = req.scope.resolve(
      CABLE_CUSTOMIZER_MODULE
    )

    const [cableSeries, cableTypes, connectors] = await Promise.all([
      cableCustomizerService.listCableSeries(),
      cableCustomizerService.listCableTypes(),
      cableCustomizerService.listConnectors(),
    ])

    res.json({
      cable_series: cableSeries,
      cable_types: cableTypes,
      connectors: connectors,
    })
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch cable customizer data",
      error: error.message,
    })
  }
}

// POST - Create new cable series, type, or connector
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cableCustomizerService: CableCustomizerService = req.scope.resolve(
      CABLE_CUSTOMIZER_MODULE
    )

    const { type, data } = req.body

    let result
    switch (type) {
      case "cable_series":
        result = await cableCustomizerService.createCableSeries(data)
        break
      case "cable_type":
        result = await cableCustomizerService.createCableType(data)
        break
      case "connector":
        result = await cableCustomizerService.createConnector(data)
        break
      default:
        return res.status(400).json({ message: "Invalid type" })
    }

    res.json(result)
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create cable customizer item",
      error: error.message,
    })
  }
}



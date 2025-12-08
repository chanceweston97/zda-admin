// API Route for Cable Customizer Data
// Provides cable series, types, and connectors to the storefront

import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { CABLE_CUSTOMIZER_MODULE } from "../../../modules/cable-customizer"
import type CableCustomizerService from "../../../modules/cable-customizer/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const cableCustomizerService: CableCustomizerService = req.scope.resolve(
      CABLE_CUSTOMIZER_MODULE
    )

    // Fetch all cable customizer data
    const [cableSeries, cableTypes, connectors] = await Promise.all([
      cableCustomizerService.listCableSeries(),
      cableCustomizerService.listCableTypes({ is_active: true }),
      cableCustomizerService.listConnectors({ is_active: true }),
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



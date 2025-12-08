// Cable Customizer Module
// Manages cable series, cable types, and connectors for the cable customizer feature

import CableCustomizerService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CABLE_CUSTOMIZER_MODULE = "cableCustomizer"

export default Module(CABLE_CUSTOMIZER_MODULE, {
  service: CableCustomizerService,
})



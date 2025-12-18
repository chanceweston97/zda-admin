// CMS Module
import { Module } from "@medusajs/framework/utils"
import CMSService from "./service"
import Hero from "./models/hero"
import Instruction from "./models/instruction"
import FAQ from "./models/faq"

export const CMS_MODULE = "cms"

export default Module(CMS_MODULE, {
  service: CMSService,
})


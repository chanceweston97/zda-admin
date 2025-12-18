// CMS Module
import { Module } from "@medusajs/framework/utils"
import CMSService from "./service"
import Hero from "./models/hero"
import Instruction from "./models/instruction"
import FAQ from "./models/faq"
import ProudPartners from "./models/proud-partners"
import WhatWeOffer from "./models/what-we-offer"
import OurStory from "./models/our-story"

export const CMS_MODULE = "cms"

export default Module(CMS_MODULE, {
  service: CMSService,
})


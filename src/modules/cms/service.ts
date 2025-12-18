// CMS Service - CRUD operations for CMS content
import { MedusaService } from "@medusajs/framework/utils"
import Hero from "./models/hero"
import Instruction from "./models/instruction"
import FAQ from "./models/faq"
import ProudPartners from "./models/proud-partners"
import WhatWeOffer from "./models/what-we-offer"
import OurStory from "./models/our-story"

class CMSService extends MedusaService({
  Hero,
  Instruction,
  FAQ,
  ProudPartners,
  WhatWeOffer,
  OurStory,
}) {
  // Hero Banner methods
  async listHeroes(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const heroes = await this.listHero_(query)
    return heroes.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
  }

  async getHero(id: string) {
    return await this.retrieveHero_(id)
  }

  async createHero(data: any) {
    return await this.createHero_(data)
  }

  async updateHero(id: string, data: any) {
    return await this.updateHero_(id, data)
  }

  async deleteHero(id: string) {
    return await this.deleteHero_(id)
  }

  // Hero Introduction methods
  async listInstructions(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const instructions = await this.listInstruction_(query)
    return instructions
  }

  async getInstruction(id: string) {
    return await this.retrieveInstruction_(id)
  }

  async createOrUpdateInstruction(data: any) {
    // Get first instruction or create new
    const existing = await this.listInstruction_({})
    if (existing.length > 0) {
      return await this.updateInstruction_(existing[0].id, data)
    }
    return await this.createInstruction_(data)
  }

  async updateInstruction(id: string, data: any) {
    return await this.updateInstruction_(id, data)
  }

  async deleteInstruction(id: string) {
    return await this.deleteInstruction_(id)
  }

  // Proud Partners methods
  async getProudPartners(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const partners = await this.listProudPartners_(query)
    return partners[0] || null // Return first (singleton)
  }

  async createOrUpdateProudPartners(data: any) {
    const existing = await this.listProudPartners_({})
    if (existing.length > 0) {
      return await this.updateProudPartners_(existing[0].id, data)
    }
    return await this.createProudPartners_(data)
  }

  // What We Offer methods
  async getWhatWeOffer(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const offers = await this.listWhatWeOffer_(query)
    return offers[0] || null // Return first (singleton)
  }

  async createOrUpdateWhatWeOffer(data: any) {
    const existing = await this.listWhatWeOffer_({})
    if (existing.length > 0) {
      return await this.updateWhatWeOffer_(existing[0].id, data)
    }
    return await this.createWhatWeOffer_(data)
  }

  // Our Story methods
  async getOurStory(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const stories = await this.listOurStory_(query)
    return stories[0] || null // Return first (singleton)
  }

  async createOrUpdateOurStory(data: any) {
    const existing = await this.listOurStory_({})
    if (existing.length > 0) {
      return await this.updateOurStory_(existing[0].id, data)
    }
    return await this.createOurStory_(data)
  }

  // FAQ methods
  async getFAQ(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const faqs = await this.listFAQ_(query)
    return faqs[0] || null // Return first (singleton)
  }

  async createOrUpdateFAQ(data: any) {
    const existing = await this.listFAQ_({})
    if (existing.length > 0) {
      return await this.updateFAQ_(existing[0].id, data)
    }
    return await this.createFAQ_(data)
  }

  async updateFAQ(id: string, data: any) {
    return await this.updateFAQ_(id, data)
  }

  async deleteFAQ(id: string) {
    return await this.deleteFAQ_(id)
  }
}

export default CMSService

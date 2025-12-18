// CMS Parent Menu Page
import { Container, Heading, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

const CMSPage = () => {
  return (
    <Container>
      <div className="flex flex-col gap-4">
        <div>
          <Heading level="h1">CMS Management</Heading>
          <Text className="text-gray-600 mt-2">
            Manage your website content including hero banners, hero introduction, proud partners, what we offer, our story, and FAQs.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Link
            to="/app/cms/heroes"
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <Heading level="h2" className="text-lg mb-2">Hero Banners</Heading>
            <Text className="text-sm text-gray-600">
              Manage homepage hero banner images and content
            </Text>
          </Link>

          <Link
            to="/app/cms/instructions"
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <Heading level="h2" className="text-lg mb-2">Hero Introduction</Heading>
            <Text className="text-sm text-gray-600">
              Edit hero section introduction text and images
            </Text>
          </Link>

          <Link
            to="/app/cms/proud-partners"
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <Heading level="h2" className="text-lg mb-2">Proud Partners</Heading>
            <Text className="text-sm text-gray-600">
              Manage partner logos and brands
            </Text>
          </Link>

          <Link
            to="/app/cms/what-we-offer"
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <Heading level="h2" className="text-lg mb-2">What We Offer</Heading>
            <Text className="text-sm text-gray-600">
              Manage product/service offerings section
            </Text>
          </Link>

          <Link
            to="/app/cms/our-story"
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <Heading level="h2" className="text-lg mb-2">Our Story</Heading>
            <Text className="text-sm text-gray-600">
              Edit company story and focus areas
            </Text>
          </Link>

          <Link
            to="/app/cms/faqs"
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <Heading level="h2" className="text-lg mb-2">FAQs</Heading>
            <Text className="text-sm text-gray-600">
              Manage frequently asked questions
            </Text>
          </Link>
        </div>
      </div>
    </Container>
  )
}

export const config = {
  label: "CMS",
  icon: "DocumentText",
  path: "/cms",
}

export default CMSPage


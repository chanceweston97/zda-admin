// Proud Partners Management Page
import { Container, Heading, Button, Text, Input, Label, Switch } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface Partner {
  name: string
  logo: string
}

const ProudPartnersPage = () => {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    partners: [] as Partner[],
    is_active: true,
  })
  const [newPartner, setNewPartner] = useState({ name: "", logo: "" })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/proud-partners", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.partners) {
          setFormData({
            title: data.partners.title || "",
            partners: data.partners.partners || [],
            is_active: data.partners.is_active ?? true,
          })
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/proud-partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Saved successfully!")
        loadData()
      }
    } catch (error) {
      console.error("Error saving:", error)
      alert("Failed to save")
    } finally {
      setLoading(false)
    }
  }

  const handleAddPartner = () => {
    if (newPartner.name && newPartner.logo) {
      setFormData({
        ...formData,
        partners: [...formData.partners, { ...newPartner }],
      })
      setNewPartner({ name: "", logo: "" })
    }
  }

  const handleRemovePartner = (index: number) => {
    setFormData({
      ...formData,
      partners: formData.partners.filter((_, i) => i !== index),
    })
  }

  const handleFileUpload = async (file: File, isNew: boolean = false) => {
    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const fileUrl = data.files?.[0]?.url || data.uploads?.[0]?.url || data.url
        if (fileUrl) {
          if (isNew) {
            setNewPartner((prev) => ({ ...prev, logo: fileUrl }))
          }
          return fileUrl
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
    return null
  }

  if (loading && !formData.title) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Container>
      <div className="mb-6">
        <Heading level="h1">Proud Partners</Heading>
        <Text className="text-gray-600 mt-2">
          Manage partner logos and brands displayed on the homepage
        </Text>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Proud Partners Of"
          />
        </div>

        <div>
          <Label>Partners</Label>
          <div className="space-y-4 mt-2">
            {formData.partners.map((partner, index) => (
              <div key={index} className="flex gap-4 items-center p-4 border rounded">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-24 h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png"
                  }}
                />
                <div className="flex-1">
                  <Text className="font-medium">{partner.name}</Text>
                  <Text className="text-sm text-gray-500">{partner.logo}</Text>
                </div>
                <Button
                  variant="transparent"
                  onClick={() => handleRemovePartner(index)}
                >
                  Remove
                </Button>
              </div>
            ))}

            <div className="border-2 border-dashed p-4 rounded">
              <div className="space-y-2">
                <Input
                  placeholder="Partner Name"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Logo URL"
                    value={newPartner.logo}
                    onChange={(e) => setNewPartner({ ...newPartner, logo: e.target.value })}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, true)
                    }}
                  />
                </div>
                <Button onClick={handleAddPartner} disabled={!newPartner.name || !newPartner.logo}>
                  Add Partner
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active" className="ml-2">Active</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = {
  label: "Proud Partners",
  icon: "Users",
  path: "/cms/proud-partners",
  parent: "CMS",
}

export default ProudPartnersPage


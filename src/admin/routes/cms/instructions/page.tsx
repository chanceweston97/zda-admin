// Hero Introduction Management Page
import { Container, Heading, Button, Text, Input, Textarea, Label, Switch } from "@medusajs/ui"
import { useState, useEffect } from "react"

const InstructionsPage = () => {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    buttons: [] as Array<{ text: string; link: string }>,
    image: "",
    is_active: true,
  })
  const [newButton, setNewButton] = useState({ text: "", link: "" })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/instructions", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.instruction) {
          setFormData({
            name: data.instruction.name || "",
            title: data.instruction.title || "",
            description: data.instruction.description || "",
            buttons: data.instruction.buttons || [],
            image: data.instruction.image || "",
            is_active: data.instruction.is_active ?? true,
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
      const response = await fetch("/admin/cms/instructions", {
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

  const handleFileUpload = async (file: File) => {
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
          setFormData((prev) => ({ ...prev, image: fileUrl }))
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
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
        <Heading level="h1">Hero Introduction</Heading>
        <Text className="text-gray-600 mt-2">
          Edit hero section introduction text and images
        </Text>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enabling Wireless Networks Since 2008"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            placeholder="At ZDA Communications, we care about one thing above all: reliable wireless performance..."
          />
        </div>

        <div>
          <Label>Buttons</Label>
          <div className="space-y-2 mt-2">
            {formData.buttons.map((button, index) => (
              <div key={index} className="flex gap-2 items-center p-2 border rounded">
                <Text className="flex-1">{button.text} → {button.link}</Text>
                <Button
                  variant="transparent"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      buttons: formData.buttons.filter((_, i) => i !== index),
                    })
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="border-2 border-dashed p-4 rounded space-y-2">
              <Input
                placeholder="Button Text"
                value={newButton.text}
                onChange={(e) => setNewButton({ ...newButton, text: e.target.value })}
              />
              <Input
                placeholder="Button Link"
                value={newButton.link}
                onChange={(e) => setNewButton({ ...newButton, link: e.target.value })}
              />
              <Button
                onClick={() => {
                  if (newButton.text && newButton.link) {
                    setFormData({
                      ...formData,
                      buttons: [...formData.buttons, { ...newButton }],
                    })
                    setNewButton({ text: "", link: "" })
                  }
                }}
                disabled={!newButton.text || !newButton.link}
              >
                Add Button
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
          <Input
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="mt-2"
            placeholder="Or enter image URL"
          />
          {formData.image && (
            <img src={formData.image} alt="Preview" className="w-64 h-64 object-cover rounded mt-2" />
          )}
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
  label: "Hero Introduction",
  icon: "DocumentText",
  parent: "CMS",
}

export default InstructionsPage

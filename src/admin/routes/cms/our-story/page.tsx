// Our Story Management Page
import { Container, Heading, Button, Text, Input, Textarea, Label, Switch } from "@medusajs/ui"
import { useState, useEffect } from "react"

const OurStoryPage = () => {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Hero Section
    hero_title: "",
    hero_description: "",
    // What We Focus On
    focus_title: "",
    focus_intro_text: "",
    focus_items: [] as Array<{ title: string; description: string }>,
    focus_closing_text: "",
    focus_image: "",
    // Let's Work Together
    work_title: "",
    work_intro_text: "",
    work_subtitle: "",
    work_items: [] as string[],
    work_closing_text: "",
    work_image: "",
    work_buttons: [] as Array<{ text: string; link: string }>,
    is_active: true,
  })
  const [newFocusItem, setNewFocusItem] = useState({ title: "", description: "" })
  const [newWorkItem, setNewWorkItem] = useState("")
  const [newWorkButton, setNewWorkButton] = useState({ text: "", link: "" })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/our-story", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.story) {
          setFormData({
            hero_title: data.story.hero_title || "",
            hero_description: data.story.hero_description || "",
            focus_title: data.story.focus_title || "",
            focus_intro_text: data.story.focus_intro_text || "",
            focus_items: data.story.focus_items || [],
            focus_closing_text: data.story.focus_closing_text || "",
            focus_image: data.story.focus_image || "",
            work_title: data.story.work_title || "",
            work_intro_text: data.story.work_intro_text || "",
            work_subtitle: data.story.work_subtitle || "",
            work_items: data.story.work_items || [],
            work_closing_text: data.story.work_closing_text || "",
            work_image: data.story.work_image || "",
            work_buttons: data.story.work_buttons || [],
            is_active: data.story.is_active ?? true,
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
      const response = await fetch("/admin/cms/our-story", {
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

  const handleFileUpload = async (file: File, field: "focus_image" | "work_image") => {
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
          setFormData((prev) => ({ ...prev, [field]: fileUrl }))
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  if (loading && !formData.hero_title) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Container>
      <div className="mb-6">
        <Heading level="h1">Our Story</Heading>
        <Text className="text-gray-600 mt-2">
          Edit company story and focus areas
        </Text>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="border p-6 rounded">
          <Heading level="h2" className="mb-4">Hero Section</Heading>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.hero_title}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                placeholder="Our Story"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.hero_description}
                onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* What We Focus On */}
        <div className="border p-6 rounded">
          <Heading level="h2" className="mb-4">What We Focus On</Heading>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.focus_title}
                onChange={(e) => setFormData({ ...formData, focus_title: e.target.value })}
              />
            </div>
            <div>
              <Label>Intro Text</Label>
              <Textarea
                value={formData.focus_intro_text}
                onChange={(e) => setFormData({ ...formData, focus_intro_text: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Focus Items</Label>
              <div className="space-y-2 mt-2">
                {formData.focus_items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start p-2 border rounded">
                    <div className="flex-1">
                      <Text className="font-medium">{item.title}</Text>
                      <Text className="text-sm text-gray-600">{item.description}</Text>
                    </div>
                    <Button
                      variant="transparent"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          focus_items: formData.focus_items.filter((_, i) => i !== index),
                        })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="border-2 border-dashed p-4 rounded space-y-2">
                  <Input
                    placeholder="Item Title"
                    value={newFocusItem.title}
                    onChange={(e) => setNewFocusItem({ ...newFocusItem, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Item Description"
                    value={newFocusItem.description}
                    onChange={(e) => setNewFocusItem({ ...newFocusItem, description: e.target.value })}
                    rows={2}
                  />
                  <Button
                    onClick={() => {
                      if (newFocusItem.title && newFocusItem.description) {
                        setFormData({
                          ...formData,
                          focus_items: [...formData.focus_items, { ...newFocusItem }],
                        })
                        setNewFocusItem({ title: "", description: "" })
                      }
                    }}
                    disabled={!newFocusItem.title || !newFocusItem.description}
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label>Closing Text</Label>
              <Textarea
                value={formData.focus_closing_text}
                onChange={(e) => setFormData({ ...formData, focus_closing_text: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "focus_image")
                }}
              />
              <Input
                value={formData.focus_image}
                onChange={(e) => setFormData({ ...formData, focus_image: e.target.value })}
                placeholder="Or enter image URL"
                className="mt-2"
              />
              {formData.focus_image && (
                <img src={formData.focus_image} alt="Preview" className="w-32 h-32 object-cover rounded mt-2" />
              )}
            </div>
          </div>
        </div>

        {/* Let's Work Together */}
        <div className="border p-6 rounded">
          <Heading level="h2" className="mb-4">Let's Work Together</Heading>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.work_title}
                onChange={(e) => setFormData({ ...formData, work_title: e.target.value })}
              />
            </div>
            <div>
              <Label>Intro Text</Label>
              <Textarea
                value={formData.work_intro_text}
                onChange={(e) => setFormData({ ...formData, work_intro_text: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={formData.work_subtitle}
                onChange={(e) => setFormData({ ...formData, work_subtitle: e.target.value })}
                placeholder="That includes:"
              />
            </div>
            <div>
              <Label>Items</Label>
              <div className="space-y-2 mt-2">
                {formData.work_items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 border rounded">
                    <Text className="flex-1">{item}</Text>
                    <Button
                      variant="transparent"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          work_items: formData.work_items.filter((_, i) => i !== index),
                        })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add item"
                    value={newWorkItem}
                    onChange={(e) => setNewWorkItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newWorkItem.trim()) {
                        setFormData({
                          ...formData,
                          work_items: [...formData.work_items, newWorkItem.trim()],
                        })
                        setNewWorkItem("")
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (newWorkItem.trim()) {
                        setFormData({
                          ...formData,
                          work_items: [...formData.work_items, newWorkItem.trim()],
                        })
                        setNewWorkItem("")
                      }
                    }}
                    disabled={!newWorkItem.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label>Closing Text</Label>
              <Textarea
                value={formData.work_closing_text}
                onChange={(e) => setFormData({ ...formData, work_closing_text: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "work_image")
                }}
              />
              <Input
                value={formData.work_image}
                onChange={(e) => setFormData({ ...formData, work_image: e.target.value })}
                placeholder="Or enter image URL"
                className="mt-2"
              />
              {formData.work_image && (
                <img src={formData.work_image} alt="Preview" className="w-32 h-32 object-cover rounded mt-2" />
              )}
            </div>
            <div>
              <Label>Buttons</Label>
              <div className="space-y-2 mt-2">
                {formData.work_buttons.map((button, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 border rounded">
                    <Text className="flex-1">{button.text} → {button.link}</Text>
                    <Button
                      variant="transparent"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          work_buttons: formData.work_buttons.filter((_, i) => i !== index),
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
                    value={newWorkButton.text}
                    onChange={(e) => setNewWorkButton({ ...newWorkButton, text: e.target.value })}
                  />
                  <Input
                    placeholder="Button Link"
                    value={newWorkButton.link}
                    onChange={(e) => setNewWorkButton({ ...newWorkButton, link: e.target.value })}
                  />
                  <Button
                    onClick={() => {
                      if (newWorkButton.text && newWorkButton.link) {
                        setFormData({
                          ...formData,
                          work_buttons: [...formData.work_buttons, { ...newWorkButton }],
                        })
                        setNewWorkButton({ text: "", link: "" })
                      }
                    }}
                    disabled={!newWorkButton.text || !newWorkButton.link}
                  >
                    Add Button
                  </Button>
                </div>
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
  label: "Our Story",
  icon: "Book",
  parent: "CMS",
}

export default OurStoryPage


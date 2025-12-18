// Route to serve uploaded files at root level
// Handles URLs like /1766026745731-antenna.png (without /static prefix)
// Serves files from the static directory
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"

const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const filename = req.params.filename as string
    
    if (!filename) {
      res.status(400).json({ message: "Filename required" })
      return
    }

    // Skip if it's a known API route or admin route
    const skipRoutes = ['admin', 'store', 'static', 'app', 'health']
    if (skipRoutes.includes(filename.split('/')[0])) {
      res.status(404).json({ message: "Not found" })
      return
    }

    // Construct the full file path in static directory
    const staticDir = path.join(process.cwd(), "static")
    const requestedPath = path.join(staticDir, filename)

    // Security: Ensure the path is within the static directory
    const resolvedPath = path.resolve(requestedPath)
    const resolvedStaticDir = path.resolve(staticDir)
    
    if (!resolvedPath.startsWith(resolvedStaticDir)) {
      res.status(403).json({ message: "Access denied" })
      return
    }

    // Check if file exists
    try {
      const fileStat = await stat(resolvedPath)
      if (!fileStat.isFile()) {
        res.status(404).json({ message: "File not found" })
        return
      }
    } catch (error) {
      res.status(404).json({ message: "File not found" })
      return
    }

    // Read and serve the file
    const fileContent = await readFile(resolvedPath)
    const ext = path.extname(resolvedPath).toLowerCase()

    // Set appropriate content type
    const contentTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
    }

    const contentType = contentTypes[ext] || "application/octet-stream"
    
    res.setHeader("Content-Type", contentType)
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
    res.end(fileContent)
  } catch (error: any) {
    console.error("Error serving file:", error)
    res.status(500).json({
      message: "Failed to serve file",
      error: error.message,
    })
  }
}


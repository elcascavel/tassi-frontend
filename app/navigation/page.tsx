"use client"

import { useState } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon } from "lucide-react"
import { useUserId } from "@/hooks/useUserId"

export default function Page() {
  const userId = useUserId()
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [enabled] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateMap = async () => {
    if (!name || !file || !userId) return

    const formData = new FormData()
    formData.append("name", name)
    formData.append("user_id", userId.toString())
    formData.append("enabled", String(enabled))
    formData.append("image", file)

    setLoading(true)
    try {
      const res = await fetch("/api/maps/create", {
        method: "POST",
        body: formData,
      })
  
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
  
      if (!res.ok) throw new Error(data?.error)
  
      setMapUrl(data.imageUrl || data.image || "/fallback.png")
      setDialogOpen(false)
      setName("")
      setFile(null)
    } catch (err) {
      console.error("Error creating map:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 space-y-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <div className="flex justify-between">
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Map
                </Button>
              </DialogTrigger>
            </div>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Map</DialogTitle>
                <DialogDescription>
                  Upload an image and name your map.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="button" disabled={loading} onClick={handleCreateMap}>
                  {loading ? "Uploading..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {mapUrl && (
            <div className="mt-6">
              <p className="font-semibold mb-2">Uploaded Map:</p>
              <img src={mapUrl} alt="Uploaded map" className="max-w-full h-auto border" />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

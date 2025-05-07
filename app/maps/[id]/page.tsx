"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type Map = {
  id: number
  name: string
  path: string
  enabled: boolean
}

export default function MapDetailPage() {
  const { id } = useParams()
  const [map, setMap] = useState<Map | null>(null)

  useEffect(() => {
    fetch(`/api/maps/${id}`)
      .then(res => res.json())
      .then(json => setMap(json?.data ?? null))
      .catch(err => console.error("Failed to load map", err))
  }, [id])

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 space-y-4">
          {map ? (
            <div>
              <h1 className="text-xl font-bold">{map.name}</h1>
              <img src={map.path} alt={`Map ${map.name}`} className="rounded border mt-4" />
            </div>
          ) : (
            <p>Loading map...</p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

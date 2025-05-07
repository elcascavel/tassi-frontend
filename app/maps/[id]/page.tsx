/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface Map {
  id: number
  name: string
  path: string
  enabled: boolean
}

interface Point {
  id: number
  x: number
  y: number
  enabled: boolean
  map_id: number
}

export default function Page() {
  const { id } = useParams()
  const [map, setMap] = useState<Map | null>(null)
  const [points, setPoints] = useState<Point[]>([])

  useEffect(() => {
    fetch(`/api/maps/${id}`)
      .then(res => res.json())
      .then(json => setMap(json?.data ?? null))
      .catch(err => console.error("Failed to load map", err))

    fetch(`/api/maps/${id}/points`)
      .then(res => res.json())
      .then(json => setPoints(json?.data?.points ?? []))
      .catch(err => console.error("Failed to load points", err))
  }, [id])

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 space-y-4">
          {map ? (
            <div>
              <h1 className="text-xl font-bold mb-4">{map.name}</h1>
              <div className="relative inline-block">
                <img
                  src={map.path}
                  alt={`Map ${map.name}`}
                  className="rounded border"
                />
                {points.map(p => (
                  <div
                    key={p.id}
                    className="absolute w-3 h-3 bg-red-500 rounded-full border border-white shadow"
                    style={{
                      left: `${p.x}px`,
                      top: `${p.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    title={`Beacon #${p.id}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p>Loading map...</p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ColumnDef } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { IconDotsVertical } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { getStatusVariant } from "@/lib/utils"

type Beacon = {
  id: number
  name: string
  statusId: number
  updated: string
}

type Status = {
  id: number
  name: string
}

export default function Page() {
  const [beacons, setBeacons] = useState<Beacon[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [beaconsRes, statusesRes] = await Promise.all([
          fetch("/api/beacons"),
          fetch("/api/GetStatus"),
        ])
  
        const beaconsData = await beaconsRes.json()
        const statusesData = await statusesRes.json()
  
        if (beaconsData.data && statusesData.data) {
          setBeacons(beaconsData.data.beacons)
          setStatuses(statusesData.data.status)
        } else {
          console.warn("Unexpected response format.")
          setBeacons([])
          setStatuses([])
        }
      } catch (err) {
        console.error("Failed to load data:", err)
        setBeacons([])
        setStatuses([])
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [])

  const beaconColumns: ColumnDef<Beacon>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "statusId",
      header: "Status",
      cell: ({ row }) => {
        const status = statuses.find((s) => s.id === row.original.statusId)
        const variant = getStatusVariant(status?.name ?? "unknown")
    
        return (
          <Badge variant={variant}>
            {status?.name ?? "Unknown"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "updated",
      header: "Updated",
      cell: ({ row }) => {
        const updated = new Date(row.original.updated)
        return <span>{updated.toLocaleDateString()} {updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDotsVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Edit", row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Delete", row.original)}
              className="text-red-500"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      ),
    },
  ]

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {loading ? (
                <p className="text-sm text-muted">Loading beacons...</p>
              ) : (
                <DataTable data={beacons} columns={beaconColumns} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

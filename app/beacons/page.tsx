"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { ColumnDef } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { IconDotsVertical } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { getStatusVariant } from "@/lib/utils"
import { PlusIcon } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useUserId } from "@/hooks/useUserId"

type Beacon = {
  id: number
  name: string
  statusId: number
  created: string
}

type Status = {
  id: number
  name: string
}

type BeaconType = {
  id: number,
  name: string,
  enabled: boolean,
}

export default function Page() {
  const userId = useUserId()
  const [beacons, setBeacons] = useState<Beacon[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [types, setTypes]   = useState<BeaconType[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newBeaconName, setNewBeaconName] = useState("")
  const [newStatusId, setNewStatusId] = useState<number | null>(null)
  const [newDescription, setNewDescription] = useState("")
  const [typeId, setTypeId] = useState<number | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [beaconsRes, statusesRes, typesRes] = await Promise.all([
          fetch("/api/beacons"),
          fetch("/api/status"),
          fetch("/api/beacons/types"),
        ])
  
        const beaconsData = await beaconsRes.json()
        const statusesData = await statusesRes.json()
        const typesData = await typesRes.json()
  
        if (beaconsData.data && statusesData.data && typesData.data) {
          setBeacons(beaconsData.data.beacons)
          setStatuses(statusesData.data.status)
          setTypes(typesData.data.beacon_types)
        } else {
          console.warn("Unexpected response format.")
          setBeacons([])
          setStatuses([])
          setTypes([])
        }
      } catch (err) {
        console.error("Failed to load data:", err)
        setBeacons([])
        setStatuses([])
        setTypes([])
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
      accessorKey: "created",
      header: "Created",
      cell: ({ row }) => {
        const created = new Date(row.original.created)
        return <span>{created.toLocaleDateString()} {created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <div className="flex items-center justify-between px-4 lg:px-6">
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        <PlusIcon className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline">Add Beacon</span>
      </Button>
    </DialogTrigger>
  </div>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Beacon</DialogTitle>
      <DialogDescription>
        Fill in the information to create a new beacon.
      </DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input
          id="name"
          value={newBeaconName}
          onChange={(e) => setNewBeaconName(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
  <Label htmlFor="description" className="text-right pt-2">Description</Label>
  <textarea
    id="description"
    value={newDescription}
    onChange={(e) => setNewDescription(e.target.value)}
    className="col-span-3 border rounded px-3 py-2 h-24 resize-none"
    placeholder="Enter beacon description..."
  />
</div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">Status</Label>
        <select
          id="status"
          value={newStatusId ?? ""}
          onChange={(e) => setNewStatusId(Number(e.target.value))}
          className="col-span-3 border rounded px-3 py-2"
        >
          <option value="" disabled>Select status</option>
          {statuses?.map(status => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
  <Label className="text-right">Type</Label>
  <select
    value={typeId ?? ""}
    onChange={e => setTypeId(Number(e.target.value))}
    className="col-span-3 border rounded px-3 py-2"
  >
    <option value="" disabled>Select type</option>
    {types?.map(t => (
      <option key={t.id} value={t.id}>{t.name}</option>
    ))}
  </select>
</div>
    </div>

    <DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="secondary">Cancel</Button>
      </DialogClose>
      <Button
        type="button"
        onClick={async () => {
          if (!newBeaconName || !newStatusId || !userId) return

          const res = await fetch("/api/beacons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newBeaconName,
              enabled: true,
              description: newDescription,
              point_id: 2,
              type_id: typeId,
              status_id: newStatusId,
              user_id: userId,
            }),
          })

          const data = await res.json()
          if (res.ok) {
            setBeacons(prev => [...prev, data.data.beacon])
            setDialogOpen(false)
            setNewBeaconName("")
            setNewStatusId(null)
          } else {
            console.error("Failed to create beacon", data)
          }
        }}
      >
        Create
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
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

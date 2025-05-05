"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ColumnDef } from "@tanstack/react-table"
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
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useUser } from "@auth0/nextjs-auth0/client"

type Disability = {
  id: number
  name: string
  enabled: boolean
}

export default function Page() {
  const { user } = useUser()
  const [disabilities, setDisabilities] = useState<Disability[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSeverity, setNewSeverity] = useState(0)
  const [newEnabled, setNewEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDisabilities() {
      try {
        const res = await fetch("/api/disabilities")
        const data = await res.json()
        if (data?.data?.disabilities) {
            setDisabilities(data.data.disabilities)
        } else {
          console.warn("Unexpected response format", data)
        }
      } catch (err) {
        console.error("Failed to fetch beacon types", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDisabilities()
  }, [])

  const disabilityColumns: ColumnDef<Disability>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "severity", header: "Severity" },
    {
      accessorKey: "enabled",
      header: "Enabled",
      cell: ({ row }) => (row.original.enabled ? "Yes" : "No"),
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
          <div className="flex flex-col gap-4 py-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <div className="flex items-center justify-between px-4 lg:px-6">
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    <span className="hidden lg:inline">Add Disability</span>
                  </Button>
                </DialogTrigger>
              </div>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Disability</DialogTitle>
                  <DialogDescription>
                    Provide a name, severity (0-10), and set enabled status.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="severity" className="text-right">Severity</Label>
                    <Input
                      id="severity"
                      type="number"
                      min={0}
                      max={10}
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="enabled" className="text-right">Enabled</Label>
                    <select
                      id="enabled"
                      value={newEnabled ? "true" : "false"}
                      onChange={(e) => setNewEnabled(e.target.value === "true")}
                      className="col-span-3 border rounded px-3 py-2"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
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
                      if (!newName) return

                      const res = await fetch("/api/disabilities", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: newName,
                          severity: newSeverity,
                          enabled: newEnabled,
                          created_by: user?.sub,
                        }),
                      })

                      const data = await res.json()
                      if (res.ok) {
                        setDisabilities(prev => [...prev, data.data.disability])
                        setDialogOpen(false)
                        setNewName("")
                        setNewSeverity(0)
                        setNewEnabled(true)
                      } else {
                        console.error("Failed to create disability", data)
                      }
                    }}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {loading ? (
              <p className="text-sm text-muted">Loading disabilities...</p>
            ) : (
              <DataTable data={disabilities} columns={disabilityColumns} />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
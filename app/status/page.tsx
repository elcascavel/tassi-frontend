"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { IconDotsVertical } from "@tabler/icons-react"
import { PlusIcon } from "lucide-react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import { useTranslationModal } from "@/hooks/useTranslationModal"

type Status = {
  id: number
  name: string
  enabled: boolean
}

export default function Page() {
  const { user } = useUser()
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Status | null>(null)
  const [name, setName] = useState("")
  const [enabled, setEnabled] = useState(true)

  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null)

  const { openTranslationModal, TranslationModalWrapper } = useTranslationModal("status", "status_id")

  useEffect(() => {
    ;(async () => {
      const res = await fetch("/api/status")
      const json = await res.json()
      setStatuses(json?.data?.status ?? [])
      setLoading(false)
    })()
  }, [])

  const save = async () => {
    if (!name) return
    if (editing) {
      const res = await fetch(`/api/status/update/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, enabled }),
      })
      const json = await res.json()
      if (res.ok)
        setStatuses((p) => p.map((s) => (s.id === editing.id ? json.data : s)))
    } else {
      const res = await fetch("/api/status/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, enabled, created_by: user?.sub }),
      })
      const json = await res.json()
      if (res.ok) setStatuses((p) => [...p, json.data])
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/status/delete/${id}`, { method: "DELETE" })
    if (res.ok) setStatuses((p) => p.filter((s) => s.id !== id))
  }

  const columns: ColumnDef<Status>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "enabled",
      header: "Enabled",
      cell: ({ row }) => (row.original.enabled ? "Yes" : "No"),
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
              <DropdownMenuItem
                onClick={() => {
                  setEditing(row.original)
                  setName(row.original.name)
                  setEnabled(row.original.enabled)
                  setDialogOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openTranslationModal(row.original.id)}>
                Translate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setStatusToDelete(row.original)}
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
          <div className="flex flex-col gap-4 py-6">
            <Button
              variant="outline"
              size="sm"
              className="self-start ml-4 lg:ml-6"
              onClick={() => {
                setEditing(null)
                setName("")
                setEnabled(true)
                setDialogOpen(true)
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add Status</span>
            </Button>

            {loading ? (
              <DataTableSkeleton columnCount={columns.length} />
            ) : (
              <DataTable data={statuses} columns={columns} />
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Status" : "Add Status"}</DialogTitle>
                  <DialogDescription>Provide a name and enabled flag.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Enabled</Label>
                    <select
                      value={enabled ? "true" : "false"}
                      onChange={(e) => setEnabled(e.target.value === "true")}
                      className="col-span-3 border rounded px-3 py-2"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>

      {statusToDelete && (
        <AlertDialog open onOpenChange={(o) => !o && setStatusToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Delete <strong>{statusToDelete.name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setStatusToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete(statusToDelete.id)
                  setStatusToDelete(null)
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <TranslationModalWrapper />
    </SidebarProvider>
  )
}

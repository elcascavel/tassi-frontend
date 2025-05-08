"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { IconDotsVertical } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog"

type Ticket = {
  id: number
  title: string
  content: string
  category_id: number
  created_by: string
}

type Category = {
  id: number
  name: string
}

type User = {
  id: string
  name: string
}

export default function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null)
  const [ticketToView, setTicketToView] = useState<Ticket | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [ticketsRes, categoriesRes, usersRes] = await Promise.all([
          fetch("/api/support"),
          fetch("/api/support/categories"),
          fetch("/api/users"),
        ])

        const ticketsData = await ticketsRes.json()
        const categoriesData = await categoriesRes.json()
        const usersData = await usersRes.json()

        setTickets(ticketsData.data?.tickets || [])
        setCategories(categoriesData.data?.categories || [])
        setUsers(usersData.data?.users || [])
      } catch (err) {
        console.error("Failed to load data:", err)
        toast.error("Failed to load ticket data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const confirmDelete = (ticket: Ticket) => {
    setTicketToDelete(ticket)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!ticketToDelete) return
    try {
      const res = await fetch(`/api/support/delete/${ticketToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete ticket.")

      setTickets(prev => prev.filter(ticket => ticket.id !== ticketToDelete.id))

      toast("Ticket deleted", {
        description: ticketToDelete.title,
        action: {
          label: "Undo",
          onClick: () => {
            setTickets(prev => [ticketToDelete, ...prev])
            toast.success("Ticket restored.")
          },
        },
      })
    } catch (err) {
      console.error("Error deleting ticket:", err)
      toast.error("Could not delete the ticket.")
    } finally {
      setDialogOpen(false)
      setTicketToDelete(null)
    }
  }

  const ticketColumns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "content",
      header: "Content",
    },
    {
      accessorKey: "category_id",
      header: "Category",
      cell: ({ row }) => {
        const category = categories.find(c => c.id === row.original.category_id)
        return category?.name || "Unknown"
      },
    },
    {
      accessorKey: "created_by",
      header: "Created By",
      cell: ({ row }) => {
        const user = users.find(u => u.id === row.original.created_by)
        return user?.name || "Unknown"
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
              <DropdownMenuItem onClick={() => {
                setTicketToView(row.original)
                setViewDialogOpen(true)
              }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => confirmDelete(row.original)}
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
    <>
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
                  <p className="text-sm text-muted">Loading tickets...</p>
                ) : (
                  <DataTable data={tickets} columns={ticketColumns} />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ticket #{ticketToDelete?.id}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ticketToView?.title} - {ticketToView?.id}</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap">
              {ticketToView?.content}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <p><strong>Category:</strong> {categories.find(c => c.id === ticketToView?.category_id)?.name || "Unknown"}</p>
            <p><strong>Created By:</strong> {users.find(u => u.id === ticketToView?.created_by)?.name || "Unknown"}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

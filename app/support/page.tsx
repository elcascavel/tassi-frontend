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

type Ticket = {
  id: number
  title: string
  content: string
  category_id: number
  create_by: string
}

export default function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [ticketsRes] = await Promise.all([
          fetch("/api/support"),
        ])
  
        const ticketsData = await ticketsRes.json()
  
        if (ticketsData.data) {
          setTickets(ticketsData.data.tickets)
        } else {
          console.warn("Unexpected response format.")
          setTickets([])
        }
      } catch (err) {
        console.error("Failed to load data:", err)
        setTickets([])
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [])

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
                <p className="text-sm text-muted">Loading tickets...</p>
              ) : (
                <DataTable data={tickets} columns={ticketColumns} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

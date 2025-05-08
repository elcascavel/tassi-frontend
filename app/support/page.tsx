"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
        setTickets([])
        setCategories([])
        setUsers([])
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
      cell: ({ row }) => (
        <Link
          href={`/support/${row.original.id}`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {row.original.title}
        </Link>
      ),
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

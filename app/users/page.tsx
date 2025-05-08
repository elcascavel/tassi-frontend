/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
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
import { Button } from "@/components/ui/button"
import { IconDotsVertical } from "@tabler/icons-react"
import { useUser } from "@auth0/nextjs-auth0/client"

type User = {
  id: number
  name: string
  picture: string
  last_login: string
  created: string
  role: string
  auth_id: string
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { user } = useUser()

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users")
        const response = await res.json()

        if (response.data) {
          setUsers(response.data.users)
        } else {
          console.warn("Unexpected response format:", response)
          setUsers([])
        }
      } catch (err) {
        console.error("Failed to load users:", err)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/delete/${userId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error(`Failed to delete user ${userId}`)
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete user.")
    }
  }

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-2">
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <span>{user.name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <span className="capitalize">
            {role === "admin" ? "Administrator" : role === "user" ? "User" : role}
          </span>
        )
      }
    },
    {
      accessorKey: "last_login",
      header: "Last Login",
      cell: ({ row }) => {
        const lastSeen = new Date(row.original.last_login)
        return (
          <span>
            {lastSeen.toLocaleDateString()}{" "}
            {lastSeen.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )
      },
    },
    {
      accessorKey: "created",
      header: "Registered On",
      cell: ({ row }) => {
        const created = new Date(row.original.created)
        return (
          <span>
            {created.toLocaleDateString()}{" "}
            {created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const isCurrentUser = String(row.original.auth_id) === user?.sub

        return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDotsVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
              className={isCurrentUser ? "text-muted-foreground cursor-not-allowed opacity-50" : "text-red-500"}
              onClick={() => {
                if (!isCurrentUser) {
                  setUserToDelete(row.original)
                }
              }}
              disabled={isCurrentUser}
            >
              Delete
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        )
      },
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
                <p className="text-sm text-muted">Loading users...</p>
              ) : (
                <DataTable data={users} columns={userColumns} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {userToDelete && (
        <AlertDialog open={true} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <strong>{userToDelete.name}</strong>. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete(userToDelete.id)
                  setUserToDelete(null)
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SidebarProvider>
  )
}
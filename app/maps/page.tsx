'use client';

import { useEffect, useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { useUserId } from '@/hooks/useUserId';
import type { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import { DataTable } from '@/components/data-table';
import Link from 'next/link';
import { DataTableSkeleton } from '@/components/data-table-skeleton';

export default function Page() {
  const userId = useUserId();
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);

  // create/edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Map | null>(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [enabled, setEnabled] = useState(true);

  // delete confirmation
  const [toDelete, setToDelete] = useState<Map | null>(null);

  type Map = {
    id: number;
    name: string;
    path: string;
    enabled: boolean;
  };

  // fetch maps
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/maps');
      const json = await res.json();
      setMaps(json?.data?.maps ?? []);
      setLoading(false);
    })();
  }, []);

  const saveMap = async () => {
    if (!name || !userId) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('user_id', userId.toString());
    formData.append('enabled', String(enabled));
    if (file) formData.append('image', file);

    if (editing) {
      const res = await fetch(`/api/maps/update/${editing.id}`, {
        method: 'PUT',
        body: formData,
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        setMaps((current) =>
          current.map((m) => (m.id === editing.id ? data.data : m))
        );
      }
    } else {
      const res = await fetch('/api/maps/create', {
        method: 'POST',
        body: formData,
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        setMaps((current) => [...current, data.data]);
      }
    }

    setDialogOpen(false);
    setEditing(null);
    setName('');
    setFile(null);
    setEnabled(true);
  };

  // delete
  const deleteMap = async (id: number) => {
    const res = await fetch(`/api/maps/delete/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMaps((current) => current.filter((m) => m.id !== id));
    }
  };

  const mapColumns: ColumnDef<Map>[] = [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          href={`/maps/${row.original.id}`}
          className="text-blue-600 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'enabled',
      header: 'Enabled',
      cell: ({ row }) => (row.original.enabled ? 'Yes' : 'No'),
    },
    {
      id: 'actions',
      header: '',
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
                  const m = row.original;
                  setEditing(m);
                  setName(m.name);
                  setEnabled(m.enabled);
                  setDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setToDelete(row.original)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(null);
              setName('');
              setFile(null);
              setEnabled(true);
              setDialogOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Map
          </Button>

          {loading ? (
            <DataTableSkeleton columnCount={mapColumns.length} />
          ) : (
            <DataTable data={maps} columns={mapColumns} />
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Map' : 'Create Map'}</DialogTitle>
                <DialogDescription>
                  {editing
                    ? 'Update name, enabled status, or replace image.'
                    : 'Upload an image and name your map.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="enabled" className="text-right">
                    Enabled
                  </Label>
                  <select
                    id="enabled"
                    value={enabled ? 'true' : 'false'}
                    onChange={(e) => setEnabled(e.target.value === 'true')}
                    className="col-span-3 border rounded px-3 py-2"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Image
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={saveMap}>{editing ? 'Save' : 'Create'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          {toDelete && (
            <AlertDialog open onOpenChange={() => setToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Delete <strong>{toDelete.name}</strong>? This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setToDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteMap(toDelete.id);
                      setToDelete(null);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

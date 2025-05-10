'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';

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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { IconDotsVertical } from '@tabler/icons-react';

// Map type for select dropdown
export type MapItem = {
  id: number;
  name: string;
};

export type Point = {
  id: number;
  x: number;
  y: number;
  enabled: boolean;
  map_id: number;
};

export default function Page() {
  const [points, setPoints] = useState<Point[]>([]);
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Point | null>(null);
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [mapId, setMapId] = useState('');
  const [enabled, setEnabled] = useState(true);

  // delete confirmation
  const [toDelete, setToDelete] = useState<Point | null>(null);

  // fetch points and maps
  useEffect(() => {
    (async () => {
      try {
        const [pointsRes, mapsRes] = await Promise.all([
          fetch('/api/maps/points'),
          fetch('/api/maps'),
        ]);
        const pointsJson = await pointsRes.json();
        const mapsJson = await mapsRes.json();

        setPoints(pointsJson.data.points ?? []);
        setMaps(mapsJson.data.maps ?? []);
      } catch (err) {
        console.error('Failed to load points or maps:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const savePoint = async () => {
    if (!x || !y || !mapId) return;

    const payload = {
      x: Number.parseFloat(x),
      y: Number.parseFloat(y),
      map_id: Number.parseInt(mapId, 10),
      enabled,
    };

    let res: Response;

    if (editing) {
      const editingId = editing.id;

      res = await fetch(`/api/maps/points/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPoints((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
        );
      } else {
        const errText = await res.text();
        console.error('Failed to update point:', errText);
      }
    }

    // reset form
    setDialogOpen(false);
    setEditing(null);
    setX('');
    setY('');
    setMapId('');
    setEnabled(true);
  };

  // delete point
  const deletePoint = async (id: number) => {
    try {
      const res = await fetch(`/api/maps/points/delete/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPoints((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete point:', err);
    }
  };

  // table columns
  const columns: ColumnDef<Point>[] = [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'x',
      header: 'X',
      cell: ({ row }) => row.original.x.toFixed(2),
    },
    {
      accessorKey: 'y',
      header: 'Y',
      cell: ({ row }) => row.original.y.toFixed(2),
    },
    {
      accessorKey: 'map_id',
      header: 'Map',
      cell: ({ row }) => {
        const map = maps.find((m) => m.id === row.original.map_id);
        return map ? map.name : `#${row.original.map_id}`;
      },
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
                  const p = row.original;
                  setEditing(p);
                  setX(p.x.toString());
                  setY(p.y.toString());
                  setMapId(p.map_id.toString());
                  setEnabled(p.enabled);
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
              setX('');
              setY('');
              setMapId('');
              setEnabled(true);
              setDialogOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Point
          </Button>

          {loading ? (
            <p className="text-sm text-muted">Loading points…</p>
          ) : (
            <DataTable data={points} columns={columns} />
          )}

          {/* Create / Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Edit Point' : 'Create Point'}
                </DialogTitle>
                <DialogDescription>
                  {editing
                    ? 'Update coordinates, map or enabled flag.'
                    : 'Provide X, Y, select a map and enabled flag.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="x" className="text-right">
                    X
                  </Label>
                  <Input
                    id="x"
                    type="number"
                    step="any"
                    value={x}
                    onChange={(e) => setX(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="y" className="text-right">
                    Y
                  </Label>
                  <Input
                    id="y"
                    type="number"
                    step="any"
                    value={y}
                    onChange={(e) => setY(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="map_id" className="text-right">
                    Map
                  </Label>
                  <select
                    id="map_id"
                    value={mapId}
                    onChange={(e) => setMapId(e.target.value)}
                    className="col-span-3 border rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      Select a map
                    </option>
                    {maps.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
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
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={savePoint}>
                  {editing ? 'Save' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {toDelete && (
            <AlertDialog open onOpenChange={(o) => !o && setToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Delete point #{toDelete.id}? This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setToDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="text-red-600"
                    onClick={() => {
                      deletePoint(toDelete.id);
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

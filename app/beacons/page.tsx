'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { DataTable } from '@/components/data-table';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStatusVariant } from '@/lib/utils';
import { PencilIcon, PlusIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { useUserId } from "@/hooks/useUserId"

type Beacon = {
  id: number;
  name: string;
  description: string;
  status_id: number;
  enabled: boolean;
  type_id: number;
  point_id: number;
  user_id: number;
  created: string;
};

type Status = { id: number; name: string };
type BeaconType = { id: number; name: string; enabled: boolean };
type Point = { id: number; name: string };

export default function Page() {
  const userId = useUserId()
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [types, setTypes] = useState<BeaconType[]>([]);
  const [points, setPoints] = useState<Point[]>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
const [createFields, setCreateFields] = useState({
  name: '',
  description: '',
  status_id: 0,
  enabled: true,
  type_id: 0,
  point_id: 0,
  user_id: 0,
});


  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [beaconToEdit, setBeaconToEdit] = useState<Beacon | null>(null);

  const [editFields, setEditFields] = useState({
    name: '',
    description: '',
    status_id: 0,
    enabled: true,
    type_id: 0,
    point_id: 0,
    user_id: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [beaconsRes, statusesRes, typesRes, pointsRes] =
          await Promise.all([
            fetch('/api/beacons'),
            fetch('/api/status'),
            fetch('/api/beacons/types'),
            fetch('/api/maps/points'),
          ]);

        const [beaconsData, statusesData, typesData, pointsData] =
          await Promise.all([
            beaconsRes.json(),
            statusesRes.json(),
            typesRes.json(),
            pointsRes.json(),
          ]);

        setBeacons(beaconsData.data?.beacons || []);
        setStatuses(statusesData.data?.status || []);
        setTypes(typesData.data?.beacon_types || []);
        setPoints(pointsData.data?.points || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load beacon data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const openEditDialog = (beacon: Beacon) => {
    setBeaconToEdit(beacon);
    setEditFields({
      name: beacon.name,
      description: beacon.description,
      status_id: beacon.status_id,
      enabled: beacon.enabled,
      type_id: beacon.type_id,
      point_id: beacon.point_id,
      user_id: beacon.user_id,
    });
    setEditDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
  const res = await fetch('/api/beacons/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createFields),
  });

  const data = await res.json();

  if (res.ok) {
    setBeacons((prev) => [...prev, data.data]);
    toast.success('Beacon created.');
    setCreateDialogOpen(false);
  } else {
    console.error('Failed to create beacon', data);
    toast.error('Failed to create beacon.');
  }
};


  const handleEditSubmit = async () => {
    if (!beaconToEdit) return;

    console.log('editFields:', editFields);

    const res = await fetch(`/api/beacons/update/${beaconToEdit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFields)
    });

    const data = await res.json();
    if (res.ok) {
      setBeacons((prev) =>
        prev.map((b) =>
          b.id === beaconToEdit.id
            ? { ...b, ...editFields, user_id: editFields.user_id ?? 0 }
            : b
        )
      );
      toast.success('Beacon updated.');
      setEditDialogOpen(false);
      setBeaconToEdit(null);
    } else {
      console.error('Failed to update beacon', data);
      toast.error('Failed to update beacon.');
    }
  };

  const beaconColumns: ColumnDef<Beacon>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'status_id',
      header: 'Status',
      cell: ({ row }) => {
        const status = statuses.find((s) => s.id === row.original.status_id);
        const variant = getStatusVariant(status?.name ?? 'unknown');
        return <Badge variant={variant}>{status?.name ?? 'Unknown'}</Badge>;
      },
    },
    {
      accessorKey: 'created',
      header: 'Created',
      cell: ({ row }) => {
        const created = new Date(row.original.created);
        return (
          <span>
            {created.toLocaleDateString()}{' '}
            {created.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="text-right">
              <Button onClick={() => openEditDialog(row.original)} variant="ghost" size="icon">
                <PencilIcon className="w-4 h-4" />
              </Button>
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Button
  variant="outline"
  size="sm"
  className='self-start ml-4 lg:ml-6'
  onClick={() => {
    setCreateFields({
      name: '',
      description: '',
      status_id: statuses[0]?.id ?? 0,
      enabled: true,
      type_id: types[0]?.id ?? 0,
      point_id: points[0]?.id ?? 0,
      user_id: userId ?? 0,
    });
    setCreateDialogOpen(true);
  }}
>
  <PlusIcon className="mr-2 h-4 w-4" />
  <span className="hidden lg:inline">Create Beacon</span>
</Button>

              {loading ? (
                <p className="text-sm text-muted">Loading beacons...</p>
              ) : (
                
                <DataTable data={beacons} columns={beaconColumns} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Beacon</DialogTitle>
            <DialogDescription>
              Edit all fields of the beacon.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                value={editFields.name}
                onChange={(e) =>
                  setEditFields({ ...editFields, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Description</Label>
              <textarea
                value={editFields.description}
                onChange={(e) =>
                  setEditFields({ ...editFields, description: e.target.value })
                }
                className="col-span-3 border rounded px-3 py-2 h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <select
                value={editFields.status_id}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    status_id: Number(e.target.value),
                  })
                }
                className="col-span-3 border rounded px-3 py-2"
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Enabled</Label>
              <input
                type="checkbox"
                checked={editFields.enabled}
                onChange={(e) =>
                  setEditFields({ ...editFields, enabled: e.target.checked })
                }
                className="col-span-3 w-4 h-4"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <select
                value={editFields.type_id}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    type_id: Number(e.target.value),
                  })
                }
                className="col-span-3 border rounded px-3 py-2"
              >
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Point</Label>
              <select
                value={editFields.point_id}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    point_id: Number(e.target.value),
                  })
                }
                className="col-span-3 border rounded px-3 py-2"
              >
                {points.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Beacon</DialogTitle>
      <DialogDescription>Fill in the details to create a new beacon.</DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Name</Label>
        <Input
          value={createFields.name}
          onChange={(e) =>
            setCreateFields({ ...createFields, name: e.target.value })
          }
          className="col-span-3"
        />
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">Description</Label>
        <textarea
          value={createFields.description}
          onChange={(e) =>
            setCreateFields({ ...createFields, description: e.target.value })
          }
          className="col-span-3 border rounded px-3 py-2 h-24 resize-none"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Status</Label>
        <select
          value={createFields.status_id}
          onChange={(e) =>
            setCreateFields({
              ...createFields,
              status_id: Number(e.target.value),
            })
          }
          className="col-span-3 border rounded px-3 py-2"
        >
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Enabled</Label>
        <input
          type="checkbox"
          checked={createFields.enabled}
          onChange={(e) =>
            setCreateFields({ ...createFields, enabled: e.target.checked })
          }
          className="col-span-3 w-4 h-4"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Type</Label>
        <select
          value={createFields.type_id}
          onChange={(e) =>
            setCreateFields({ ...createFields, type_id: Number(e.target.value) })
          }
          className="col-span-3 border rounded px-3 py-2"
        >
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Point</Label>
        <select
          value={createFields.point_id}
          onChange={(e) =>
            setCreateFields({ ...createFields, point_id: Number(e.target.value) })
          }
          className="col-span-3 border rounded px-3 py-2"
        >
          {points.map((point) => (
            <option key={point.id} value={point.id}>
              {point.id}
            </option>
          ))}
        </select>
      </div>
    </div>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DialogClose>
      <Button onClick={handleCreateSubmit}>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </SidebarProvider>
  );
}

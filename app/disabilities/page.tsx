'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { DataTable } from '@/components/data-table';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { IconDotsVertical } from '@tabler/icons-react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { useTranslationModal } from '@/hooks/useTranslationModal';

export default function Page() {
  const { user } = useUser();

  const [rows, setRows] = useState<Disability[]>([]);
  const [loading, setLoading] = useState(true);

  const [dlg, setDlg] = useState(false);
  const [editing, setEdit] = useState<Disability | null>(null);
  const [name, setName] = useState('');
  const [sev, setSev] = useState(0);
  const [en, setEn] = useState(true);

  const [toDel, setDel] = useState<Disability | null>(null);

  const { openTranslationModal, TranslationModalWrapper } = useTranslationModal('disabilities', 'disability_id');

  type Disability = {
    id: number;
    name: string;
    severity: number;
    enabled: boolean;
  };

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/disabilities');
      const j = await r.json();
      setRows(j?.data?.disabilities ?? []);
      setLoading(false);
    })();
  }, []);

  async function save() {
    if (!name) return;
    if (editing) {
      const r = await fetch(`/api/disabilities/update/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, severity: sev, enabled: en }),
      });
      const j = await r.json();
      if (r.ok)
        setRows((p) => p.map((d) => (d.id === editing.id ? j.data : d)));
    } else {
      const r = await fetch('/api/disabilities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          severity: sev,
          enabled: en,
          created_by: user?.sub,
        }),
      });
      const j = await r.json();
      if (r.ok) setRows((p) => [...p, j.data]);
    }
    setDlg(false);
  }

  async function remove(id: number) {
    const r = await fetch(`/api/disabilities/delete/${id}`, {
      method: 'DELETE',
    });
    if (r.ok) setRows((p) => p.filter((d) => d.id !== id));
  }

  const cols: ColumnDef<Disability>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'severity', header: 'Severity' },
    {
      accessorKey: 'enabled',
      header: 'Enabled',
      cell: ({ row }) => (row.original.enabled ? 'Yes' : 'No'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDotsVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEdit(row.original);
                setName(row.original.name);
                setSev(row.original.severity);
                setEn(row.original.enabled);
                setDlg(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openTranslationModal(row.original.id)}>
              Translate
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => setDel(row.original)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing)*72)',
          '--header-height': 'calc(var(--spacing)*12)',
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
                setEdit(null);
                setName('');
                setSev(0);
                setEn(true);
                setDlg(true);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Add Disability</span>
            </Button>

            {loading ? (
              <DataTableSkeleton columnCount={cols.length} />
            ) : (
              <DataTable data={rows} columns={cols} />
            )}

            <Dialog open={dlg} onOpenChange={setDlg}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editing ? 'Edit Disability' : 'Add Disability'}
                  </DialogTitle>
                  <DialogDescription>Fill in the fields.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Severity</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={sev}
                      onChange={(e) => setSev(Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Enabled</Label>
                    <select
                      value={en ? 'true' : 'false'}
                      onChange={(e) => setEn(e.target.value === 'true')}
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
                  <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
      {toDel && (
        <AlertDialog open onOpenChange={(o) => !o && setDel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Delete <strong>{toDel.name}</strong>? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDel(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  remove(toDel.id);
                  setDel(null);
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
  );
}

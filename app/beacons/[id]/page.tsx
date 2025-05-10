/* eslint-disable @next/next/no-img-element */
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { TrashIcon } from 'lucide-react';

type Beacon = {
  id: number;
  name: string;
  description: string;
};

type BeaconFile = {
  id: number;
  name: string;
  path: string;
};

export default function BeaconDetailPage() {
  const { id } = useParams();
  const [beacon, setBeacon] = useState<Beacon | null>(null);
  const [files, setFiles] = useState<BeaconFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/beacons/${id}`)
      .then((res) => res.json())
      .then((data) => setBeacon(data.data))
      .catch(() => toast.error('Failed to fetch beacon'));

    fetch(`/api/beacons/files/${id}`)
      .then((res) => res.json())
      .then((data) => setFiles(Array.isArray(data?.data?.files) ? data.data.files : []))
      .catch(() => toast.error('Failed to fetch files'));
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('name', file.name);
    formData.append('file', file);
    formData.append('beacon_id', String(id));

    setUploading(true);
    const res = await fetch('/api/beacons/files/create', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setFiles((prev) => [...prev, data.data]);
      toast.success('File uploaded');
    } else {
      toast.error('Failed to upload file');
    }
  };

  const getFileType = (filename: string): 'image' | 'video' | 'document' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    return 'document';
  };

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
        <SiteHeader title={`Beacon #${beacon?.id ?? 'Loading'}`} />
        <div className="p-6 space-y-6">
          {!beacon ? (
            <p className="text-muted-foreground">Loading beacon...</p>
          ) : (
            <>
              <Card>
                <CardContent className="space-y-2">
                  <p><strong>Name:</strong> {beacon.name}</p>
                  <p><strong>Description:</strong> {beacon.description}</p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Upload Files</h2>
                <Input type="file" onChange={handleUpload} disabled={uploading} />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Files</h2>
                {files.length === 0 ? (
                  <p className="text-muted-foreground">No files uploaded.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
  {files.map((file) => {
    const type = getFileType(file.name);
    const handleDelete = async () => {
      const res = await fetch(`/api/beacons/files/delete/${file.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Deleted ${file.name}`);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
      } else {
        toast.error('Failed to delete file');
      }
    };

    return (
      <Card key={file.id} className="relative rounded-md border shadow-sm">
        <button
          onClick={handleDelete}
          className="absolute top-1 right-1 z-10 text-red-500 hover:text-red-700"
          aria-label={`Delete ${file.name}`}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
        <CardContent className="p-2 space-y-2">
          <div className="text-xs truncate text-muted-foreground font-medium">
            {file.name}
          </div>
          {type === 'image' ? (
            <img src={file.path} alt={file.name} className="rounded w-full h-28 object-contain" />
          ) : type === 'video' ? (
            <video
              src={file.path}
              controls
              className="rounded w-full h-28 object-contain"
            />
          ) : (
            <a
              href={file.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline"
            >
              Open document
            </a>
          )}
        </CardContent>
      </Card>
    );
  })}
</div>


                )}
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

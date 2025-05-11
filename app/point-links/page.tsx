/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export type PointLink = {
  from_id: number;
  to_id: number;
};

export type Point = {
  id: number;
  x: number;
  y: number;
  map_id: number;
};

export type MapItem = {
  id: number;
  name: string;
};

export default function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [point1, setPoint1] = useState('');
  const [point2, setPoint2] = useState('');
  const [links, setLinks] = useState<PointLink[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pointsRes, linksRes, mapsRes] = await Promise.all([
          fetch('/api/maps/points'),
          fetch('/api/maps/points/links'),
          fetch('/api/maps'),
        ]);
        const pointsJson = await pointsRes.json();
        const linksJson = await linksRes.json();
        const mapsJson = await mapsRes.json();

        setPoints(pointsJson?.data?.points ?? []);
        setLinks(linksJson?.data?.links ?? []);
        setMaps(mapsJson?.data?.maps ?? []);
      } catch (err) {
        console.error('Failed to fetch points, links, or maps:', err);
      }
    })();
  }, []);

  const createLink = async () => {
    if (!point1 || !point2) return;

    const payload = {
      point_1_id: parseInt(point1, 10),
      point_2_id: parseInt(point2, 10),
    };

    setLoading(true);
    const res = await fetch('/api/maps/points/links/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (res.ok && json.data) {
        setLinks((prev) => [...prev, json.data]);
        setDialogOpen(false);
        setPoint1('');
        setPoint2('');
      } else {
        console.error('Link creation failed:', json);
      }
    } catch (err) {
      console.error('Failed to parse response:', text);
    } finally {
      setLoading(false);
    }
  };

  const getMapName = (id: number) =>
    maps.find((m) => m.id === id)?.name || `map: ${id}`;

  const getPointDisplay = (id: number) => {
    const p = points.find((pt) => pt.id === id);
    return p
      ? `Point #${p.id} (x: ${p.x}, y: ${p.y}, ${getMapName(p.map_id)})`
      : `#${id}`;
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
        <SiteHeader />
        <div className="p-4 space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Point Link
          </Button>

          <ScrollArea className="h-[400px] rounded border p-2">
            <div className="grid gap-2">
              {links.map((link, index) => (
                <Card key={index} className="p-3 text-sm">
                  <CardContent className="p-0 flex items-center gap-2">
                    <div className="font-mono whitespace-nowrap">
                      {getPointDisplay(link.from_id)}
                    </div>
                    <div className="text-muted">→</div>
                    <div className="font-mono whitespace-nowrap">
                      {getPointDisplay(link.to_id)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Point Link</DialogTitle>
                <DialogDescription>
                  Select two points to link.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="point1" className="text-right">
                    From Point
                  </Label>
                  <select
                    id="point1"
                    value={point1}
                    onChange={(e) => setPoint1(e.target.value)}
                    className="col-span-3 border rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      Select point
                    </option>
                    {points.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.id} (x: {p.x}, y: {p.y}, {getMapName(p.map_id)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="point2" className="text-right">
                    To Point
                  </Label>
                  <select
                    id="point2"
                    value={point2}
                    onChange={(e) => setPoint2(e.target.value)}
                    className="col-span-3 border rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      Select point
                    </option>
                    {points.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.id} (x: {p.x}, y: {p.y}, {getMapName(p.map_id)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={createLink} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Link'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

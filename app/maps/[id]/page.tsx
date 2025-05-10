/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Map {
  id: number;
  name: string;
  path: string;
  enabled: boolean;
}

interface Point {
  id: number;
  x: number;
  y: number;
  enabled: boolean;
  map_id: number;
}

export default function Page() {
  const { id } = useParams();
  const [map, setMap] = useState<Map | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/maps/${id}`)
      .then((res) => res.json())
      .then((json) => setMap(json?.data ?? null))
      .catch((err) => console.error('Failed to load map', err));

    fetch(`/api/maps/${id}/points`)
      .then((res) => res.json())
      .then((json) => setPoints(json?.data?.points ?? []))
      .catch((err) => console.error('Failed to load points', err));
  }, [id]);

  const handleCreatePoint = async () => {
    if (!clickPosition || !map) return;

    const res = await fetch('/api/maps/points/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x: clickPosition.x,
        y: clickPosition.y,
        map_id: map.id,
        enabled: true,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      setPoints((prev) => [...prev, json.data.point]);
    } else {
      console.error('Failed to create point:', await res.text());
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 space-y-4">
          {map ? (
            <div>
              <h1 className="text-xl font-bold mb-4">{map.name}</h1>
              <ContextMenu>
                <ContextMenuTrigger
                  className="relative inline-block"
                  onDragOver={(e) => e.preventDefault()}
                  onContextMenu={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    setClickPosition({ x, y });
                  }}
                >
                  <img
                    src={map.path}
                    alt={`Map ${map.name}`}
                    className="rounded border"
                  />
                  <TooltipProvider>
                    {points.map((p) => (
                      <Tooltip key={p.id}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute w-3 h-3 bg-red-500 rounded-full border border-white shadow cursor-move"
                            style={{
                              left: `${p.x}px`,
                              top: `${p.y}px`,
                              transform: 'translate(-50%, -50%)',
                            }}
                            title={`Beacon #${p.id}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                'text/plain',
                                String(p.id)
                              );
                            }}
                            onDragEnd={async (e) => {
                              if (!map) return;
                              const rect =
                                e.currentTarget.offsetParent?.getBoundingClientRect();
                              if (!rect) return;

                              const newX = e.clientX - rect.left;
                              const newY = e.clientY - rect.top;

                              try {
                                const res = await fetch(
                                  `/api/maps/points/${p.id}`,
                                  {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      x: newX,
                                      y: newY,
                                      enabled: p.enabled,
                                      map_id: p.map_id,
                                    }),
                                  }
                                );

                                if (res.ok) {
                                  setPoints((prev) =>
                                    prev.map((pt) =>
                                      pt.id === p.id
                                        ? { ...pt, x: newX, y: newY }
                                        : pt
                                    )
                                  );
                                } else {
                                  console.error(
                                    'Failed to move point:',
                                    await res.text()
                                  );
                                }
                              } catch (err) {
                                console.error('Drag update failed', err);
                              }
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>
                            X: {p.x.toFixed(1)}, Y: {p.y.toFixed(1)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem onClick={handleCreatePoint}>
                    Create Point Here
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          ) : (
            <p>Loading map...</p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

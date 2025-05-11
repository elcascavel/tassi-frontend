/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
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
  x: number; // stored relative to 1920
  y: number; // stored relative to 1080
  enabled: boolean;
  map_id: number;
}

export default function Page() {
  const { id } = useParams();
  const [map, setMap] = useState<Map | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/maps/${id}`)
      .then(res => res.json())
      .then(json => setMap(json?.data ?? null))
      .catch(err => console.error('Failed to load map', err));

    fetch(`/api/maps/${id}/points`)
      .then(res => res.json())
      .then(json => setPoints(json?.data?.points ?? []))
      .catch(err => console.error('Failed to load points', err));
  }, [id]);

  const handleCreatePoint = async () => {
    if (!clickPosition || !map || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const normalizedX = (clickPosition.x / rect.width) * 1920;
    const normalizedY = (clickPosition.y / rect.height) * 1080;

    const res = await fetch('/api/maps/points/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x: normalizedX,
        y: normalizedY,
        map_id: map.id,
        enabled: true,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      setPoints(prev => [...prev, json.data.point]);
    } else {
      console.error('Failed to create point:', await res.text());
    }
  };

  const mapImagePointToScreen = (x: number, y: number) => {
    const container = containerRef.current;
    if (!container) return { left: 0, top: 0 };

    const bounds = container.getBoundingClientRect();
    return {
      left: (x / 1920) * bounds.width,
      top: (y / 1080) * bounds.height,
    };
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={map?.name} />
        <div className="p-4 space-y-4">
          {map ? (
            <div
              ref={containerRef}
              className="relative mx-auto max-w-[960px] w-full"
            >
              <ContextMenu>
                <ContextMenuTrigger
                  className="relative"
                  onContextMenu={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    setClickPosition({ x, y });
                  }}
                >
                  <img
                    ref={imageRef}
                    src={map.path}
                    alt={`Map ${map.name}`}
                    className="rounded border w-full h-auto"
                    draggable={false}
                    onLoad={() => setImageLoaded(true)}
                  />

                  {imageLoaded && (
                  <TooltipProvider>
                    {points.map((p) => {
                      const { left, top } = mapImagePointToScreen(p.x, p.y);
                      return (
                        <Tooltip key={p.id}>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute w-3 h-3 bg-red-500 rounded-full border border-white shadow cursor-move animate-pulse"
                              style={{
                                left: `${left}px`,
                                top: `${top}px`,
                                transform: 'translate(-50%, -50%)',
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', String(p.id));
                              }}
                              onDragEnd={async (e) => {
                                if (!imageRef.current) return;
                                const rect = imageRef.current.getBoundingClientRect();
                                const newX = ((e.clientX - rect.left) / rect.width) * 1920;
                                const newY = ((e.clientY - rect.top) / rect.height) * 1080;

                                const res = await fetch(`/api/maps/points/${p.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    x: newX,
                                    y: newY,
                                    map_id: p.map_id,
                                    enabled: p.enabled,
                                  }),
                                });

                                if (res.ok) {
                                  setPoints(prev =>
                                    prev.map(pt => pt.id === p.id ? { ...pt, x: newX, y: newY } : pt)
                                  );
                                } else {
                                  console.error('Failed to move point:', await res.text());
                                }
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className='font-bold'>Point #{p.id}</p>
                            <p>X: {p.x.toFixed(1)}, Y: {p.y.toFixed(1)}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                  )}
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={handleCreatePoint}>Create Point Here</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          ) : (
            <p>Loading map…</p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

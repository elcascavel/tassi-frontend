/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from 'react'
import { IconTrendingUp } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SectionCards() {
  const [stats, setStats] = useState({
    beacons: 0,
    activeBeacons: 0,
    beaconTypes: 0,
    maps: 0,
    users: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const [beaconsRes, beaconTypesRes, mapsRes, usersRes] = await Promise.all([
        fetch('/api/beacons').then(res => res.json()),
        fetch('/api/beacons/types').then(res => res.json()),
        fetch('/api/maps').then(res => res.json()),
        fetch('/api/users').then(res => res.json()),
      ])

const beacons = Array.isArray(beaconsRes) ? beaconsRes : beaconsRes?.data.beacons ?? []
const activeBeacons = beacons.filter((b: any) => b?.enabled).length

      setStats({
        beacons: beacons.length,
        activeBeacons,
        beaconTypes: beaconTypesRes?.data.beacon_types?.length || 0,
        maps: mapsRes?.data.maps.length || 0,
        users: usersRes?.data.users.length || 0,
      })
    }

    fetchStats()
  }, [])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Beacons</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.beacons}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Installed beacons <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">System-wide total</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Beacons</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeBeacons}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Currently enabled <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Beacons reporting status</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Beacon Types</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.beaconTypes}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Categories defined <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Stop, location types</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Maps</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.maps}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Route visuals <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Available map overlays</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>User Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.users}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Users <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Total registered users</div>
        </CardFooter>
      </Card>
    </div>
  )
}

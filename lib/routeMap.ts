// lib/navigation.ts
import {
  IconDashboard,
  IconNavigation,
  IconHighlight,
  IconChartBar,
  IconReport,
  IconUsers,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react"

export const routeMap: Record<string, string> = {
  "/": "Dashboard",
  "/navigation": "Navigation",
  "/beacons": "Beacons",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/users": "Users",
  "/settings": "Settings",
  "/help": "Get Help",
}

export const navMain = [
  {
    title: routeMap["/"],
    url: "/",
    icon: IconDashboard,
  },
  {
    title: routeMap["/navigation"],
    url: "/navigation",
    icon: IconNavigation,
  },
  {
    title: routeMap["/beacons"],
    url: "/beacons",
    icon: IconHighlight,
  },
  {
    title: routeMap["/analytics"],
    url: "/analytics",
    icon: IconChartBar,
  },
  {
    title: routeMap["/reports"],
    url: "/reports",
    icon: IconReport,
  },
  {
    title: routeMap["/users"],
    url: "/users",
    icon: IconUsers,
  },
]

export const navSecondary = [
  {
    title: routeMap["/settings"],
    url: "/settings",
    icon: IconSettings,
  },
  {
    title: routeMap["/help"],
    url: "/help",
    icon: IconHelp,
  },
]

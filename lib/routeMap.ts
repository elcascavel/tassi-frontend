// lib/navigation.ts
import {
  IconDashboard,
  IconNavigation,
  IconHighlight,
  IconSettings,
  IconHelp,
  IconTicket,
  IconUsers,
  IconCategory2,
  IconCategory,
  IconDisabled2,
  IconStatusChange,
} from "@tabler/icons-react"

export const routeMap: Record<string, string> = {
  "/": "Dashboard",
  "/navigation": "Navigation",
  "/beacons": "Beacons",
  "/beacon-types": "Beacon Types",
  "/support": "Support",
  "/support-categories": "Support Categories",
  "/disabilities": "Disabilities",
  "/status": "Status",
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
    title: routeMap["/beacon-types"],
    url: "/beacon-types",
    icon: IconCategory2,
  },
  {
    title: routeMap["/support"],
    url: "/support",
    icon: IconTicket,
  },
  {
    title: routeMap["/support-categories"],
    url: "/support-categories",
    icon: IconCategory,
  },
  {
    title: routeMap["/disabilities"],
    url: "/disabilities",
    icon: IconDisabled2,
  },
  {
    title: routeMap["/status"],
    url: "/status",
    icon: IconStatusChange,
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

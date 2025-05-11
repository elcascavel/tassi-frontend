import {
  IconHighlight,
  IconTicket,
  IconUsers,
  IconCategory2,
  IconCategory,
  IconDisabled2,
  IconStatusChange,
  IconPoint,
  IconMap,
} from '@tabler/icons-react';

export const routeMap: Record<string, string> = {
  '/': 'Dashboard',
  '/maps': 'Maps',
  '/beacons': 'Beacons',
  '/beacon-types': 'Beacon Types',
  '/points': 'Points',
  '/point-links': 'Point Links',
  '/support': 'Support',
  '/support-categories': 'Support Categories',
  '/disabilities': 'Disabilities',
  '/status': 'Status',
  '/users': 'Users',
  '/settings': 'Settings',
};

export const navMain = [
  {
    group: 'Map Management',
    items: [
      { title: routeMap['/maps'], url: '/maps', icon: IconMap },
      { title: routeMap['/points'], url: '/points', icon: IconPoint },
      // { title: routeMap["/point-links"], url: "/point-links", icon: IconLink },
    ],
  },
  {
    group: 'Beacons',
    items: [
      { title: routeMap['/beacons'], url: '/beacons', icon: IconHighlight },
      {
        title: routeMap['/beacon-types'],
        url: '/beacon-types',
        icon: IconCategory2,
      },
      {
        title: routeMap['/disabilities'],
        url: '/disabilities',
        icon: IconDisabled2,
      },
      { title: routeMap['/status'], url: '/status', icon: IconStatusChange },
    ],
  },
  {
    group: 'Support',
    items: [
      { title: routeMap['/support'], url: '/support', icon: IconTicket },
      {
        title: routeMap['/support-categories'],
        url: '/support-categories',
        icon: IconCategory,
      },
    ],
  },
  {
    group: 'System',
    items: [{ title: routeMap['/users'], url: '/users', icon: IconUsers }],
  },
];

import {
  IconBuilding,
  IconCalendar,
  IconHome,
  IconTag,
  IconWallet,
} from '@tabler/icons-react';

import {
  PATH_ACCOUNTS,
  PATH_DASHBOARD,
  PATH_ENTITIES,
  PATH_EVENTS,
  PATH_TAGS,
} from '@/routes';

export const SIDEBAR_LINKS = [
  {
    titleKey: 'sidebar.sectionMain',
    links: [
      {
        labelKey: 'sidebar.links.dashboard',
        icon: IconHome,
        link: PATH_DASHBOARD.default,
      },
      {
        labelKey: 'sidebar.links.accounts',
        icon: IconWallet,
        link: PATH_ACCOUNTS.root,
      },
      {
        labelKey: 'sidebar.links.entities',
        icon: IconBuilding,
        link: PATH_ENTITIES.root,
      },
      {
        labelKey: 'sidebar.links.events',
        icon: IconCalendar,
        link: PATH_EVENTS.root,
      },
      {
        labelKey: 'sidebar.links.tags',
        icon: IconTag,
        link: PATH_TAGS.root,
      },
    ],
  },
] as const;

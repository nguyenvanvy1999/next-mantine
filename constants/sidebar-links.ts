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
    title: 'Main',
    links: [
      { label: 'Dashboard', icon: IconHome, link: PATH_DASHBOARD.default },
      { label: 'Accounts', icon: IconWallet, link: PATH_ACCOUNTS.root },
      { label: 'Entities', icon: IconBuilding, link: PATH_ENTITIES.root },
      { label: 'Events', icon: IconCalendar, link: PATH_EVENTS.root },
      { label: 'Tags', icon: IconTag, link: PATH_TAGS.root },
    ],
  },
];

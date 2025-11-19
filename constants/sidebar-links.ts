import {
  IconBook2,
  IconLifebuoy,
  IconList,
  IconLogin2,
  IconRotateRectangle,
  IconUserPlus,
} from '@tabler/icons-react';

import {
  PATH_AUTH,
  PATH_CHANGELOG,
  PATH_DOCS,
} from '@/routes';

export const SIDEBAR_LINKS = [
  {
    title: 'Auth',
    links: [
      { label: 'Sign In', icon: IconLogin2, link: PATH_AUTH.signin },
      { label: 'Sign Up', icon: IconUserPlus, link: PATH_AUTH.signup },
      {
        label: 'Reset Password',
        icon: IconRotateRectangle,
        link: PATH_AUTH.passwordReset,
      },
    ],
  },
  {
    title: 'Documentation',
    links: [
      {
        label: 'Getting started',
        icon: IconLifebuoy,
        link: PATH_DOCS.root,
      },
      {
        label: 'Documentation',
        icon: IconBook2,
        link: PATH_DOCS.root,
      },
      { label: 'Changelog', icon: IconList, link: PATH_CHANGELOG.root },
    ],
  },
];

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';

export const PATH_DASHBOARD = {
  default: '/dashboard',
};

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  signin: path(ROOTS_AUTH, '/signin'),
  signup: path(ROOTS_AUTH, '/signup'),
  passwordReset: path(ROOTS_AUTH, '/password-reset'),
};

export const PATH_DOCS = {
  root: 'https://mantine-analytics-dashboard-docs.netlify.app/',
};

export const PATH_GITHUB = {
  org: 'https://github.com/design-sparx',
  repo: 'https://github.com/design-sparx/mantine-analytics-dashboard',
};

const ROOTS_DASHBOARD = '/dashboard';

export const PATH_ACCOUNTS = {
  root: path(ROOTS_DASHBOARD, '/accounts'),
};

export const PATH_ENTITIES = {
  root: path(ROOTS_DASHBOARD, '/entities'),
};

export const PATH_EVENTS = {
  root: path(ROOTS_DASHBOARD, '/events'),
};

export const PATH_TAGS = {
  root: path(ROOTS_DASHBOARD, '/tags'),
};

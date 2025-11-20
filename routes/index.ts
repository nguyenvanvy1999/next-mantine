function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_CHANGELOG = '/changelog';

export const PATH_DASHBOARD = {
  default: '/dashboard',
};

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  signin: path(ROOTS_AUTH, '/signin'),
  signup: path(ROOTS_AUTH, '/signup'),
  passwordReset: path(ROOTS_AUTH, '/password-reset'),
};

export const PATH_CHANGELOG = {
  root: ROOTS_CHANGELOG,
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

export const PATH_TRANSACTIONS = {
  root: path(ROOTS_DASHBOARD, '/transactions'),
  bulk: path(ROOTS_DASHBOARD, '/transactions/bulk'),
};

export const PATH_DEBTS = {
  root: path(ROOTS_DASHBOARD, '/debts'),
};

export const PATH_BUDGETS = {
  root: path(ROOTS_DASHBOARD, '/budgets'),
};

export const PATH_INVESTMENTS = {
  root: path(ROOTS_DASHBOARD, '/investments'),
};

export const PATH_CATEGORIES = {
  root: path(ROOTS_DASHBOARD, '/categories'),
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

export const PATH_RULES = {
  root: path(ROOTS_DASHBOARD, '/rules'),
};

export const PATH_STATISTICS = {
  incomeExpense: path(ROOTS_DASHBOARD, '/statistics/income-expense'),
  investments: path(ROOTS_DASHBOARD, '/statistics/investments'),
  debts: path(ROOTS_DASHBOARD, '/statistics/debts'),
};

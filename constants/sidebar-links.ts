import {
  IconBuilding,
  IconBulb,
  IconCalendar,
  IconCategory,
  IconChartBar,
  IconCoins,
  IconCreditCard,
  IconHome,
  IconPlus,
  IconTag,
  IconTrendingUp,
  IconWallet,
} from '@tabler/icons-react';

import {
  PATH_ACCOUNTS,
  PATH_BUDGETS,
  PATH_CATEGORIES,
  PATH_DASHBOARD,
  PATH_DEBTS,
  PATH_ENTITIES,
  PATH_EVENTS,
  PATH_INVESTMENTS,
  PATH_RULES,
  PATH_STATISTICS,
  PATH_TAGS,
  PATH_TRANSACTIONS,
} from '@/routes';

export const SIDEBAR_LINKS = [
  {
    title: 'Main',
    links: [
      { label: 'Dashboard', icon: IconHome, link: PATH_DASHBOARD.default },
      {
        label: 'Transactions',
        icon: IconCreditCard,
        link: PATH_TRANSACTIONS.root,
      },
      { label: 'Debts', icon: IconCreditCard, link: PATH_DEBTS.root },
      {
        label: 'Bulk Add Transactions',
        icon: IconPlus,
        link: PATH_TRANSACTIONS.bulk,
      },
      { label: 'Budgets', icon: IconCoins, link: PATH_BUDGETS.root },
      { label: 'Accounts', icon: IconWallet, link: PATH_ACCOUNTS.root },
      {
        label: 'Investments',
        icon: IconTrendingUp,
        link: PATH_INVESTMENTS.root,
      },
      { label: 'Categories', icon: IconCategory, link: PATH_CATEGORIES.root },
      { label: 'Entities', icon: IconBuilding, link: PATH_ENTITIES.root },
      { label: 'Events', icon: IconCalendar, link: PATH_EVENTS.root },
      { label: 'Tags', icon: IconTag, link: PATH_TAGS.root },
      { label: 'Rules', icon: IconBulb, link: PATH_RULES.root },
    ],
  },
  {
    title: 'Statistics',
    links: [
      {
        label: 'Income/Expense',
        icon: IconChartBar,
        link: PATH_STATISTICS.incomeExpense,
      },
      {
        label: 'Investment',
        icon: IconChartBar,
        link: PATH_STATISTICS.investments,
      },
      {
        label: 'Debt',
        icon: IconChartBar,
        link: PATH_STATISTICS.debts,
      },
    ],
  },
];

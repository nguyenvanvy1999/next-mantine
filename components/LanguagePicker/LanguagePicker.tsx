'use client';

import { Group, Image, Menu, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import classes from './LanguagePicker.module.css';

const locales = [
  {
    code: 'en',
    labelKey: 'language.english',
    image: 'https://flagcdn.com/w40/gb.png',
  },
  {
    code: 'vi',
    labelKey: 'language.vietnamese',
    image: 'https://flagcdn.com/w40/vn.png',
  },
] as const;

type LanguagePickerProps = {
  type: 'collapsed' | 'expanded';
};

const LanguagePicker = ({ type }: LanguagePickerProps) => {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const selected =
    locales.find((locale) => locale.code === currentLanguage) ?? locales[0];

  const items = locales.map((item) => (
    <Menu.Item
      leftSection={<Image src={item.image} width={18} height={18} alt="flag" />}
      onClick={() => i18n.changeLanguage(item.code)}
      key={item.code}
    >
      {t(item.labelKey)}
    </Menu.Item>
  ));

  return (
    <Menu radius="sm" withinPortal width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.control}>
          <Group gap="xs">
            <Image src={selected.image} width={22} height={22} alt="flag" />
            {type === 'expanded' && (
              <span className={classes.label}>{t(selected.labelKey)}</span>
            )}
          </Group>
          {type === 'expanded' && (
            <IconChevronDown
              size="1rem"
              className={classes.icon}
              stroke={1.5}
            />
          )}
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>{items}</Menu.Dropdown>
    </Menu>
  );
};

export default LanguagePicker;

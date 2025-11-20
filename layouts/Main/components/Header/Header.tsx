'use client';

import { ActionIcon, Group, rem, TextInput, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMenu2, IconPower, IconSearch } from '@tabler/icons-react';

import { LanguagePicker } from '@/components';
import {
  type HeaderVariant,
  useSidebarConfig,
} from '@/contexts/theme-customizer';
import { useAuth } from '@/hooks/useAuth';

const ICON_SIZE = 20;

type HeaderNavProps = {
  mobileOpened?: boolean;
  toggleMobile?: () => void;
  sidebarVisible: boolean;
  onSidebarToggle: () => void;
  onSidebarShow?: () => void;
  headerVariant: HeaderVariant;
};

const HeaderNav = (props: HeaderNavProps) => {
  const {
    toggleMobile,
    headerVariant,
    sidebarVisible,
    onSidebarToggle,
    onSidebarShow,
  } = props;
  const tablet_match = useMediaQuery('(max-width: 768px)');
  const mobile_match = useMediaQuery('(max-width: 425px)');
  const sidebarConfig = useSidebarConfig();
  const { logout } = useAuth();

  // Determine text color based on header variant
  const getTextColor = () => {
    if (headerVariant === 'colored') {
      return 'white';
    }
    return undefined; // Use default theme colors
  };

  const textColor = getTextColor();

  const handleSidebarToggle = () => {
    if (mobile_match) {
      // Mobile: toggle mobile menu
      toggleMobile?.();
    } else if (sidebarConfig.overlay && !sidebarVisible) {
      // Desktop overlay mode: show sidebar if hidden
      onSidebarShow?.();
    } else {
      // Normal mode or overlay mode with visible sidebar: toggle
      onSidebarToggle();
    }
  };

  const getSidebarToggleIcon = () => {
    if (mobile_match) {
      return <IconMenu2 size={ICON_SIZE} color={textColor} />;
    }

    // Desktop: use menu icon for overlay mode or when sidebar is hidden
    if (sidebarConfig.overlay || !sidebarVisible) {
      return <IconMenu2 size={ICON_SIZE} color={textColor} />;
    }

    // Use menu icon for normal mode when sidebar is visible
    return <IconMenu2 size={ICON_SIZE} color={textColor} />;
  };

  const getSidebarToggleTooltip = () => {
    if (mobile_match) return 'Toggle menu';
    if (!sidebarVisible) return 'Show sidebar';
    return 'Hide sidebar';
  };

  return (
    <Group justify="space-between">
      <Group gap={0}>
        <Tooltip label={getSidebarToggleTooltip()}>
          <ActionIcon
            onClick={handleSidebarToggle}
            variant={headerVariant === 'colored' ? 'transparent' : 'default'}
            size="lg"
          >
            {getSidebarToggleIcon()}
          </ActionIcon>
        </Tooltip>

        {!mobile_match && (
          <TextInput
            placeholder="search"
            rightSection={<IconSearch size={ICON_SIZE} />}
            ml="md"
            style={{
              width: tablet_match ? 'auto' : rem(400),
              '--input-color': textColor || undefined,
            }}
          />
        )}
      </Group>
      <Group>
        {mobile_match && (
          <ActionIcon
            variant={headerVariant === 'colored' ? 'transparent' : 'default'}
          >
            <IconSearch size={ICON_SIZE} color={textColor} />
          </ActionIcon>
        )}
        <LanguagePicker type="collapsed" />
        <Tooltip label="Logout">
          <ActionIcon
            onClick={logout}
            variant={headerVariant === 'colored' ? 'transparent' : 'default'}
          >
            <IconPower size={ICON_SIZE} color={textColor} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
};

export default HeaderNav;

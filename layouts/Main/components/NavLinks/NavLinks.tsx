import {
  Box,
  Collapse,
  Group,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronRight, type TablerIconsProps } from '@tabler/icons-react';
import * as _ from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import {
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import classes from './NavLinks.module.css';

interface LinksGroupProps {
  icon?: ComponentType<TablerIconsProps>;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  links?: {
    label: string;
    link: string;
  }[];
  closeSidebar: () => void;
  isMini?: boolean;
}

export function LinksGroup(props: LinksGroupProps) {
  const {
    icon: Icon,
    label,
    initiallyOpened,
    link,
    links,
    closeSidebar,
    isMini,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const [_currentPath, setCurrentPath] = useState<string | undefined>();
  const ChevronIcon = IconChevronRight;
  const tablet_match = useMediaQuery('(max-width: 768px)');

  const LinkItem = ({ link }: { link: { label: string; link: string } }) => {
    const linkPath = link.link.toLowerCase();
    const currentPath = pathname.toLowerCase();
    const isLinkActive =
      currentPath === linkPath ||
      (currentPath.startsWith(`${linkPath}/`) && linkPath !== '/dashboard');

    return (
      <Text
        className={classes.link}
        onClick={() => {
          router.push(link.link);
          if (tablet_match) {
            closeSidebar();
          }
        }}
        data-active={isLinkActive || undefined}
        data-mini={isMini}
      >
        {link.label}
      </Text>
    );
  };

  const items = (hasLinks ? links : []).map((link) =>
    isMini ? (
      <Menu.Item key={`menu-${link.label}`}>
        <LinkItem link={link} />
      </Menu.Item>
    ) : (
      <LinkItem key={link.label} link={link} />
    ),
  );

  const handleMainButtonClick = useCallback(() => {
    if (hasLinks) {
      setOpened((o) => !o);
      return;
    }
    if (link) {
      router.push(link);
      if (tablet_match) {
        closeSidebar();
      }
    }
  }, [closeSidebar, hasLinks, link, router, tablet_match]);

  const handleMiniButtonClick = useCallback(
    (evt: React.MouseEvent) => {
      evt.preventDefault();
      if (hasLinks) {
        setOpened((o) => !o);
        return;
      }
      if (link) {
        router.push(link);
        if (tablet_match) {
          closeSidebar();
        }
      }
    },
    [closeSidebar, hasLinks, link, router, tablet_match],
  );

  const isActive = useMemo(() => {
    const currentPath = pathname.toLowerCase();
    if (hasLinks) {
      return links?.some((l) => {
        const linkPath = l.link.toLowerCase();
        return (
          currentPath === linkPath ||
          (currentPath.startsWith(`${linkPath}/`) && linkPath !== '/dashboard')
        );
      });
    }
    if (link) {
      const linkPath = link.toLowerCase();
      return (
        currentPath === linkPath ||
        (currentPath.startsWith(`${linkPath}/`) && linkPath !== '/dashboard')
      );
    }
    return false;
  }, [hasLinks, links, link, pathname]);

  const content: React.ReactElement = useMemo(() => {
    let view: React.ReactElement;
    if (isMini) {
      view = (
        <Menu
          position="right-start"
          withArrow
          arrowPosition="center"
          trigger="hover"
          openDelay={100}
          closeDelay={400}
        >
          <Menu.Target>
            <UnstyledButton
              onClick={handleMiniButtonClick}
              className={classes.control}
              data-active={isActive || undefined}
              data-mini={isMini}
            >
              <Tooltip
                label={label}
                position="right"
                transitionProps={{ duration: 0 }}
              >
                <Icon size={24} />
              </Tooltip>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>{items}</Menu.Dropdown>
        </Menu>
      );
    } else {
      view = (
        <>
          <UnstyledButton
            onClick={handleMainButtonClick}
            className={classes.control}
            data-active={isActive || undefined}
            data-mini={isMini}
          >
            <Group justify="space-between" gap={0}>
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Icon size={18} />
                {!isMini && <Box ml="md">{label}</Box>}
              </Box>
              {hasLinks && (
                <ChevronIcon
                  className={classes.chevron}
                  size="1rem"
                  stroke={1.5}
                  style={{
                    transform: opened ? `rotate(90deg)` : 'none',
                  }}
                />
              )}
            </Group>
          </UnstyledButton>
          {hasLinks ? (
            <Collapse in={opened} className={classes.linksInner}>
              {items}
            </Collapse>
          ) : null}
        </>
      );
    }

    return view;
  }, [
    ChevronIcon,
    Icon,
    hasLinks,
    isMini,
    items,
    label,
    opened,
    isActive,
    handleMainButtonClick,
    handleMiniButtonClick,
  ]);

  useEffect(() => {
    const paths = pathname.split('/');
    if (hasLinks && links?.length) {
      const shouldOpen = links.some((linkItem) => {
        const linkPath = linkItem.link.toLowerCase();
        const currentPath = pathname.toLowerCase();
        return (
          currentPath === linkPath ||
          (currentPath.startsWith(`${linkPath}/`) && linkPath !== '/dashboard')
        );
      });
      setOpened(shouldOpen);
    }
    setCurrentPath(_.last(paths)?.toLowerCase() || undefined);
  }, [pathname, hasLinks, links]);

  return <>{content}</>;
}

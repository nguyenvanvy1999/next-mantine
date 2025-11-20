import { Group, Text } from '@mantine/core';

import { PATH_GITHUB } from '@/routes';

const FooterNav = () => {
  return (
    <Group justify="flex-end">
      <Text component="a" href={PATH_GITHUB.org} target="_blank">
        &copy;&nbsp;{new Date().getFullYear()}&nbsp;DesignSparx
      </Text>
    </Group>
  );
};

export default FooterNav;

'use client';

import { Button, Flex, Input, Text } from '@mantine/core';
import { useState } from 'react';

type AddCardProps = {
  addCard: (title: string) => void;
};

const AddTaskCard = ({ addCard }: AddCardProps) => {
  const [title, setTitle] = useState<string>('');

  return (
    <Flex align="center">
      <Text ta="center">Card Title</Text>
      <Input
        type="text"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
      />
      <Button
        onClick={() => {
          setTitle('');
          addCard(title);
        }}
      >
        Add Card
      </Button>
    </Flex>
  );
};

export default AddTaskCard;

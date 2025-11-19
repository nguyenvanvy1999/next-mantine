'use client';

import { DateInput, type DatePickerInputProps } from '@mantine/dates';
import { useState } from 'react';

type DateFieldProps = DatePickerInputProps;

/**
 * For more docs see - https://mantine.dev/dates/date-input/
 * @param others
 * @constructor
 */
const DateField = ({ ...others }: DateFieldProps) => {
  const [value, setValue] = useState<Date | null>(null);
  return (
    // @ts-expect-error
    <DateInput label="Pick date" placeholder="Pick date" {...others} />
  );
};

export default DateField;

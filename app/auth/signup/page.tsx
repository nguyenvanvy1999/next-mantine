'use client';

import {
  Alert,
  Button,
  Center,
  Flex,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  type TextProps,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

import { Surface } from '@/components';
import { authClient } from '@/lib/auth-client';
import { PATH_AUTH, PATH_DASHBOARD } from '@/routes';

import classes from './page.module.css';

const schema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First name must have at least 2 letters' }),
    lastName: z
      .string()
      .min(2, { message: 'Last name must have at least 2 letters' }),
    email: z.email({ message: 'Invalid email' }),
    password: z
      .string()
      .min(6, { message: 'Password must include at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords did not match',
    path: ['confirmPassword'],
  });

function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const LINK_PROPS: TextProps = {
    className: classes.link,
  };

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(schema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
      });

      if (error) {
        setError(error.message || 'An error occurred during registration');
        return;
      }

      router.push(PATH_DASHBOARD.default);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <title>Sign up | DesignSparx</title>
      <meta
        name="description"
        content="Explore our versatile dashboard website template featuring a stunning array of themes and meticulously crafted components. Elevate your web project with seamless integration, customizable themes, and a rich variety of components for a dynamic user experience. Effortlessly bring your data to life with our intuitive dashboard template, designed to streamline development and captivate users. Discover endless possibilities in design and functionality today!"
      />

      <Title ta="center">Welcome!</Title>
      <Text ta="center">Create your account to continue</Text>

      <Surface component={Paper} className={classes.card}>
        {error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Registration Error"
            color="red"
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 'md' }}>
            <TextInput
              label="First name"
              placeholder="John"
              required
              classNames={{ label: classes.label }}
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label="Last name"
              placeholder="Doe"
              required
              classNames={{ label: classes.label }}
              {...form.getInputProps('lastName')}
            />
          </Flex>
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
            mt="md"
            classNames={{ label: classes.label }}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            classNames={{ label: classes.label }}
            {...form.getInputProps('password')}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm password"
            required
            mt="md"
            classNames={{ label: classes.label }}
            {...form.getInputProps('confirmPassword')}
          />
          <Button fullWidth mt="xl" type="submit" loading={isLoading}>
            Create account
          </Button>
        </form>
        <Center mt="md">
          <Text
            size="sm"
            component={Link}
            href={PATH_AUTH.signin}
            {...LINK_PROPS}
          >
            Already have an account? Sign in
          </Text>
        </Center>
      </Surface>
    </>
  );
}

export default Page;

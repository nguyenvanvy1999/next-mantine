'use client';

import {
  Alert,
  Button,
  Center,
  Flex,
  Paper,
  PasswordInput,
  Select,
  Text,
  TextInput,
  type TextProps,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

import { Surface } from '@/components';
import { authClient } from '@/lib/auth-client';
import { useCurrenciesPublic } from '@/lib/endpoints/currency';
import { PATH_AUTH } from '@/routes';

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
    baseCurrencyId: z.string().min(1, { message: 'Base currency is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords did not match',
    path: ['confirmPassword'],
  });

function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: currencies = [], loading: currenciesLoading } =
    useCurrenciesPublic();

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
      baseCurrencyId: '',
    },
    validate: zod4Resolver(schema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          baseCurrencyId: values.baseCurrencyId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'An error occurred during registration');
        return;
      }

      // After successful registration, sign in the user
      const signInResult = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        fetchOptions: {
          onSuccess: () => {
            router.push('/dashboard');
          },
        },
      });

      if (signInResult.error) {
        // Registration succeeded but auto-login failed
        // Redirect to sign in page
        router.push(PATH_AUTH.signin);
      }
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
          <Select
            label="Base Currency"
            placeholder="Select your base currency"
            required
            mt="md"
            classNames={{ label: classes.label }}
            data={
              currencies?.map((currency) => ({
                value: currency.id,
                label: `${currency.symbol || ''} - ${currency.name} (${currency.code})`,
              })) || []
            }
            disabled={currenciesLoading}
            {...form.getInputProps('baseCurrencyId')}
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

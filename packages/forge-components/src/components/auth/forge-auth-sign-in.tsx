import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { ForgeButton } from '../ui/forge-button';
import { ForgeInput } from '../ui/forge-input';
import { ForgeCard } from '../ui/forge-card';

export interface ForgeAuthSignInProps extends ForgeComponentConfig {
  variant?: 'default' | 'card' | 'minimal';
  provider?: string;
  redirectUrl?: string;
  showEmail?: boolean;
  showPassword?: boolean;
  buttonText?: string;
  className?: string;
}

export function ForgeAuthSignIn({
  variant = 'default',
  provider,
  redirectUrl,
  showEmail = true,
  showPassword = true,
  buttonText = 'Sign In',
  className,
  ...forgeConfig
}: ForgeAuthSignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (provider) {
        if (forgeConfig.onEvent) forgeConfig.onEvent('success', { provider, email });
      }
    } catch (e: any) {
      setError(e.message);
      if (forgeConfig.onEvent) forgeConfig.onEvent('error', e);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={cn('space-y-4', className)}>
      {showEmail && (
        <ForgeInput
          {...forgeConfig}
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
        />
      )}
      {showPassword && (
        <ForgeInput
          {...forgeConfig}
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ForgeButton
        {...forgeConfig}
        loading={loading}
        onClick={handleSubmit}
        className="w-full"
      >
        {buttonText}
      </ForgeButton>
    </div>
  );

  if (variant === 'card') {
    return <ForgeCard {...forgeConfig} className="w-full max-w-sm">{content}</ForgeCard>;
  }

  return content;
}

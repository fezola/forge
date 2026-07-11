import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { ForgeButton } from '../ui/forge-button';
import { ForgeInput } from '../ui/forge-input';
import { ForgeCard } from '../ui/forge-card';

export interface ForgeAuthSignUpProps extends ForgeComponentConfig {
  variant?: 'default' | 'card';
  showName?: boolean;
  showEmail?: boolean;
  showPassword?: boolean;
  showConfirmPassword?: boolean;
  buttonText?: string;
  className?: string;
}

export function ForgeAuthSignUp({
  variant = 'default',
  showName = true,
  showEmail = true,
  showPassword = true,
  showConfirmPassword = true,
  buttonText = 'Sign Up',
  className,
  ...forgeConfig
}: ForgeAuthSignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (showConfirmPassword && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setSuccess(true);
      if (forgeConfig.onEvent) forgeConfig.onEvent('success', { email });
    } catch (e: any) {
      setError(e.message);
      if (forgeConfig.onEvent) forgeConfig.onEvent('error', e);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={cn('space-y-4', className)}>
      {success && <p className="text-sm text-green-600">Account created successfully!</p>}
      {showName && <ForgeInput {...forgeConfig} placeholder="Full Name" value={name} onChange={setName} />}
      {showEmail && <ForgeInput {...forgeConfig} type="email" placeholder="Email" value={email} onChange={setEmail} />}
      {showPassword && <ForgeInput {...forgeConfig} type="password" placeholder="Password" value={password} onChange={setPassword} />}
      {showConfirmPassword && <ForgeInput {...forgeConfig} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ForgeButton {...forgeConfig} loading={loading} onClick={handleSubmit} className="w-full">{buttonText}</ForgeButton>
    </div>
  );

  if (variant === 'card') return <ForgeCard {...forgeConfig} className="w-full max-w-sm">{content}</ForgeCard>;
  return content;
}

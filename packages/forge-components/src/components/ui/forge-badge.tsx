import React from 'react';

export function ForgeBadge({ children, variant, className, ...rest }: Record<string, any>) {
  return React.createElement('span', { className, ...rest }, children ?? variant ?? 'ForgeBadge');
}
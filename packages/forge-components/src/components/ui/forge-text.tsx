import React from 'react';

export function ForgeText({ children, className, ...rest }: Record<string, any>) {
  return React.createElement('p', { className, ...rest }, children ?? 'ForgeText');
}
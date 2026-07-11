import React from 'react';

export function ForgeCard({ children, className, ...rest }: Record<string, any>) {
  return React.createElement('div', { className, ...rest }, children ?? 'ForgeCard');
}
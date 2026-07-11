import React from 'react';

export function ForgeButton({ children, loading, onClick, className, ...rest }: Record<string, any>) {
  return React.createElement('button', { disabled: loading, onClick, className, ...rest }, loading ? 'Loading...' : children ?? 'ForgeButton');
}
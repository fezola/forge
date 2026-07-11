import React from 'react';

export function ForgeLoading({ size, className, ...rest }: Record<string, any>) {
  return React.createElement('div', { className, ...rest }, 'Loading...');
}
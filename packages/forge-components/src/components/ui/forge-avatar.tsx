import React from 'react';

export function ForgeAvatar({ src, fallback, size, status, className, children, ...rest }: Record<string, any>) {
  return React.createElement('div', { className, ...rest }, children ?? fallback ?? 'ForgeAvatar');
}
import React from 'react';

export function ForgeInput({ type, placeholder, value, onChange, className, ...rest }: Record<string, any>) {
  return React.createElement('input', { type: type ?? 'text', placeholder, value, onChange, className, ...rest });
}
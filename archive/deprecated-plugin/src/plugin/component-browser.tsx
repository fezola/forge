'use client';

import React, { useState } from 'react';
import { getAllComponents } from './component-registry';

export function ComponentBrowser() {
  const [search, setSearch] = useState('');

  const categories = ['auth', 'data', 'payment', 'blockchain', 'ai', 'storage', 'ui'];
  const allComponents = getAllComponents();

  const filtered = search
    ? allComponents.filter(c => c.schema.name.toLowerCase().includes(search.toLowerCase()) || c.schema.category.includes(search))
    : allComponents;

  return (
    <div className="space-y-2 p-2">
      <input
        type="text"
        placeholder="Search components..."
        className="w-full rounded border bg-background px-3 py-1.5 text-xs"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="space-y-1">
        {categories.map(category => {
          const items = filtered.filter(c => c.schema.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{category}</p>
              {items.map(item => (
                <div
                  key={item.id}
                  className="cursor-pointer rounded px-2 py-1.5 text-xs hover:bg-muted/50 transition-colors"
                  draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}
                  onClick={() => {}}
                >
                  {item.schema.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

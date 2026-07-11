'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/users', label: 'Users', icon: 'User' },
  { href: '/billing', label: 'Billing', icon: 'CreditCard' },
  { href: '/blockchain', label: 'Blockchain', icon: 'Hexagon' },
  { href: '/ai', label: 'AI Engine', icon: 'Brain' },
  { href: '/components', label: 'Components', icon: 'Puzzle' },
  { href: '/marketplace', label: 'Marketplace', icon: 'Store' },
  { href: '/deployment', label: 'Deployment', icon: 'Rocket' },
  { href: '/enterprise', label: 'Enterprise', icon: 'Building2' },
  { href: '/projects', label: 'Projects', icon: 'Folder' },
  { href: '/workflows', label: 'Workflows', icon: 'Workflow' },
  { href: '/bindings', label: 'Data Bindings', icon: 'Link2' },
  { href: '/cms', label: 'CMS Collections', icon: 'Database' },
  { href: '/identities', label: 'Identities', icon: 'Users' },
  { href: '/organizations', label: 'Organizations', icon: 'Building2' },
  { href: '/roles', label: 'Roles & Permissions', icon: 'Shield' },
  { href: '/connectors', label: 'Connectors', icon: 'Puzzle' },
  { href: '/connectors/marketplace', label: 'Marketplace', icon: 'Store' },
  { href: '/connectors/custom', label: 'Custom API', icon: 'Code' },
  { href: '/config', label: 'Configuration', icon: 'Settings2' },
  { href: '/config/feature-flags', label: '  Feature Flags', icon: 'Flag' },
  { href: '/config/environments', label: '  Environments', icon: 'Layers' },
  { href: '/config/secrets', label: '  Secrets', icon: 'Key' },
  { href: '/config/branding', label: '  Branding', icon: 'Palette' },
  { href: '/secrets', label: 'Secrets (legacy)', icon: 'Key' },
  { href: '/settings', label: 'Platform Settings', icon: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card p-4">
      <div className="mb-6 text-xl font-bold">Forge</div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

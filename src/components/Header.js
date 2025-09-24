import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            {process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Starter'}
          </Link>
        </div>

        <nav className="hidden items-center space-x-6 md:flex">
          <Link href="/" className="hover:text-primary text-sm font-medium">
            Home
          </Link>
          <Link
            href="/components"
            className="hover:text-primary text-sm font-medium"
          >
            Components
          </Link>
          <Link
            href="/features"
            className="hover:text-primary text-sm font-medium"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="hover:text-primary text-sm font-medium"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
}

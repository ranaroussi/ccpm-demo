import Button from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="py-20 text-center">
        <h1 className="mb-6 text-4xl font-bold md:text-6xl">
          Build Your SaaS
          <span className="block text-blue-600">Faster Than Ever</span>
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
          A modern Next.js starter template with everything you need to build a
          successful SaaS application. Authentication, payments, and more
          included.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            View Documentation
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>⚡ Next.js 15</CardTitle>
              <CardDescription>
                Built with the latest Next.js featuring App Router and React
                Server Components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• App Router architecture</li>
                <li>• Server and client components</li>
                <li>• Optimized performance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎨 Tailwind CSS</CardTitle>
              <CardDescription>
                Modern utility-first CSS framework for rapid UI development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Tailwind CSS v4</li>
                <li>• Dark mode support</li>
                <li>• Responsive design</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔧 Developer Experience</CardTitle>
              <CardDescription>
                Optimized for productivity with modern development tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• ESLint configuration</li>
                <li>• Prettier formatting</li>
                <li>• Hot reloading</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 text-center">
        <h2 className="mb-6 text-3xl font-bold">Ready to Start Building?</h2>
        <p className="text-muted-foreground mb-8 text-xl">
          Get started with your SaaS application today
        </p>
        <Button size="lg">Get Started Now</Button>
      </div>
    </div>
  );
}

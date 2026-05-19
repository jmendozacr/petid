import Link from 'next/link'
import { Button } from '@/components/ui/button'

function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="50" cy="68" rx="24" ry="20" />
      <ellipse cx="26" cy="47" rx="11" ry="9" transform="rotate(-20 26 47)" />
      <ellipse cx="41" cy="36" rx="11" ry="9" transform="rotate(-5 41 36)" />
      <ellipse cx="59" cy="36" rx="11" ry="9" transform="rotate(5 59 36)" />
      <ellipse cx="74" cy="47" rx="11" ry="9" transform="rotate(20 74 47)" />
    </svg>
  )
}

const features = ['Health records', 'QR identification', 'Lost pet alerts', 'Emergency contacts']

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Content panel */}
      <div className="flex-1 flex flex-col justify-center px-8 py-16 lg:px-16 xl:px-24 bg-background order-2 lg:order-1">
        <div className="max-w-lg animate-fade-up">
          <div className="flex items-center gap-2.5 mb-12">
            <PawIcon className="h-7 w-7 text-primary" />
            <span className="font-heading text-lg font-semibold text-foreground tracking-tight">PetID</span>
          </div>

          <h1 className="font-heading text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] mb-6">
            Every pet deserves an identity.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Create a digital profile for your pet, generate a QR code, and help them find their way home if they ever get lost.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Button asChild size="lg" className="font-medium">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <span
                key={feature}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Visual panel */}
      <div className="h-56 lg:h-auto lg:w-5/12 xl:w-2/5 bg-primary relative overflow-hidden order-1 lg:order-2 flex items-center justify-center">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/[0.08]" />
        <div className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/15" />
        <div className="absolute bottom-12 right-12 w-8 h-8 rounded-full bg-white/[0.12]" />
        <PawIcon className="relative z-10 w-40 h-40 lg:w-60 lg:h-60 text-white/20" />
        <PawIcon className="absolute top-8 left-1/4 w-8 h-8 text-white/10 rotate-12" />
        <PawIcon className="absolute bottom-10 right-1/4 w-6 h-6 text-white/[0.08] -rotate-20" />
        <PawIcon className="absolute top-1/3 right-10 w-7 h-7 text-white/[0.08] rotate-45" />
      </div>
    </div>
  )
}

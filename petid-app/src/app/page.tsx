import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <h1 className="text-4xl font-bold text-primary">PetID</h1>
          <CardDescription className="text-base">
            Digital identity and health record for your pets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Keep your pet's information safe and accessible</p>
            <p>Generate QR codes for easy identification</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

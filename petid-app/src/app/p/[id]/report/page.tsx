'use client'

import { useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useReportForm } from '@/hooks/useReportForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportFoundPetPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const { formData, loading, success, error, handleChange, submit } = useReportForm(petId)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await submit()
  }, [submit])

  if (success) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-success">Report Submitted!</CardTitle>
            <CardDescription className="text-center">
              Thank you for reporting this pet. The owner will be notified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/p/${petId}`)} className="w-full">
              Back to Pet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Report Found Pet</CardTitle>
            <CardDescription>
              Let the owner know you found their pet
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div role="alert" className="text-sm text-danger p-3 rounded-md bg-danger/10">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Where did you find the pet? Any details..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Street, neighborhood, city..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Your Contact (optional)</Label>
                <Input
                  id="contact"
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  placeholder="Phone or email..."
                />
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

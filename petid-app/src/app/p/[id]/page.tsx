import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QRCode } from '@/components/qr-code'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicPetPage({ params }: PageProps) {
  const { id: petId } = await params
  const supabase = await createClient()

  const { data: pet } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single()

  if (!pet) {
    notFound()
  }

  const { data: records } = await supabase
    .from('health_records')
    .select('*')
    .eq('pet_id', petId)
    .in('type', ['allergy', 'medical_note'])
    .order('record_date', { ascending: false })

  const allergies = records?.filter(r => r.type === 'allergy') || []
  const medicalNotes = records?.filter(r => r.type === 'medical_note') || []

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <div className="aspect-square bg-muted relative">
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{pet.name}</CardTitle>
            <CardDescription className="text-lg">
              {pet.species} {pet.breed && `• ${pet.breed}`}
            </CardDescription>
          </CardHeader>
        </Card>

        {pet.owner_phone && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Owner Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{pet.owner_phone}</p>
            </CardContent>
          </Card>
        )}

        {pet.emergency_contact && (
          <Card className="border-danger bg-danger/5">
            <CardHeader>
              <CardTitle className="text-lg text-danger">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{pet.emergency_contact}</p>
            </CardContent>
          </Card>
        )}

        {allergies.length > 0 && (
          <Card className="border-danger">
            <CardHeader>
              <CardTitle className="text-lg text-danger">⚠️ Allergies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allergies.map((allergy) => (
                <div key={allergy.id} className="p-3 bg-danger/10 rounded-md">
                  <p className="font-medium">{allergy.description}</p>
                  <p className="text-sm text-muted-foreground">{allergy.record_date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {medicalNotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {medicalNotes.map((note) => (
                <div key={note.id} className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{note.description}</p>
                  <p className="text-sm text-muted-foreground">{note.record_date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {pet.microchip_id && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Microchip ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-lg">{pet.microchip_id}</p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Powered by PetID
        </p>
      </div>
    </div>
  )
}

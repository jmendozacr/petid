export interface GeoCoords {
  lat: number
  lng: number
}

export function getCurrentPosition(): Promise<GeoCoords | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 60000 }
    )
  })
}

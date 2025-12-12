import { GpsTrackingBar } from '@/components/gps/gps-tracking-bar'

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <GpsTrackingBar />
      {children}
    </>
  )
}
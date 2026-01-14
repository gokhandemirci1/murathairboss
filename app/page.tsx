'use client'

import { useRef } from 'react'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import ExampleCuts from '@/components/ExampleCuts'
import BookingForm from '@/components/BookingForm'
import Location from '@/components/Location'

export default function Home() {
  const bookingRef = useRef<HTMLDivElement>(null)

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <Hero onBookNow={scrollToBooking} />
      <Services />
      <ExampleCuts />
      <div ref={bookingRef}>
        <BookingForm />
      </div>
      <Location />
    </main>
  )
}

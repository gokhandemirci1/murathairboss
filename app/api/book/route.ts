import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

interface BookingRequest {
  firstName: string
  lastName: string
  phone: string
  date: string
  time: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json()

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.phone || !body.date || !body.time) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      )
    }

    // Get environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const calendarId = process.env.GOOGLE_CALENDAR_ID

    // If environment variables are not set, return a mock success response
    if (!clientEmail || !privateKey || !calendarId) {
      console.log('Google Calendar credentials not configured. Returning mock response.')
      console.log('Booking details:', body)
      
      return NextResponse.json(
        {
          success: true,
          message: 'Randevu başarıyla oluşturuldu (Mock)',
          booking: {
            id: `mock-${Date.now()}`,
            ...body,
          },
        },
        { status: 200 }
      )
    }

    // Authenticate with Google Calendar API using Service Account
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Combine date and time into a single datetime
    const startDateTime = new Date(`${body.date}T${body.time}`)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // Add 1 hour

    // Create event
    const event = {
      summary: `${body.firstName} ${body.lastName} - ${body.phone}`,
      description: `
        Müşteri: ${body.firstName} ${body.lastName}
        Telefon: ${body.phone}
        Tarih: ${body.date}
        Saat: ${body.time}
      `,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Istanbul',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Istanbul',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    }

    // Insert event into calendar
    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Randevu başarıyla oluşturuldu',
        eventId: response.data.id,
        booking: {
          id: response.data.id,
          ...body,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error creating booking:', error)
    
    // If it's a Google API error, provide more details
    if (error.response) {
      return NextResponse.json(
        {
          error: 'Google Calendar API hatası',
          details: error.response.data?.error?.message || 'Bilinmeyen hata',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Randevu oluşturulurken bir hata oluştu',
        details: error.message || 'Bilinmeyen hata',
      },
      { status: 500 }
    )
  }
}

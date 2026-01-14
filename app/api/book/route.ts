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

    // Debug: Log environment variable status (without sensitive data)
    console.log('Environment check:', {
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      hasCalendarId: !!calendarId,
      calendarId: calendarId,
    })

    // If environment variables are not set, return a mock success response
    if (!clientEmail || !privateKey || !calendarId) {
      console.log('Google Calendar credentials not configured. Returning mock response.')
      console.log('Missing:', {
        clientEmail: !clientEmail,
        privateKey: !privateKey,
        calendarId: !calendarId,
      })
      console.log('Booking details:', body)
      
      return NextResponse.json(
        {
          success: true,
          message: 'Randevu başarıyla oluşturuldu (Mock - Google Calendar credentials not configured)',
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

    // Handle calendar ID - if it's an email, use it as calendar ID
    // For shared calendars, you can use the email address directly
    // Format: "user@gmail.com" or "primary" for primary calendar
    let targetCalendarId = calendarId
    
    // If calendarId is a Gmail address, we can use it directly
    // But first, let's try to get the calendar list to find the correct ID
    if (calendarId.includes('@gmail.com') && !calendarId.includes('group.calendar.google.com')) {
      console.log('Calendar ID is a Gmail address, using it directly:', calendarId)
      // Try to use the email as calendar ID (works for shared calendars)
      targetCalendarId = calendarId
    }

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
    console.log('Attempting to create calendar event:', {
      calendarId: targetCalendarId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    })

    // Try to insert event
    let response
    try {
      response = await calendar.events.insert({
        calendarId: targetCalendarId,
        requestBody: event,
      })
      console.log('Calendar event created successfully:', response.data.id)
      console.log('Event details:', {
        summary: response.data.summary,
        start: response.data.start?.dateTime,
        end: response.data.end?.dateTime,
        htmlLink: response.data.htmlLink,
        calendarId: targetCalendarId,
      })
    } catch (insertError: any) {
      // If calendar not found or access denied, provide helpful error
      if (insertError.code === 404 || insertError.message?.includes('Not Found')) {
        console.error('Calendar not found or not accessible. Make sure:')
        console.error('1. Calendar ID is correct (use "primary" for primary calendar)')
        console.error('2. Service account email has access to the calendar')
        console.error('3. Calendar is shared with service account email:', clientEmail)
        throw new Error(`Calendar not found or not accessible. Please share the calendar with ${clientEmail} or use "primary" as calendar ID.`)
      } else if (insertError.code === 403 || insertError.message?.includes('Permission')) {
        console.error('Permission denied. Make sure the calendar is shared with:', clientEmail)
        throw new Error(`Permission denied. Please share the calendar with service account: ${clientEmail}`)
      } else {
        throw insertError
      }
    }

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
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    })
    
    // If it's a Google API error, provide more details
    if (error.response) {
      const errorMessage = error.response.data?.error?.message || 'Bilinmeyen hata'
      const errorCode = error.response.data?.error?.code
      
      console.error('Google API Error:', {
        code: errorCode,
        message: errorMessage,
        status: error.response.status,
      })

      return NextResponse.json(
        {
          error: 'Google Calendar API hatası',
          details: errorMessage,
          code: errorCode,
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

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

    // Combine date and time into a single datetime (Turkey timezone - Europe/Istanbul)
    // Use explicit UTC+3 offset to avoid day-shift issues
    const [year, month, day] = body.date.split('-').map(Number)
    const [hours, minutes] = body.time.split(':').map(Number)
    const tzOffset = '+03:00'
    
    // Create date string in Turkey timezone format (YYYY-MM-DDTHH:mm:ss+03:00)
    const startDateTimeISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00${tzOffset}`
    
    // Calculate end time (30 minutes later) - handle minute/hour/day overflow
    const totalMinutes = minutes + 30
    let endHours = hours + Math.floor(totalMinutes / 60)
    let endMinutes = totalMinutes % 60
    let endYear = year
    let endMonth = month
    let endDay = day
    
    if (endHours >= 24) {
      endHours = endHours % 24
      // Add one day manually to avoid timezone conversion issues
      const daysInMonth = new Date(year, month, 0).getDate() // Get days in current month
      if (day < daysInMonth) {
        endDay = day + 1
      } else if (month < 12) {
        endDay = 1
        endMonth = month + 1
      } else {
        endDay = 1
        endMonth = 1
        endYear = year + 1
      }
    }
    
    const endDateTimeISO = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00${tzOffset}`

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
        dateTime: startDateTimeISO, // Format: YYYY-MM-DDTHH:mm:ss+03:00
        timeZone: 'Europe/Istanbul',
      },
      end: {
        dateTime: endDateTimeISO, // Format: YYYY-MM-DDTHH:mm:ss+03:00
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

    // Check if there's already an event at this time
    console.log('Checking for existing events at this time:', {
      calendarId: targetCalendarId,
      startDateTime: startDateTimeISO,
      endDateTime: endDateTimeISO,
    })

    // Query events for the selected time slot (API expects UTC range)
    const queryStartUTC = new Date(`${body.date}T${body.time}:00${tzOffset}`)
    const queryEndUTC = new Date(queryStartUTC.getTime() + 30 * 60 * 1000)

    const timeMin = queryStartUTC.toISOString()
    const timeMax = queryEndUTC.toISOString()

    let existingEvents
    try {
      const eventsResponse = await calendar.events.list({
        calendarId: targetCalendarId,
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 10,
      })

      existingEvents = eventsResponse.data.items || []
      console.log('Found existing events:', existingEvents.length)

      // Check if there are any events that overlap with our time slot
      if (existingEvents.length > 0) {
        console.log('Time slot is already booked:', existingEvents.map(e => ({
          summary: e.summary,
          start: e.start?.dateTime,
          end: e.end?.dateTime,
        })))

        return NextResponse.json(
          {
            error: 'Bu saatte zaten bir randevu var',
            details: 'Lütfen başka bir saat seçiniz',
            availableSlots: 'Farklı bir saat deneyiniz',
          },
          { status: 409 } // Conflict status code
        )
      }
    } catch (listError: any) {
      console.error('Error checking existing events:', listError)
      // If we can't check, we'll still try to create the event
      // Google Calendar will prevent double booking if configured
    }

    // Insert event into calendar
    console.log('Attempting to create calendar event:', {
      calendarId: targetCalendarId,
      startDateTime: startDateTimeISO,
      endDateTime: endDateTimeISO,
      localTime: `${body.date} ${body.time} (Turkey time - Europe/Istanbul)`,
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

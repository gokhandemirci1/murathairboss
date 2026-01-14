# Murat Hair Boss - Barber Landing Page

A modern, high-end landing page and appointment booking website for Murat Hair Boss barber shop.

## Features

- 🎨 Modern, bold design with Red, Black, and White color scheme
- 📱 Fully responsive and mobile-friendly
- ✨ Smooth animations with Framer Motion
- 📅 Appointment booking form with validation
- 🔗 Google Calendar API integration
- 🎯 Horizontal scrollable services carousel

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **React Hook Form**
- **Lucide React** (Icons)
- **Google APIs** (Calendar integration)

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

**Note:** If these environment variables are not set, the API will return a mock success response for development purposes.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── book/
│   │       └── route.ts          # Booking API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── Hero.tsx                 # Hero section
│   ├── Services.tsx             # Services carousel
│   ├── BookingForm.tsx          # Booking form
│   └── Location.tsx             # Location section
└── ...
```

## Customization

### Services

Edit the `services` array in `components/Services.tsx` to update service names, descriptions, and prices.

### Location

Update the address and description in `components/Location.tsx`.

### Colors

Modify the color palette in `tailwind.config.ts` if needed.

## Google Calendar Setup

1. Create a Google Cloud Project
2. Enable the Google Calendar API
3. Create a Service Account
4. Download the JSON key file
5. Extract the `client_email` and `private_key` from the JSON
6. Create a Google Calendar and share it with the service account email
7. Get the Calendar ID from the calendar settings
8. Add the credentials to your `.env.local` file

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

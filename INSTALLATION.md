# Installation Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables (Optional)**
   
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
   ```
   
   **Note:** If you don't set these variables, the booking API will return a mock success response for development.

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Customization

### Update Services
Edit the `services` array in `components/Services.tsx`:
```typescript
const services: Service[] = [
  {
    id: 1,
    name: 'Your Service Name',
    description: 'Service description',
    price: '150 TL',
    icon: <Scissors className="w-8 h-8" />,
  },
  // ... more services
]
```

### Update Location
Edit the address in `components/Location.tsx`:
```typescript
const address = "Your Address Here"
```

### Update Colors
Modify `tailwind.config.ts` if you want to change the color scheme.

## Google Calendar API Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Fill in the details and create
5. Create a key for the service account (JSON format)
6. Download the JSON file and extract:
   - `client_email` → `GOOGLE_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY` (keep the quotes and \n)
7. Create a Google Calendar and share it with the service account email
8. Get the Calendar ID from calendar settings
9. Add all three values to your `.env.local` file

## Build for Production

```bash
npm run build
npm start
```

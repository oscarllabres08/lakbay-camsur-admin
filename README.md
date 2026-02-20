# Lakbay CamSur - Admin Website

Admin dashboard for managing Lakbay CamSur destinations, analytics, and categories.

## Features

- 🔐 **Login System** - Default credentials (temporary, no backend)
- 📍 **Destinations Management** - Add, edit, delete destinations with image upload
- 📊 **Analytics Dashboard** - View statistics, charts, and performance metrics
- 📁 **Categories Management** - Manage destination categories
- 🖼️ **Image Upload** - Drag & drop image upload for destinations
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Dropzone** - Image upload
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the admin-website directory:
```bash
cd admin-website
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

## Project Structure

```
admin-website/
├── app/
│   ├── page.tsx              # Login page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard overview
│   ├── destinations/
│   │   └── page.tsx          # Destinations management
│   ├── analytics/
│   │   └── page.tsx          # Analytics & charts
│   └── categories/
│       └── page.tsx          # Categories management
├── components/
│   ├── Layout.tsx            # Main layout wrapper
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── AddDestinationModal.tsx  # Add/Edit destination modal
└── ...
```

## Features in Detail

### Destinations Management

- **Add Destination:**
  - Select category
  - Upload destination image (drag & drop)
  - Enter name, description
  - Set coordinates (latitude, longitude)
  - Set operating hours
  - Select best time to visit (Morning, Afternoon, Evening)
  - Enter estimated cost

- **Edit/Delete:** Click Edit or Delete buttons on destination cards

### Analytics

- **Most Viewed Destinations** - Top 5 by views
- **Most Visited Destinations** - Top 5 by visits
- **Visitor Trends** - Line chart showing monthly views and visits
- **Views by Category** - Pie chart distribution
- **Category Performance** - Bar chart comparing views vs visits

### Categories

- View all categories with statistics
- See destinations count, total views, and total visits per category

## Notes

- **No Database:** Currently uses localStorage and mock data
- **Image Upload:** Images are stored as base64 (temporary solution)
- **Authentication:** Simple localStorage-based auth (temporary)

## Future Enhancements

- Connect to Supabase/Firebase database
- Real image storage (Supabase Storage)
- User authentication with proper backend
- Data persistence
- Export analytics reports
- Bulk import destinations

## License

This project is for Lakbay CamSur admin dashboard.

# Admin Panel

A modern, responsive admin panel built with React, Vite, and Tailwind CSS. Features user management, product catalog, category organization, and comprehensive settings.

## Features

- 🔐 **Authentication** - Secure login with JWT integration
- 📊 **Dashboard** - Overview of key metrics and recent activity
- 👥 **User Management** - Complete user administration
- 📦 **Product Management** - Full product catalog management
- 🏷️ **Category Management** - Organize products with categories
- ⚙️ **Settings** - Comprehensive settings management
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Clean, professional interface
- 🔄 **Reusable Components** - Modular, maintainable codebase

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icons

## API Integration

The application is configured to work with the login endpoint:

```
https://chart.dsrt321.online/api/auth/login/
```

### Authentication Flow

1. User enters credentials on login page
2. Credentials are sent to the API endpoint
3. On successful authentication, JWT token is stored
4. Token is automatically included in subsequent API requests
5. User is redirected to dashboard

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   └── ui/              # UI components (Button, Input, etc.)
├── contexts/            # React contexts
├── pages/               # Page components
├── services/            # API services
└── styles/              # Global styles
```

## Components

### UI Components

- **Button** - Flexible button component with variants
- **Input** - Form input with validation support
- **Card** - Container component for content sections
- **Table** - Data table with sorting and filtering

### Layout Components

- **Layout** - Main application layout with sidebar
- **ProtectedRoute** - Route wrapper for authentication

### Pages

- **Login** - Authentication page
- **Dashboard** - Main overview page
- **Users** - User management interface
- **Products** - Product catalog management
- **Categories** - Category organization
- **Settings** - Application settings

## Customization

### Tailwind Configuration

The project uses a custom Tailwind configuration with:

- Custom color palette (primary, gray shades)
- Extended theme configuration
- Responsive design utilities

### API Configuration

Update the API base URL in `src/services/auth.js`:

```javascript
const API_BASE_URL = "your-api-url-here";
```

## Authentication

The app uses JWT-based authentication with:

- Automatic token storage in localStorage
- Request interceptors for token injection
- Response interceptors for error handling
- Automatic redirect on authentication failure

## Development

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/layout/Layout.jsx`

### Adding New Components

1. Create component in appropriate directory
2. Export from index file if needed
3. Import and use in pages/components

### Styling Guidelines

- Use Tailwind CSS classes for styling
- Follow the existing color scheme
- Maintain responsive design principles
- Use the defined component variants

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.

# Intelligent Auction Platform - React Version

A modern React-based auction platform that allows users to create, browse, and bid on auction listings. This is a complete conversion from the original HTML/CSS/JavaScript version to a modern React application.

## Features

- **User Authentication**: Login and registration system
- **Auction Listings**: Browse all available auctions with real-time status
- **Create Listings**: Authenticated users can create new auction listings
- **Edit Listings**: Listing owners can edit their own listings
- **Bidding System**: Place bids on active auctions
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Dynamic status updates for auction states

## Tech Stack

- **React 18** - Frontend framework
- **React Router DOM** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Context API** - State management for authentication
- **Fetch API** - HTTP requests to backend

## Project Structure

```
src/
├── components/          # React components
│   ├── Home.js         # Landing page
│   ├── Login.js        # Authentication page
│   ├── Listings.js     # Auction listings grid
│   ├── AddListing.js   # Create new listing
│   ├── EditListing.js  # Edit existing listing
│   ├── Auction.js      # Individual auction details
│   └── Layout.js       # Main layout wrapper
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication state management
├── services/           # API services
│   └── api.js          # Backend API communication
├── styles/             # Styled components
│   └── GlobalStyles.js # Global styles and common components
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Backend Setup

Make sure your backend API is running on `http://localhost:5000` with the following endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get specific listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/auctions/:id/bids` - Place a bid

## Usage

### For Users

1. **Browse Auctions**: Visit the homepage to see featured content and navigate to listings
2. **Register/Login**: Create an account or login to access full features
3. **View Auctions**: Click on any listing to see detailed auction information
4. **Place Bids**: On active auctions, enter your bid amount and submit

### For Sellers

1. **Create Listings**: After logging in, click "Add Listing" to create new auctions
2. **Edit Listings**: Use the "Edit" button on your own listings to make changes
3. **Delete Listings**: Remove listings you no longer want to auction

## Key Features Converted

### From Original HTML/JS:

- ✅ **Multi-page navigation** → React Router
- ✅ **Authentication system** → React Context + localStorage
- ✅ **Dynamic content loading** → React state management
- ✅ **Form handling** → React controlled components
- ✅ **API communication** → Centralized API service
- ✅ **Responsive design** → Styled Components
- ✅ **User session management** → Context API

### Improvements Made:

- **Component-based architecture** for better maintainability
- **Centralized state management** with React Context
- **Type-safe API service** with error handling
- **Reusable styled components** for consistent UI
- **Better separation of concerns** between UI and business logic
- **Modern React patterns** (hooks, functional components)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Environment Variables

Create a `.env` file in the root directory if you need to customize the API URL:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed by Prasad Kumbhar. All rights reserved.

## Support

For issues or questions, please check the console for error messages and ensure your backend API is running correctly.

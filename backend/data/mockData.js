// Mock data for development when MongoDB is not available
export const mockListings = [
  {
    _id: "1",
    title: "MacBook Pro 13-inch",
    description: "Excellent condition MacBook Pro, perfect for students",
    startPrice: 800,
    currentBid: 850,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    seller: {
      _id: "user1",
      name: "John Doe",
      email: "john@example.com"
    },
    image: "https://via.placeholder.com/300x200?text=MacBook+Pro",
    status: "active",
    category: "electronics",
    condition: "like-new",
    bidCount: 5,
    viewCount: 23
  },
  {
    _id: "2", 
    title: "Calculus Textbook",
    description: "Stewart Calculus 8th Edition, barely used",
    startPrice: 50,
    currentBid: 65,
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    seller: {
      _id: "user2",
      name: "Sarah Smith",
      email: "sarah@example.com"
    },
    image: "https://via.placeholder.com/300x200?text=Calculus+Book",
    status: "active",
    category: "books",
    condition: "good",
    bidCount: 3,
    viewCount: 15
  },
  {
    _id: "3",
    title: "Gaming Chair",
    description: "Comfortable gaming chair, great for long study sessions",
    startPrice: 120,
    currentBid: 120,
    startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    seller: {
      _id: "user3", 
      name: "Mike Johnson",
      email: "mike@example.com"
    },
    image: "https://via.placeholder.com/300x200?text=Gaming+Chair",
    status: "active",
    category: "furniture",
    condition: "good",
    bidCount: 0,
    viewCount: 8
  }
];

export const mockUsers = [
  {
    _id: "user1",
    name: "John Doe",
    email: "john@example.com",
    rating: 4.5,
    totalRatings: 12,
    trustScore: 85,
    completedTransactions: 15,
    successfulTransactions: 14
  },
  {
    _id: "user2", 
    name: "Sarah Smith",
    email: "sarah@example.com",
    rating: 4.8,
    totalRatings: 8,
    trustScore: 92,
    completedTransactions: 10,
    successfulTransactions: 10
  },
  {
    _id: "user3",
    name: "Mike Johnson", 
    email: "mike@example.com",
    rating: 4.2,
    totalRatings: 5,
    trustScore: 78,
    completedTransactions: 7,
    successfulTransactions: 6
  }
];

export const mockNotifications = [
  {
    _id: "notif1",
    type: "bid_placed",
    title: "New Bid Placed",
    message: "Someone bid $850 on your MacBook Pro listing",
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
  },
  {
    _id: "notif2",
    type: "auction_reminder", 
    title: "Auction Ending Soon",
    message: "Your Calculus Textbook auction ends in 2 hours",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  }
];

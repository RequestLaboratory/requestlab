# RequestLab - API Testing & Comparison Tool

A modern web application that provides a comprehensive API development platform. Built with React and TypeScript, RequestLab offers powerful features for API testing, JSON comparison, cURL command analysis, and API request interception.

## Features

### API Testing

- **Full Request Configuration**

  - Multiple HTTP methods (GET, POST, PUT, DELETE, etc.)
  - Headers management with key-value pairs
  - Query parameters support
  - Request body with multiple content types
  - Pre-request and test scripts

- **Response Analysis**
  - Real-time response visualization
  - Status code color coding
  - Response time and size tracking
  - Syntax-highlighted JSON display
  - Copy response functionality

### JSON/cURL Comparison

- **Smart Difference Highlighting**

  - 🔴 Red highlighting for fields present in left JSON but missing in right
  - 🟢 Green highlighting for fields present in right JSON but missing in left
  - ⚫ Gray highlighting for fields with different values

- **Advanced Comparison Features**
  - Deep JSON comparison with nested object support
  - cURL command execution and response comparison
  - Real-time diff visualization
  - Share comparison results via unique URLs

### API Interceptor

- **Request Interception**

  - Create custom interceptors for any API endpoint
  - Real-time request/response monitoring
  - Detailed request and response logging
  - Support for all HTTP methods
  - Automatic request forwarding

- **Interceptor Management**

  - Create, edit, and delete interceptors
  - Unique proxy URLs for each interceptor
  - Active/Inactive status toggle
  - Base URL configuration
  - Request path mapping

- **Real-time Logging**
  - Server-Sent Events (SSE) for real-time updates
  - Heartbeat mechanism for connection stability
  - Automatic reconnection handling
  - Detailed request/response information
  - Connection status monitoring

### SQL Schema Comparison

- **Schema Analysis**
  - Compare MySQL database schemas
  - Visualize schema differences
  - Support for complex SQL structures
  - File upload support
  - Example schema loading

### General Features

- **User Experience**

  - Dark/Light mode support
  - Responsive design for all devices
  - Intuitive and clean interface
  - Keyboard shortcuts support
  - Session storage for state persistence

- **Developer Tools**
  - JSON formatting and validation
  - cURL command parsing and execution
  - Request/response history
  - Shareable links with encoded parameters

## Architecture

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management
- Server-Sent Events for real-time updates

### Backend (Cloudflare Worker)

- Serverless architecture
- KV storage for interceptor data
- Durable Objects for WebSocket management
- CORS support
- Request/response logging

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Cloudflare account (for API Interceptor feature)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yadev64/jsoncompare.git
cd jsoncompare
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure environment variables:

```bash
# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

### API Testing

1. Navigate to the API Testing page
2. Configure your request:
   - Select HTTP method
   - Enter URL
   - Add headers and query parameters
   - Configure request body
3. Execute the request
4. Analyze the response with syntax highlighting

### JSON/cURL Comparison

1. Choose between JSON or cURL mode
2. Input your JSON objects or cURL commands
3. View the differences with color-coded highlighting
4. Share the comparison using the generated URL

### API Interceptor

1. Create a new interceptor:
   - Enter a name
   - Specify the base URL to intercept
   - Configure any path mappings
2. Use the generated proxy URL in your application
3. Monitor requests in real-time through the logs interface
4. View detailed request/response information

### SQL Schema Comparison

1. Navigate to the SQL Compare page
2. Input or upload your MySQL schema dumps
3. View the differences between schemas
4. Export or share the comparison results

## Development

### Project Structure

```
src/
├── components/         # React components
├── contexts/          # React contexts
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── utils/            # Utility functions
└── types/            # TypeScript type definitions
```

### Key Components

- `ApiTesting`: Main API testing interface
- `JsonInput`: JSON input and formatting
- `CurlInput`: cURL command input and execution
- `DiffViewer`: JSON/cURL comparison visualization
- `ApiInterceptor`: Interceptor management interface
- `RequestLogViewer`: Real-time request logging
- `SqlCompare`: SQL schema comparison tool

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About

RequestLab is developed and maintained by [Yadev Jayachandran](https://www.linkedin.com/in/yadev-jayachandran/).

## Support

If you find this tool helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing to the project

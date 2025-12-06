# RequestLab - API Testing & Development Toolkit

A modern web application that provides a comprehensive API development platform. Built with React and TypeScript, RequestLab offers powerful features for API testing, JSON comparison, JSON formatting, cURL command analysis, and API request interception.

## Features

### API Testing

- **Multi-Tab Interface**
  - Postman-like tabbed interface for working on multiple requests
  - Open APIs from Collections sidebar in new tabs
  - Each tab maintains its own independent state
  - Create fresh request tabs with the + button

- **Auto-Save & Persistence**
  - Automatic saving with 1-second debounce after changes
  - Orange circle indicator shows unsaved changes
  - All APIs and collections stored in IndexedDB for persistence
  - Session storage for tab state across page refreshes

- **Full Request Configuration**
  - Multiple HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
  - Headers management with key-value pairs and enable/disable toggle
  - Query parameters support
  - Request body with multiple content types (raw JSON, form-data, x-www-form-urlencoded)
  - Pre-request and test scripts

- **Response Analysis**
  - Real-time response visualization
  - Status code color coding
  - Response time and size tracking
  - Syntax-highlighted JSON display
  - Copy response functionality

- **Collections Management**
  - Organize requests into collections
  - Add to Collection button for quick saving
  - Import/Export collections (Postman compatible)
  - Import cURL commands directly

- **Load Testing**
  - Configure concurrent users and request rates
  - Real-time performance metrics
  - Response time graphs and throughput analysis
  - Error rate monitoring

### JSON Formatter

- **Format & Beautify**
  - Convert minified JSON to readable, indented format
  - Configurable indentation (2 spaces, 4 spaces, or tab)
  - One-click formatting with instant results

- **Minify**
  - Compress JSON to single line for production use
  - Reduce payload size for API requests

- **Validation**
  - Instant error detection with line and column information
  - Detailed error messages for invalid JSON

- **Export Options**
  - Copy formatted output to clipboard
  - Download as .json file
  - 100% client-side processing for privacy

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

### MySQL Schema Comparison

- **Schema Analysis**
  - Compare MySQL database schemas
  - Visualize schema differences with color coding
  - Support for complex SQL structures
  - File upload support
  - Example schema loading

- **Export & AI Migration**
  - Export differences as JSON
  - ChatGPT integration for generating migration scripts
  - Detailed field comparison view

### General Features

- **User Experience**
  - Dark/Light mode support
  - Responsive design for all devices
  - Intuitive and clean interface
  - Toast notifications for feedback
  - Session storage for state persistence

- **Developer Tools**
  - JSON formatting and validation
  - cURL command parsing and execution
  - Request/response history
  - Shareable links with encoded parameters

## Architecture

### Frontend

- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management
- IndexedDB (Dexie.js) for local storage
- Chart.js for load testing visualizations
- react-toastify for notifications

### Backend

- Express.js server for API Interceptor
- Supabase for interceptor data storage
- CORS support with configurable origins
- Request/response logging

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yadev64/requestlab.git
cd requestlab
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

1. Navigate to the API Testing page from the sidebar
2. Click + to create a new request tab or select an API from Collections
3. Configure your request:
   - Select HTTP method
   - Enter URL
   - Add headers and query parameters
   - Configure request body
4. Click Send to execute the request
5. Analyze the response with syntax highlighting
6. Use "Add to Collection" to save the request
7. Changes are auto-saved after 1 second (orange indicator shows unsaved state)

### JSON Formatter

1. Navigate to JSON Formatter from the sidebar
2. Paste your JSON in the left panel
3. Click "Format" to beautify or "Minify" to compress
4. Copy the result or download as a file
5. Error messages show exact line/column for invalid JSON

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

### MySQL Schema Comparison

1. Navigate to the MySQL Compare page
2. Input or upload your MySQL schema dumps
3. View the differences between schemas
4. Click on tables to expand and see field-level differences
5. Export differences as JSON for migration scripts

## Development

### Project Structure

```
src/
├── components/         # React components
│   ├── api-testing/   # API testing specific components
│   ├── ApiInterceptor/# Interceptor components
│   ├── homePage/      # Home page components
│   └── ...
├── contexts/          # React contexts (Theme, Auth, Collections, Loader)
├── hooks/             # Custom React hooks
├── pages/             # Page components
│   ├── ApiTesting.tsx
│   ├── ApiInterceptor.tsx
│   ├── JsonFormatter.tsx
│   ├── Documentation.tsx
│   └── ...
├── utils/             # Utility functions
│   ├── apiTestingUtils.ts
│   ├── curlParser.ts
│   ├── db.ts          # IndexedDB configuration
│   └── ...
└── types/             # TypeScript type definitions
```

### Key Components

- `ApiTesting`: Main API testing interface with multi-tab support
- `JsonFormatter`: JSON formatting and validation tool
- `JsonInput`: JSON input and formatting
- `CurlInput`: cURL command input and execution
- `DiffViewer`: JSON/cURL comparison visualization
- `ApiInterceptor`: Interceptor management interface
- `CollectionsSidebar`: API collections management
- `LoadTestTab`: Load testing configuration and results
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

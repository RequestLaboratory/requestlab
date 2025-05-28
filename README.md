# RequestLab - API Testing & Comparison Tool

A modern web application that provides a comprehensive API development platform. Built with React and TypeScript, RequestLab offers powerful features for API testing, JSON comparison, and cURL command analysis.

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

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

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

## Use Cases

- **API Development**

  - Test API endpoints
  - Debug API responses
  - Compare API versions
  - Validate request/response formats

- **JSON Processing**

  - Compare JSON objects
  - Validate JSON schemas
  - Format and beautify JSON
  - Track JSON changes

- **cURL Testing**
  - Execute cURL commands
  - Compare cURL responses
  - Debug API calls
  - Share API requests

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- React Router
- Lucide Icons
- React Syntax Highlighter

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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

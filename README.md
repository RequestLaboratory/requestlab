# JSON Difference Viewer

A modern web application that allows users to compare two JSON objects side by side, highlighting differences in field names and values. Built with React and TypeScript, this tool provides a clean and intuitive interface for visualizing JSON differences.

## Features

- **Side-by-Side Comparison**: View two JSON objects simultaneously for easy comparison
- **Smart Difference Highlighting**:
  - 🔴 Red highlighting for fields present in the left JSON but missing in the right
  - 🟢 Green highlighting for fields present in the right JSON but missing in the left
  - ⚫ Gray highlighting for fields that exist in both but have different values
- **JSON Validation**: Real-time validation of JSON input
- **Format JSON**: One-click JSON formatting for better readability
- **Shareable Links**: Generate unique URLs to share your JSON comparisons
- **Example Data**: Quick access to example JSONs for testing
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Dark Mode Support**: Automatic theme switching based on system preferences

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/json-diff-viewer.git
   cd json-diff-viewer
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

1. **Input JSON Data**:
   - Paste your JSON in the left and right input panels
   - Use the "Format" button to prettify your JSON
   - Click "Load Example" to test with sample data

2. **View Differences**:
   - Field differences are highlighted in red (left) and green (right)
   - Value differences are highlighted in gray
   - Scroll through the diff view to see all differences

3. **Share Results**:
   - Click the "Share" button to generate a unique URL
   - Copy the URL to share your comparison with others

## Example

```json
// Left JSON
{
  "name": "Product A",
  "price": 19.99,
  "details": {
    "weight": "2kg",
    "dimensions": {
      "width": 10,
      "height": 5
    }
  }
}

// Right JSON
{
  "name": "Product B",
  "price": 24.99,
  "details": {
    "weight": "2.5kg",
    "dimensions": {
      "width": 10,
      "height": 6
    },
    "warranty": "2 years"
  }
}
```

In this example:
- `warranty` field will be highlighted in green (present only in right JSON)
- `price` and `weight` values will be highlighted in gray (different values)
- `height` value will be highlighted in gray (different values)
- `name` and `width` will have no highlighting (different values but same type)

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- React Syntax Highlighter
- React Icons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 

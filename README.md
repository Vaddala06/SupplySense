# SupplySense

## Overview
SupplySense is a comprehensive inventory management and supply chain optimization platform designed to help businesses efficiently manage their inventory, forecast demand, and analyze costs. The application provides an intuitive interface for tracking inventory, predicting future demand, and optimizing supply chain operations.

## Features
- **Dashboard**: Centralized view of key metrics and performance indicators
- **Inventory Setup**: Easy configuration and management of inventory items
- **Cost Analysis**: Tools for analyzing and optimizing supply chain costs
- **Demand Forecasting**: AI-powered prediction of future demand based on historical data
- **CSV Data Import**: Support for importing inventory data from CSV files
- **Interactive Charts**: Visual representation of inventory and cost data

## Setup and Installation

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- pnpm package manager

### Installation Steps
1. Clone the repository:
   ```
   git clone https://github.com/Vaddala06/SupplySense.git
   cd SupplySense
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory (if needed)

## Running the Application

### Development Mode
To run the application in development mode:
```
pnpm dev
```
The application will be available at http://localhost:3000

### Production Build
To create a production build:
```
pnpm build
pnpm start
```

## Branch Information
- **main**: Stable production-ready code
- **Aryan**: Development branch with new features
- **Kedaar**: Feature branch with HTML parsing, CSV memory integration, and system prompt updates
- **updates**: Branch for ongoing updates
- **new**: Branch for new feature development

## Technologies Used
- **Next.js 15**: React framework for server-rendered applications
- **React 19**: Frontend UI library
- **TypeScript**: Typed JavaScript for enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI component library
- **Recharts**: Composable charting library for data visualization
- **papaparse**: CSV parsing library
- **React Hook Form**: Form validation library
- **Zod**: TypeScript-first schema validation

## License
[Specify your license information here]

## Contributors
- [List contributors here]

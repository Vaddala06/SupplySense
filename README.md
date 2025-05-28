# SupplySense

## Our Overview
SupplySense is a comprehensive inventory management and supply chain optimization platform designed to help businesses efficiently manage their inventory, forecast demand, and analyze costs. The application provides an intuitive interface for tracking inventory, predicting future demand, and optimizing supply chain operations. We truly believe that the need for such a system powered by real-time insights and analysis is only increasing as regulatory changes in economic policy lead to small businesses having to make major adjustments to their inventories across multiple industries. SupplySense empowers small business owners navigate changing tax laws, tariff poliicies, and major trends, boosting productivity and profitability. 

SupplySense is powered by the Perplexity API in 3 key ways. First, we use Sonar as a personal assistant and analyzer across the website. Second, we also use it to search the internet alongside analyzing the user's inputted inventory to generate recomended actions that the user can take to fix their inventory, and how much they potentially stand to gain based on each action. Third, we also use Sonar to analyze the inventory and forcast potential demand for certain items based on a variety of factors. Overall, SupplySense leverages the Perplexity API to reimagine inventory management for the modern era. 

Perplexity AI Hackathon

https://www.youtube.com/watch?v=rGBj1SmaJAE&t=45s

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
Check http://localhost:3000

### Production Build
To create a production build:
```
pnpm build
pnpm start
```


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


## Contributors
Vibha, Kedaar, Aryan, Diya

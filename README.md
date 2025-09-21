# CSV to JSON API

A simple Node.js application that converts CSV files to JSON and stores them in PostgreSQL database.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database with Prisma**
   - Create a PostgreSQL database
   - Update the `.env` file with your database URL:
   ```
   DATABASE_URL="YOUR_DATABASE_URL_HERE"
   PORT=3000
   ```
   - Run Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Run the application**
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000`

## API Usage

- **Upload CSV**: `POST /api/v1/upload` (multipart/form-data with file field)

## Requirements

- Node.js
- PostgreSQL
- CSV files with headers
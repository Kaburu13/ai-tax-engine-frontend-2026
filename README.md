# AI Tax Computation Engine - Frontend

## 🎯 Overview

React TypeScript frontend for the AI Tax Computation Engine, built for KPMG East Africa's tax practice. This application provides an intuitive interface for uploading Excel workbooks, processing tax data, and generating comprehensive tax computation reports.

## 🚀 Features

- **📤 Workbook Upload**: Drag-and-drop Excel workbook upload with validation
- **🔍 Smart Processing**: Real-time processing status with detailed logs
- **📊 Dashboard**: Overview of all workbooks and their processing status
- **📈 Tax Computation Views**: Interactive tables for provisions, investment allowances, and deferred tax
- **📑 Report Generation**: Download comprehensive tax computation reports
- **⚡ Real-time Updates**: Live processing status using React Query
- **🎨 Modern UI**: Built with TailwindCSS and Lucide icons

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Running Django backend on `http://localhost:8000`

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── api/                  # API integration layer
│   ├── axios_client.ts   # Configured Axios instance
│   ├── workbook_api.ts   # Workbook endpoints
│   ├── processing_api.ts # Processing endpoints
│   ├── report_api.ts     # Report endpoints
│   └── types.ts          # API type definitions
│
├── components/           # Reusable React components
│   ├── common/          # Generic UI components
│   ├── layout/          # Layout components
│   ├── workbook/        # Workbook-specific components
│   ├── processing/      # Processing status components
│   └── tax/             # Tax computation components
│
├── pages/               # Route pages
│   ├── home_page.tsx
│   ├── upload_page.tsx
│   ├── dashboard_page.tsx
│   ├── workbook_detail_page.tsx
│   ├── processing_page.tsx
│   └── reports_page.tsx
│
├── hooks/               # Custom React hooks
│   ├── use_workbooks.ts
│   ├── use_processing_status.ts
│   ├── use_tax_computation.ts
│   └── use_upload.ts
│
├── store/               # Zustand state management
│   ├── workbook_store.ts
│   ├── ui_store.ts
│   └── auth_store.ts
│
├── utils/               # Utility functions
│   ├── format.ts
│   ├── date.ts
│   ├── currency.ts
│   ├── validators.ts
│   └── constants.ts
│
├── types/               # TypeScript type definitions
│   ├── workbook.types.ts
│   ├── sheet.types.ts
│   ├── tax.types.ts
│   └── api.types.ts
│
└── assets/              # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **date-fns** - Date utilities
- **Lucide React** - Icons

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_APP_NAME=AI Tax Computation Engine
VITE_MAX_FILE_SIZE=52428800
VITE_ALLOWED_FILE_TYPES=.xlsx,.xls
```

### API Proxy

The Vite dev server is configured to proxy API requests to the Django backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## 🎯 Key Features Explained

### 1. Workbook Upload
- Drag-and-drop interface
- File size validation (max 50MB)
- File type validation (.xlsx, .xls)
- Real-time upload progress

### 2. Processing Dashboard
- View all uploaded workbooks
- Real-time processing status
- Filter by status (pending, processing, completed, failed)
- Search by client name or workbook name

### 3. Tax Computation Views
- **Provisions**: View tax provisions with comparisons
- **Investment Allowances**: Track capital allowances and wear & tear
- **Deferred Tax**: Monitor temporary differences and DTA/DTL

### 4. Report Generation
- Download complete tax computation Excel reports
- Includes all schedules and computations
- Formatted for KRA compliance

## 🔐 Authentication (Future)

Currently, the application doesn't require authentication. Future versions will integrate with KPMG's SSO system.

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Ensure Django backend is running
cd ../ai-tax-engine-backend
python manage.py runserver
```

### CORS Issues
The Django backend must have CORS configured for `http://localhost:3000`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- [Backend API Documentation](../ai-tax-engine-backend/README.md)
- [Tax Computation Logic](./docs/tax-computation.md)
- [Component API](./docs/components.md)


## 📄 License

Proprietary - KPMG East Africa

## 🔄 Version History

- **v1.0.0** (2025-01) - Initial release
  - Workbook upload and processing
  - Tax computation views
  - Report generation
  - Dashboard and monitoring
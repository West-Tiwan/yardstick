# Personal Finance Visualizer

A modern web application for tracking personal finances with interactive charts and insights, built with Next.js, React, shadcn/ui, and Recharts.

## 🚀 Features

### Stage 1: Basic Transaction Tracking ✅
- ✅ Add/Edit/Delete transactions (amount, date, description)
- ✅ Transaction list view with recent transactions
- ✅ Monthly expenses bar chart
- ✅ Form validation and error handling
- ✅ Responsive design

### Stage 2: Categories (Coming Soon)
- Predefined categories for transactions
- Category-wise pie chart
- Dashboard with summary cards
- Total expenses, category breakdown, most recent transactions

### Stage 3: Budgeting (Coming Soon)
- Set monthly category budgets
- Budget vs actual comparison chart
- Simple spending insights

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 18, TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: MongoDB (to be implemented)
- **Icons**: Lucide React
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns

## 🏃‍♂️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yardstick
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with your MongoDB credentials:
   ```env
   MONGODB_URI=mongodb+srv://your-client-id:your-client-secret@cluster0.mongodb.net/finance-tracker?retryWrites=true&w=majority
   MONGODB_DB_NAME=finance-tracker
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── transactions/        # API routes for transactions
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── TransactionForm.tsx     # Transaction form component
│   ├── TransactionList.tsx     # Transaction list component
│   └── MonthlyExpensesChart.tsx # Chart component
├── hooks/
│   └── use-toast.ts            # Toast notification hook
├── lib/
│   ├── data-store.ts           # In-memory data store
│   └── utils.ts                # Utility functions
└── types/
    └── transaction.ts          # TypeScript type definitions
```

## 🎯 Current Implementation

The application currently implements **Stage 1** features with **MongoDB integration**:

- **Transaction Management**: Full CRUD operations for income and expense transactions
- **MongoDB Database**: Persistent storage using MongoDB Atlas with service account authentication
- **Data Validation**: Client-side and server-side validation for all transaction fields
- **Interactive Charts**: Monthly expenses visualization using Recharts
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Clean interface using shadcn/ui components
- **Error Handling**: Comprehensive error states and user feedback
- **Sample Data**: Automatic initialization with sample transactions

## 🔄 Data Flow

1. **MongoDB Storage**: Persistent data storage using MongoDB Atlas
2. **Service Account Authentication**: Secure database access using MongoDB service account
3. **API Layer**: RESTful API endpoints for transaction operations
4. **Client-Side State**: React state management for UI updates
5. **Real-time Updates**: Automatic refresh after data modifications

## 🚧 Development Status

- **Stage 1**: ✅ Complete
- **Stage 2**: 🔄 In Planning
- **Stage 3**: 📋 Planned

## 🤝 Contributing

This is a personal finance tracking application. Contributions are welcome for:

- Bug fixes
- UI/UX improvements
- Performance optimizations
- Additional chart types
- Enhanced validation

## 📄 License

This project is licensed under the MIT License.
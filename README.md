# Zeno Lite ERP

A modern, open‑source Inventory and Order Management System built for SMEs.  
**Live Demo:** [zenos-lite-erp.vercel.app](https://zenos-lite-erp.vercel.app)

---

## 📋 Features

- ✅ **Products** – Full CRUD with SKU, category, price, stock, and supplier fields.
- ✅ **Inventory** – Track stock levels, set reorder points, adjust quantities with reason.
- ✅ **Inventory Transactions** – Append‑only ledger with **reverse** functionality.
- ✅ **Suppliers** – Manage supplier contact details.
- ✅ **Customers** – Manage customer information.
- ✅ **Orders** – Create orders from a cart, update stock automatically, track order status.
- ✅ **Analytics** – Monthly sales, category distribution, top‑selling products (integrated into Dashboard).
- ✅ **Authentication** – Email/password sign‑up and sign‑in (Supabase Auth).
- ✅ **Theme Switcher** – Toggle between Light and Soft Dark modes (persisted in localStorage).
- ✅ **Currency** – All prices displayed in Philippine Pesos (₱).
- ✅ **Responsive** – Works on desktop, tablet, and mobile.
- ✅ **Deployed** – Ready for Vercel deployment with environment variables.

---

## 🛠️ Tech Stack

| Layer          | Technology |
|----------------|------------|
| **Frontend**   | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend**    | Supabase (PostgreSQL, Auth, Storage) |
| **Charts**     | Recharts |
| **Icons**      | Lucide React |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Git (for cloning)

### 1. Clone the repository

```bash
git clone https://github.com/czeno17/zenos-lite-erp.git
cd zenos-lite-erp
2. Install dependencies
bash
npm install
3. Set up environment variables
Create a .env.local file in the root directory and add your Supabase credentials:

env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
You can find these in your Supabase project → Settings → API.

4. Set up the database
Go to your Supabase project → SQL Editor.

Copy the contents of supabase/schema.sql (provided in the repo) and run the script.

This creates all required tables (products, customers, orders, order_items, stock_movements, suppliers, audit_logs).

5. Run the development server
bash
npm run dev
Open http://localhost:3000 to view the app.

🔐 Authentication
Sign Up at /signup

Sign In at /login

Logout from the navbar icon (🚪)

All routes (except login/signup) are protected – unauthenticated users are redirected to /login.

☁️ Deploy to Vercel
Push your code to a GitHub repository.

Go to Vercel and import your repo.

Add the same environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) in Vercel's project settings.

Click Deploy – your app will be live in minutes.

📁 Project Structure
text
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Login & Signup pages
│   │   ├── analytics/          # (merged into dashboard)
│   │   ├── customers/          # Customers CRUD
│   │   ├── inventory/          # Inventory management
│   │   ├── orders/             # Order creation & listing
│   │   ├── products/           # Products CRUD
│   │   ├── suppliers/          # Suppliers CRUD
│   │   ├── globals.css         # Global styles & dark mode
│   │   └── layout.js           # Root layout with Theme & Auth providers
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Card, Button, Input, Select
│   │   ├── Navbar.js           # Top bar with logout
│   │   ├── Sidebar.js          # Navigation menu
│   │   └── ProtectedLayout.js  # Auth guard for client‑side
│   ├── context/                # React Context providers
│   │   ├── AuthContext.js      # Supabase authentication
│   │   └── ThemeContext.js     # Light/Dark theme
│   └── lib/                    # Utilities
│       ├── supabaseClient.js   # Supabase client instance
│       └── utils.js            # formatPHP, cn, etc.
├── supabase/
│   └── schema.sql              # Database schema & sample data
├── .env.local                  # Environment variables (ignored)
├── package.json
└── README.md
🧪 Sample Data
The schema.sql script includes sample products, customers, and orders to get you started. You can modify or delete them as needed.

🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

📄 License
MIT © czeno17

🙏 Acknowledgements
Next.js

Supabase

Tailwind CSS

Lucide Icons

Recharts
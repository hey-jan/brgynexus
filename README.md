# BrgyNexus

BrgyNexus is a comprehensive digital barangay management system built to modernize and streamline local government operations. It replaces manual, paper-based processes with an efficient digital workflow for residents, barangay staff, and administrators.

Currently configured for **Barangay Sambag I, Cebu City**.

## 🌟 Key Features

*   **Three Dedicated Portals:** Tailored dashboards for Residents, Staff, and Administrators.
*   **Digital Document Requests:** Residents can request clearances, indigency certificates, and more online.
*   **Automated PDF Generation:** Staff can review and generate official, printable PDF certificates with a single click using `@react-pdf/renderer`.
*   **QR Code Verification:** Every generated document includes a unique tracking number and QR code to prevent forgery and allow instant authenticity verification.
*   **Admin Analytics:** Rich visual dashboards tracking revenue, request volumes, and document issuance trends over time.

## 💻 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **PDF Generation:** [@react-pdf/renderer](https://react-pdf.org/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL database

### Installation

1.  Clone the repository
    ```bash
    git clone https://github.com/hey-jan/brgynexus.git
    cd brgynexus
    ```

2.  Install dependencies
    ```bash
    npm install
    ```

3.  Set up your environment variables
    Create a `.env` file in the root directory and add your database connection string:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/brgynexus?schema=public"
    ```

4.  Run Prisma migrations and seed the database
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

5.  Start the development server
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Test Credentials (Local Development)

If you have run the database seed, you can use the following default accounts to explore the different portals:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@brgynexus.com` | `password123` |
| **Staff** | `staff@brgynexus.com` | `password123` |
| **Resident** | `resident@brgynexus.com` | `password123` |

## 📸 Screenshots

*(Add your screenshots here! Recommended: Admin Dashboard, and PDF Generation Flow)*

---
*Built by John Earl P. Balabat*

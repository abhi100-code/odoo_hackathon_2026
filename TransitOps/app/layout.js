import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeContext';

export const metadata = {
  title: 'TransitOps - Smart Transport Operations Platform',
  description: 'Centralized fleet, driver, dispatch, maintenance, and analytics platform for Odoo Hackathon 2026.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

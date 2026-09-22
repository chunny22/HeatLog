import { Route, Routes } from 'react-router-dom'
import { AdminLoginPage } from './auth/AdminLoginPage'
import { AuthPage } from './auth/AuthPage'
import { RequireAdmin } from './auth/RequireAdmin'
import { RequireAuth } from './auth/RequireAuth'
import { Nav } from './components/Nav'
import { AdminPage } from './pages/AdminPage'
import { BreakdownPage } from './pages/BreakdownPage'
import { CalendarPage } from './pages/CalendarPage'
import { CompleteWorkoutPage } from './pages/CompleteWorkoutPage'
import { DayDetailPage } from './pages/DayDetailPage'
import { LogWorkoutPage } from './pages/LogWorkoutPage'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout>
              <CalendarPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/log"
        element={
          <RequireAuth>
            <AppLayout>
              <LogWorkoutPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/breakdown"
        element={
          <RequireAuth>
            <AppLayout>
              <BreakdownPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/day/:date"
        element={
          <RequireAuth>
            <AppLayout>
              <DayDetailPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/complete/:id"
        element={
          <RequireAuth>
            <AppLayout>
              <CompleteWorkoutPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AppLayout>
              <AdminPage />
            </AppLayout>
          </RequireAdmin>
        }
      />
    </Routes>
  )
}

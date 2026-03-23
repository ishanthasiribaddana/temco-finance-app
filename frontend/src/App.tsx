import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ChartOfAccounts from './pages/chartofaccounts/ChartOfAccounts'
import JournalEntries from './pages/journal/JournalEntries'
import Vouchers from './pages/voucher/Vouchers'
import Partners from './pages/partner/Partners'
import FiscalYears from './pages/fiscal/FiscalYears'
import RevenueCenters from './pages/revenuecenter/RevenueCenters'
import BankReconciliation from './pages/reconciliation/BankReconciliation'
import Reports from './pages/reports/Reports'
import SettingsLayout from './components/SettingsLayout'
import Profile from './pages/settings/Profile'
import Security from './pages/settings/Security'
import UserManagement from './pages/settings/UserManagement'
import RoleManagement from './pages/settings/RoleManagement'
import System from './pages/settings/System'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="chart-of-accounts/*" element={<ChartOfAccounts />} />
            <Route path="journal-entries/*" element={<JournalEntries />} />
            <Route path="vouchers/*" element={<Vouchers />} />
            <Route path="partners/*" element={<Partners />} />
            <Route path="fiscal/*" element={<FiscalYears />} />
            <Route path="revenue-centers/*" element={<RevenueCenters />} />
            <Route path="reconciliation/*" element={<BankReconciliation />} />
            <Route path="reports/*" element={<Reports />} />
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="security" element={<Security />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="system" element={<System />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

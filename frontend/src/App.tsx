import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import Login from './pages/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="chart-of-accounts/*" element={<ChartOfAccounts />} />
          <Route path="journal-entries/*" element={<JournalEntries />} />
          <Route path="vouchers/*" element={<Vouchers />} />
          <Route path="partners/*" element={<Partners />} />
          <Route path="fiscal/*" element={<FiscalYears />} />
          <Route path="revenue-centers/*" element={<RevenueCenters />} />
          <Route path="reconciliation/*" element={<BankReconciliation />} />
          <Route path="reports/*" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/Shell/AppShell'
import { Dashboard } from './pages/Dashboard'
import { BoardPage } from './pages/BoardPage'
import { NewDeal } from './pages/NewDeal'
import { DealPage } from './pages/DealPage'
import { ThesisPage } from './pages/ThesisPage'

import { AllDealsPage } from './pages/AllDealsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pipeline" element={<BoardPage />} />
          <Route path="deal/new" element={<><BoardPage /><NewDeal /></>} />
          <Route path="deal/:dealId" element={<DealPage />} />
          <Route path="deals" element={<AllDealsPage />} />
          <Route path="thesis" element={<ThesisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

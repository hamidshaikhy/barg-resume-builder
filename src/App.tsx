import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Intro from './pages/intro/Intro'
import { Router } from './router'

// رزومه‌ساز جدا بارگذاری می‌شود تا صفحه‌ی نخست سبک بماند.
const Builder = lazy(() => import('./pages/builder/Builder'))

/** با عوض‌شدن صفحه، اسکرول به بالا برمی‌گردد. */
function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Loading() {
  return (
    <div className="flex h-dvh items-center justify-center bg-paper text-sm text-muted" role="status">
      در حال بازکردن رزومه‌ساز …
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <ScrollReset />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/builder" element={<Builder />} />
          <Route path="*" element={<Intro />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

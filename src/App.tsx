import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AddProblemPage } from './pages/AddProblemPage'
import { ProblemDetailPage } from './pages/ProblemDetailPage'
import { ProblemListPage } from './pages/ProblemListPage'

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
}

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} {...pageTransition}>
          <Routes location={location}>
            <Route path="/" element={<ProblemListPage />} />
            <Route path="/problem/:id" element={<ProblemDetailPage />} />
            <Route path="/add" element={<AddProblemPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App

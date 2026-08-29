import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Courses } from './pages/Courses'
import { Dashboard } from './pages/Dashboard'
import { NotFound } from './pages/NotFound'
import { Profile } from './pages/Profile'
import { Tasks } from './pages/Tasks'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

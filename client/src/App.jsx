import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { Courses } from './pages/Courses'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'
import { Planner } from './pages/Planner'
import { Profile } from './pages/Profile'
import { Register } from './pages/Register'
import { TaskDetail } from './pages/TaskDetail'
import { Tasks } from './pages/Tasks'

/*
  Two zones. /login and /register are public and render their own centred shell.
  Everything else sits behind RequireAuth, which supplies the app chrome (nav +
  main) once a session is confirmed and otherwise bounces to sign-in — so the
  layout only ever wraps pages a signed-in student is allowed to see.
*/
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/plan" element={<Planner />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

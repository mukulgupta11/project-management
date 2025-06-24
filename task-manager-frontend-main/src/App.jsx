import React, { useContext, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import PrivateRoutes from './routes/PrivateRoutes'
import Dashboard from './pages/Admin/Dashboard'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import ManageUsers from './pages/Admin/ManageUsers'

import UserDashboard from './pages/User/UserDashboard'
import MyTasks from './pages/User/MyTasks'
import ViewTaskDetails from './pages/User/ViewTaskDetails'

import UserProvider from './context/userProvider'
import { UserContext } from './context/userContext'
import { Toaster } from 'react-hot-toast'

import { setNavigator } from './utils/navigate' // ✅ navigator setter import
import UploadFilesAdmin from "./pages/Admin/UploadFiles";
import UploadFilesUser from "./pages/User/UploadFiles";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <NavigatorRegistrar /> {/* ✅ navigator রেজিস্টার */}
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoutes allowedRoles={['admin']} />}>
            <Route path='/admin/dashboard' element={<Dashboard />} />
            <Route path='/admin/tasks' element={<ManageTasks />} />
            <Route path='/admin/create-task' element={<CreateTask />} />
            <Route path='/admin/users' element={<ManageUsers />} />
            <Route path="/admin/upload-files" element={<UploadFilesAdmin />} />
          </Route>

          {/* User Routes */}
          <Route element={<PrivateRoutes allowedRoles={['member']} />}>
            <Route path='/user/dashboard' element={<UserDashboard />} />
            <Route path='/user/tasks' element={<MyTasks />} />
            <Route path='/user/task-details/:id' element={<ViewTaskDetails />} />
            <Route path="/user/upload-files" element={<UploadFilesUser />} />
          </Route>


          {/* Default Route */}
          <Route path='/' element={<Root />} />

          {/* Optional: Unauthorized Route */}
          <Route path='/unauthorized' element={<div>Unauthorized</div>} />
        </Routes>
        <Toaster
          toastOptions={{
            className: '',
            style: {
              fontSize: '13px',
            },
          }}
        />
      </Router>
    </UserProvider>
  )
}

export default App

// ✅ Root Component
const Root = () => {
  const { user, loading } = useContext(UserContext)

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  return user.role === 'admin' ? (
    <Navigate to='/admin/dashboard' replace />
  ) : (
    <Navigate to='/user/dashboard' replace />
  )
}

// ✅ NavigatorRegistrar Component
const NavigatorRegistrar = () => {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigator(navigate)
  }, [navigate])

  return null
}

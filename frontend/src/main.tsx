/* eslint-disable @typescript-eslint/no-explicit-any */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements,Route, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import ProtectedRoute from './components/ProtectedRoute'
import "./index.css"

// Importing Pages
import Dashboard from './pages/dashboard/Dashboard'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import ForgotPassword from './pages/forgot-password/ForgotPassword'
import ResetPassword from './pages/reset-password/ResetPassword'
import ResetPasswordEmailSentSuccessFully from './pages/forgot-password/ResetPasswordEmailSentSuccessFully'
import VerifyEmail from './pages/verify-email/VerifyEmail'
import Docs from './pages/docs/Docs'
import PresentationMode from './pages/presentation/PresentationMode'
import { checkAuthStatus } from './features/auth/authThunk'
import GuestRoute from './components/GuestRoute'
import AppLayout from './layouts/AppLayout'
import Editor from './pages/editor/Editor'
import Themes from './pages/themes/Themes'
import PresentationViewer from './pages/presentation/PresentationView'
import CLI from './pages/cli/Cli'
import Home from './pages/home/Home'
import { ThemeProvider } from 'next-themes'

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<AppLayout/>}>
    <Route>
      <Route index element={<Home />} />
    </Route>
    <Route>
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Route>
    
    <Route path="/" element={<GuestRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/reset-password-email-sent" element={<ResetPasswordEmailSentSuccessFully />} />
    </Route>

    <Route path="/" element={<ProtectedRoute />}>
      <Route path='/dashboard'  element={<Dashboard />} />
      <Route path='/editor' index element={<Editor />} />
      <Route path='/presentation/:id' element={<PresentationViewer/>}></Route>
      <Route path='/themes' element={<Themes/>}/>
      <Route path='/docs' element={<Docs />} />
      <Route path='/cli' element={<CLI />} />
      <Route path='/editor/:id' element={<Editor />} />
      <Route path='/present/:id' element={<PresentationMode/>} />
    </Route>
  </Route>
))

async function init() {
  const dispatch = store.dispatch as typeof store.dispatch & ((arg: any) => Promise<any>);
  await dispatch(checkAuthStatus());
  // Wait for user check BEFORE rendering
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <ThemeProvider defaultTheme="system" storageKey="markpre-ui-theme">
      <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
}
init();
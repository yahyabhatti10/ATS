import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import JobListings from './pages/JobListings';
import Landing from './pages/Landing';
import MyJob from './pages/MyJob';
import ResumeParser from './pages/Home';
import Job from './pages/Job';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/adminLogin';
import AdminLayout from './components/layouts/AdminLayout';
import AdminPanel from './pages/adminPanel';
import VapiAssistant from './pages/Vapi';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' >
          <Route index element={ <Landing /> } />
          <Route element={<MainLayout />}  >
            <Route path='/jobs' element={<JobListings />} />
            <Route path='/jobs/:id' element={<Job />} />
            <Route path='/my-jobs' element={<MyJob />} />
            <Route path='/upload-resume' element={<ResumeParser />} />
            <Route path='/vapi/:id' element={<VapiAssistant />} />

          </Route>
        </Route>
        <Route path='/' element={<AdminLayout/>}>
          <Route index element={<AdminLayout/>} />
          <Route path='login-admin' element={<AdminLogin />} />
          <Route path='admin-dashboard' element={<AdminDashboard />} />
          <Route path='admin-panel' element={<AdminPanel />} />
          {/* <Route path='teams' element={<ManageTeam />} />
          <Route path='tasks' element={<ManageTasks />} /> */}
        </Route>
      </Routes>
    </>
  );
}

export default App;

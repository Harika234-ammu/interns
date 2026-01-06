
import { BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import './App.css';

// import Proj from './Proj';



import ForgotPassword from './component/ForgotPassword';
import First from './component/First';
import PatientRegister from './component/PatientRegister';
import DoctorRegister from './component/DoctorRegister';
import Login from './component/Login';
import PatientDashboard from './component/PatientDashboard';
import AdminDashboard from './component/AdminDashboard';
import DoctorDashboard from "./component/DoctorDashboard";
import HomePage from './pages/HomePage';
// import HomePage from "./pages/HomePage.jsx";
import SymptomPage from "./pages/SymptomPage";
import DoctorPage from "./pages/DoctorPage";
import DoctorDetailPage from "./pages/DoctorDetailPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import PaymentPage from "./pages/PaymentPage";
// import Notifications from './component/Notifications';
// import Reviews from './component/Reviews';
// import Appointments from './component/Appointments';


const App =() => {
  

  return (
    <Router> 
      <Routes>
        <Route path = '/' element={<First/>} />
        <Route path = '/patientReg' element={<PatientRegister/>} />
        {/* <Route path="/Docregister" element = {<Proj/>} /> */}
        <Route path="/DocRegister" element={<DoctorRegister />} />
        {/* <Route path = "/dashboard" element={<Dashboard/>} /> */}
        <Route path = '/forgot-password' element={<ForgotPassword/>} />
        <Route path = '/Login' element={<Login/>} />
        <Route path="/PatientDash" element={<PatientDashboard />} />
        <Route path="/adminDash" element={<AdminDashboard />} />
        <Route path="/DocDashboard" element={<DoctorDashboard />} />


        <Route path="/homepage" element={<HomePage/>} />
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/symptoms" element={<SymptomPage />} />
        <Route path="/doctors" element={<DoctorPage />} />
        <Route path="/doctor/:id" element={<DoctorDetailPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        {/* <Route path='/notification' element={<Notifications/>} />
        <Route path='reviews' element={<Reviews/>} />
        <Route path='/appointments' element={<Appointments/>} /> */}
        
      </Routes>
    </Router>
    
  );
}

export default App;





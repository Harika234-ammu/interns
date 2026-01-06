import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage.jsx";
import SymptomPage from "./pages/SymptomPage.jsx";
import DoctorPage from "./pages/DoctorPage.jsx";
import DoctorDetailPage from "./pages/DoctorDetailPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import ConfirmationPage from "./pages/ConfirmationPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/symptoms" element={<SymptomPage />} />

        <Route path="/doctors" element={<DoctorPage />} />
        <Route path="/doctor/:id" element={<DoctorDetailPage />} />

        <Route path="/book" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />

        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Routings/ProtectedRoute";
import ProtectedLayout from "./Routings/ProtectedLayout"; // ⬅️ import layout
import Login from "./Forms/Login";
import Register from "./Forms/Register";
import Dashboard from "./Pages/Dashboard";
import CartPage from "./Pages/CartPage";
import Otp from "./Forms/Otp";
import CompleteProfile from "./Forms/CompleteProfile"; // ✅ Import the new form
import PublicRoute from "./Routings/PublicRoute";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import Update from "./Pages/Update";
import SearchResults from "./Pages/SearchResult";
import PaymentHistory from "./Pages/PaymentHistory";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verify" element={<Otp />} />
        </Route>

        {/* // Add routes like above given route */}
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/update-profile" element={<Update />} />{" "}
          {/* ✅ Update profile route */}
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/checkout" element={<Checkout />} />{" "}
            {/* ✅ Checkout route */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<Orders />} />{" "}
            <Route path="/paymenthistory" element={<PaymentHistory/>}/>
            {/* ✅ Orders route */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

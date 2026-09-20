import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Routings/ProtectedRoute";
import ProtectedLayout from "./Routings/ProtectedLayout"; 
import Login from "./Forms/Login";
import Register from "./Forms/Register";
import Dashboard from "./Pages/Dashboard";
import CartPage from "./Pages/CartPage";
import Otp from "./Forms/Otp";
import CompleteProfile from "./Forms/CompleteProfile"; 
import PublicRoute from "./Routings/PublicRoute";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import Update from "./Pages/Update";
import SearchResults from "./Pages/SearchResult";
import PaymentHistory from "./Pages/PaymentHistory";
import AdminRoute from "./Routings/AdminRoute";
import AdminDashboard from "./AdminPages/AdminDashboard";
import AdminLayout from "./Routings/AdminLayout";
import AdminOrders from "./AdminPages/AdminOrders";
import AdminProducts from "./AdminPages/AdminProducts";
import AdminPayments from "./AdminPages/AdminPayments";
import AdminCustomers from "./AdminPages/AdminCustomers";
import Notify from "./Pages/Notify";

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

          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/checkout" element={<Checkout />} />{" "}

            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<Orders />} />{" "}
            <Route path="/paymenthistory" element={<PaymentHistory />} />
            <Route path="/notifications" element={<Notify />} />

          </Route>

          {/* Admin routes — separate branch, no customer Navbar */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/orders" element={<AdminOrders />} />
              <Route path="/admin-dashboard/products" element={<AdminProducts/>}/>
              <Route path="/admin-dashboard/payments" element={<AdminPayments/>}/>
              <Route path="/admin-dashboard/customers" element={<AdminCustomers/>}/>
            </Route>
          </Route>
          
        </Route>
      </Routes>
    </Router>
  );
}

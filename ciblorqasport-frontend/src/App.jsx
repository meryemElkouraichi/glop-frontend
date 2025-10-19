import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext"
import MainLayout from "../layout/MainLayout";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

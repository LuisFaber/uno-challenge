import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ContactsPage from "./pages/ContactsPage";
import LeadsPage from "./pages/LeadsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/contacts" replace />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="leads" element={<LeadsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

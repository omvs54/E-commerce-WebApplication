import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Shop from './pages/Shop';
import './App.css';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Shop />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}


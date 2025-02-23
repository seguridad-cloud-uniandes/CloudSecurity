import React from "react";
import AppRouter from "./router";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css"; // Asegúrate de importar el CSS con la clase personalizada

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <AppRouter />
      <ToastContainer 
        toastClassName="blue-toast"  // Clase personalizada para los toasts
        //hideProgressBar            // Oculta la barra de progreso
        position="top-center"        // Posición superior centrada
        autoClose={5000}             // Se cierra automáticamente en 5 segundos
      />
    </div>
  );
}

export default App;
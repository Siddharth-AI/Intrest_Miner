import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] relative overflow-hidden">
      {/* Techy SVG Illustration */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#00c3ff"
          fillOpacity="0.3"
          d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
        <circle cx="1200" cy="80" r="60" fill="#00c3ff" fillOpacity="0.15" />
        <rect
          x="200"
          y="200"
          width="120"
          height="120"
          rx="30"
          fill="#00c3ff"
          fillOpacity="0.08"
        />
      </svg>
      <div className="relative z-10 max-w-lg w-full mx-auto p-10 rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20 flex flex-col items-center">
        <div className="mb-8">
          <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00c3ff] to-[#3a7bd5] drop-shadow-lg animate-pulse">
            404
          </h1>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-wide">
          Page Not Found
        </h2>
        <p className="text-lg text-blue-100 mb-8 text-center max-w-md">
          Sorry, the page you are looking for does not exist or has been moved.
          <br />
        </p>
        <button
          onClick={() => navigate(isLoggedIn ? "/miner" : "/")}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#00c3ff] to-[#3a7bd5] text-white font-semibold text-lg shadow-lg hover:scale-105 hover:from-[#3a7bd5] hover:to-[#00c3ff] transition-all duration-200">
          {isLoggedIn ? "Go to Dashboard" : "Go to Home"}
        </button>
      </div>
    </div>
  );
};

export default NotFound;

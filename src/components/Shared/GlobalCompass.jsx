import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import compassImg from '../../assets/compass.png';

export default function GlobalCompass() {
  const location = useLocation();
  const useNavigateInstance = useNavigate();
  
  // Check if we are on the homepage
  const isHome = location.pathname === '/';

  // If we are NOT on the homepage, completely hide the compass
  if (!isHome) {
    return null;
  }

  return (
    <motion.img
      src={compassImg}
      alt="Compass"
      onClick={() => useNavigateInstance('/hub')}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        top: "calc(100vh - 145px)",
        left: "50%",
        x: "-50%",
        width: "150px",
        height: "150px",
        rotate: 0,
        opacity: 1,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      // Slow, continuous rotation when hovered
      whileHover={{
        rotate: [0, 90],
        transition: { duration: 4, ease: "linear", repeat: Infinity }
      }}
      transition={{
        default: { type: "spring", stiffness: 100, damping: 20 },
        rotate: { type: "tween", duration: 0.8, ease: "easeInOut" }
      }}
      className="fixed z-[99999] object-contain cursor-pointer drop-shadow-[0_0_15px_rgba(213,176,108,0.2)] hover:drop-shadow-[0_0_25px_rgba(213,176,108,0.6)] transition-shadow duration-300"
    />
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'HOME', path: '/hub' },
    { name: 'POEMS', path: '/poems' },
    { name: 'STORIES', path: '/stories' },
    { name: 'ABOUT', path: '/about' },
  ];

  return (
    <div className="relative w-full flex justify-center items-center z-50">
      
      <div className="absolute w-full h-[1px] bg-divider top-1/2 -translate-y-1/2 -z-10" />

      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center gap-12 px-12 py-3 rounded-nav bg-[#0F1216]/90 backdrop-blur-md border border-borderSoft shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
      >
        <Link to={navItems[0].path} className={`font-sans text-nav uppercase tracking-[0.35em] transition-colors duration-300 hover:text-gold ${location.pathname === navItems[0].path ? 'text-gold' : 'text-textSecondary'}`}>
          {navItems[0].name}
        </Link>
        <Link to={navItems[1].path} className={`font-sans text-nav uppercase tracking-[0.35em] transition-colors duration-300 hover:text-gold ${location.pathname === navItems[1].path ? 'text-gold' : 'text-textSecondary'}`}>
          {navItems[1].name}
        </Link>

        {/* PLACEHOLDER: GlobalCompass floats here. Click event allows navigation. */}
        <div 
          className="relative group cursor-pointer mx-4 w-[58px] h-[58px] flex justify-center items-center"
          onClick={() => navigate('/')}
        >
          <div className="absolute inset-0 bg-gold/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <Link to={navItems[2].path} className={`font-sans text-nav uppercase tracking-[0.35em] transition-colors duration-300 hover:text-gold ${location.pathname === navItems[2].path ? 'text-gold' : 'text-textSecondary'}`}>
          {navItems[2].name}
        </Link>
        <Link to={navItems[3].path} className={`font-sans text-nav uppercase tracking-[0.35em] transition-colors duration-300 hover:text-gold ${location.pathname === navItems[3].path ? 'text-gold' : 'text-textSecondary'}`}>
          {navItems[3].name}
        </Link>
      </motion.nav>
    </div>
  );
}
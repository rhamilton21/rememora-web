'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function NavbarLanding() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  const linkClass = `transition-colors ${
    scrolled
      ? 'text-gray-700 hover:text-rememora'
      : 'text-white hover:text-gray-200'
  }`

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* LOGO + MARCA */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/rememora-logo.png"
            alt="Rememora"
            className="w-9 h-9"
          />
          <span
            className={`text-xl font-bold tracking-wide ${
              scrolled ? 'text-[#4557a6]' : 'text-white'
            }`}
          >
            REMEMORA
          </span>
        </Link>

        {/* LINKS DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#product" className={linkClass}>
            Producto
          </a>
          <a href="#pricing" className={linkClass}>
            Planes
          </a>
          <a href="#contact" className={linkClass}>
            Contacto
          </a>
        </nav>

        {/* BOTÓN SOLO INICIAR SESIÓN */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm px-4 py-2 rounded-md font-semibold transition ${
              scrolled
                ? 'text-[#4557a6] hover:text-[#3a4890]'
                : 'text-white hover:text-gray-200'
            }`}
          >
            Iniciar sesión
          </Link>
        </div>

        {/* HAMBURGUESA MÓVIL */}
        <button
          onClick={toggleMenu}
          className={`md:hidden transition ${
            scrolled ? 'text-[#4557a6]' : 'text-white'
          }`}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden flex flex-col items-center bg-white text-gray-800 border-t shadow-md py-4"
          >
            <a
              href="#product"
              className="py-2 text-sm font-medium hover:text-[#4557a6]"
              onClick={() => setMenuOpen(false)}
            >
              Producto
            </a>
            <a
              href="#pricing"
              className="py-2 text-sm font-medium hover:text-[#4557a6]"
              onClick={() => setMenuOpen(false)}
            >
              Planes
            </a>
            <a
              href="#contact"
              className="py-2 text-sm font-medium hover:text-[#4557a6]"
              onClick={() => setMenuOpen(false)}
            >
              Contacto
            </a>
            <hr className="w-3/4 border-gray-200 my-2" />
            <Link
              href="/login"
              className="py-2 text-sm font-semibold text-[#4557a6] hover:text-[#3a4890]"
              onClick={() => setMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}


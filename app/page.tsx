'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import NavbarLanding from '@/components/NavbarLanding'

export default function LandingPage() {
  return (
    <main className="bg-gray-50 text-gray-800 scroll-smooth">
      <NavbarLanding />

      {/* HERO */}
      <section className="pt-32 pb-24 text-center px-6 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-extrabold leading-tight"
        >
          Preserva los recuerdos.<br />
          <span className="text-rememora">Celebra la vida.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
        >
          REMEMORA te permite crear espacios digitales donde los recuerdos, fotos y mensajes de tus seres queridos viven para siempre.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/register"
            className="px-8 py-3 rounded-md bg-rememora text-white font-semibold hover:bg-rememora-dark transition"
          >
            Crear memorial gratuito
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-md border border-gray-300 hover:bg-gray-100 transition"
          >
            Iniciar sesión
          </Link>
        </motion.div>

        <motion.img
          src="/images/memorial.png"
          alt="Vista previa Rememora"
          className="mt-16 rounded-2xl shadow-lg w-full max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          viewport={{ once: true }}
        />
      </section>

      {/* MEMORIAL DE EJEMPLO */}
      <section className="py-24 bg-[#f8f8fb] text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            Conoce cómo luce un memorial en REMEMORA
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.9 }}
            viewport={{ once: true }}
            className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Explora un ejemplo público de cómo las familias pueden honrar la memoria 
            de sus seres queridos compartiendo historias, fotografías y mensajes 
            que perduran en el tiempo.
          </motion.p>

          <motion.a
            href="/m/a9055c09-4561-468b-b2c6-301820c4bc9e"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4557a6] text-white font-medium rounded-full shadow-md hover:bg-[#3a4890] transition"
          >
            Ver memorial de ejemplo
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </motion.a>

        </motion.div>
      </section>

      {/* SECCIÓN PRODUCTO */}
      <section id="product" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6"
          >
            Un legado que trasciende generaciones
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-gray-600 max-w-2xl mx-auto mb-10"
          >
            Crea memoriales únicos donde familiares y amigos pueden colaborar con fotos, videos y mensajes, construyendo una historia eterna.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Colaboración familiar',
                desc: 'Permite que tus seres queridos compartan recuerdos y mensajes, enriqueciendo la historia de cada vida.',
              },
              {
                title: 'QR en placas físicas',
                desc: 'Conecta memoriales digitales con placas QR accesibles desde cualquier lugar.',
              },
              {
                title: 'Reacciones y recuerdos',
                desc: 'Crea una comunidad en torno a la memoria, permitiendo comentarios y aportes multimedia.',
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * idx, duration: 0.7 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-xl shadow-sm border"
              >
                <h3 className="text-xl font-semibold text-rememora mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="pricing" className="py-24 bg-gray-50 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-6"
        >
          Planes para todos
        </motion.h2>

        <motion.div
          className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          viewport={{ once: true }}
        >
          {[
            { name: 'Gratis', price: '$0', desc: 'Crea memoriales básicos con fotos y descripciones.' },
            { name: 'Premium', price: '$7.99 / mes', desc: 'Colaboración, QR y multimedia ilimitado.' },
            { name: 'Familiar', price: '$14.99 / mes', desc: 'Hasta 5 miembros y soporte prioritario.' },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.7 }}
              viewport={{ once: true }}
              className={`border rounded-xl bg-white p-6 shadow-sm ${
                plan.name === 'Premium' ? 'border-rememora shadow-md' : ''
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.desc}</p>
              <p className="text-3xl font-bold mb-6">{plan.price}</p>
              <button className="px-6 py-2 bg-rememora text-white rounded-md font-semibold hover:bg-rememora-dark transition">
                Empezar
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA FINAL */}
      <section id="contact" className="py-24 bg-rememora text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Empieza hoy tu legado digital</h2>
          <p className="text-blue-100 mb-8">
            Crea un memorial que perdure en el tiempo y mantenga viva la memoria de tus seres queridos.
          </p>
          <Link
            href="/register"
            className="bg-white text-rememora px-8 py-3 rounded-md font-semibold hover:bg-blue-50 transition"
          >
            Crear memorial
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-500 text-sm border-t bg-white">
        © {new Date().getFullYear()} REMEMORA. Todos los derechos reservados.
      </footer>
    </main>
  )
}

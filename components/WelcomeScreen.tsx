'use client'

import { useState } from 'react'

export default function WelcomeScreen() {
  const [tab, setTab] = useState<'bienvenida' | 'sugerencias'>('bienvenida')
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="w-full bg-gradient-to-br from-red-800 via-red-700 to-red-600 border-b border-red-900/20">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-white text-sm font-semibold truncate">Mapa Solidario Colombia</span>
          <button
            onClick={() => setCollapsed(false)}
            className="shrink-0 text-red-100 hover:text-white text-xs font-medium underline underline-offset-2 transition-colors whitespace-nowrap"
          >
            Ver bienvenida
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white border-b border-gray-200">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-red-600">
        <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(255,255,255,.6)_39px,rgba(255,255,255,.6)_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,rgba(255,255,255,.6)_39px,rgba(255,255,255,.6)_40px)]" />
        <div className="relative px-6 pt-8 pb-6 max-w-2xl mx-auto">
          <p className="text-red-200 text-xs font-semibold uppercase tracking-widest mb-2">
            Emergencia activa · Colombia, 2026
          </p>
          <h1 className="text-white font-bold text-2xl sm:text-3xl leading-tight">
            Mapa Solidario Colombia
          </h1>
          <p className="text-red-100 text-sm mt-2 leading-relaxed">
            Un lugar para coordinar ayuda después del terremoto que afectó a nuestro país. Lo construimos para que nadie quede
            sin saber dónde puede dar ayuda, ni dónde puede pedirla.
          </p>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-xs font-medium transition-colors bg-black/20 hover:bg-black/35 px-3 py-1.5 rounded-full"
          aria-label="Ocultar bienvenida"
        >
          Ocultar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['bienvenida', 'sugerencias'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              tab === t
                ? 'text-red-700 border-red-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t === 'bienvenida' ? 'Bienvenida' : 'Sugerencias y contacto'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 py-6 max-w-2xl mx-auto">
        {tab === 'bienvenida' ? (
          <div className="space-y-6">

            <div>
              <h2 className="text-gray-900 font-bold text-xl leading-snug">
                Aquí puedes ayudar, y aquí puedes pedir ayuda
              </h2>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                El 10 de agosto de 2026, un terremoto de magnitud 7.4 sacudió San José del Palmar,
                en el Chocó. Familias enteras lo perdieron todo en minutos. La respuesta solidaria
                fue inmensa, pero también confusa. Este mapa existe para ordenarla.
              </p>
            </div>

            {/* How it works */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
                Cómo funciona
              </p>
              <div className="space-y-3">
                {[
                  {
                    n: '1',
                    title: 'Agrega un punto',
                    desc: 'Si conoces un lugar que recibe o necesita ayuda, publícalo. En segundos aparece en el mapa para todos. Asegurate de agregar imagenes e inforamción adicional que puede ayudar a otros a encontrar el lugar.',
                  },
                  {
                    n: '2',
                    title: 'Actualiza el estado',
                    desc: 'Cuando un punto ya está cubierto, repórtalo. Así dirigimos la ayuda a donde más se necesita. Si un sitio tiene información desactualizada, puedes ayudar a actualizarla.',
                  },
                  {
                    n: '3',
                    title: 'Encuentra apoyo cercano',
                    desc: 'Usa tu ubicación para ver los puntos más próximos y llegar con lo que se necesita sin rodeos.',
                  },
                ].map((item) => (
                  <div key={item.n} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {item.n}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-semibold">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funcionalidades */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
                Qué puedes hacer en cada punto
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Subir fotos del lugar',
                    desc: 'Al agregar o editar un punto puedes subir hasta 5 fotografías reales del sitio para que otros sepan exactamente dónde ir.',
                  },
                  {
                    title: 'Abrir en Google Maps',
                    desc: 'Cada dirección es un enlace directo a Google Maps para que puedas navegar al lugar sin salir de tu aplicación de mapas.',
                  },
                  {
                    title: 'Ver qué necesita el punto',
                    desc: 'Cada punto puede listar los ítems que necesita con urgencia, como agua, medicamentos o cobijas, distinguiendo lo urgente de lo necesario.',
                  },
                  {
                    title: 'Filtrar por ciudad y distancia',
                    desc: 'Puedes buscar puntos por ciudad, tipo de apoyo o cercanía a tu ubicación actual para encontrar el lugar más conveniente.',
                  },
                ].map((f) => (
                  <div key={f.title} className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-gray-900 text-sm font-semibold mb-1">{f.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                No necesitas crear una cuenta ni registrarte. Todo es anónimo y se actualiza en tiempo
                real para todos. Si sabes de un lugar que no está en el mapa, por favor agrégalo.
                Puede que alguien lo necesite hoy.
              </p>
            </div>

          </div>
        ) : (
          <div className="space-y-6">

            <div>
              <h2 className="text-gray-900 font-bold text-xl leading-snug">
                Tu voz importa
              </h2>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Este proyecto lo construimos para ser útiles en una emergencia real. Sabemos que hay
                formas de mejorarlo, y queremos escucharlas. Si encontraste un error, tienes una
                sugerencia, o simplemente quieres contarnos cómo te fue usando el mapa, escríbenos.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
              <p className="text-gray-800 text-sm font-semibold">Escríbenos directamente</p>
              <div className="space-y-3">
                <a href="mailto:joshuaprieto8@gmail.com" className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold shrink-0 group-hover:bg-red-200 transition-colors">
                    JP
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium group-hover:text-red-700 transition-colors">
                      joshuaprieto8@gmail.com
                    </p>
                    <p className="text-gray-400 text-xs">Joshua Prieto</p>
                  </div>
                </a>
                <a href="mailto:joaneorduzzz@gmail.com" className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold shrink-0 group-hover:bg-red-200 transition-colors">
                    JO
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium group-hover:text-red-700 transition-colors">
                      joaneorduzzz@gmail.com
                    </p>
                    <p className="text-gray-400 text-xs">Joan Orduz</p>
                  </div>
                </a>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed">
              También nos puedes escribir si quieres ayudar a verificar información, coordinar
              ayuda a mayor escala, o si crees que podemos construir esto juntos de alguna manera.
              Leemos todos los mensajes.
            </p>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-gray-400 text-xs leading-relaxed">
                Mapa Solidario es un proyecto voluntario, sin fines de lucro,
                construido para ayudar en la emergencia que está atravesando nuestro país.
              </p>
            </div>

          </div>
        )}
      </div>

      {/* Scroll hint */}
      <div className="py-5 flex flex-col items-center gap-1.5 border-t border-gray-100">
        <p className="text-gray-400 text-xs font-medium">Desliza para ver todos los puntos de ayuda</p>
        <svg
          className="w-4 h-4 text-gray-300 animate-bounce"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

    </div>
  )
}

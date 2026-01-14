'use client'

import { motion } from 'framer-motion'
import { Scissors, Sparkles, Droplets } from 'lucide-react'

export interface Service {
  id: number
  name: string
  description: string
  price: string
  icon: React.ReactNode
}

const services: Service[] = [
  {
    id: 1,
    name: 'Saç Kesimi',
    description: 'Profesyonel saç kesimi ve şekillendirme',
    price: '600 TL',
    icon: <Scissors className="w-8 h-8" />,
  },
  {
    id: 2,
    name: 'Sakal Tıraşı',
    description: 'Özenli sakal tıraşı ve bakım',
    price: '300 TL',
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    id: 3,
    name: 'Saç + Sakal',
    description: 'Komple bakım paketi',
    price: '700 TL',
    icon: <Droplets className="w-8 h-8" />,
  },
  {
    id: 4,
    name: 'Yüz Bakımı',
    description: 'Derinlemesine yüz bakımı ve masaj',
    price: '1000 TL',
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    id: 5,
    name: 'Saç Boyama',
    description: 'Profesyonel saç boyama hizmeti',
    price: '3000 TL',
    icon: <Droplets className="w-8 h-8" />,
  },
  {
    id: 6,
    name: 'Damat Tıraşı',
    description: 'Tüm hizmetleri içeren özel paket',
    price: '4000 TL',
    icon: <Scissors className="w-8 h-8" />,
  },

  {
    id: 7,
    name: 'Sir-Ağda',
    description: 'Tüm hizmetleri içeren özel paket',
    price: '200 TL',
    icon: <Scissors className="w-8 h-8" />,
  },
  {
    id: 8,
    name: 'Perma',
    description: 'Tüm hizmetleri içeren özel paket',
    price: '3000 TL',
    icon: <Scissors className="w-8 h-8" />,
  },
]

export default function Services() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Hizmetlerimiz
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl">
            Size özel hazırlanmış premium hizmetler
          </p>
        </motion.div>

        {/* Horizontal Scrollable Container */}
        <div className="overflow-x-auto pb-6 scrollbar-hide">
          <div className="flex gap-6 px-4 sm:px-0" style={{ minWidth: 'max-content' }}>
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 sm:w-96 bg-gray-900 rounded-xl p-8 border border-gray-800 hover:border-red-600 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="text-red-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {service.name}
                  </h3>
                  <p className="text-gray-400 mb-6 text-sm sm:text-base">
                    {service.description}
                  </p>
                  <div className="text-3xl font-bold text-red-600">
                    {service.price}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll hint for mobile */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 text-sm mt-6 sm:hidden"
        >
          ← Kaydırarak daha fazla hizmet görüntüleyin →
        </motion.p>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}

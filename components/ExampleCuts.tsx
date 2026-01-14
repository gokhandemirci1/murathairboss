'use client'

import { motion } from 'framer-motion'

const exampleCuts = [
  '/images/foto2.jpeg',
  '/images/foto3.jpeg',
  '/images/foto4.jpeg',
  '/images/foto6.jpeg',
  '/images/foto7.jpeg',
  '/images/foto8.jpeg',
]

export default function ExampleCuts() {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Örnek Kesimler
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl">
            Müşterilerimizin memnuniyeti bizim önceliğimiz
          </p>
        </motion.div>

        {/* Horizontal Scrollable Gallery */}
        <div className="overflow-x-auto pb-6 scrollbar-hide">
          <div className="flex gap-6 px-4 sm:px-0" style={{ minWidth: 'max-content' }}>
            {exampleCuts.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 sm:w-96 h-96 sm:h-[28rem] rounded-xl overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 group cursor-pointer"
              >
                <div className="relative w-full h-full">
                  <img
                    src={image}
                    alt={`Örnek kesim ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
          ← Kaydırarak daha fazla örnek görüntüleyin →
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

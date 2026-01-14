'use client'

import { motion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'

export default function Location() {
  const address = "Ataşehir 8010/2. Sk. No:6/C 35630 Çiğli/İzmir"
  const googleMapsUrl = "https://www.google.com/maps/place/Murat+Hair+Boss+%C3%87i%C4%9Fli/@38.4907159,27.0619938,17z/data=!3m1!4b1!4m6!3m5!1s0x14bbd16737db8ce1:0x4975ad862c416e05!8m2!3d38.4907159!4d27.0619938!16s%2Fg%2F11yfd8g722?entry=ttu&g_ep=EgoyMDI2MDEwNy4wIKXMDSoASAFQAw%3D%3D"

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Konumumuz
            </h2>
            <p className="text-gray-400 text-lg sm:text-xl">
              Bizi ziyaret edin
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900 rounded-2xl p-8 sm:p-10 border border-gray-800"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="text-red-600 mb-4">
                <MapPin className="w-16 h-16" />
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Adres
                </h3>
                <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
                  {address}
                </p>
                <p className="text-gray-400 text-base sm:text-lg mt-4">
                  Çiğli İzban durağına yakın merkezi konum. Çiğli gelişim garajı yan tarafı. Çiğli İzban Taksi durağı yanı. 
                </p>
              </div>

              <motion.a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center gap-3 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Yol Tarifi Al
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

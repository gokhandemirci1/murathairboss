'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Phone, Send } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface BookingFormData {
  firstName: string
  lastName: string
  phone: string
  date: Date | null
  time: Date | null
}

export default function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    defaultValues: {
      date: null,
      time: null,
    },
  })

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Convert date to local YYYY-MM-DD and time to HH:mm format
      const formattedData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        date: data.date
          ? `${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, '0')}-${String(
              data.date.getDate()
            ).padStart(2, '0')}`
          : '',
        time: data.time ? data.time.toTimeString().slice(0, 5) : '',
      }

      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        reset()
        setTimeout(() => setSubmitStatus('idle'), 5000)
      } else {
        if (response.status === 409) {
          // Conflict - time slot already booked
          setSubmitStatus('error')
          // Show specific error message
          const errorMessage = result?.error || 'Bu saatte zaten bir randevu var'
          alert(errorMessage + '. Lütfen başka bir saat seçiniz.')
        } else {
          setSubmitStatus('error')
        }
        setTimeout(() => setSubmitStatus('idle'), 5000)
      }
    } catch (error) {
      console.error('Booking error:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filter out Sundays (0 = Sunday)
  const isWeekday = (date: Date) => {
    const day = date.getDay()
    return day !== 0 // Disable Sundays
  }

  // Generate available time slots: 10:30 to 20:00 with 30-minute intervals
  const generateTimeSlots = () => {
    const slots: Date[] = []
    const startHour = 10
    const startMinute = 30
    const endHour = 20
    const endMinute = 0
    const intervalMinutes = 30

    let currentHour = startHour
    let currentMinute = startMinute

    while (true) {
      // Create time slot
      const time = new Date()
      time.setHours(currentHour, currentMinute, 0, 0)
      
      // Check if we've exceeded the end time (20:00)
      if (currentHour > endHour || (currentHour === endHour && currentMinute >= endMinute)) {
        break
      }
      
      slots.push(time)

      // Add 30 minutes for next slot
      currentMinute += intervalMinutes
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60)
        currentMinute = currentMinute % 60
      }
    }

    return slots
  }

  const availableTimeSlots = generateTimeSlots()

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Randevu Al
            </h2>
            <p className="text-gray-400 text-lg sm:text-xl">
              Hemen randevunuzu oluşturun
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900 rounded-2xl p-8 sm:p-10 border border-gray-800"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-white mb-2 font-medium">
                  <User className="inline w-4 h-4 mr-2" />
                  Ad
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName', {
                    required: 'Ad gereklidir',
                    minLength: {
                      value: 2,
                      message: 'Ad en az 2 karakter olmalıdır',
                    },
                  })}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Adınız"
                />
                {errors.firstName && (
                  <p className="mt-1 text-red-600 text-sm">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-white mb-2 font-medium">
                  <User className="inline w-4 h-4 mr-2" />
                  Soyad
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName', {
                    required: 'Soyad gereklidir',
                    minLength: {
                      value: 2,
                      message: 'Soyad en az 2 karakter olmalıdır',
                    },
                  })}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Soyadınız"
                />
                {errors.lastName && (
                  <p className="mt-1 text-red-600 text-sm">{errors.lastName.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-white mb-2 font-medium">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Telefon
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', {
                    required: 'Telefon numarası gereklidir',
                    pattern: {
                      value: /^[0-9+\s()-]+$/,
                      message: 'Geçerli bir telefon numarası giriniz',
                    },
                  })}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="05XX XXX XX XX"
                />
                {errors.phone && (
                  <p className="mt-1 text-red-600 text-sm">{errors.phone.message}</p>
                )}
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-white mb-2 font-medium">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    Tarih
                  </label>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: 'Tarih gereklidir' }}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        minDate={today}
                        filterDate={isWeekday}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Tarih seçiniz"
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                        wrapperClassName="w-full"
                        calendarClassName="bg-gray-900 border border-gray-700 text-white"
                        dayClassName={(date) => {
                          if (date < today) {
                            return 'text-gray-600 cursor-not-allowed'
                          }
                          if (date.getDay() === 0) {
                            return 'text-gray-600 cursor-not-allowed'
                          }
                          return 'text-white hover:bg-red-600'
                        }}
                        popperClassName="react-datepicker-popper"
                      />
                    )}
                  />
                  {errors.date && (
                    <p className="mt-1 text-red-600 text-sm">{errors.date.message}</p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time" className="block text-white mb-2 font-medium">
                    <Clock className="inline w-4 h-4 mr-2" />
                    Saat
                  </label>
                  <Controller
                    name="time"
                    control={control}
                    rules={{ required: 'Saat gereklidir' }}
                    render={({ field }) => (
                      <div className="relative">
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => field.onChange(date)}
                          showTimeSelect
                          showTimeSelectOnly
                          includeTimes={availableTimeSlots}
                          dateFormat="HH:mm"
                          timeCaption="Saat"
                          placeholderText="Saat seçiniz (10:30-19:30)"
                          onKeyDown={(e) => {
                            if (e.key !== 'Tab' && e.key !== 'Enter' && e.key !== 'Escape') {
                              e.preventDefault()
                            }
                          }}
                          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
                          wrapperClassName="w-full"
                          calendarClassName="bg-gray-900 border border-gray-700 text-white"
                          popperClassName="react-datepicker-popper"
                        />
                      </div>
                    )}
                  />
                  {errors.time && (
                    <p className="mt-1 text-red-600 text-sm">{errors.time.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Randevu Oluştur
                  </>
                )}
              </motion.button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-900/50 border border-green-600 rounded-lg text-green-400 text-center"
                >
                  Randevunuz başarıyla oluşturuldu! En kısa sürede sizinle iletişime geçeceğiz.
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-400 text-center"
                >
                  Bir hata oluştu. Lütfen tekrar deneyin veya telefon ile iletişime geçin.
                </motion.div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

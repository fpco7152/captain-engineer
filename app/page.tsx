"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, ChevronRight, Eye, Lightbulb, HardHat, Hammer, Compass, Target } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedButton } from "@/components/ui/animated-button"
import { HoverButton } from "@/components/ui/hover-button"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerIn } from "@/components/animations/stagger-in"
import { ScaleIn } from "@/components/animations/scale-in"
import { HoverCard } from "@/components/animations/hover-card"
import { CountUp } from "@/components/animations/count-up"
import { ScrollProgress } from "@/components/animations/scroll-progress"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />

      {/* Hero Section with Static Background Image */}
      <section className="relative w-full overflow-hidden h-[600px] md:h-[700px] lg:h-[800px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-1.png"
            alt="Construction site background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={90}
          />
        </div>

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Hero Content */}
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block px-4 py-2 bg-amber-500/90 text-white rounded-full text-sm font-medium mb-4"
              >
                Premier Construction Services
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 drop-shadow-md">
                Building Tomorrow's <span className="text-amber-400">Foundations</span> Today
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-10 max-w-xl md:max-w-2xl mx-auto drop-shadow-md">
                Innovative construction solutions for residential, commercial, and industrial projects with unmatched
                quality and precision.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/services" className="w-full sm:w-auto">
                  <AnimatedButton
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 sm:px-8 w-full sm:w-auto"
                    hoverEffect="lift"
                    iconAnimation={true}
                  >
                    Explore Services
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                </Link>
                <Link href="/projects" className="w-full sm:w-auto">
                  <HoverButton
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white/20 hover:text-white font-semibold px-6 sm:px-8 w-full sm:w-auto backdrop-blur-sm"
                    hoverEffect="glow"
                    rippleColor="rgba(255, 255, 255, 0.3)"
                  >
                    View Projects
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </HoverButton>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rest of the page content remains the same */}
      {/* Mission & Vision Section */}
      <section className="py-12 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10 md:mb-16 max-w-3xl mx-auto">
              <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400 rounded-full text-sm font-medium mb-3 md:mb-4">
                Our Purpose
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
                Mission & Vision
              </h2>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                Guided by our core principles, we strive to transform the construction industry and create lasting value
                for our clients.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
            <FadeIn direction="left" delay={0.2}>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 md:p-10 rounded-2xl shadow-md">
                <div className="flex items-center mb-4 md:mb-6 justify-center sm:justify-start">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-amber-100 dark:bg-amber-900 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mr-4"
                  >
                    <Target className="h-6 w-6 md:h-7 md:w-7 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 md:mb-6 text-sm sm:text-base text-center sm:text-left">
                  To deliver exceptional construction services that exceed client expectations through innovation,
                  integrity, and craftsmanship. We are committed to:
                </p>
                <StaggerIn direction="up" staggerDelay={0.1}>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-amber-500 mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base text-left">
                      Creating safe, sustainable, and functional spaces that enhance the quality of life for those who
                      use them
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-amber-500 mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base text-left">
                      Fostering a culture of excellence, continuous improvement, and professional growth among our team
                      members
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-amber-500 mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base text-left">
                      Building lasting relationships with clients, partners, and communities through transparent
                      communication and ethical practices
                    </p>
                  </div>
                </StaggerIn>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.4}>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 md:p-10 rounded-2xl shadow-md">
                <div className="flex items-center mb-4 md:mb-6 justify-center sm:justify-start">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-amber-100 dark:bg-amber-900 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mr-4"
                  >
                    <Eye className="h-6 w-6 md:h-7 md:w-7 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 md:mb-6 text-sm sm:text-base text-center sm:text-left">
                  To be the most trusted and innovative construction company, recognized for:
                </p>
                <StaggerIn direction="up" staggerDelay={0.1}>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-amber-500 mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base text-left">
                      Setting new standards of excellence in construction quality, safety, and client satisfaction
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-amber-500 mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base text-left">
                      Pioneering sustainable building practices that minimize environmental impact while maximizing
                      efficiency and durability
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-amber-500 mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base text-left">
                      Creating positive change in the communities where we work through responsible business practices
                      and meaningful engagement
                    </p>
                  </div>
                </StaggerIn>
              </div>
            </FadeIn>
          </div>

          <ScaleIn delay={0.6}>
            <div className="mt-10 md:mt-16 text-center">
              <div className="bg-amber-50 dark:bg-amber-900/30 p-6 md:p-8 rounded-2xl max-w-3xl mx-auto">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-amber-100 dark:bg-amber-900 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Lightbulb className="h-6 w-6 md:h-7 md:w-7 text-amber-600 dark:text-amber-400" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900 dark:text-white">
                  Our Approach
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg mb-5 md:mb-6">
                  We believe that successful construction is built on a foundation of collaboration, innovation, and
                  attention to detail. By combining traditional craftsmanship with cutting-edge technology, we deliver
                  projects that stand the test of time.
                </p>
                <Link href="/contact">
                  <AnimatedButton
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                    hoverEffect="shine"
                    iconRotate={true}
                  >
                    Partner With Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <StaggerIn direction="up" staggerDelay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              <HoverCard>
                <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-amber-100 dark:bg-amber-900 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <HardHat className="h-7 w-7 md:h-8 md:w-8 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white">
                    Quality Guaranteed
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    Our projects meet the highest standards of quality and durability, backed by our satisfaction
                    guarantee.
                  </p>
                </div>
              </HoverCard>
              <HoverCard>
                <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-amber-100 dark:bg-amber-900 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Hammer className="h-7 w-7 md:h-8 md:w-8 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white">
                    Expert Craftsmen
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    Our team consists of skilled professionals with decades of combined experience in construction.
                  </p>
                </div>
              </HoverCard>
              <HoverCard className="sm:col-span-2 md:col-span-1">
                <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-amber-100 dark:bg-amber-900 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Compass className="h-7 w-7 md:h-8 md:w-8 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white">
                    Innovative Solutions
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    We implement cutting-edge technologies and methods to deliver efficient and sustainable results.
                  </p>
                </div>
              </HoverCard>
            </div>
          </StaggerIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-16 bg-amber-500 dark:bg-amber-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 text-center max-w-5xl mx-auto">
            <FadeIn direction="up" delay={0.1}>
              <div className="p-4 md:p-6">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                  <CountUp end={500} suffix="+" />
                </div>
                <p className="text-black dark:text-gray-100 font-medium text-sm md:text-base">Projects Completed</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <div className="p-4 md:p-6">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                  <CountUp end={25} suffix="+" />
                </div>
                <p className="text-black dark:text-gray-100 font-medium text-sm md:text-base">Years Experience</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.3}>
              <div className="p-4 md:p-6">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                  <CountUp end={150} suffix="+" />
                </div>
                <p className="text-black dark:text-gray-100 font-medium text-sm md:text-base">Expert Team Members</p>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.4}>
              <div className="p-4 md:p-6">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                  <CountUp end={98} suffix="%" />
                </div>
                <p className="text-black dark:text-gray-100 font-medium text-sm md:text-base">Client Satisfaction</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              Ready to Start Your Construction Project?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-xl sm:max-w-2xl mx-auto mb-6 md:mb-10">
              Contact us today for a free consultation and quote. Our team is ready to bring your vision to life with
              precision and excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/contact" className="w-full sm:w-auto">
                <HoverButton
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 md:px-8 w-full sm:w-auto"
                  hoverEffect="ripple"
                >
                  Get a Free Quote
                  <ChevronRight className="ml-2 h-4 w-4" />
                </HoverButton>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <AnimatedButton
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white/10 hover:text-white font-semibold px-6 md:px-8 w-full sm:w-auto"
                  hoverEffect="pulse"
                  iconAnimation={true}
                >
                  Contact Our Team
                  <ChevronRight className="ml-2 h-4 w-4" />
                </AnimatedButton>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}

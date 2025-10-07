"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HardHat, ChevronRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) onClose()
    }

    window.addEventListener("popstate", handleRouteChange)
    return () => window.removeEventListener("popstate", handleRouteChange)
  }, [isOpen, onClose])

  return (
    <>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[85vw] sm:w-[350px] bg-background border-l border-amber-200 dark:border-amber-800 z-50 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full p-4 sm:p-6">
              <div className="flex items-center justify-between border-b py-3 sm:py-4">
                <Link href="/" className="flex items-center gap-1.5 sm:gap-2" onClick={onClose}>
                  <motion.div
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                    className="bg-amber-500 text-white p-1 sm:p-1.5 rounded-md"
                  >
                    <HardHat className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.div>
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    className="flex flex-col"
                  >
                    <span className="text-base sm:text-lg font-bold">BuildMaster</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Construction Excellence</span>
                  </motion.div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-amber-50 dark:bg-amber-900/20"
                  type="button"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>

              <nav className="flex flex-col gap-4 sm:gap-6 py-6 sm:py-8">
                <MobileNavItem href="/" label="Home" isActive={pathname === "/"} onClick={onClose} delay={0.1} />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2,
                    mass: 0.8,
                  }}
                  className="space-y-4"
                >
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg font-medium text-center"
                  >
                    Services
                  </motion.p>
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, staggerChildren: 0.1 }}
                  >
                    <MobileSubNavItem
                      href="/services/residential"
                      label="Residential Construction"
                      isActive={pathname === "/services/residential"}
                      onClick={onClose}
                    />
                    <MobileSubNavItem
                      href="/services/commercial"
                      label="Commercial Development"
                      isActive={pathname === "/services/commercial"}
                      onClick={onClose}
                    />
                    <MobileSubNavItem
                      href="/services/industrial"
                      label="Industrial Facilities"
                      isActive={pathname === "/services/industrial"}
                      onClick={onClose}
                    />
                    <MobileSubNavItem
                      href="/services/design"
                      label="Architectural Design"
                      isActive={pathname === "/services/design"}
                      onClick={onClose}
                    />
                  </motion.div>
                </motion.div>

                <MobileNavItem
                  href="/projects"
                  label="Projects"
                  isActive={pathname === "/projects"}
                  onClick={onClose}
                  delay={0.3}
                />

                <MobileNavItem
                  href="/about"
                  label="About Us"
                  isActive={pathname === "/about"}
                  onClick={onClose}
                  delay={0.4}
                />

                <MobileNavItem
                  href="/contact"
                  label="Contact"
                  isActive={pathname === "/contact"}
                  onClick={onClose}
                  delay={0.5}
                />
              </nav>

              <motion.div
                className="mt-auto border-t py-4 sm:py-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.7,
                  mass: 0.8,
                }}
              >
                <Link href="/contact#quote-form" onClick={onClose}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <AnimatedButton
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm sm:text-base transition-all duration-300 py-5 sm:py-6"
                      hoverEffect="shine"
                      iconAnimation={true}
                    >
                      Get a Free Quote
                      <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </AnimatedButton>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Mobile Nav Item
function MobileNavItem({
  href,
  label,
  isActive,
  onClick,
  delay = 0,
}: {
  href: string
  label: string
  isActive: boolean
  onClick: () => void
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: delay,
        mass: 0.8,
      }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(245, 158, 11, 0.05)" }}
      className="overflow-hidden rounded-lg"
    >
      <Link
        href={href}
        className={`text-base sm:text-lg font-medium block text-center py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 ${
          isActive ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" : ""
        }`}
        onClick={onClick}
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="inline-block"
        >
          {label}
        </motion.span>
      </Link>
    </motion.div>
  )
}

// Mobile Sub Nav Item
function MobileSubNavItem({
  href,
  label,
  isActive,
  onClick,
}: {
  href: string
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{
        scale: 1.02,
        backgroundColor: "rgba(245, 158, 11, 0.05)",
        transition: { type: "spring", stiffness: 400, damping: 15 },
      }}
      className="overflow-hidden rounded-lg"
    >
      <Link
        href={href}
        className={`block text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-300 text-center ${
          isActive ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" : ""
        }`}
        onClick={onClick}
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="inline-block"
        >
          {label}
        </motion.span>
      </Link>
    </motion.div>
  )
}

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle, Home, Hammer, Ruler } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Residential Construction | BuildMaster Construction",
  description:
    "Explore BuildMaster's residential construction services including custom homes, renovations, and additions.",
}

export default function ResidentialServicePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image src="/images/residential-1.png" alt="Residential construction" fill className="object-cover" priority />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Residential Construction</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Building dream homes with quality craftsmanship and attention to detail.
          </p>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
                Residential Services
              </div>
              <h2 className="text-4xl font-bold mb-6">Creating Spaces You'll Love to Call Home</h2>
              <p className="text-gray-700 mb-6 text-lg">
                At BuildMaster, we understand that your home is more than just a building—it's where memories are made
                and lives are lived. That's why we approach each residential project with care, precision, and a
                commitment to excellence.
              </p>
              <p className="text-gray-700 mb-8">
                Whether you're building a new custom home, renovating an existing space, or adding an extension, our
                team of skilled professionals will work closely with you to bring your vision to life while ensuring the
                highest standards of quality and craftsmanship.
              </p>
              <Link href="/contact">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                  Get a Free Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/residential-2.png" alt="Residential construction" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              What We Offer
            </div>
            <h2 className="text-4xl font-bold mb-6">Our Residential Services</h2>
            <p className="text-gray-700 text-lg">
              We provide a comprehensive range of residential construction services to meet all your home building
              needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {residentialServices.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <service.icon className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-700 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              Our Process
            </div>
            <h2 className="text-4xl font-bold mb-6">How We Build Your Dream Home</h2>
            <p className="text-gray-700 text-lg">
              Our streamlined process ensures a smooth experience from initial consultation to project completion.
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-amber-200 hidden md:block"></div>

              {/* Process steps */}
              <div className="space-y-12 relative">
                {processSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                  >
                    <div className="md:w-1/2 relative">
                      <div className="bg-gray-50 p-8 rounded-2xl shadow-sm relative z-10">
                        <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                          <span className="text-amber-700 font-bold text-xl">{index + 1}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                        <p className="text-gray-700">{step.description}</p>
                      </div>
                      {/* Circle on the timeline */}
                      <div className="absolute top-1/2 left-0 md:left-auto md:right-0 transform translate-y-[-50%] translate-x-[-50%] md:translate-x-[50%] w-6 h-6 bg-amber-500 rounded-full border-4 border-white z-20 hidden md:block"></div>
                    </div>
                    <div className="md:w-1/2 hidden md:block">{/* This div is just for spacing in the timeline */}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              Our Portfolio
            </div>
            <h2 className="text-4xl font-bold mb-6">Featured Residential Projects</h2>
            <p className="text-gray-700 text-lg">
              Explore some of our recent residential construction projects that showcase our expertise and quality.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {residentialProjects.map((project, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-md">
                <div className="relative h-80 w-full">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 w-full">
                      <h3 className="font-bold text-xl text-white">{project.title}</h3>
                      <p className="text-amber-300 mb-4">{project.location}</p>
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" className="text-white border-white hover:bg-white/20">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/projects">
              <Button
                variant="outline"
                className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white font-medium px-8"
              >
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              Client Testimonials
            </div>
            <h2 className="text-4xl font-bold mb-6">What Our Clients Say</h2>
            <p className="text-gray-700 text-lg">
              Hear from homeowners who have trusted us with their residential construction projects.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4 border-2 border-amber-300">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-amber-600">{testimonial.project}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Your Dream Home?</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
            Contact us today for a free consultation and discover how BuildMaster can bring your residential vision to
            life.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8">
                Get a Free Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Sample data
const residentialServices = [
  {
    title: "Custom Home Building",
    description: "Design and construction of custom homes tailored to your specific needs and preferences.",
    icon: Home,
    features: [
      "Personalized design consultation",
      "Quality materials and craftsmanship",
      "Energy-efficient building practices",
      "Comprehensive project management",
    ],
  },
  {
    title: "Home Renovations",
    description: "Transform your existing space with our comprehensive renovation services.",
    icon: Hammer,
    features: [
      "Kitchen and bathroom remodels",
      "Basement finishing",
      "Interior and exterior renovations",
      "Structural modifications",
    ],
  },
  {
    title: "Home Additions",
    description: "Expand your living space with carefully planned and executed home additions.",
    icon: Ruler,
    features: [
      "Seamless integration with existing structure",
      "Additional bedrooms or living spaces",
      "Expanded kitchens and dining areas",
      "Second-story additions",
    ],
  },
]

const processSteps = [
  {
    title: "Initial Consultation",
    description:
      "We begin with a thorough consultation to understand your vision, requirements, and budget constraints for your residential project.",
  },
  {
    title: "Design & Planning",
    description:
      "Our design team creates detailed plans and visualizations of your home, incorporating your feedback at every stage.",
  },
  {
    title: "Material Selection",
    description:
      "We guide you through selecting the right materials that balance quality, aesthetics, and budget for your home.",
  },
  {
    title: "Construction",
    description:
      "Our skilled craftsmen bring your home to life with precision, quality materials, and attention to detail.",
  },
  {
    title: "Quality Assurance",
    description:
      "Rigorous quality checks throughout the construction process ensure your home meets our high standards.",
  },
  {
    title: "Final Walkthrough",
    description:
      "We conduct a comprehensive walkthrough with you to ensure every detail meets your expectations before handover.",
  },
]

const residentialProjects = [
  {
    id: "lakeside-villa",
    title: "Lakeside Villa",
    location: "Lake District",
    image: "/images/project-2.png",
  },
  {
    id: "modern-farmhouse",
    title: "Modern Farmhouse",
    location: "Countryside Estates",
    image: "/images/project-6.png",
  },
  {
    id: "urban-townhouse",
    title: "Urban Townhouse",
    location: "Downtown",
    image: "/images/project-3.png",
  },
]

const testimonials = [
  {
    name: "Emily & David Thompson",
    project: "Custom Home Build",
    quote:
      "BuildMaster turned our dream home into reality. Their attention to detail and commitment to quality exceeded our expectations. We couldn't be happier with our new home.",
    avatar: "/images/testimonial-1.png",
  },
  {
    name: "Michael Rodriguez",
    project: "Home Renovation",
    quote:
      "The renovation of our 1950s home was handled with expertise and care. The team respected the character of our home while modernizing it beautifully.",
    avatar: "/images/testimonial-2.png",
  },
]

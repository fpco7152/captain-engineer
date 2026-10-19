import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: "Our Projects | BuildMaster Construction",
  description:
    "Explore BuildMaster's portfolio of completed construction projects across residential, commercial, and industrial sectors.",
}

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[300px] sm:h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="/images/project-1.png"
          alt="Construction projects"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4">Our Projects</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl sm:max-w-2xl">
            Explore our portfolio of successful projects that showcase our expertise and commitment to excellence.
          </p>
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-3 md:mb-4">
              Our Portfolio
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-6">Featured Projects</h2>
            <p className="text-base md:text-lg text-gray-700">
              Browse through our diverse portfolio of completed projects across various sectors.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="all" className="mb-8 md:mb-12">
              <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4">
                <TabsList className="flex space-x-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="all" className="px-4 py-2 text-sm rounded-md">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="residential" className="px-4 py-2 text-sm rounded-md">
                    Residential
                  </TabsTrigger>
                  <TabsTrigger value="commercial" className="px-4 py-2 text-sm rounded-md">
                    Commercial
                  </TabsTrigger>
                  <TabsTrigger value="industrial" className="px-4 py-2 text-sm rounded-md">
                    Industrial
                  </TabsTrigger>
                  <TabsTrigger value="renovation" className="px-4 py-2 text-sm rounded-md">
                    Renovation
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-6 md:mt-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {projects.map((project, index) => (
                    <ProjectCard key={index} project={project} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="residential" className="mt-6 md:mt-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {projects
                    .filter((project) => project.category === "Residential")
                    .map((project, index) => (
                      <ProjectCard key={index} project={project} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="commercial" className="mt-6 md:mt-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {projects
                    .filter((project) => project.category === "Commercial")
                    .map((project, index) => (
                      <ProjectCard key={index} project={project} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="industrial" className="mt-6 md:mt-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {projects
                    .filter((project) => project.category === "Industrial")
                    .map((project, index) => (
                      <ProjectCard key={index} project={project} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="renovation" className="mt-6 md:mt-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {projects
                    .filter((project) => project.category === "Renovation")
                    .map((project, index) => (
                      <ProjectCard key={index} project={project} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-3 md:mb-4">
                Our Approach
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">How We Deliver Excellence</h2>
              <p className="text-base md:text-lg text-gray-700 mb-6">
                Every project we undertake follows a rigorous process to ensure quality, timeliness, and client
                satisfaction.
              </p>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start">
                  <div className="bg-amber-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                    <span className="text-amber-700 font-bold text-sm md:text-base">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">Thorough Planning</h3>
                    <p className="text-gray-700 text-sm md:text-base">
                      We begin with comprehensive planning to establish clear objectives, timelines, and budgets.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-amber-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                    <span className="text-amber-700 font-bold text-sm md:text-base">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">Quality Materials</h3>
                    <p className="text-gray-700 text-sm md:text-base">
                      We source only the highest quality materials to ensure durability and longevity.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-amber-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                    <span className="text-amber-700 font-bold text-sm md:text-base">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">Expert Execution</h3>
                    <p className="text-gray-700 text-sm md:text-base">
                      Our skilled team executes each phase with precision and attention to detail.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-amber-100 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                    <span className="text-amber-700 font-bold text-sm md:text-base">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">Rigorous Quality Control</h3>
                    <p className="text-gray-700 text-sm md:text-base">
                      We conduct thorough inspections at every stage to maintain our high standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl mt-8 md:mt-0">
              <Image
                src="/images/process.png"
                alt="Construction process"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">Ready to Start Your Project?</h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-xl md:max-w-2xl mx-auto mb-6 md:mb-10">
            Contact us today to discuss how we can bring your vision to life with the same excellence showcased in our
            portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 md:px-8 w-full sm:w-auto"
              >
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Project Card Component
function ProjectCard({ project }) {
  return (
    <Card className="overflow-hidden group h-full">
      <div className="relative h-48 sm:h-56 md:h-64 w-full">
        <Image
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 md:p-6 w-full">
            <h3 className="text-lg md:text-xl font-bold text-white">{project.title}</h3>
            <p className="text-amber-300 mb-4">{project.category}</p>
            <Link href={`/projects/${project.id}`}>
              <Button variant="outline" className="text-white border-white hover:bg-white/20">
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">{project.title}</CardTitle>
        <CardDescription className="text-amber-600">{project.category}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <p className="text-gray-700 text-sm sm:text-base">{project.description}</p>
      </CardContent>
      <CardFooter className="p-4 md:p-6 pt-0">
        <Link href={`/projects/${project.id}`}>
          <Button
            variant="outline"
            className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white text-sm sm:text-base"
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

// Sample data
const projects = [
  {
    id: "skyline-tower",
    title: "Skyline Tower",
    category: "Commercial",
    description:
      "A 25-story office building featuring modern design, energy-efficient systems, and state-of-the-art amenities.",
    image: "/images/project-1.png",
  },
  {
    id: "riverside-residences",
    title: "Riverside Residences",
    category: "Residential",
    description: "Luxury condominium complex with 50 units, featuring high-end finishes and waterfront views.",
    image: "/images/project-2.png",
  },
  {
    id: "heritage-plaza",
    title: "Heritage Plaza Renovation",
    category: "Renovation",
    description:
      "Complete renovation of a historic commercial building, preserving its character while modernizing its functionality.",
    image: "/images/project-3.png",
  },
  {
    id: "metro-transit",
    title: "Metro Transit Hub",
    category: "Industrial",
    description: "Multi-modal transportation facility designed for efficiency, durability, and passenger comfort.",
    image: "/images/project-4.png",
  },
  {
    id: "innovation-center",
    title: "Innovation Center",
    category: "Commercial",
    description:
      "Tech-focused office complex with collaborative spaces, advanced connectivity, and sustainable features.",
    image: "/images/project-5.png",
  },
  {
    id: "lakeside-community",
    title: "Lakeside Community",
    category: "Residential",
    description: "Master-planned residential community with single-family homes, townhouses, and community amenities.",
    image: "/images/project-6.png",
  },
  {
    id: "central-warehouse",
    title: "Central Distribution Facility",
    category: "Industrial",
    description: "200,000 sq ft distribution center with advanced logistics systems and energy-efficient design.",
    image: "/images/industrial-1.png",
  },
  {
    id: "mountain-retreat",
    title: "Mountain Retreat",
    category: "Residential",
    description:
      "Custom luxury home built with sustainable materials and designed to harmonize with its natural surroundings.",
    image: "/images/residential-2.png",
  },
  {
    id: "historic-theater",
    title: "Grand Theater Restoration",
    category: "Renovation",
    description:
      "Careful restoration of a 1920s theater, preserving historical elements while updating systems and accessibility.",
    image: "/images/commercial-2.png",
  },
]

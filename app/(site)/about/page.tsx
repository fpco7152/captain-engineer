import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle, Award, Clock, Target, Eye, Lightbulb, Compass, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata = {
  title: "About Us | BuildMaster Construction",
  description:
    "Learn about BuildMaster Construction's history, values, and our expert team dedicated to excellence in construction.",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image src="/images/about-team.png" alt="Construction team" fill className="object-cover" priority />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About BuildMaster</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Building excellence through innovation, quality craftsmanship, and unwavering commitment to our clients.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full text-sm font-medium mb-4">
              Our Purpose
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Mission & Vision</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Guided by our core principles, we strive to transform the construction industry and create lasting value
              for our clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800 p-10 rounded-2xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="bg-amber-100 dark:bg-amber-900 w-14 h-14 rounded-full flex items-center justify-center mr-4">
                  <Target className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                To deliver exceptional construction services that exceed client expectations through innovation,
                integrity, and craftsmanship. We are committed to:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Creating safe, sustainable, and functional spaces that enhance the quality of life for those who use
                    them
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Fostering a culture of excellence, continuous improvement, and professional growth among our team
                    members
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Building lasting relationships with clients, partners, and communities through transparent
                    communication and ethical practices
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-10 rounded-2xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="bg-amber-100 dark:bg-amber-900 w-14 h-14 rounded-full flex items-center justify-center mr-4">
                  <Eye className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                To be the most trusted and innovative construction company, recognized for:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Setting new standards of excellence in construction quality, safety, and client satisfaction
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Pioneering sustainable building practices that minimize environmental impact while maximizing
                    efficiency and durability
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Creating positive change in the communities where we work through responsible business practices and
                    meaningful engagement
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-amber-50 dark:bg-amber-900/30 p-8 rounded-2xl max-w-3xl mx-auto">
              <div className="bg-amber-100 dark:bg-amber-900 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Our Approach</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                We believe that successful construction is built on a foundation of collaboration, innovation, and
                attention to detail. By combining traditional craftsmanship with cutting-edge technology, we deliver
                projects that stand the test of time.
              </p>
              <Link href="/contact">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  Partner With Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full text-sm font-medium mb-4">
                Our Story
              </div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Building a Legacy of Excellence</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                Founded in 2000, BuildMaster began as a small family-owned construction company with a vision to
                transform the industry through innovation and quality craftsmanship.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Over the past two decades, we've grown into a leading construction firm, completing over 500 projects
                across residential, commercial, and industrial sectors. Our success is built on our commitment to
                excellence, integrity, and client satisfaction.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Today, BuildMaster continues to push the boundaries of construction, embracing new technologies and
                sustainable practices to deliver exceptional results for our clients.
              </p>
              <Link href="/contact">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/about-story.png" alt="Company history" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full text-sm font-medium mb-4">
              Our Values
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">What Drives Us</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Our core values guide everything we do, from how we interact with clients to how we approach each project.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Excellence</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We strive for excellence in every aspect of our work, from planning to execution and beyond.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Integrity</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We conduct our business with honesty, transparency, and ethical practices at all times.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Innovation</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We embrace new technologies and methods to deliver innovative solutions for our clients.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Reliability</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We deliver on our promises, meeting deadlines and exceeding expectations consistently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full text-sm font-medium mb-4">
              Our Team
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Meet Our Leadership</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Our experienced leadership team brings decades of industry expertise to every project.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-80 overflow-hidden">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-amber-600 dark:text-amber-400 mb-4">{member.position}</p>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">{member.bio}</p>
                  <div className="flex justify-center space-x-4">
                    {member.social.map((social, idx) => (
                      <Link
                        key={idx}
                        href={social.url}
                        className="text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                      >
                        <social.icon className="h-5 w-5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-amber-500 dark:bg-amber-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <p className="text-black dark:text-gray-100 font-medium">Projects Completed</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-2">25+</div>
              <p className="text-black dark:text-gray-100 font-medium">Years Experience</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <p className="text-black dark:text-gray-100 font-medium">Expert Team Members</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <p className="text-black dark:text-gray-100 font-medium">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
            Contact us today to discuss your project needs and discover how BuildMaster can bring your vision to life.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/10 font-semibold px-8"
              >
                View Our Projects
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
import { Linkedin, Twitter, Facebook } from "lucide-react"

const teamMembers = [
  {
    name: "Michael Reynolds",
    position: "CEO & Founder",
    bio: "With over 30 years in construction, Michael founded BuildMaster with a vision to transform the industry through innovation and quality.",
    image: "/images/team-1.png",
    social: [
      { icon: Linkedin, url: "#" },
      { icon: Twitter, url: "#" },
      { icon: Facebook, url: "#" },
    ],
  },
  {
    name: "Sarah Johnson",
    position: "Chief Operations Officer",
    bio: "Sarah oversees all operations, ensuring projects are delivered on time, within budget, and to the highest standards of quality.",
    image: "/images/team-2.png",
    social: [
      { icon: Linkedin, url: "#" },
      { icon: Twitter, url: "#" },
    ],
  },
  {
    name: "David Chen",
    position: "Lead Architect",
    bio: "David brings creative vision and technical expertise to every project, specializing in sustainable and innovative design solutions.",
    image: "/images/team-3.png",
    social: [
      { icon: Linkedin, url: "#" },
      { icon: Facebook, url: "#" },
    ],
  },
]

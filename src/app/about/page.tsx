import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  Award, 
  Target, 
  Heart, 
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Handshake
} from "lucide-react";

const teamMembers = [
  {
    name: "Md. Rahman Khan",
    role: "Founder & CEO",
    image: "/placeholder-avatar.jpg",
    description: "15+ years in automotive industry. Passionate about making bike buying/selling transparent and trustworthy.",
    linkedin: "#"
  },
  {
    name: "Sarah Ahmed",
    role: "Head of Operations",
    image: "/placeholder-avatar.jpg",
    description: "Expert in business operations and customer service. Ensures smooth transactions for all our users.",
    linkedin: "#"
  },
  {
    name: "Karim Hassan",
    role: "Technical Lead",
    image: "/placeholder-avatar.jpg",
    description: "Full-stack developer with expertise in building scalable platforms. Leads our technical innovation.",
    linkedin: "#"
  },
  {
    name: "Fatima Ali",
    role: "Customer Success Manager",
    image: "/placeholder-avatar.jpg",
    description: "Dedicated to ensuring every customer has the best experience on our platform.",
    linkedin: "#"
  }
];

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Happy Customers",
    description: "Satisfied buyers and sellers"
  },
  {
    icon: CheckCircle,
    value: "5,000+",
    label: "Bikes Sold",
    description: "Successfully completed transactions"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Verified Papers",
    description: "All documents authenticated"
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Customer Rating",
    description: "Based on 2,500+ reviews"
  }
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "We verify every bike and document to ensure complete transparency in all transactions."
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Our customers are at the heart of everything we do. Their satisfaction is our top priority."
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description: "We maintain the highest standards in bike quality and service delivery."
  },
  {
    icon: Handshake,
    title: "Fair Dealing",
    description: "We promote fair pricing and honest dealings between buyers and sellers."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About BikeHub
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We're revolutionizing the second-hand bike market in Bangladesh by creating 
              a trusted platform where buyers and sellers can connect with confidence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Est. 2020
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                Dhaka, Bangladesh
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Growing Fast
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stat.value}
                    </div>
                    <div className="font-semibold text-foreground mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Our Story
              </h2>
              <p className="text-lg text-muted-foreground">
                How we started and where we're heading
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">The Beginning</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    BikeHub was born from a simple frustration: buying and selling second-hand bikes 
                    in Bangladesh was complicated, risky, and often unreliable. Our founder, 
                    Md. Rahman Khan, experienced this firsthand when trying to sell his bike.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">The Solution</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We created a platform that addresses the core issues: document verification, 
                    transparent pricing, and secure transactions. Every bike on our platform 
                    goes through rigorous verification to ensure authenticity.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">The Future</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're expanding our services to include bike washing, maintenance, and 
                    financing options. Our goal is to become the one-stop solution for all 
                    bike-related needs in Bangladesh.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <Target className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h4 className="text-xl font-semibold mb-2">Our Mission</h4>
                    <p className="text-muted-foreground">
                      To make bike buying and selling safe, transparent, and hassle-free for everyone in Bangladesh.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind BikeHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-muted-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {member.description}
                  </p>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Get In Touch
              </h2>
              <p className="text-lg text-muted-foreground">
                Have questions? We'd love to hear from you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <p className="text-muted-foreground mb-3">Mon-Fri 9AM-6PM</p>
                  <p className="font-medium">+880 1712-345678</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <p className="text-muted-foreground mb-3">We'll respond within 24hrs</p>
                  <p className="font-medium">info@bikehub.bd</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Visit Us</h3>
                  <p className="text-muted-foreground mb-3">Our main office</p>
                  <p className="font-medium">Dhanmondi, Dhaka 1205</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg">
                Contact Us Today
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
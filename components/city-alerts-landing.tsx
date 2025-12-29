"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Bell,
  Shield,
  Zap,
  Users,
  MapPin,
  AlertTriangle,
  Calendar,
  Navigation,
  CheckCircle,
  Phone,
  Mail,
  ArrowRight,
  Menu,
  X,
  Clock,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CityAlertsLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState(0);

  // Mock alert data for the live preview
  const mockAlerts = [
    {
      type: "traffic",
      icon: Navigation,
      text: "Heavy traffic on MG Road - Use alternate route",
      time: "2 mins ago",
    },
    {
      type: "power",
      icon: Zap,
      text: "Power outage in Sector 12 - Restoration by 6 PM",
      time: "15 mins ago",
    },
    {
      type: "event",
      icon: Calendar,
      text: "Community cleanup drive this Sunday at City Park",
      time: "1 hour ago",
    },
    {
      type: "safety",
      icon: Shield,
      text: "Weather advisory: Heavy rain expected tonight",
      time: "3 hours ago",
    },
  ];

  // Rotate through alerts automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlert((prev) => (prev + 1) % mockAlerts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [mockAlerts.length]);

  // Features data
  const features = [
    {
      icon: Bell,
      title: "Real-Time Alerts",
      description:
        "Get instant notifications about traffic, power cuts, roadblocks, and safety concerns in your area",
    },
    {
      icon: MessageCircle,
      title: "No New App Needed",
      description:
        "All updates delivered directly through WhatsApp - the app you already use every day",
    },
    {
      icon: Shield,
      title: "Verified Information",
      description:
        "Trustworthy, reliable updates from official sources - no rumors or misinformation",
    },
    {
      icon: Calendar,
      title: "Community Events",
      description:
        "Stay informed about local happenings, cultural events, and community activities",
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description:
        "Receive updates relevant to your neighborhood and frequently visited areas",
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description:
        "Critical information reaches you in seconds, ensuring you're always prepared",
    },
  ];

  // Alert types
  const alertTypes = [
    {
      name: "Traffic Updates",
      icon: Navigation,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      name: "Power Cuts",
      icon: Zap,
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      name: "Safety Alerts",
      icon: Shield,
      color: "bg-red-500/10 text-red-500",
    },
    {
      name: "Road Blocks",
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      name: "Public Services",
      icon: Users,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      name: "Local Events",
      icon: Calendar,
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  // How it works steps
  const steps = [
    {
      step: "01",
      title: "Send a Message",
      desc: 'Send "SUBSCRIBE" to our WhatsApp number',
      icon: MessageCircle,
    },
    {
      step: "02",
      title: "Choose Your Areas",
      desc: "Select the neighborhoods you want updates from",
      icon: MapPin,
    },
    {
      step: "03",
      title: "Stay Informed",
      desc: "Receive real-time alerts directly in WhatsApp",
      icon: Bell,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                CityAlert
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                How It Works
              </a>
              <a
                href="#coverage"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Coverage
              </a>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Contact
              </a>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full">
                <MessageCircle className="w-5 h-5 mr-2" />
                Subscribe Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <a
                href="#features"
                className="block text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                How It Works
              </a>
              <a
                href="#coverage"
                className="block text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Coverage
              </a>
              <a
                href="#contact"
                className="block text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Contact
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column - Text Content */}
          <div className="space-y-6 animate-fade-in">
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Stay Connected. Stay Informed.
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              Your City&apos;s Updates,
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                Right in WhatsApp
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Real-time alerts about traffic, emergencies, events, and city
              happenings delivered directly to your WhatsApp. No new apps, just
              reliable information when you need it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full text-lg"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                Join via WhatsApp
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full text-lg"
              >
                Learn More
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-muted-foreground font-medium">
                  No App Download
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-muted-foreground font-medium">
                  100% Free
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-muted-foreground font-medium">
                  Verified Info
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Live Notifications Preview */}
          <div className="relative animate-fade-in delay-200">
            <Card className="rounded-3xl border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center relative">
                    <Bell className="w-6 h-6 text-white" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
                  </div>
                  <div>
                    <CardTitle>City Alerts</CardTitle>
                    <CardDescription>Live notifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notification Feed */}
                {mockAlerts.map((alert, idx) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 transition-all duration-300 ${
                        idx === activeAlert
                          ? "ring-2 ring-emerald-500 shadow-md scale-105"
                          : "opacity-60"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium text-sm mb-1">
                            {alert.text}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {alert.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span>Monitoring your city...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alert Types Section */}
      <section className="py-16 px-6 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              What Updates Do You{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                Receive?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Stay informed about everything that matters in your city
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {alertTypes.map((type, idx) => {
              const Icon = type.icon;
              return (
                <Card
                  key={idx}
                  className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-14 h-14 mx-auto mb-3 ${type.color} rounded-full flex items-center justify-center`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-sm">{type.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Why{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                CityAlert
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The simplest way to stay connected with your city&apos;s pulse
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-3">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 border-y">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Get Started in{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative">
                  <div className="text-center">
                    <div className="inline-flex w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full items-center justify-center mb-6 relative">
                      <Icon className="w-10 h-10 text-white" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-10 -right-4 text-emerald-500/30">
                      <ArrowRight className="w-8 h-8" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full text-xl px-10 py-7"
            >
              <MessageCircle className="w-7 h-7 mr-3" />
              Start Getting Alerts Now
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-black mb-2">50K+</div>
              <div className="text-emerald-100 font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">1M+</div>
              <div className="text-emerald-100 font-medium">Alerts Sent</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">100%</div>
              <div className="text-emerald-100 font-medium">Verified Info</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">24/7</div>
              <div className="text-emerald-100 font-medium">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Never Miss a Beat in{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Your City
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of residents who trust CityAlert for reliable,
            real-time updates
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full text-xl px-10 py-7"
            >
              <MessageCircle className="w-7 h-7 mr-3" />
              Subscribe via WhatsApp
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-xl px-10 py-7"
            >
              Learn More
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-8 text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5 text-emerald-500" />
              <span>+1-234-567-8900</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-emerald-500" />
              <span>hello@cityalert.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CityAlert</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Keeping your city connected, one message at a time.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-primary transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#coverage"
                    className="hover:text-primary transition-colors"
                  >
                    Coverage
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-muted-foreground text-sm">
            <p>
              © 2025 CityAlert. All rights reserved. Stay informed, stay safe.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

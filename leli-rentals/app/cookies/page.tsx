import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Cookie, Settings, BarChart3, Shield, ToggleLeft, Info } from "lucide-react"

export default function CookiesPage() {
  const sections = [
    {
      icon: Cookie,
      title: "What Are Cookies",
      content: `Cookies are small text files stored on your device that help us provide a better browsing experience and analyze site usage.`
    },
    {
      icon: Settings,
      title: "Managing Cookies",
      content: `You can control cookie settings through your browser preferences or our cookie consent banner. Some features may not work without cookies.`
    },
    {
      icon: BarChart3,
      title: "Analytics Cookies",
      content: `These cookies help us understand how visitors interact with our website, allowing us to improve our services and user experience.`
    },
    {
      icon: Shield,
      title: "Essential Cookies",
      content: `Required for basic website functionality, security, and to remember your cookie preferences. These cannot be disabled.`
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Cookie className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Cookie Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
              Learn about how we use cookies to enhance your experience on Leli Rentals.
            </p>
            <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-muted-foreground mb-12">
              <p className="text-lg leading-relaxed mb-8">
                This Cookie Policy explains how Leli Rentals uses cookies and similar technologies to recognize you when you visit our website.
                It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">1. What Are Cookies?</h2>
              <p className="mb-8">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website.
                Cookies are widely used by website owners to make their websites work, or to work more efficiently,
                as well as to provide reporting information.
              </p>

              <p className="mb-8">
                Cookies set by the website owner (in this case, Leli Rentals) are called "first-party cookies".
                Cookies set by parties other than the website owner are called "third-party cookies".
                Third-party cookies enable third-party features or functionality to be provided on or through the website
                (e.g., advertising, interactive content, and analytics).
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. Why Do We Use Cookies?</h2>
              <p className="mb-4">We use first-party and third-party cookies for several reasons:</p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To understand how you use our website</li>
                <li>To improve your browsing experience</li>
                <li>To provide personalized content and advertising</li>
                <li>To analyze website traffic and performance</li>
                <li>To ensure website security</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3">Essential Cookies</h3>
              <p className="mb-4">These cookies are necessary for the website to function and cannot be switched off in our systems.</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Authentication cookies:</strong> Help us remember if you're logged in</li>
                <li><strong>Security cookies:</strong> Protect against fraud and unauthorized access</li>
                <li><strong>Load balancing cookies:</strong> Ensure website stability</li>
                <li><strong>Cookie preference cookies:</strong> Remember your cookie settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Analytics Cookies</h3>
              <p className="mb-4">These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Google Analytics:</strong> Helps us understand how visitors interact with our website</li>
                <li><strong>Performance cookies:</strong> Track page load times and errors</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Functional Cookies</h3>
              <p className="mb-4">These cookies enable the website to provide enhanced functionality and personalization.</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Language preferences:</strong> Remember your language settings</li>
                <li><strong>Location data:</strong> Provide location-based services</li>
                <li><strong>User preferences:</strong> Remember your display preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Marketing Cookies</h3>
              <p className="mb-4">These cookies are used to track visitors across websites to display ads that are relevant to their interests.</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Advertising cookies:</strong> Used to deliver relevant advertisements</li>
                <li><strong>Social media cookies:</strong> Enable social media sharing features</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Third-Party Cookies</h2>
              <p className="mb-4">In some cases, we use third-party cookies provided by trusted partners for:</p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>Website analytics and performance monitoring</li>
                <li>Social media integration</li>
                <li>Payment processing</li>
                <li>Customer support chat functionality</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. How Long Do Cookies Last?</h2>
              <p className="mb-4">Cookies can be categorized by their duration:</p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain until deleted or expired (typically 1-2 years)</li>
                <li><strong>Flash cookies:</strong> Used for Adobe Flash content, stored differently</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. How to Control Cookies</h2>
              <p className="mb-4">You have several options to control cookies:</p>

              <h3 className="text-xl font-semibold text-foreground mb-3">Browser Settings</h3>
              <p className="mb-4">Most web browsers allow you to control cookies through their settings preferences.</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Delete existing cookies</li>
                <li>Receive notifications when cookies are set</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Our Cookie Banner</h3>
              <p className="mb-4">
                When you first visit our website, you'll see a cookie banner that allows you to accept or reject non-essential cookies.
                You can change your preferences at any time by clicking the cookie settings link in our footer.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">Opt-Out Links</h3>
              <p className="mb-8">
                For specific third-party services, you can opt out directly:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline">Google Analytics Opt-out</a></li>
                <li><a href="https://www.facebook.com/ads/settings" className="text-primary hover:underline">Facebook Advertising Settings</a></li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Impact of Disabling Cookies</h2>
              <p className="mb-8">
                If you disable cookies, some features of our website may not work properly. For example:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>You may need to log in each time you visit</li>
                <li>Some preferences may not be saved</li>
                <li>Certain interactive features may not function</li>
                <li>Personalized content may not be available</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Updates to This Policy</h2>
              <p className="mb-8">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational,
                legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website
                and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">9. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>Email: lelirentalsmail@gmail.com</li>
                <li>Phone: +254112081866</li>
                <li>Address: 123 Rental Street, Nairobi, Kenya 00100</li>
              </ul>
            </div>

            {/* Key Points Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{section.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

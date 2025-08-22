"use client";

import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using BikeHub's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Our Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  BikeHub operates as a motorcycle purchasing and reselling platform. We directly purchase motorcycles from sellers and then resell them to buyers. We do not facilitate direct transactions between third-party sellers and buyers.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Direct motorcycle purchasing from sellers</li>
                  <li>Professional inspection and verification services</li>
                  <li>Motorcycle reselling to qualified buyers</li>
                  <li>Bike wash and maintenance services</li>
                  <li>Document verification and transfer assistance</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Selling Your Motorcycle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  When you sell your motorcycle to BikeHub:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>You must provide accurate and complete information about your motorcycle</li>
                  <li>You must have legal ownership and all necessary documents</li>
                  <li>The motorcycle must be available for physical inspection</li>
                  <li>Our offer is based on market evaluation and motorcycle condition</li>
                  <li>Payment is made upon successful inspection and document verification</li>
                  <li>All sales are final once payment is completed</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Buying from BikeHub</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  When purchasing a motorcycle from BikeHub:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>All motorcycles are inspected and verified before listing</li>
                  <li>Prices are fixed and non-negotiable</li>
                  <li>Payment must be completed before motorcycle delivery</li>
                  <li>Document transfer is handled by BikeHub</li>
                  <li>Limited warranty may apply as specified in individual listings</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Pricing and Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>All prices are in Bangladeshi Taka (BDT)</li>
                  <li>Prices may change without prior notice</li>
                  <li>Payment methods include cash, bank transfer, and mobile banking</li>
                  <li>Additional fees may apply for document processing</li>
                  <li>Refunds are subject to our refund policy</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  You may not use our service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  BikeHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms & Conditions, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> legal@bikehub.com</p>
                  <p><strong>Phone:</strong> +880 1712-345678</p>
                  <p><strong>Address:</strong> House 123, Road 45, Dhanmondi, Dhaka 1205</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Separator } from '@radix-ui/react-separator'
import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <div>
              {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">BikeHub</h3>
              <p className="text-slate-300 mb-4">
                Your trusted partner for reliable second-hand bikes with verified papers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/listings" className="hover:text-white">Bike Listings</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/sell" className="hover:text-white">Sell Your Bike</Link></li>
                <li><Link href="/wash" className="hover:text-white">Bike Wash</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-300">
                <li>+880-123-456789</li>
                <li>contact@bikehub.com</li>
                <li>123 Bike Street, Dhaka</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-700" />
          
          <div className="text-center text-slate-300">
            <p>&copy; 2024 BikeHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

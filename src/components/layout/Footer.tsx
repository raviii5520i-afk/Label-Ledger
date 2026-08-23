import Link from "next/link";
import { Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-text-main text-white py-12 border-t border-text-main/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg">GlobeTrotter</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Personalized multi-city travel planning platform. Plan less, travel more with intelligent itinerary management and budget intelligence.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm mb-3 text-gray-200">Product</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link href="/trips/create" className="hover:text-white transition-colors">Create Trip</Link></li>
            <li><Link href="/trips/1" className="hover:text-white transition-colors">Itinerary Builder</Link></li>
            <li><Link href="/trips/1/budget" className="hover:text-white transition-colors">Budget Intelligence</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm mb-3 text-gray-200">Explore</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><a href="#destinations" className="hover:text-white transition-colors">Popular Cities</a></li>
            <li><a href="#itineraries" className="hover:text-white transition-colors">Public Trips</a></li>
            <li><Link href="/trip/share/abc123" className="hover:text-white transition-colors">Sample Shared Trip</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm mb-3 text-gray-200">Legal & Support</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} GlobeTrotter Inc. All rights reserved. Designed for multi-city travellers.
      </div>
    </footer>
  );
}

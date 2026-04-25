import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-linear-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6 sm:text-6xl text-primary">
          Rent Your Dream PlayStation Today
        </h1>
        <p className="text-xl text-muted-foreground mb-10">
          Experience the best gaming consoles delivered right to your door. From PS4 to the latest PS5, we've got you covered with affordable hourly rates.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8">
              Start Playing
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
              Login to Account
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-xl border shadow-sm text-center">
            <h3 className="text-2xl font-bold mb-3">Latest Consoles</h3>
            <p className="text-muted-foreground">We stock the newest PS5 units so you can enjoy next-gen graphics.</p>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm text-center">
            <h3 className="text-2xl font-bold mb-3">Affordable Rates</h3>
            <p className="text-muted-foreground">Rent by the hour with transparent pricing and no hidden fees.</p>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm text-center">
            <h3 className="text-2xl font-bold mb-3">Instant Booking</h3>
            <p className="text-muted-foreground">Check real-time availability and secure your unit instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

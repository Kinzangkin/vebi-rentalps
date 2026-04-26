import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveRight, Gamepad2, CreditCard, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Decorative Geometric Shapes */}
      <div className="absolute top-20 left-10 text-blue-500/20 floating" style={{ animationDelay: '0s' }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3L20 18H4L12 3Z" />
        </svg>
      </div>
      <div className="absolute top-40 right-20 text-pink-500/20 floating" style={{ animationDelay: '1s' }}>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <div className="absolute bottom-20 left-1/4 text-purple-500/10 floating" style={{ animationDelay: '2s' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </div>
      <div className="absolute top-1/2 right-1/3 text-green-500/15 floating" style={{ animationDelay: '1.5s' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" />
        </svg>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#00439c] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl italic">P</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">RENTAL<span className="text-[#00439c]">PS</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="#" className="hover:text-black transition-colors">Games</Link>
          <Link href="#" className="hover:text-black transition-colors">Hardware</Link>
          <Link href="#" className="hover:text-black transition-colors">News</Link>
          <Link href="#" className="hover:text-black transition-colors">Help</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#00439c] hover:bg-[#00367d] text-white px-6 rounded-full font-semibold shadow-lg shadow-blue-500/20">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#00439c] text-sm font-bold tracking-wider">
            <Zap className="w-4 h-4 fill-current" />
            NEW GENERATION RENTAL
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-gray-900">
            Play has <br />
            <span className="ps-gradient-text italic">no limits</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
            Rasakan sensasi bermain konsol terbaik dunia langsung dari genggamanmu. Sewa PS5 dan PS4 dengan harga terjangkau dan layanan instan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-[#00439c] hover:bg-[#00367d] text-white px-10 py-7 rounded-full text-lg font-bold shadow-xl shadow-blue-600/30 group">
                Mulai Bermain
                <MoveRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard/customer">
              <Button variant="outline" size="lg" className="px-10 py-7 rounded-full text-lg font-bold border-2 hover:bg-gray-50">
                Lihat Katalog
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-8 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="avatar" />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">
              <span className="text-black font-bold">1,200+</span> Gamer sudah bergabung
            </p>
          </div>
        </div>

        <div className="relative animate-in fade-in slide-in-from-right duration-1000">
          <div className="absolute -inset-10 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=2070&auto=format&fit=crop" 
            alt="PS5 Controller" 
            className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] floating"
          />
          
          {/* Floating Game Preview */}
          <div className="absolute -bottom-10 -left-10 glass p-4 rounded-2xl hidden md:flex items-center gap-4 animate-in zoom-in duration-1000 delay-500">
            <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shadow-inner">
              <img src="https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/679YvS9q7vVXp6s5Yv9vVv9v.png" alt="game" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-sm">God of War Ragnarök</p>
              <p className="text-xs text-gray-500">Tersedia Sekarang</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Konsol Terbaru", desc: "Nikmati grafis masa depan dengan unit PS5 terbaru kami.", icon: <Gamepad2 className="w-8 h-8 text-blue-600" /> },
              { title: "Harga Terjangkau", desc: "Sewa harian atau mingguan dengan harga yang ramah di kantong.", icon: <CreditCard className="w-8 h-8 text-pink-600" /> },
              { title: "Layanan Instan", desc: "Proses booking cepat dan unit siap pakai kapan saja.", icon: <Zap className="w-8 h-8 text-yellow-500" /> },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white p-10 rounded-[2rem] border border-gray-100 hover:border-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
                <div className="mb-6 p-4 rounded-2xl bg-gray-50 w-fit group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 text-center text-gray-400 text-sm font-medium tracking-wide">
        <p>© 2024 RENTAL PS. Play Has No Limits.</p>
      </footer>
    </div>
  );
}

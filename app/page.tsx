import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { ArrowRight, Map, Users, Zap, QrCode, Package, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-white font-bold text-xl">Nextory</span>
          </div>
          {hasEnvVars && <AuthButton />}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              Vivi l Avventura
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              Esplora mondi immersivi, risolvi enigmi e raccogli oggetti nelle tue avventure dal vivo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/player/profile/">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-8">
                  Inizia Ora
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 text-lg px-8">
                Scopri di Più
              </Button>
            </div>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {[
              { icon: Users, label: "Giocatori Attivi", value: "500+" },
              { icon: Map, label: "Avventure", value: "12" },
              { icon: Target, label: "Missioni", value: "150+" },
              { icon: Package, label: "Oggetti Unici", value: "300+" },
            ].map((stat, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Come Funziona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "Scansiona QR Code",
                description: "Trova e scansiona QR code nascosti negli eventi per raccogliere oggetti misteriosi",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Map,
                title: "Esplora Location",
                description: "Usa il GPS per scoprire luoghi segreti e sbloccare nuove missioni",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Zap,
                title: "Completa Missioni",
                description: "Risolvi enigmi, supera sfide e guadagna esperienza per salire di livello",
                color: "from-amber-500 to-orange-500"
              },
            ].map((feature, i) => (
              <Card 
                key={i} 
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/80 transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 backdrop-blur">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pronto per l Avventura?
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Unisciti a centinaia di giocatori e vivi esperienze uniche nei nostri eventi dal vivo
              </p>
              <Link href="/auth/login">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-12">
                  Accedi Ora
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-white font-semibold">Nextory</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2025 Nextory. Uso del motore Evendral sotto licenza. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
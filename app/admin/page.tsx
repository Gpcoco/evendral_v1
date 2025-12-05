import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Calendar, Users, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // Check admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();
  
  if (!userData?.is_admin) redirect('/');

  // Get stats
  const [
    { count: episodesCount },
    { count: itemsCount },
    { count: playersCount },
    { count: nodesCount }
  ] = await Promise.all([
    supabase.from('episodes').select('*', { count: 'exact', head: true }),
    supabase.from('items').select('*', { count: 'exact', head: true }),
    supabase.from('player').select('*', { count: 'exact', head: true }),
    supabase.from('content_nodes').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    { 
      label: 'Episodi Totali', 
      value: episodesCount || 0, 
      icon: Calendar, 
      color: 'from-blue-500 to-cyan-500',
      href: '/admin/episodes',
      buttonText: 'Gestisci Episodi'
    },
    { 
      label: 'Items Catalogo', 
      value: itemsCount || 0, 
      icon: Package, 
      color: 'from-purple-500 to-pink-500',
      href: '/admin/items',
      buttonText: 'Gestisci Items'
    },
    { 
      label: 'Giocatori', 
      value: playersCount || 0, 
      icon: Users, 
      color: 'from-green-500 to-emerald-500',
      href: null,
      buttonText: null
    },
    { 
      label: 'Content Nodes', 
      value: nodesCount || 0, 
      icon: FileText, 
      color: 'from-amber-500 to-orange-500',
      href: null,
      buttonText: null
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">Pannello di controllo Evendral</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="bg-slate-800/60 border-slate-700 hover:bg-slate-800/80 transition-all animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400 mb-4">{stat.label}</div>
                
                {stat.href && (
                  <Link href={stat.href}>
                    <Button 
                      size="sm"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                    >
                      {stat.buttonText}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity placeholder */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">
              Dashboard operativa - Statistiche in tempo reale
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
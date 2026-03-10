import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
    violet: "from-violet-500 to-purple-600 shadow-violet-200",
    blue: "from-blue-500 to-cyan-500 shadow-blue-200",
    amber: "from-amber-400 to-orange-500 shadow-orange-200",
    emerald: "from-emerald-400 to-green-500 shadow-emerald-200",
};

export default function StatCard({ label, value, subtext, icon: Icon, trend, variant = "violet" }) {
    return (
        <div className={cn(
            "relative overflow-hidden p-6 rounded-3xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-br text-white border border-white/10",
            VARIANTS[variant] || VARIANTS.violet
        )}>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Icon size={24} className="text-white" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm bg-white/20",
                            trend === 'up' ? "text-white" : "text-white"
                        )}>
                            {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            <span>{trend === 'up' ? '+12%' : '-2%'}</span>
                        </div>
                    )}
                </div>

                <h3 className="text-sm font-medium opacity-90 mb-1">{label}</h3>
                <p className="text-3xl font-bold tracking-tight">{value}</p>

                {subtext && (
                    <p className="text-xs mt-2 opacity-75 font-medium">{subtext}</p>
                )}
            </div>

            {/* Decorative Background Circles */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-black/5 rounded-full blur-2xl"></div>
        </div>
    );
}

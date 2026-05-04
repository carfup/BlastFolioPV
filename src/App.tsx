import { Info, TrendingUp, Settings } from 'lucide-react';
import React, { useState, useMemo } from 'react';

const CARRIED_RATE = 0.20;
const FLAT_TAX_RATE = 0.314;
const NET_FACTOR = (1 - CARRIED_RATE) * (1 - FLAT_TAX_RATE); // 0.5488

function formatCurrency(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

function formatPercent(n: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n / 100);
}

export default function App() {
  // Configuration State
  const [shares, setShares] = useState<number>(500);
  const [purchasePrice, setPurchasePrice] = useState<number>(1.00);
  const [fees, setFees] = useState<number>(20.00);

  // Approach 1 State
  const [app1Price, setApp1Price] = useState<number>(1.00);

  // Approach 2 State
  const [app2TargetPct, setApp2TargetPct] = useState<number>(50);

  // === Derived Configuration ===
  const totalInvested = (shares * purchasePrice) + fees;
  const pru = shares > 0 ? totalInvested / shares : 0;

  // === Helpers ===
  const calculateTaxes = (brute: number) => {
    if (brute <= 0) return { net: brute, carried: 0, flatTax: 0 };
    const carried = brute * CARRIED_RATE;
    const remaining = brute - carried;
    const flatTax = remaining * FLAT_TAX_RATE;
    const net = brute - carried - flatTax;
    return { net, carried, flatTax };
  };

  const getRequiredPriceForNetPv = (targetNetAmount: number) => {
    if (targetNetAmount <= 0) return pru;
    const requiredBrute = targetNetAmount / NET_FACTOR;
    const requiredTotalCession = totalInvested + requiredBrute;
    return shares > 0 ? requiredTotalCession / shares : 0;
  };

  // === Approach 1 Calculations ===
  const app1TotalCession = shares * app1Price;
  const app1PvBrute = app1TotalCession - totalInvested;
  const app1Taxes = calculateTaxes(app1PvBrute);
  const app1PvNettePct = totalInvested > 0 ? (app1Taxes.net / totalInvested) * 100 : 0;

  // === Approach 2 Calculations ===
  const app2TargetNetPvAmount = totalInvested * (app2TargetPct / 100);
  const app2RequiredPrice = getRequiredPriceForNetPv(app2TargetNetPvAmount);
  const app2TotalCession = shares * app2RequiredPrice;
  const app2PvBrute = app2TotalCession - totalInvested;
  const app2Taxes = calculateTaxes(app2PvBrute);

  // === Thresholds ===
  const thresholdReoupPrice = getRequiredPriceForNetPv(totalInvested);
  const thresholdReoupMultiple = thresholdReoupPrice > 0 ? (thresholdReoupPrice * shares) / totalInvested : 0;

  const thresholdDoublePrice = getRequiredPriceForNetPv(totalInvested * 2);
  const thresholdDoubleMultiple = thresholdDoublePrice > 0 ? (thresholdDoublePrice * shares) / totalInvested : 0;


  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 to-slate-900 p-4 md:p-8 font-sans text-slate-100 relative overflow-hidden">
      {/* Abstract UI Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* Info Banner */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4 text-slate-300 text-sm backdrop-blur-sm shadow-xl">
          <div className="w-10 h-10 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <p className="font-medium leading-relaxed">
            PV nette = PV brute &times; (1 − 20% carried) &times; (1 − 31,4% flat tax) = PV brute &times; <strong className="text-white">0.5488</strong>
          </p>
        </div>

        {/* Configuration Section  */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-800 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8 text-white font-semibold border-b border-slate-800 pb-5">
            <Settings className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl tracking-tight">Paramètres d'investissement</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Nombre d'actions / parts</label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-4 px-5 text-xl font-mono text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Prix d'achat unitaire (€)</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-4 px-5 text-xl font-mono text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Frais inclus (€)</label>
              <input
                type="number"
                step="0.01"
                value={fees}
                onChange={(e) => setFees(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-4 px-5 text-xl font-mono text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-800">
            <div className="bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-800/80">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Total investi</span>
              <span className="text-3xl font-bold text-white font-mono">{formatCurrency(totalInvested)}</span>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-800/80">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Nombre de parts</span>
              <span className="text-3xl font-bold text-white font-mono">{shares}</span>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-800/80">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">PRU moyen</span>
              <span className="text-3xl font-bold text-white font-mono">{formatCurrency(pru)}</span>
            </div>
          </div>
        </div>

        {/* Main Approaches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Approach 1 */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="bg-slate-800/30 p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white tracking-tight">Approche 1 — Prix de cession</h2>
              <p className="text-sm text-slate-400 mt-2">Je connais le prix de vente → quel sera mon gain net ?</p>
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-3">Prix de cession par action</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    value={app1Price}
                    onChange={(e) => setApp1Price(Number(e.target.value) || 0)}
                    className="bg-slate-950 border border-slate-700 rounded-lg py-4 px-5 text-xl font-mono text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all w-48 shadow-inner"
                  />
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">€ / action</span>
                </div>
                <div className="mt-4 text-sm font-medium text-slate-400">
                  Total cession : <span className="font-mono text-emerald-400 font-bold ml-1">{formatCurrency(app1TotalCession)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-10">
                <button 
                  onClick={() => setApp1Price(pru)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded border border-slate-700 transition-colors shadow-sm"
                >
                  Seuil PV nette (P &gt; PRU)
                </button>
                <button 
                  onClick={() => setApp1Price(thresholdReoupPrice)}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded border border-emerald-500/20 transition-colors shadow-sm"
                >
                  Récupérer sa mise
                </button>
                <button 
                  onClick={() => setApp1Price(thresholdDoublePrice)}
                  className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-500/20 transition-colors shadow-sm"
                >
                  Doubler sa mise
                </button>
              </div>

              <div className="mt-auto space-y-5 pt-8 border-t border-slate-800 px-2 text-sm font-medium">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Valeur de cession totale</span>
                  <span className="font-mono text-base">{formatCurrency(app1TotalCession)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Montant investi</span>
                  <span className="font-mono text-base">− {formatCurrency(totalInvested)}</span>
                </div>
                
                <div className={`flex justify-between items-center pt-5 border-t border-slate-800 ${app1PvBrute >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className="uppercase tracking-[0.1em] text-xs font-bold">Plus-value brute</span>
                  <span className="font-mono text-lg">{app1PvBrute > 0 ? '+' : ''}{formatCurrency(app1PvBrute)}</span>
                </div>
                
                {app1PvBrute > 0 && (
                  <div className="flex justify-between items-center text-orange-400/80 text-sm">
                    <span>Carried interest (20%)</span>
                    <span className="font-mono">− {formatCurrency(app1Taxes.carried)}</span>
                  </div>
                )}
                {app1PvBrute > 0 && (
                  <div className="flex justify-between items-center text-orange-400/80 text-sm">
                    <span>Flat Tax / PFU (31,4%)</span>
                    <span className="font-mono">− {formatCurrency(app1Taxes.flatTax)}</span>
                  </div>
                )}

                <div className={`flex justify-between items-center mt-5 p-5 rounded-xl border ${app1Taxes.net >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  <span className="uppercase tracking-[0.1em] text-sm font-bold text-white">Plus-value nette</span>
                  <span className="flex items-baseline gap-2 font-mono text-2xl font-bold">
                    {app1Taxes.net > 0 ? '+' : ''}{formatCurrency(app1Taxes.net)}
                    <span className="text-sm font-sans font-medium opacity-80 tracking-normal ml-1">
                      ({app1Taxes.net > 0 ? '+' : ''}{formatPercent(app1PvNettePct)})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Approach 2 */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="bg-slate-800/30 p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white tracking-tight">Approche 2 — Objectif de PV nette</h2>
              <p className="text-sm text-slate-400 mt-2">Je vise un gain net de X% → à quel prix dois-je vendre ?</p>
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-3">Objectif de plus-value nette</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={app2TargetPct}
                    onChange={(e) => setApp2TargetPct(Number(e.target.value) || 0)}
                    className="bg-slate-950 border border-slate-700 rounded-lg py-4 px-5 text-xl font-mono text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all w-32 shadow-inner"
                  />
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">% de PV nette</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-10">
                <button onClick={() => setApp2TargetPct(0)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded border border-slate-700 transition-colors shadow-sm">Seuil PV</button>
                <button onClick={() => setApp2TargetPct(25)} className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-500/20 transition-colors shadow-sm">+25%</button>
                <button onClick={() => setApp2TargetPct(50)} className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-500/20 transition-colors shadow-sm">+50%</button>
                <button onClick={() => setApp2TargetPct(100)} className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-500/20 transition-colors shadow-sm">+100%</button>
                <button onClick={() => setApp2TargetPct(200)} className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-500/20 transition-colors shadow-sm">+200%</button>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 mb-8 shadow-inner">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-2">Prix de cession requis</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white font-mono">{formatCurrency(app2RequiredPrice)}</span>
                      <span className="text-sm font-bold uppercase tracking-widest text-slate-500">/ action</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-2 font-medium">Total cession : <span className="font-mono text-white ml-1">{formatCurrency(app2TotalCession)}</span></div>
                  </div>
                  <button 
                    onClick={() => setApp1Price(app2RequiredPrice)}
                    className="text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 border-b border-transparent hover:border-blue-300 transition-colors mt-2 pb-0.5"
                  >
                    Utiliser dans l'App 1 →
                  </button>
                </div>
              </div>

              <div className="mt-auto space-y-4 pt-4 px-2 text-sm font-medium">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Valeur de cession totale</span>
                  <span className="font-mono text-base">{formatCurrency(app2TotalCession)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Montant investi</span>
                  <span className="font-mono text-base">− {formatCurrency(totalInvested)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-emerald-400">
                  <span className="uppercase tracking-[0.1em] text-xs font-bold">Plus-value brute</span>
                  <span className="font-mono text-lg">+{formatCurrency(app2PvBrute)}</span>
                </div>
                
                {app2PvBrute > 0 && (
                  <div className="flex justify-between items-center text-orange-400/80 text-sm">
                    <span>Carried interest (20%)</span>
                    <span className="font-mono">− {formatCurrency(app2Taxes.carried)}</span>
                  </div>
                )}
                {app2PvBrute > 0 && (
                  <div className="flex justify-between items-center text-orange-400/80 text-sm">
                    <span>Flat Tax / PFU (31,4%)</span>
                    <span className="font-mono">− {formatCurrency(app2Taxes.flatTax)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-5 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <span className="uppercase tracking-[0.1em] text-sm font-bold text-white">Plus-value nette</span>
                  <span className="flex items-baseline gap-2 font-mono text-2xl font-bold">
                    {app2Taxes.net > 0 ? '+' : ''}{formatCurrency(app2Taxes.net)}
                    <span className="text-sm font-sans font-medium opacity-80 tracking-normal ml-1">
                      ({app2TargetPct > 0 ? '+' : ''}{formatPercent(app2TargetPct)})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Thresholds */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden relative z-10 shadow-xl">
          <div className="bg-slate-800/30 uppercase text-xs tracking-[0.2em] font-bold text-slate-400 p-5 border-b border-slate-800">
            Seuils de référence
          </div>
          <div className="divide-y divide-slate-800">
            
            <div className="p-5 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-800/50 transition-colors gap-4">
              <div>
                <div className="flex items-center gap-3 text-white font-semibold mb-2">
                  <TrendingUp className="w-5 h-5 text-slate-500" />
                  <span className="tracking-wide text-lg">Seuil PV nette <span className="text-slate-500 font-mono text-xs ml-2 tracking-normal uppercase">(P &gt; PRU)</span></span>
                </div>
                <div className="text-sm text-slate-400 ml-8">Toute cession au-dessus du PRU génère une PV nette positive</div>
              </div>
              <div className="text-left md:text-right ml-8 md:ml-0">
                <div className="font-bold text-xl text-white font-mono">{formatCurrency(pru)} <span className="text-xs text-slate-500 uppercase tracking-widest font-sans font-bold ml-1">/ part</span></div>
                <div className="text-sm text-slate-500 mt-1 font-mono">Total : {formatCurrency(totalInvested)}</div>
              </div>
            </div>

            <div className="p-5 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-emerald-500/5 transition-colors gap-4">
              <div>
                <div className="flex items-center gap-3 text-emerald-400 font-semibold mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="tracking-wide text-lg">Récupérer sa mise</span>
                </div>
                <div className="text-sm text-slate-400 ml-8">Multiple brut requis : <span className="font-mono text-emerald-400/80">{thresholdReoupMultiple.toFixed(2)}x</span></div>
              </div>
              <div className="text-left md:text-right ml-8 md:ml-0">
                <div className="font-bold text-xl text-emerald-400 font-mono">{formatCurrency(thresholdReoupPrice)} <span className="text-xs text-emerald-500/50 uppercase tracking-widest font-sans font-bold ml-1">/ part</span></div>
                <div className="text-sm text-emerald-400/60 mt-1 font-mono">Total : {formatCurrency(thresholdReoupPrice * shares)}</div>
              </div>
            </div>

            <div className="p-5 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-blue-500/5 transition-colors gap-4">
              <div>
                <div className="flex items-center gap-3 text-blue-400 font-semibold mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="tracking-wide text-lg">Doubler sa mise</span>
                </div>
                <div className="text-sm text-slate-400 ml-8">Multiple brut requis : <span className="font-mono text-blue-400/80">{thresholdDoubleMultiple.toFixed(2)}x</span></div>
              </div>
              <div className="text-left md:text-right ml-8 md:ml-0">
                <div className="font-bold text-xl text-blue-400 font-mono">{formatCurrency(thresholdDoublePrice)} <span className="text-xs text-blue-500/50 uppercase tracking-widest font-sans font-bold ml-1">/ part</span></div>
                <div className="text-sm text-blue-400/60 mt-1 font-mono">Total : {formatCurrency(thresholdDoublePrice * shares)}</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

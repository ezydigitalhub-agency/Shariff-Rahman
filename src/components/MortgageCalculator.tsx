import React, { useState, useMemo } from "react";
import { DollarSign, Percent, Calendar, Calculator, Check, ArrowUpRight } from "lucide-react";

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(5.89);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [frequency, setFrequency] = useState<"monthly" | "fortnightly" | "weekly">("monthly");

  const results = useMemo(() => {
    const r = (interestRate / 100) / 12;
    const n = loanTerm * 12;
    
    // Monthly payment calculation formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    let monthlyRepayment = 0;
    if (r === 0) {
      monthlyRepayment = loanAmount / n;
    } else {
      monthlyRepayment = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalCostOfLoan = monthlyRepayment * n;
    const totalInterest = totalCostOfLoan - loanAmount;

    // Adjust for payment frequency
    let repaymentAmount = monthlyRepayment;
    let multiplier = 1;
    if (frequency === "fortnightly") {
      repaymentAmount = (monthlyRepayment * 12) / 26;
      multiplier = 26;
    } else if (frequency === "weekly") {
      repaymentAmount = (monthlyRepayment * 12) / 52;
      multiplier = 52;
    }

    return {
      repaymentAmount: Math.round(repaymentAmount),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCostOfLoan),
    };
  }, [loanAmount, interestRate, loanTerm, frequency]);

  const formatter = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="w-full bg-zinc-950/40 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 hover:border-blue-500/40 transition duration-300">
      
      {/* Title & Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white tracking-tight">Interactive Help: Repayment Estimator</h4>
          <p className="text-zinc-400 text-xs mt-1">Estimate your payments based on current Australian market rates.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Sliders Input Block (Col-7) */}
        <div className="md:col-span-7 space-y-6">
          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-zinc-400" />
                Loan Amount
              </label>
              <span className="font-mono text-zinc-100 font-semibold bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-md text-xs">
                {formatter.format(loanAmount)}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="2500000"
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>$50k</span>
              <span>$1.2M</span>
              <span>$2.5M</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-zinc-400" />
                Interest Rate (p.a.)
              </label>
              <span className="font-mono text-zinc-100 font-semibold bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-md text-xs">
                {interestRate.toFixed(2)}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="0.05"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>1.0%</span>
              <span>6.0% (Average)</span>
              <span>12.0%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                Loan Term
              </label>
              <span className="font-mono text-zinc-100 font-semibold bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-md text-xs">
                {loanTerm} Years
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>5 Yrs</span>
              <span>15 Yrs</span>
              <span>30 Yrs</span>
            </div>
          </div>

          {/* Payment Frequency Toggle */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs font-medium block">REPAYMENT FREQUENCY</label>
            <div className="grid grid-cols-3 gap-2 bg-zinc-950/80 p-1 border border-zinc-900 rounded-xl">
              {(["weekly", "fortnightly", "monthly"] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2 text-xs font-medium capitalize rounded-lg transition ${
                    frequency === freq
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Calculations Area (Col-5) */}
        <div className="md:col-span-5 bg-zinc-950/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider font-mono">Estimated Payments</span>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-3xl font-bold text-blue-400 tracking-tight font-display">
                  {formatter.format(results.repaymentAmount)}
                </h3>
                <span className="text-sm text-zinc-400 font-medium">/{frequency.replace("ly", "")}</span>
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Principal Loan:</span>
                <span className="font-mono text-zinc-300 font-medium">{formatter.format(loanAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Total Interest Paid:</span>
                <span className="font-mono text-blue-400/90 font-medium">{formatter.format(results.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Total Cost of Loan:</span>
                <span className="font-mono text-zinc-100 font-medium">{formatter.format(results.totalCost)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-900 text-xs text-zinc-400 space-y-3">
            <div className="flex items-start gap-1.5 text-[11px] leading-relaxed">
              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>Shariff Rahman handles submissions across <b>31+ banks and lenders</b> including ANZ, CBA, NAB, & Westpac.</span>
            </div>
            <a
              href="#contact"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium rounded-lg border border-blue-500/20 transition group"
            >
              Request Free Rate Quote
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}

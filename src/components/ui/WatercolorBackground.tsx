import React from 'react';
export function WatercolorBackground({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`relative min-h-screen w-full overflow-hidden bg-background ${className || ''}`}>
      {/* Abstract Watercolor Shapes */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#839362] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.08] animate-pulse duration-[10000ms]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#A4B484] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.08] animate-pulse duration-[12000ms] delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-[#D4D9C8] rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.15] animate-pulse duration-[15000ms] delay-2000" />
      </div>

      <div className="relative z-10 h-full">{children}</div>
    </div>;
}
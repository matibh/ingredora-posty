import React from 'react';

export default function FlowCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center w-20 h-20 md:w-24 md:h-24 glass hover-glow ${className ?? ''}`}> 
      {children}
    </div>
  );
}

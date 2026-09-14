import React from 'react';

const SuccessMessage = ({ message = 'Operation completed successfully.', icon = '✓' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="w-16 h-16 bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-2xl font-cormorant">
      {icon}
    </div>
    <p className="font-cinzel text-sm tracking-[3px] uppercase text-gold">{message}</p>
  </div>
);

export default SuccessMessage;

import React from 'react';

interface TooltipProps {
  message: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ message, children }) => {
  return (
    <div className='tooltip-container'>
      {children}
      <span className='tooltip-message'>{message}</span>
      <style jsx>{`
        .tooltip-container {
          position: relative;
          display: inline-block;
        }
        .tooltip-message {
          visibility: hidden;
          background-color: black;
          color: #fff;
          text-align: center;
          border-radius: 4px;
          padding: 5px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tooltip-container:hover .tooltip-message {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Tooltip;

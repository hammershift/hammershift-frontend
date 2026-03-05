/**
 * Connection Status Indicator
 *
 * Displays the real-time connection status for Socket.IO.
 * Shows: "Live" | "Connecting..." | "Disconnected"
 */

'use client';

import React from 'react';

export interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function ConnectionStatus({
  isConnected,
  isLoading = false,
  error = null,
  className = '',
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    if (error) {
      return {
        label: 'Disconnected',
        color: 'bg-red-500',
        textColor: 'text-red-600',
        pulseColor: 'bg-red-400',
      };
    }

    if (isLoading || !isConnected) {
      return {
        label: 'Connecting...',
        color: 'bg-amber-500',
        textColor: 'text-amber-600',
        pulseColor: 'bg-amber-400',
      };
    }

    return {
      label: 'Live',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      pulseColor: 'bg-green-400',
    };
  };

  const status = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status indicator dot with pulse animation */}
      <div className="relative flex h-3 w-3">
        {isConnected && !error && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.pulseColor} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${status.color}`}></span>
      </div>

      {/* Status label */}
      <span className={`text-sm font-medium ${status.textColor}`}>
        {status.label}
      </span>

      {/* Error message tooltip */}
      {error && (
        <span className="text-xs text-gray-500 ml-1" title={error}>
          (hover for details)
        </span>
      )}
    </div>
  );
}

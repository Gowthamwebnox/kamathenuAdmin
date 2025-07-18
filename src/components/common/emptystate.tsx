// src/components/common/EmptyState.tsx
import React from 'react';
import { Package, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  showRefresh?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No results found",
  description = "There are no items to display at this time.",
  icon = <Package size={40} />,
  actionLabel,
  onAction,
  showRefresh = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      
      <div className="flex gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
        
        {showRefresh && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
};

export const NoSearchResults: React.FC<{ searchTerm: string; onClear: () => void }> = ({
  searchTerm,
  onClear
}) => {
  return (
    <EmptyState
      icon={<Search size={40} />}
      title="No matching results"
      description={`We couldn't find any items matching "${searchTerm}". Try adjusting your search or filters.`}
      actionLabel="Clear Search"
      onAction={onClear}
    />
  );
};

export const NoOrders: React.FC = () => {
  return (
    <EmptyState
      title="No orders yet"
      description="There are no orders to display at this time. New orders will appear here when customers make purchases."
      showRefresh={true}
    />
  );
};
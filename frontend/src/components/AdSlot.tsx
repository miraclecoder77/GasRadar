import React from 'react';

interface AdSlotProps {
    id: string;
    type: 'display' | 'native' | 'in-feed';
    isVisible?: boolean;
}

export const AdSlot: React.FC<AdSlotProps> = ({ id, type, isVisible = true }) => {
    if (!isVisible) return null;

    return (
        <div className={`ad-container ad-type-${type} my-8`}>
            <div className="text-[10px] text-m3-on-surface-variant uppercase tracking-widest mb-2 opacity-50">
                Advertisement
            </div>
            <div
                id={id}
                className="w-full min-h-[100px] bg-m3-surface-variant/20 rounded-2xl flex items-center justify-center border border-dashed border-m3-outline/30 relative overflow-hidden"
            >
                <div className="text-sm font-medium text-m3-on-surface-variant opacity-30">
                    AdSense {type.toUpperCase()} Slot
                </div>
                {/* AdSense Script placeholder */}
                {/* <ins className="adsbygoogle" ... /> */}
            </div>
        </div>
    );
};

'use client';

import { motion } from 'motion/react';
import { Map, MapPin, Plus } from 'lucide-react';

type MobileTabType = 'itinerary' | 'nearby' | 'map' | 'food' | 'activities';

interface BottomNavBarProps {
  activeTab: MobileTabType;
  onTabChange: (tab: MobileTabType) => void;
  onAddPress: () => void;
}

export default function BottomNavBar({
  activeTab,
  onTabChange,
  onAddPress,
}: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-3 safe-area-pb">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Map Button */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'map' ? 'text-[#5C6B4A]' : 'text-muted'
          }`}
        >
          <Map size={22} strokeWidth={activeTab === 'map' ? 2 : 1.5} />
          <span className="text-xs font-medium">Map</span>
        </button>

        {/* FAB Button */}
        <motion.button
          onClick={onAddPress}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 -mt-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#5C6B4A' }}
        >
          <Plus size={28} className="text-white" strokeWidth={2} />
        </motion.button>

        {/* Nearby Button */}
        <button
          onClick={() => onTabChange('nearby')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'nearby' ? 'text-[#5C6B4A]' : 'text-muted'
          }`}
        >
          <MapPin size={22} strokeWidth={activeTab === 'nearby' ? 2 : 1.5} />
          <span className="text-xs font-medium">Nearby</span>
        </button>
      </div>
    </div>
  );
}

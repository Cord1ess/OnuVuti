import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Impairment = 'visual' | 'deaf' | 'mute';
export type ColorBlindType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

interface TTSSettings {
  rate: number;
  pitch: number;
  voice: string;
}

interface AccessibilityContextType {
  selectedImpairments: Impairment[];
  toggleImpairment: (impairment: Impairment) => void;
  isVisuallyImpaired: boolean;
  isDeaf: boolean;
  isMute: boolean;
  // New Settings
  colorBlindMode: ColorBlindType;
  setColorBlindMode: (mode: ColorBlindType) => void;
  ttsSettings: TTSSettings;
  setTTSSetting: (key: keyof TTSSettings, value: any) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedImpairments, setSelectedImpairments] = useState<Impairment[]>([]);
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindType>('none');
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({
    rate: 1.1,
    pitch: 1.0,
    voice: 'default'
  });

  const toggleImpairment = (impairment: Impairment) => {
    setSelectedImpairments((prev) =>
      prev.includes(impairment)
        ? prev.filter((i) => i !== impairment)
        : [...prev, impairment]
    );
  };

  const setTTSSetting = (key: keyof TTSSettings, value: any) => {
    setTtsSettings(prev => ({ ...prev, [key]: value }));
  };

  const isVisuallyImpaired = selectedImpairments.includes('visual');
  const isDeaf = selectedImpairments.includes('deaf');
  const isMute = selectedImpairments.includes('mute');

  // Apply color blind filters to the root element
  useState(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const modes: ColorBlindType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
      modes.forEach(m => root.classList.remove(`cb-${m}`));
      if (colorBlindMode !== 'none') root.classList.add(`cb-${colorBlindMode}`);
    }
  });

  // Effect to sync document classes
  useEffect(() => {
    const root = document.documentElement;
    const modes: ColorBlindType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
    modes.forEach(m => root.classList.remove(`cb-${m}`));
    if (colorBlindMode !== 'none') root.classList.add(`cb-${colorBlindMode}`);
  }, [colorBlindMode]);

  return (
    <AccessibilityContext.Provider
      value={{
        selectedImpairments,
        toggleImpairment,
        isVisuallyImpaired,
        isDeaf,
        isMute,
        colorBlindMode,
        setColorBlindMode,
        ttsSettings,
        setTTSSetting
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

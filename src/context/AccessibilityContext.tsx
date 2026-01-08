import { createContext, useContext, useState, type ReactNode } from 'react';

export type Impairment = 'visual' | 'deaf' | 'mute';

interface AccessibilityContextType {
  selectedImpairments: Impairment[];
  toggleImpairment: (impairment: Impairment) => void;
  isVisuallyImpaired: boolean;
  isDeaf: boolean;
  isMute: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedImpairments, setSelectedImpairments] = useState<Impairment[]>([]);

  const toggleImpairment = (impairment: Impairment) => {
    setSelectedImpairments((prev) =>
      prev.includes(impairment)
        ? prev.filter((i) => i !== impairment)
        : [...prev, impairment]
    );
  };

  const isVisuallyImpaired = selectedImpairments.includes('visual');
  const isDeaf = selectedImpairments.includes('deaf');
  const isMute = selectedImpairments.includes('mute');

  return (
    <AccessibilityContext.Provider
      value={{
        selectedImpairments,
        toggleImpairment,
        isVisuallyImpaired,
        isDeaf,
        isMute,
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

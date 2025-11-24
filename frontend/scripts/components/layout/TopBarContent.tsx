import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TopBarContentProps {
  children: ReactNode;
}

/**
 * Composant pour rendre du contenu dans la TopBar via un portail React
 * Le portail préserve le contexte React tout en rendant dans un DOM différent
 *
 * @example
 * ```tsx
 * <TopBarContent>
 *   <ConsommationControls />
 * </TopBarContent>
 * ```
 */
export const TopBarContent: React.FC<TopBarContentProps> = ({ children }) => {
  const topBarSlot = document.getElementById('topbar-slot');

  if (!topBarSlot) {
    return null;
  }

  return createPortal(children, topBarSlot);
};

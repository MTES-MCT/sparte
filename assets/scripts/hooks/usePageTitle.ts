import { useEffect } from "react";

/**
 * Hook pour mettre à jour le titre de la page.
 * @param title - Le titre de la page.
 */
const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | Mon Diagnostic Artificialisation`;
  }, [title]);
};

export default usePageTitle;

import { useEffect, useState } from "react";

export const useHtmlLoader = (endpoint: string) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(endpoint, {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to load content from ${endpoint}`);
        }
        const data = await response.text();
        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [endpoint]);

  return { content, isLoading, error };
};

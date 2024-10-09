import { useEffect, useState } from 'react';

interface UrlsData {
    [key: string]: string;
}

const useUrls = (): UrlsData | null => {
    const [urls, setUrls] = useState<UrlsData | null>(null);

    useEffect(() => {
        const urlsElement = document.getElementById('urls-data');
        if (urlsElement) {
            const data = JSON.parse(urlsElement.textContent || '{}');

            // Gérer les accents dans les urls
            const decodedUrls: UrlsData = Object.keys(data.urls).reduce((acc, key) => {
                acc[key] = decodeURIComponent(data.urls[key]);
                return acc;
            }, {} as UrlsData);

            setUrls(decodedUrls);
        }
    }, []);

    return urls;
};

export default useUrls;

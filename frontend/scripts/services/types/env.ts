export type UseEnvTypes = (arg: {}) => {
    data?: {
        vector_tiles_location: string;
        matomo_container_src: string;
        export_server_url: string;
        pdf_header_url: string;
        pdf_footer_url: string;
    }
    isLoading: boolean;
    error?: any;
    refetch: () => void;
}
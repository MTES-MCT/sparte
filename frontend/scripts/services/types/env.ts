export type UseEnvTypes = (arg: {}) => {
    data?: {
        vector_tiles_location: string;
        matomo_container_src: string;
    }
    isLoading: boolean;
    error?: any;
    refetch: () => void;
}
import { useCallback } from "react";
import { useGetCurrentUserQuery } from "@services/api";
import { showAuthRequiredToast } from "@components/ui/Toast";

interface UseAuthGuardOptions {
    message?: string;
    redirectUrl?: string;
}

interface UseAuthGuardReturn {
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUser: ReturnType<typeof useGetCurrentUserQuery>["data"];
    guardedAction: (action: () => void) => void;
}

export const useAuthGuard = (options?: UseAuthGuardOptions): UseAuthGuardReturn => {
    const { data: currentUser, isLoading } = useGetCurrentUserQuery();

    const isAuthenticated = currentUser?.is_authenticated ?? false;

    const guardedAction = useCallback(
        (action: () => void) => {
            if (!isAuthenticated) {
                showAuthRequiredToast(options?.message, options?.redirectUrl);
                return;
            }
            action();
        },
        [isAuthenticated, options?.message, options?.redirectUrl]
    );

    return {
        isAuthenticated,
        isLoading,
        currentUser,
        guardedAction,
    };
};

export default useAuthGuard;

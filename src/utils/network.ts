/**
 * Network connectivity utilities
 * Provides offline detection and connection monitoring
 */

import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

/**
 * Network service for checking connectivity status
 */
export const networkService = {
  /**
   * Check if device is online (has network connection)
   * @returns Promise<boolean> - true if connected to network
   */
  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.warn("[Network] Failed to check connection status:", error);
      // Assume online if we can't check (fail open)
      return true;
    }
  },

  /**
   * Check if internet is actually reachable (not just connected to WiFi)
   * @returns Promise<boolean> - true if internet is reachable
   */
  async isInternetReachable(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isInternetReachable ?? false;
    } catch (error) {
      console.warn("[Network] Failed to check internet reachability:", error);
      return false;
    }
  },

  /**
   * Get full network state
   * @returns Promise<NetworkState>
   */
  async getNetworkState(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected ?? null,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type || null,
      };
    } catch (error) {
      console.error("[Network] Failed to get network state:", error);
      return {
        isConnected: null,
        isInternetReachable: null,
        type: null,
      };
    }
  },

  /**
   * Get IP address
   * @returns Promise<string | null>
   */
  async getIpAddress(): Promise<string | null> {
    try {
      const state = await NetInfo.fetch();
      return (state.details as any)?.ipAddress || null;
    } catch (error) {
      console.warn("[Network] Failed to get IP address:", error);
      return null;
    }
  },

  /**
   * Ensure function only runs when online
   * Throws error if offline
   *
   * @example
   * ```typescript
   * await networkService.requireOnline(async () => {
   *   return await api.fetchData();
   * });
   * ```
   */
  async requireOnline<T>(fn: () => Promise<T>): Promise<T> {
    const isOnline = await this.isOnline();
    if (!isOnline) {
      throw new Error(
        "No internet connection. Please check your network and try again.",
      );
    }
    return fn();
  },

  /**
   * Execute function with offline fallback
   *
   * @example
   * ```typescript
   * const data = await networkService.withOfflineFallback(
   *   async () => await api.fetchData(),
   *   async () => await localDb.getData()
   * );
   * ```
   */
  async withOfflineFallback<T>(
    onlineFn: () => Promise<T>,
    offlineFn: () => Promise<T>,
  ): Promise<T> {
    const isOnline = await this.isOnline();
    if (isOnline) {
      try {
        return await onlineFn();
      } catch (error) {
        console.warn(
          "[Network] Online function failed, falling back to offline:",
          error,
        );
        return await offlineFn();
      }
    }
    return await offlineFn();
  },
};

/**
 * React hook for monitoring network connectivity
 * @returns NetworkState - Current network connection state
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const network = useNetworkStatus();
 *
 *   if (network.isConnected === false) {
 *     return <Text>You are offline</Text>;
 *   }
 *
 *   return <Text>You are online</Text>;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    // Initial check
    networkService.getNetworkState().then(setNetworkState);

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkState({
        isConnected: state.isConnected ?? null,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type || null,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkState;
}

/**
 * React hook that returns a boolean indicating if device is online
 * @returns boolean | null - true if online, false if offline, null if unknown
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const isOnline = useIsOnline();
 *
 *   return <Text>{isOnline ? 'Online' : 'Offline'}</Text>;
 * }
 * ```
 */
export function useIsOnline(): boolean | null {
  const { isConnected } = useNetworkStatus();
  return isConnected;
}

/**
 * Check if an error is network-related
 * @param error - Error object to check
 * @returns boolean - true if error is network-related
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  const message = error.message?.toLowerCase() || "";
  const name = error.name?.toLowerCase() || "";

  const networkKeywords = [
    "network",
    "timeout",
    "connection",
    "fetch failed",
    "failed to fetch",
    "networkerror",
    "no internet",
    "offline",
  ];

  return (
    networkKeywords.some((keyword) => message.includes(keyword)) ||
    networkKeywords.some((keyword) => name.includes(keyword)) ||
    error.code === "NETWORK_ERROR" ||
    error.code === "ECONNREFUSED" ||
    error.code === "ETIMEDOUT"
  );
}

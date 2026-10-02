import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RequestListItem } from './requestService';

const REQUEST_CACHE_KEY = '@sahatakip/requests-cache';

export const saveCachedRequests = async (
  requests: RequestListItem[],
): Promise<void> => {
  try {
    const cachedRequests = await getCachedRequests();

    const updatedRequests = requests.map((request) => {
      const cachedRequest = cachedRequests?.find(
        (item) => item.id === request.id,
      );

      return {
        ...request,
        assignedStaffName:
          request.assignedStaffName ??
          cachedRequest?.assignedStaffName ??
          null,
      };
    });

    await AsyncStorage.setItem(
      REQUEST_CACHE_KEY,
      JSON.stringify(updatedRequests),
    );
  } catch (error) {
    console.error(
      'Talepler cache kaydedilemedi:',
      error,
    );
  }
};

export const getCachedRequests =
  async (): Promise<RequestListItem[] | null> => {
    try {
      const cachedData = await AsyncStorage.getItem(
        REQUEST_CACHE_KEY,
      );

      if (!cachedData) {
        return null;
      }

      return JSON.parse(
        cachedData,
      ) as RequestListItem[];
    } catch (error) {
      console.error(
        'Talepler cache okunamadı:',
        error,
      );

      return null;
    }
  };

export const saveCachedRequest = async (
  request: RequestListItem,
): Promise<void> => {
  try {
    const cachedRequests = await getCachedRequests();

    const currentRequests = cachedRequests ?? [];

    const existingRequest = currentRequests.find(
      (item) => item.id === request.id,
    );

    const updatedRequest = {
      ...request,
      assignedStaffName:
        request.assignedStaffName ??
        existingRequest?.assignedStaffName ??
        null,
    };

    const updatedRequests = currentRequests.filter(
      (item) => item.id !== request.id,
    );

    updatedRequests.unshift(updatedRequest);

    await AsyncStorage.setItem(
      REQUEST_CACHE_KEY,
      JSON.stringify(updatedRequests),
    );
  } catch (error) {
    console.error(
      'Talep detayı cache kaydedilemedi:',
      error,
    );
  }
};

export const getCachedRequest = async (
  requestId: string,
): Promise<RequestListItem | null> => {
  try {
    const cachedRequests = await getCachedRequests();

    if (!cachedRequests) {
      return null;
    }

    return (
      cachedRequests.find(
        (request) => request.id === requestId,
      ) ?? null
    );
  } catch (error) {
    console.error(
      'Talep detayı cache okunamadı:',
      error,
    );

    return null;
  }
};

export const clearCachedRequests =
  async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(
        REQUEST_CACHE_KEY,
      );
    } catch (error) {
      console.error(
        'Talepler cache temizlenemedi:',
        error,
      );
    }
  };
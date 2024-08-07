import { ctxUrl } from '@/utils/multi-ctx';
import { api } from './index';

const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLoggedInUser: builder.query({
      query: () => `user`,
      method: 'GET',
    }),
    getUserById: builder.query({
      query: (id) => `user/profile/${id}`,
      method: 'GET',
    }),
    getToken: builder.query({
      query: () => `token`,
      method: 'GET',
    }),
    getUserPref: builder.query({
      query: () => 'user/prefs',
      method: 'GET',
    }),
    getUserPrefWithContext: builder.query({
      query: (selectedK8sContexts) => ({
        url: ctxUrl('user/prefs', selectedK8sContexts),
        method: 'GET',
        credentials: 'same-origin',
      }),
    }),
    getProviderCapabilities: builder.query({
      query: () => 'provider/capabilities',
      method: 'GET',
    }),
  }),
});

export const {
  useGetLoggedInUserQuery,
  useGetUserByIdQuery,
  useLazyGetTokenQuery,
  useGetUserPrefQuery,
  useGetUserPrefWithContextQuery,
  useGetProviderCapabilitiesQuery,
} = userApi;

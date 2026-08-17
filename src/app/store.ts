import { configureStore } from '@reduxjs/toolkit'

import authReducer from '@/features/auth/authSlice'
import localeReducer from '@/features/locale/localeSlice'
import tabsReducer from '@/features/tabs/tabsSlice'
import { keycloakApi } from '@/api/keycloakApi'
import { usersApi } from '@/api/usersApi'
import { sessionApi } from '@/api/sessionApi'
import { registrationApi } from '@/api/registrationApi'
import { credentialApi } from '@/api/credentialApi'
import { rolesApi } from '@/api/rolesApi'
import { pillarLinksApi } from '@/api/pillarLinksApi'
import { notificationsApi } from '@/api/notificationsApi'
import { organisationsApi } from '@/api/organisationsApi'
import { registrationLookupsApi } from '@/api/registrationLookupsApi'
import registrationWizardReducer from '@/features/registration/registrationWizardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locale: localeReducer,
    tabs: tabsReducer,
    registrationWizard: registrationWizardReducer,
    [keycloakApi.reducerPath]: keycloakApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [sessionApi.reducerPath]: sessionApi.reducer,
    [registrationApi.reducerPath]: registrationApi.reducer,
    [credentialApi.reducerPath]: credentialApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [pillarLinksApi.reducerPath]: pillarLinksApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [organisationsApi.reducerPath]: organisationsApi.reducer,
    [registrationLookupsApi.reducerPath]: registrationLookupsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      keycloakApi.middleware,
      usersApi.middleware,
      sessionApi.middleware,
      registrationApi.middleware,
      credentialApi.middleware,
      rolesApi.middleware,
      pillarLinksApi.middleware,
      notificationsApi.middleware,
      organisationsApi.middleware,
      registrationLookupsApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

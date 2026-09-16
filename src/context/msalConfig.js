import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '45e9ec04-4208-4fd5-a76d-5203d5aeba9c',
    authority: 'https://login.microsoftonline.com/c4f44f7e-f5c8-49a8-8f08-b39ffd2a6d43',
    redirectUri: 'http://localhost:5173',
    postLogoutRedirectUri: 'http://localhost:5173',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message) => {
        if (level <= LogLevel.Warning) console.log(message);
      },
    },
  },
};

export const loginRequest = {
  scopes: ['api://c98eba33-135d-40c4-9382-7166ce6af6f3/access_as_user'],
};
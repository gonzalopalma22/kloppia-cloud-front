import axios from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../context/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(async (config) => {
  await msalInstance.initialize();
  const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];

  if (account) {
    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      config.headers.Authorization = `Bearer ${response.accessToken}`;
    } catch (error) {
      console.error('Error al obtener token de MSAL:', error);
      await msalInstance.acquireTokenRedirect(loginRequest);
    }
  }

  return config;
});

export const generarFlashcards = (materiaId, apunteId, cantidad = 10) =>
  api.get(`/api/materias/${materiaId}/apuntes/${apunteId}/flashcards`, {
    params: { cantidad },
  });

export const obtenerHistorialChat = (materiaId, apunteId) =>
  api.get(`/api/materias/${materiaId}/apuntes/${apunteId}/chat/historial`);

export const enviarMensajeChat = (materiaId, apunteId, pregunta) =>
  api.post(`/api/materias/${materiaId}/apuntes/${apunteId}/chat`, { pregunta });

export default api;
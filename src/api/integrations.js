import client from './client';

export const SendEmail = ({ to, subject, body }) =>
  client.post('/integrations/email', { to, subject, body }).then((r) => r.data);

// Stub — non più utilizzati senza Base44
export const InvokeLLM               = () => Promise.reject(new Error('InvokeLLM non disponibile'));
export const SendSMS                 = () => Promise.reject(new Error('SendSMS non disponibile'));
export const UploadFile              = () => Promise.reject(new Error('UploadFile non disponibile'));
export const GenerateImage           = () => Promise.reject(new Error('GenerateImage non disponibile'));
export const ExtractDataFromUploadedFile = () => Promise.reject(new Error('ExtractDataFromUploadedFile non disponibile'));

export const Core = { SendEmail, InvokeLLM, SendSMS, UploadFile, GenerateImage, ExtractDataFromUploadedFile };

export const success = (message: string, data?: any) => ({
  status: 'success',
  message,
  ...(data && { data }),
});
export const failure = (message: string) => ({
  status: 'failure',
  message,
});

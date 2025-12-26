export interface ApiResponseType {
  statusCode: number;
  message: string;
  data: any;
}

export function createApiResponse(
  params: Partial<ApiResponseType>,
): ApiResponseType {
  const response: ApiResponseType = {
    statusCode: params.statusCode !== undefined ? params.statusCode : 200,
    message: params.message !== undefined ? params.message : 'Success',
    data: params.data !== undefined ? params.data : null,
  };

  return response;
}

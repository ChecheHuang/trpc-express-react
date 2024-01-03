export const trpcRequest = {
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    description:
      'The server cannot or will not process the request due to something that is perceived to be a client error.',
    status: 400,
    translation: '伺服器無法處理請求，因為被認為是客戶端錯誤。',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    description:
      'The client request has not been completed because it lacks valid authentication credentials for the requested resource.',
    status: 401,
    translation: '客戶端請求未完成，因為缺少所需的驗證憑證。',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    description:
      'The server was unauthorized to access a required data source, such as a REST API.',
    status: 403,
    translation: '伺服器未經授權訪問所需的數據源，例如 REST API。',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    description: 'The server cannot find the requested resource.',
    status: 404,
    translation: '伺服器找不到請求的資源。',
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    description: 'The server would like to shut down this unused connection.',
    status: 408,
    translation: '伺服器希望關閉此未使用的連接。',
  },
  CONFLICT: {
    code: 'CONFLICT',
    description:
      'The server request resource conflict with the current state of the target resource.',
    status: 409,
    translation: '伺服器請求的資源與目標資源的當前狀態發生衝突。',
  },
  PRECONDITION_FAILED: {
    code: 'PRECONDITION_FAILED',
    description: 'Access to the target resource has been denied.',
    status: 412,
    translation: '拒絕訪問目標資源。',
  },
  PAYLOAD_TOO_LARGE: {
    code: 'PAYLOAD_TOO_LARGE',
    description: 'Request entity is larger than limits defined by server.',
    status: 413,
    translation: '請求實體大於伺服器定義的限制。',
  },
  METHOD_NOT_SUPPORTED: {
    code: 'METHOD_NOT_SUPPORTED',
    description:
      "The server knows the request method, but the target resource doesn't support this method.",
    status: 405,
    translation: '伺服器知道請求方法，但目標資源不支援此方法。',
  },
  UNPROCESSABLE_CONTENT: {
    code: 'UNPROCESSABLE_CONTENT',
    description:
      'The server understands the request method, and the request entity is correct, but the server was unable to process it.',
    status: 422,
    translation: '伺服器理解請求方法，並且請求實體正確，但無法處理它。',
  },
  TOO_MANY_REQUESTS: {
    code: 'TOO_MANY_REQUESTS',
    description:
      'The rate limit has been exceeded or too many requests are being sent to the server.',
    status: 429,
    translation: '超過速率限制或向伺服器發送了太多請求。',
  },
  CLIENT_CLOSED_REQUEST: {
    code: 'CLIENT_CLOSED_REQUEST',
    description: 'Access to the resource has been denied.',
    status: 499,
    translation: '拒絕訪問資源。',
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    description: 'An unspecified error occurred.',
    status: 500,
    translation: '發生了一個未指定的錯誤。',
  },
}

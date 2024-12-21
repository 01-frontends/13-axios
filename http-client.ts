import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
} from "axios";

export interface HttpResponse<T = unknown> {
  headers: Record<string, any>;
  statusCode: number;
  hasError: boolean;
  data?: T;
}

interface HandleRequestProps {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  payload?: any;
  config?: AxiosRequestConfig;
}

export class HttpClient {
  protected axiosInstance: AxiosInstance;

  constructor(injectedAxios?: AxiosStatic) {
    const serviceUrl = String(process.env.SERVICE_URL);

    this.axiosInstance = (injectedAxios || axios).create({
      baseURL: serviceUrl,
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: (status: number) => {
        return status >= 200 && status < 300;
      },
    });
  }

  private transformAxiosData<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      headers: response.headers,
      statusCode: response.status,
      data: response.data,
      hasError: false,
    };
  }

  private transformAxiosError<T>({ response }: AxiosError): HttpResponse<T> {
    return {
      headers: response?.headers || {},
      statusCode: response?.status || 500,
      data: response?.data as T,
      hasError: true,
    };
  }

  private async handleRequest<T>({
    method,
    path,
    payload,
    config,
  }: HandleRequestProps): Promise<HttpResponse<T>> {
    try {
      const result = await this.axiosInstance[method]<T>(path, payload, config);
      return this.transformAxiosData(result);
    } catch (error) {
      throw this.transformAxiosError<T>(error as AxiosError);
    }
  }

  /**
   * GET
   */

  public async get<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<HttpResponse<T>> {
    return await this.handleRequest<T>({
      method: "get",
      path,
      config,
    });
  }

  /**
   * POST
   */

  public async post<T>(
    path: string,
    payload: any,
    config?: AxiosRequestConfig
  ): Promise<HttpResponse<T>> {
    return await this.handleRequest<T>({
      method: "post",
      path,
      payload,
      config,
    });
  }

  /**
   * PUT
   */

  public async put<T>(
    path: string,
    payload: any,
    config?: AxiosRequestConfig
  ): Promise<HttpResponse<T>> {
    return await this.handleRequest<T>({
      method: "put",
      path,
      payload,
      config,
    });
  }

  /**
   * DELETE
   */

  public async delete<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<HttpResponse<T>> {
    return await this.handleRequest<T>({
      method: "delete",
      path,
      config,
    });
  }
}

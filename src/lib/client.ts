import axios, { AxiosResponse } from "axios";

export const BASE_URL = "https://api.dify.ai/v1";

export type RequestMethods = 'GET' | 'POST' | 'PATCH' | 'DELETE';
export type Rating = 'like' | 'dislike';

interface Params {
  [key: string]: unknown;
}

interface HeaderParams {
  [key: string]: string;
}

type User = string | Record<string, unknown>;

export interface IFileResponse {
  "id": string,
  "name": string,
  "size": number,
  "extension": string,
  "mime_type": string,
  "created_by": number,
  "created_at": number,
}

export const routes = {
  application: { method: "GET" as const, url: () => `/parameters` },
  feedback: { method: "POST" as const, url: (message_id: string) => `/messages/${message_id}/feedbacks` },
  createCompletionMessage: { method: "POST" as const, url: () => `/completion-messages` },
  createChatMessage: { method: "POST" as const, url: () => `/chat-messages` },
  getConversationMessages: { method: "GET" as const, url: () => `/messages` },
  getConversations: { method: "GET" as const, url: () => `/conversations` },
  renameConversation: { method: "POST" as const, url: (conversation_id: string) => `/conversations/${conversation_id}/name` },
  deleteConversation: { method: "DELETE" as const, url: (conversation_id: string) => `/conversations/${conversation_id}` },
  fileUpload: { method: "POST" as const, url: () => `/files/upload` },
  runWorkflow: { method: "POST" as const, url: () => `/workflows/run` },
};

export class DifyClient {
  public apiKey: string;
  public baseUrl: string;

  constructor(apiKey: string, baseUrl: string = BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  updateApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendRequest<T>(
    method: RequestMethods,
    endpoint: string,
    data?: unknown,
    params?: Params,
    stream: boolean = false,
    headerParams: HeaderParams = {}
  ): Promise<AxiosResponse<T>> {
    const headers: HeaderParams = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...headerParams,
    };

    const url = `${this.baseUrl}${endpoint}`;
    return axios({
      method,
      url,
      data: method !== "GET" ? data : undefined,
      params,
      headers,
      responseType: stream ? "stream" : "json",
    });
  }

  messageFeedback(message_id: string, rating: Rating, user: User) {
    const data = { rating, user };
    return this.sendRequest(
      routes.feedback.method,
      routes.feedback.url(message_id),
      data
    );
  }

  getApplicationParameters(user: User) {
    const params = { user };
    return this.sendRequest(
      routes.application.method,
      routes.application.url(),
      undefined,
      params
    );
  }

  fileUpload(data: unknown): Promise<AxiosResponse<IFileResponse>> {
    return this.sendRequest<IFileResponse>(
      routes.fileUpload.method,
      routes.fileUpload.url(),
      data,
      undefined,
      false,
      { "Content-Type": "multipart/form-data" }
    );
  }
}

export class CompletionClient extends DifyClient {
  createCompletionMessage(inputs: unknown, user: User, stream: boolean = false, files: unknown = null) {
    const data = {
      inputs,
      user,
      response_mode: stream ? "streaming" : "blocking",
      files,
    };
    return this.sendRequest(
      routes.createCompletionMessage.method,
      routes.createCompletionMessage.url(),
      data,
      undefined,
      stream
    );
  }

  runWorkflow(inputs: unknown, user: User, stream: boolean = false, files: unknown = null) {
    const data = {
      inputs,
      user,
      response_mode: stream ? "streaming" : "blocking",
    };
    return this.sendRequest(
      routes.runWorkflow.method,
      routes.runWorkflow.url(),
      data,
      undefined,
      stream
    );
  }
}

export class ChatClient extends DifyClient {
  createChatMessage(
    inputs: unknown,
    query: unknown,
    user: User,
    stream: boolean = false,
    conversation_id: string | null = null,
    files: unknown = null
  ) {
    const data = {
      inputs,
      query,
      user,
      response_mode: stream ? "streaming" : "blocking",
      files,
      ...(conversation_id ? { conversation_id } : {}),
    };
    return this.sendRequest(
      routes.createChatMessage.method,
      routes.createChatMessage.url(),
      data,
      undefined,
      stream
    );
  }

  getConversationMessages(
    user: User,
    conversation_id: string = "",
    first_id: string | null = null,
    limit: number | null = null
  ) {
    const params: Params = { user };
    if (conversation_id) params.conversation_id = conversation_id;
    if (first_id) params.first_id = first_id;
    if (limit) params.limit = limit;
    return this.sendRequest(
      routes.getConversationMessages.method,
      routes.getConversationMessages.url(),
      undefined,
      params
    );
  }

  getConversations(user: User, last_id: string | null = null, limit: number | null = null) {
    const params: Params = { user, last_id, limit };
    return this.sendRequest(
      routes.getConversations.method,
      routes.getConversations.url(),
      undefined,
      params
    );
  }

  renameConversation(conversation_id: string, name: string, user: User, auto_generate: boolean) {
    const data = { name, user, auto_generate };
    return this.sendRequest(
      routes.renameConversation.method,
      routes.renameConversation.url(conversation_id),
      data
    );
  }

  deleteConversation(conversation_id: string, user: User) {
    const data = { user };
    return this.sendRequest(
      routes.deleteConversation.method,
      routes.deleteConversation.url(conversation_id),
      data
    );
  }
}
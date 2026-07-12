import { LiveScannerResponse, StockDetailsResponse, RiskState } from "./types";

export const BASE_URL = process.env.BACKEND_URL || "https://stratos.yogeshwaran.space";

export const getStratosToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("stratos_jwt_token");
  const expiresAt = localStorage.getItem("stratos_expires_at");
  
  if (!token || !expiresAt) return null;
  
  // Check if expired
  const expiryDate = new Date(expiresAt);
  if (expiryDate.getTime() <= Date.now()) {
    clearStratosAuth();
    return null;
  }
  
  return token;
};

export const saveStratosAuth = (token: string, expiresAt: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("stratos_jwt_token", token);
    localStorage.setItem("stratos_expires_at", expiresAt);
    localStorage.setItem("stratos_demo_mode", "false");
  }
};

export const clearStratosAuth = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("stratos_jwt_token");
    localStorage.removeItem("stratos_expires_at");
    localStorage.removeItem("stratos_demo_mode");
  }
};

// Custom fetch wrapper mimicking an HTTP interceptor
export const stratosFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getStratosToken();
  const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http") ? endpoint : `${cleanBase}${cleanEndpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      clearStratosAuth();
      if (typeof window !== "undefined") {
        // Broadcast custom event so active UI components can react and reset state
        window.dispatchEvent(new Event("stratos-unauthorized"));
      }
      throw new Error("Session expired. Please log in again.");
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export interface NotionItem {
  id: string;
  title: string;
}

export const getNotionDatabases = async (notionApiKey?: string): Promise<NotionItem[]> => {
  let endpoint = "/summarize/notion/databases";
  if (notionApiKey?.trim()) {
    const params = new URLSearchParams();
    params.append("notion_api_key", notionApiKey.trim());
    endpoint += `?${params.toString()}`;
  }
  const response = await stratosFetch(endpoint);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to fetch Notion databases");
  }
  return response.json();
};

export const getNotionPages = async (notionApiKey?: string): Promise<NotionItem[]> => {
  let endpoint = "/summarize/notion/pages";
  if (notionApiKey?.trim()) {
    const params = new URLSearchParams();
    params.append("notion_api_key", notionApiKey.trim());
    endpoint += `?${params.toString()}`;
  }
  const response = await stratosFetch(endpoint);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to fetch Notion pages");
  }
  return response.json();
};

export const createNotionDatabase = async (
  title: string,
  parentPageId?: string,
  notionApiKey?: string
): Promise<NotionItem> => {
  const body: Record<string, string> = {
    title: title,
  };
  if (parentPageId?.trim()) {
    body.parent_page_id = parentPageId.trim();
  }
  if (notionApiKey?.trim()) {
    body.notion_api_key = notionApiKey.trim();
  }
  const response = await stratosFetch("/summarize/notion/databases", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to create Notion database");
  }
  return response.json();
};


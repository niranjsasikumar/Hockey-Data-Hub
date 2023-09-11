import { API_BASE_URL } from "../data/constants";

export function apiEndpoint(endpoint) {
  return API_BASE_URL + endpoint;
}
// src/api/patientProfilesApi.js
import { apiGet } from "../lib/api";

export const patientProfilesApi = {
  listMine: () => apiGet("/api/patient/profiles"),
};

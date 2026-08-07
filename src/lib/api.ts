// const API_BASE = "https://task-tracker-back-mfxy.onrender.com";

// async function request<T = any>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     ...(options.headers as Record<string, string>),
//   };

//   if (token) {
//     headers["Authorization"] = token;
//   }

//   const res = await fetch(`${API_BASE}/api/${endpoint}`, {
//     ...options,
//     headers,
//     credentials: "include",
//   });

//   // --- SAFE PARSING FIX STARTS HERE ---
//   const contentType = res.headers.get("content-type");
//   let data: any = {};

//   if (contentType && contentType.includes("application/json")) {
//     data = await res.json();
//     console.log("Valid JSON Response:", data);
//   } else {
//     // If the server returns HTML/Text (like a 404 or 500 error), read it as text
//     const rawText = await res.text();
//     console.error("🚨 BACKEND SYSTEM ERROR (Received non-JSON content):", rawText);
//     throw new Error(`Server Error (${res.status}): Expected JSON but received HTML or plain text.`);
//   }
//   // --- SAFE PARSING FIX ENDS HERE ---

//   if (!res.ok) {
//     if (
//       typeof window !== "undefined" &&
//       (data.info?.includes("Authenticate") ||
//         data.info?.includes("credentials") ||
//         data.info?.includes("expired"))
//     ) {
//       localStorage.removeItem("auth_token");
//     }
//     throw new Error(data.info || `Request failed with status ${res.status}`);
//   }

//   const authHeader = res.headers.get("Authorization");
//   if (authHeader && typeof window !== "undefined") {
//     localStorage.setItem("auth_token", authHeader);
//   }

//   return data;
// }

// export const api = {
//   signup: (body: {
//     name: string;
//     email: string;
//     password: string;
//     dept: string;
//     role?: string;
//   }) =>
//     request("/auth/signup/", { method: "POST", body: JSON.stringify(body) }),

//   login: (body: { email: string; password: string }) =>
//     request<{ info: string; role?: string; dpt?: string }>("/auth/login/", {
//       method: "POST",
//       body: JSON.stringify(body),
//     }),

//   getStaffEmails: () =>
//     request<string[]>("/auth/login/emails/", { method: "GET" }),

//   getHistory: (params?: { filter?: string; q?: string }) => {
//     const query = params ? "?" + new URLSearchParams(params).toString() : "";
//     return request<{ info: any[]; staff_name: string }>("/history/" + query, {
//       method: "GET",
//     });
//   },

//   createTask: (body: {
//     task: string;
//     description?: string;
//     status?: string;
//     progress?: string;
//     completion_date?: string;
//   }) => request("/task/", { method: "POST", body: JSON.stringify(body) }),

//   updateTask: (
//     id: number,
//     body: {
//       task?: string;
//       description?: string;
//       status?: string;
//       progress?: string;
//       completion_date?: string;
//     },
//   ) => request(`/task/${id}/`, { method: "PUT", body: JSON.stringify(body) }),

//   adminLogin: (body: { email: string; password: string }) =>
//     request<{ info: string }>("/admin/login/", {
//       method: "POST",
//       body: JSON.stringify(body),
//     }),

//   getAdminDashboard: () => request<any>("/admin/dashboard/", { method: "GET" }),

//   createDirectorTask: (body: { task: string; status?: string }) =>
//     request("/director/task/", { method: "POST", body: JSON.stringify(body) }),

//   getDirectorHistory: () =>
//     request<any>("/director/history/", { method: "GET" }),

//   getAllStaffTasks: (params?: { filter?: string; q?: string }) => {
//     const query = params ? "?" + new URLSearchParams(params).toString() : "";
//     return request<any>("/director/tasks/" + query, { method: "GET" });
//   },

//   updateProfile: (body: {
//     name?: string;
//     email?: string;
//     dept?: string;
//     role?: string;
//   }) =>
//     request("/auth/profile/", { method: "PUT", body: JSON.stringify(body) }),

//   forgotPassword: (email: string) =>
//     request<{ info: string }>("/auth/forgot-password/", {
//       method: "POST",
//       body: JSON.stringify({ email }),
//     }),

//   verifyOTP: (email: string, otp: string) =>
//     request<{ info: string; token: string }>("/auth/verify-otp/", {
//       method: "POST",
//       body: JSON.stringify({ email, otp }),
//     }),

//   resetPassword: (email: string, token: string, password: string) =>
//     request<{ info: string }>("/auth/reset-password/", {
//       method: "POST",
//       body: JSON.stringify({ email, token, password }),
//     }),
// };

// const MONTHS = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

// function ordinal(n: number): string {
//   if (n > 3 && n < 21) return n + "th";
//   switch (n % 10) {
//     case 1:
//       return n + "st";
//     case 2:
//       return n + "nd";
//     case 3:
//       return n + "rd";
//     default:
//       return n + "th";
//   }
// }

// export function formatDate(dateStr: string | null | undefined): string {
//   if (!dateStr) return "-";
//   const parts = dateStr.split("-");
//   if (parts.length !== 3) return "-";
//   const year = parseInt(parts[0], 10);
//   const month = parseInt(parts[1], 10);
//   const day = parseInt(parts[2], 10);
//   if (isNaN(year) || isNaN(month) || isNaN(day)) return "-";
//   if (month < 1 || month > 12) return "-";
//   return `${ordinal(day)} ${MONTHS[month - 1]} ${year}`;
// }

// export function logout() {
//   if (typeof window !== "undefined") {
//     localStorage.removeItem("auth_token");
//     localStorage.removeItem("user_role");
//     localStorage.removeItem("user_name");
//     localStorage.removeItem("user_dept");
//   }
// }

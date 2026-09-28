const BASE_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000/api`;
function getToken() {
  return localStorage.getItem("ocp_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* réponse vide */
  }

  if (!res.ok) {
    throw new Error(data.erreur || "Erreur serveur (" + res.status + ")");
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/auth/me"),

  listerMoteurs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v),
    ).toString();
    return request("/moteurs" + (qs ? "?" + qs : ""));
  },
  obtenirMoteur: (matricule) =>
    request("/moteurs/" + encodeURIComponent(matricule)),
  ajouterMoteur: (data) => request("/moteurs", { method: "POST", body: data }),
  modifierMoteur: (matricule, data) =>
    request("/moteurs/" + encodeURIComponent(matricule), {
      method: "PUT",
      body: data,
    }),
  supprimerMoteur: (matricule) =>
    request("/moteurs/" + encodeURIComponent(matricule), { method: "DELETE" }),
  localisations: () => request("/moteurs/localisations"),

  chercherEquivalents: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v),
    ).toString();
    return request("/equivalents" + (qs ? "?" + qs : ""));
  },
  utiliserEquivalent: (matricule, vers) =>
    request("/equivalents/utiliser", {
      method: "POST",
      body: { matricule, vers },
    }),

  listerPannes: () => request("/pannes"),
  declarerPanne: (data) => request("/pannes", { method: "POST", body: data }),

  listerHistorique: (matricule) =>
    request(
      "/historique" +
        (matricule ? "?matricule=" + encodeURIComponent(matricule) : ""),
    ),

  listerMouvements: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v),
    ).toString();
    return request("/mouvements" + (qs ? "?" + qs : ""));
  },
  ajouterMouvement: (data) =>
    request("/mouvements", { method: "POST", body: data }),
  modifierMouvement: (id, data) =>
    request("/mouvements/" + id, { method: "PUT", body: data }),
  supprimerMouvement: (id) =>
    request("/mouvements/" + id, { method: "DELETE" }),
};

export function setToken(token) {
  if (token) localStorage.setItem("ocp_token", token);
  else localStorage.removeItem("ocp_token");
}
export function hasToken() {
  return !!getToken();
}

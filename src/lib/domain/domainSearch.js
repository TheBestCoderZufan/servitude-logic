// src/lib/domain/domainSearch.js
import {
  EnvSchema,
  DomainNameSchema,
  DomainSearchResponseSchema,
} from "@/validation/domain/schema";

const { DYNADOT_PRODUCTION_BASE_URL: BASE_URL, DYNADOT_PRODUCTION_KEY: KEY } =
  EnvSchema.parse({
    DYNADOT_PRODUCTION_BASE_URL: process.env.DYNADOT_PRODUCTION_BASE_URL,
    DYNADOT_PRODUCTION_KEY: process.env.DYNADOT_PRODUCTION_KEY,
  });

export async function domainSearch(domain_name) {
  DomainNameSchema.parse(domain_name);
  const url = `${BASE_URL}/restful/v1/domains/${domain_name.toLowerCase()}/search?show_price=true&currency=usd`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: KEY,
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();

    // Normalize upstream response to our envelope shape
    const normalize = (raw) => {
      const codeStr = raw?.code != null ? String(raw.code) : String(res.status);

      if (raw?.data) {
        const d = { ...raw.data };
        if (typeof d.available === "boolean") {
          d.available = d.available ? "Yes" : "No";
        }
        if (typeof d.premium === "boolean") {
          d.premium = d.premium ? "YES" : "NO";
        }
        d.price_list = Array.isArray(d.price_list) ? d.price_list : [];
        return { code: codeStr, message: raw.message ?? "Success", data: d };
      }

      // Some providers return flat payload; wrap it
      const available =
        typeof raw?.available === "boolean"
          ? raw.available
            ? "Yes"
            : "No"
          : raw?.available;
      const premium =
        typeof raw?.premium === "boolean"
          ? raw.premium
            ? "YES"
            : "NO"
          : raw?.premium;
      const price_list = Array.isArray(raw?.price_list) ? raw.price_list : [];
      const dataNode = {
        domain_name: raw?.domain_name ?? domain_name,
        available,
        premium,
        price_list,
      };
      return {
        code: codeStr,
        message: raw?.message ?? "Success",
        data: dataNode,
      };
    };

    const normalized = normalize(data);
    const parsed = DomainSearchResponseSchema.parse(normalized);
    return parsed;
  } catch (error) {
    throw error;
  }
}

export async function bulkDomainSearch(domain_name) {
  DomainListSchema.parse(domains);
  const query = domain_name.join(",");
  const url = `${BASE_URL}/restful/v1/domains/bulk_search?domain_name_list=${query}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: KEY,
      },
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    return await res.json();
  } catch (error) {
    throw error;
  }
}

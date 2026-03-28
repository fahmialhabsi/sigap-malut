// frontend/src/utils/roleMap.js

// Dynamic role mapping, to be initialized at app startup
export let roleIdToName = {};
export let roleNameToId = {};

/**
 * Inisialisasi mapping roleIdToName dan roleNameToId dari array roles hasil API
 * @param {Array<{id: string, code: string, name: string}>} roles
 */
export function initRoleMaps(roles) {
  roleIdToName = {};
  roleNameToId = {};
  if (Array.isArray(roles)) {
    roles.forEach((r) => {
      if (r.id && r.code) {
        roleIdToName[r.id] = r.code;
        roleNameToId[r.code] = r.id;
      }
    });
  }
}

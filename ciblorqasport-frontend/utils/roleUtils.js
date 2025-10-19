export const ROLE_PERMISSIONS = {
  spectator: ["/", "/events", "/notifications", "/map", "/tickets", "/security"],
  athlete: ["/", "/athlete", "/events", "/notifications"],
  commissaire: ["/", "/commissaire", "/events"],
  volunteer: ["/", "/volunteer"],
  admin: ["/", "/admin", "/events", "/notifications"],
};

export function canAccess(role, path) {
  return ROLE_PERMISSIONS[role]?.includes(path);
}

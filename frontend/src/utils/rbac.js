export const RBAC_MATRIX = {
  fleet_manager: {
    dashboard: 'full',
    fleet: 'full',
    drivers: 'full',
    trips: 'full',
    maintenance: 'full',
    fuel: 'full',
    analytics: 'full',
    settings: 'full'
  },
  dispatcher: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'view',
    trips: 'full',
    maintenance: 'view',
    fuel: 'view',
    analytics: 'view',
    settings: 'none'
  },
  driver: {
    dashboard: 'view',
    fleet: 'none',
    drivers: 'none',
    trips: 'view',
    maintenance: 'none',
    fuel: 'full',
    analytics: 'none',
    settings: 'none'
  },
  safety_officer: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'full',
    trips: 'view',
    maintenance: 'view',
    fuel: 'none',
    analytics: 'full',
    settings: 'none'
  },
  finance_manager: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'view',
    trips: 'view',
    maintenance: 'view',
    fuel: 'full',
    analytics: 'full',
    settings: 'none'
  }
};

export const getAccessLevel = (userRoles, resource) => {
  if (!userRoles || !userRoles.length) return 'none';
  
  let accessLevel = 'none';
  for (const role of userRoles) {
    const roleMatrix = RBAC_MATRIX[role];
    if (roleMatrix) {
      const level = roleMatrix[resource];
      if (level === 'full') return 'full';
      if (level === 'view') accessLevel = 'view';
    }
  }
  return accessLevel;
};

export const hasMutationAccess = (userRoles, resource) => {
  return getAccessLevel(userRoles, resource) === 'full';
};

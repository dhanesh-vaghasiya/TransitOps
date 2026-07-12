export const RBAC_MATRIX = {
  fleet_manager: {
    dashboard: 'full',
    fleet: 'full',
    drivers: 'full',
    trips: 'none',
    maintenance: 'full',
    fuel: 'none',
    analytics: 'full',
    settings: 'full'
  },
  dispatcher: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'none',
    trips: 'full',
    maintenance: 'none',
    fuel: 'none',
    analytics: 'none',
    settings: 'none'
  },
  safety_officer: {
    dashboard: 'full',
    fleet: 'none',
    drivers: 'full',
    trips: 'view',
    maintenance: 'none',
    fuel: 'none',
    analytics: 'none',
    settings: 'none'
  },
  financial_analyst: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'none',
    trips: 'none',
    maintenance: 'none',
    fuel: 'full',
    analytics: 'full',
    settings: 'none'
  }
};

let liveRbacMatrix = null;

export const setLiveRbacMatrix = (matrix) => {
  liveRbacMatrix = matrix;
};

export const getAccessLevel = (userRoles, resource) => {
  if (!userRoles || !userRoles.length) return 'none';
  
  const matrix = liveRbacMatrix || RBAC_MATRIX;
  
  let accessLevel = 'none';
  for (const role of userRoles) {
    const roleMatrix = matrix[role];
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

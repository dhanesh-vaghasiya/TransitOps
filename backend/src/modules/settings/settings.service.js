const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');

const getSettings = async () => {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    throw new ApiError(404, 'System settings not found');
  }
  return settings;
};

const updateSettings = async (data, userId = null) => {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    throw new ApiError(404, 'System settings not found');
  }

  const updatedSettings = await prisma.settings.update({
    where: { id: settings.id },
    data: {
      depotName: data.depotName,
      currency: data.currency,
      distanceUnit: data.distanceUnit,
    },
  });

  // Log the action
  await createSecurityLog(
    'SETTINGS_MODIFIED',
    `General settings updated: depotName="${data.depotName}", currency="${data.currency}", distanceUnit="${data.distanceUnit}"`,
    userId
  );

  return updatedSettings;
};

const updateRbacMatrix = async (rbacMatrix, userId = null) => {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    throw new ApiError(404, 'System settings not found');
  }

  const updatedSettings = await prisma.settings.update({
    where: { id: settings.id },
    data: {
      rbacMatrix,
    },
  });

  // Log the action
  await createSecurityLog(
    'ROLE_MODIFIED',
    `Role permissions matrix modified by user`,
    userId
  );

  return updatedSettings;
};

const getSecurityLogs = async () => {
  return await prisma.securityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

const createSecurityLog = async (action, details, userId = null) => {
  return await prisma.securityLog.create({
    data: {
      action,
      details,
      userId: userId ? parseInt(userId, 10) : null,
    },
  });
};

module.exports = {
  getSettings,
  updateSettings,
  updateRbacMatrix,
  getSecurityLogs,
  createSecurityLog,
};

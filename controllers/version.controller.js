import AppVersion from '../models/appVersion.model.js';

// Mobile app: get version info by platform
export const getVersionInfo = async (req, res) => {
  try {
    const platform = req.query.platform || 'android';

    const version = await AppVersion.findOne({
      where: { platform },
    });

    if (version) {
      return res.status(200).json({
        latest_version: version.version_code,
        min_supported_version:
          version.min_supported_version || version.version_code,
        is_critical: !!version.is_forced,
      });
    }

    return res.status(200).json({
      latest_version: '1.0.0',
      min_supported_version: '1.0.0',
      is_critical: false,
    });
  } catch (error) {
    console.error('getVersionInfo error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch version info. Error: ' + error.message,
    });
  }
};

// Admin: list all versions
export const adminGetAllVersions = async (_req, res) => {
  try {
    const versions = await AppVersion.findAll();
    return res.status(200).json(versions);
  } catch (error) {
    console.error('adminGetAllVersions error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch versions. Error: ' + error.message,
    });
  }
};

// Admin: create or update version for platform
export const adminUpsertVersion = async (req, res) => {
  try {
    const {
      platform,
      version_code,
      min_supported_version,
      is_forced,
    } = req.body;

    if (!platform || !version_code) {
      return res.status(400).json({
        status: 'error',
        message: 'platform and version_code are required.',
      });
    }

    const existing = await AppVersion.findOne({ where: { platform } });

    const payload = {
      platform,
      version_code,
      min_supported_version: min_supported_version || version_code,
      is_forced: !!is_forced,
    };

    if (existing) {
      await existing.update(payload);
    } else {
      await AppVersion.create(payload);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Version updated.',
    });
  } catch (error) {
    console.error('adminUpsertVersion error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update version. Error: ' + error.message,
    });
  }
};



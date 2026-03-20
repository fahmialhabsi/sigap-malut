import {
  UPTD_PILOT_STANDARD_VERSION,
  UPTD_PILOT_REPLICATION_UNITS,
  isPilotReplicationUnit,
  isRoleExcludedFromInternalPilot,
  isUptdPilotReviewerRole,
  isUptdPilotRole,
  normalizeRole,
  normalizeUnitKerja,
} from "../config/pilotProjectPolicy.js";
import { logAudit } from "../services/auditLogService.js";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const normalizeSimple = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isSameUnit = (a, b) => normalizeSimple(a) === normalizeSimple(b);

const isReadOnlyReplicationSource = (unitKerja) =>
  isPilotReplicationUnit(unitKerja) || normalizeUnitKerja(unitKerja) === "UPTD";

const policyMeta = (req) => ({
  path: req.originalUrl || req.path,
  method: req.method,
  timestamp: new Date().toISOString(),
});

const deniedPayload = ({
  req,
  message,
  code,
  domain,
  sourceUnit,
  role,
  unitKerja,
}) => ({
  success: false,
  message,
  code,
  policy: {
    domain,
    version: UPTD_PILOT_STANDARD_VERSION,
    source_unit: sourceUnit || null,
    role,
    unit_kerja: unitKerja,
    replication_units: UPTD_PILOT_REPLICATION_UNITS,
  },
  meta: policyMeta(req),
});

const auditDeniedPolicy = ({ req, domain, code, role, unitKerja, sourceUnit }) => {
  if (!req.user?.id) {
    return;
  }

  void logAudit({
    modul: "PILOT_POLICY",
    entitas_id: req.originalUrl || req.path,
    aksi: "DENY",
    data_lama: null,
    data_baru: {
      domain,
      version: UPTD_PILOT_STANDARD_VERSION,
      code,
      source_unit: sourceUnit || null,
      role,
      unit_kerja: unitKerja,
      method: req.method,
      path: req.originalUrl || req.path,
    },
    pegawai_id: req.user?.id,
  });
};

export const createReplicationPilotGuard = ({ domainCode, sourceUnit }) => {
  if (!domainCode || !sourceUnit) {
    throw new Error(
      "createReplicationPilotGuard membutuhkan domainCode dan sourceUnit",
    );
  }

  return (req, res, next) => {
    if (!req.user) {
      auditDeniedPolicy({
        req,
        domain: domainCode,
        code: "UNAUTHENTICATED",
        role: null,
        unitKerja: null,
        sourceUnit,
      });
      return res.status(401).json({
        ...deniedPayload({
          req,
          message: "Silakan login terlebih dahulu",
          code: "UNAUTHENTICATED",
          domain: domainCode,
          sourceUnit,
          role: null,
          unitKerja: null,
        }),
      });
    }

    const role = normalizeRole(req.user.role);
    const unitKerja = normalizeUnitKerja(req.user.unit_kerja);

    if (isRoleExcludedFromInternalPilot(role)) {
      auditDeniedPolicy({
        req,
        domain: domainCode,
        code: "PILOT_SCOPE_EXCLUDED_ROLE",
        role,
        unitKerja,
        sourceUnit,
      });
      return res.status(403).json({
        ...deniedPayload({
          req,
          message:
            "Role ini berada di luar cakupan pilot internal sesuai kebijakan SPBE.",
          code: "PILOT_SCOPE_EXCLUDED_ROLE",
          domain: domainCode,
          sourceUnit,
          role,
          unitKerja,
        }),
      });
    }

    if (isSameUnit(unitKerja, sourceUnit)) {
      res.setHeader("X-Pilot-Policy-Version", UPTD_PILOT_STANDARD_VERSION);
      res.setHeader("X-Pilot-Policy-Domain", domainCode);
      req.pilotProject = {
        domain: domainCode,
        version: UPTD_PILOT_STANDARD_VERSION,
        access: "full",
        source_unit: sourceUnit,
        replication_units: UPTD_PILOT_REPLICATION_UNITS,
      };

      return next();
    }

    const canReadAsReviewer =
      isReadOnlyReplicationSource(unitKerja) &&
      (isUptdPilotReviewerRole(role) || isUptdPilotRole(role));

    if (canReadAsReviewer) {
      if (WRITE_METHODS.has(req.method)) {
        auditDeniedPolicy({
          req,
          domain: domainCode,
          code: "PILOT_READ_ONLY",
          role,
          unitKerja,
          sourceUnit,
        });
        return res.status(403).json({
          ...deniedPayload({
            req,
            message:
              "Unit replikasi pilot hanya memiliki akses baca pada fase standardisasi lintas-unit.",
            code: "PILOT_READ_ONLY",
            domain: domainCode,
            sourceUnit,
            role,
            unitKerja,
          }),
        });
      }

      res.setHeader("X-Pilot-Policy-Version", UPTD_PILOT_STANDARD_VERSION);
      res.setHeader("X-Pilot-Policy-Domain", domainCode);
      req.pilotProject = {
        domain: domainCode,
        version: UPTD_PILOT_STANDARD_VERSION,
        access: "read-only",
        source_unit: sourceUnit,
        reviewer_unit: unitKerja,
        replication_units: UPTD_PILOT_REPLICATION_UNITS,
      };

      return next();
    }

    auditDeniedPolicy({
      req,
      domain: domainCode,
      code: "PILOT_ROLE_NOT_ALLOWED",
      role,
      unitKerja,
      sourceUnit,
    });
    return res.status(403).json({
      ...deniedPayload({
        req,
        message:
          "Akses ditolak. Endpoint ini khusus pilot internal unit kerja yang ditetapkan.",
        code: "PILOT_ROLE_NOT_ALLOWED",
        domain: domainCode,
        sourceUnit,
        role,
        unitKerja,
      }),
    });
  };
};

export const enforceUptdPilotAccess = (req, res, next) => {
  if (!req.user) {
    auditDeniedPolicy({
      req,
      domain: "UPTD_BALAI_PENGAWASAN",
      code: "UNAUTHENTICATED",
      role: null,
      unitKerja: null,
      sourceUnit: "UPTD",
    });
    return res.status(401).json({
      ...deniedPayload({
        req,
        message: "Silakan login terlebih dahulu",
        code: "UNAUTHENTICATED",
        domain: "UPTD_BALAI_PENGAWASAN",
        sourceUnit: "UPTD",
        role: null,
        unitKerja: null,
      }),
    });
  }

  const role = normalizeRole(req.user.role);
  const unitKerja = normalizeUnitKerja(req.user.unit_kerja);

  if (isRoleExcludedFromInternalPilot(role)) {
    auditDeniedPolicy({
      req,
      domain: "UPTD_BALAI_PENGAWASAN",
      code: "PILOT_SCOPE_EXCLUDED_ROLE",
      role,
      unitKerja,
      sourceUnit: "UPTD",
    });
    return res.status(403).json({
      ...deniedPayload({
        req,
        message:
          "Role ini berada di luar cakupan pilot UPTD Balai Pengawasan sesuai kebijakan SPBE internal.",
        code: "PILOT_SCOPE_EXCLUDED_ROLE",
        domain: "UPTD_BALAI_PENGAWASAN",
        sourceUnit: "UPTD",
        role,
        unitKerja,
      }),
    });
  }

  if (isUptdPilotRole(role)) {
    res.setHeader("X-Pilot-Policy-Version", UPTD_PILOT_STANDARD_VERSION);
    res.setHeader("X-Pilot-Policy-Domain", "UPTD_BALAI_PENGAWASAN");
    req.pilotProject = {
      domain: "UPTD_BALAI_PENGAWASAN",
      version: UPTD_PILOT_STANDARD_VERSION,
      access: "full",
      source_unit: "UPTD",
      replication_units: UPTD_PILOT_REPLICATION_UNITS,
    };

    return next();
  }

  if (isUptdPilotReviewerRole(role) && isPilotReplicationUnit(unitKerja)) {
    if (WRITE_METHODS.has(req.method)) {
      auditDeniedPolicy({
        req,
        domain: "UPTD_BALAI_PENGAWASAN",
        code: "PILOT_READ_ONLY",
        role,
        unitKerja,
        sourceUnit: "UPTD",
      });
      return res.status(403).json({
        ...deniedPayload({
          req,
          message:
            "Unit replikasi pilot hanya memiliki akses baca pada fase standardisasi UPTD Balai Pengawasan.",
          code: "PILOT_READ_ONLY",
          domain: "UPTD_BALAI_PENGAWASAN",
          sourceUnit: "UPTD",
          role,
          unitKerja,
        }),
      });
    }

    res.setHeader("X-Pilot-Policy-Version", UPTD_PILOT_STANDARD_VERSION);
    res.setHeader("X-Pilot-Policy-Domain", "UPTD_BALAI_PENGAWASAN");
    req.pilotProject = {
      domain: "UPTD_BALAI_PENGAWASAN",
      version: UPTD_PILOT_STANDARD_VERSION,
      access: "read-only",
      source_unit: "UPTD",
      reviewer_unit: unitKerja,
      replication_units: UPTD_PILOT_REPLICATION_UNITS,
    };

    return next();
  }

  auditDeniedPolicy({
    req,
    domain: "UPTD_BALAI_PENGAWASAN",
    code: "PILOT_ROLE_NOT_ALLOWED",
    role,
    unitKerja,
    sourceUnit: "UPTD",
  });
  return res.status(403).json({
    ...deniedPayload({
      req,
      message:
        "Akses ditolak. Endpoint ini khusus pilot UPTD Balai Pengawasan untuk role internal yang ditetapkan.",
      code: "PILOT_ROLE_NOT_ALLOWED",
      domain: "UPTD_BALAI_PENGAWASAN",
      sourceUnit: "UPTD",
      role,
      unitKerja,
    }),
  });
};

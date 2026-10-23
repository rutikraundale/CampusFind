export const STUDENT_EMAIL_DOMAIN = "kbtcoe.org";
export const RESPONSIBILITY_DECLARATION_VERSION = "v1";

export const isResponsibilityDeclarationAccepted = (accepted, version) =>
    accepted === "true" && version === RESPONSIBILITY_DECLARATION_VERSION;

export const normalizeStudentEmail = (email) => {
    if (typeof email !== "string") return null;

    const normalized = email.trim().toLowerCase();
    if (
        normalized.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ||
        normalized.split("@")[1] !== STUDENT_EMAIL_DOMAIN
    ) {
        return null;
    }

    return normalized;
};

export const normalizeIndianMobile = (mobile) => {
    if (typeof mobile !== "string") return null;

    const compact = mobile.trim().replace(/[\s()-]/g, "");
    const nationalNumber = compact.startsWith("+91")
        ? compact.slice(3)
        : compact;

    return /^[6-9]\d{9}$/.test(nationalNumber) ? nationalNumber : null;
};

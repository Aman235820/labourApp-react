export const normalizeMongoId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.$oid === 'string') return value.$oid;
    if (typeof value.oid === 'string') return value.oid;

    // Common places where id can be nested
    if (typeof value._id === 'string') return value._id;
    if (value._id && typeof value._id === 'object') return normalizeMongoId(value._id);
    if (typeof value.id === 'string') return value.id;

    // BSON/ObjectId-like objects (defensive)
    if (typeof value.toHexString === 'function') {
      const hex = value.toHexString();
      if (typeof hex === 'string') return hex;
    }
    if (typeof value.toString === 'function') {
      const s = value.toString();
      // Handle forms like: ObjectId("...") or just the hex string
      const m = String(s).match(/([0-9a-fA-F]{24})/);
      if (m?.[1]) return m[1];
    }
  }
  return '';
};

export const withEnterpriseId = (enterpriseLike) => {
  if (!enterpriseLike || typeof enterpriseLike !== 'object') return enterpriseLike;

  const id = normalizeMongoId(
    enterpriseLike.enterpriseId ||
      enterpriseLike._id ||
      enterpriseLike.id ||
      enterpriseLike?.returnValue?._id ||
      enterpriseLike?.returnValue?.id
  );

  const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!id || !mongoIdPattern.test(String(id))) return enterpriseLike;
  if (String(enterpriseLike.enterpriseId || '') === String(id)) return enterpriseLike;

  return {
    ...enterpriseLike,
    enterpriseId: String(id)
  };
};


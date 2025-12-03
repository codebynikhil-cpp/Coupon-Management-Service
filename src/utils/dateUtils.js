// Convert string to Date safely
exports.toDate = (value) => {
  return value ? new Date(value) : null;
};

// Check if current date is within [start, end]
exports.isWithinRange = (now, start, end) => {
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
};

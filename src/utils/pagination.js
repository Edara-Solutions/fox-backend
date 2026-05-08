const paginationOptions = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const paginate = async (findQuery, countQuery, requestQuery = {}) => {
  const { page, limit, skip } = paginationOptions(requestQuery);
  const [documents, total] = await Promise.all([
    findQuery.skip(skip).limit(limit),
    countQuery,
  ]);

  return {
    documents,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

module.exports = { paginate, paginationOptions };

/**
 * Parses ?page=&limit= query params with sane bounds.
 */
export function parsePagination(query, { defaultLimit = 10, maxLimit = 50 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const requested =
    Number.parseInt(query.limit ?? String(defaultLimit), 10) || defaultLimit;
  const limit = Math.min(Math.max(1, requested), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Runs a count + find pair and returns the standard paginated envelope:
 * { data, page, limit, total, totalPages }
 */
export async function paginate(Model, filter, { page, limit, skip }, options = {}) {
  const [total, data] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter)
      .sort(options.sort ?? { _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate(options.populate ?? []),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

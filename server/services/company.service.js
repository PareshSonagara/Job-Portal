import Company from "../models/Company.js";

export const createCompanyService = async (data) => {
  const company = await Company.create(data);
  return company;
};

export const getCompanyByIdService = async (id) => {
  const company = await Company.findById(id);
  return company;
};

export const getCompaniesService = async (filters, queries) => {
  const companies = await Company.find(filters)
    .skip(queries.skip)
    .limit(queries.limit)
    .select(queries.fields)
    .sort(queries.sortBy);

  const totalCompanies = await Company.countDocuments(filters);
  const pageCount = Math.ceil(totalCompanies / queries.limit);

  return { companies, totalCompanies, pageCount };
};

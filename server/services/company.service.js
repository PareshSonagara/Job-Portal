const Company = require("../models/Company");

exports.createCompanyService = async (data) => {
  const company = await Company.create(data);
  return company;
};

exports.getCompanyByIdService = async (id) => {
  const company = await Company.findById(id);
  return company;
};

exports.getCompaniesService = async (filters, queries) => {
  const companies = await Company.find(filters)
    .skip(queries.skip)
    .limit(queries.limit)
    .select(queries.fields)
    .sort(queries.sortBy);

  const totalCompanies = await Company.countDocuments(filters);
  const pageCount = Math.ceil(totalCompanies / queries.limit);

  return { companies, totalCompanies, pageCount };
};

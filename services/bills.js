const Apartment = require("../models/apartmentModel");
const Bill = require("../models/billsModel");
const moment = require("moment");

exports.generateNewTenantBill = async ({ apartmentId }) => {
  const apartment = await Apartment.findOne({ apartmentId }).populate({
    path: "property",
    select: "name",
  });

  if (!apartment.tenant) {
    return { success: false, message: "Apartment is not occupied" };
  }
  const leaseStartDate = apartment.leaseStartDate;
  const isFirstHalf = new Date(leaseStartDate).getDate() <= 15;
  const period = isFirstHalf ? "first-half" : "second-half";
  const month = moment(leaseStartDate).format("MMMM");
  const year = moment(leaseStartDate).format("YYYY");

  const depositedBill = new Bill({
    client: apartment.client,
    property: apartment.property,
    apartment: apartment._id,
    tenant: apartment.tenant,
    amount: apartment.deposit,
    month,
    year,
    period,
    type: "deposit",
    description: `Security deposit for ${apartment.floor}-${apartment.door.toUpperCase()},${apartment.property.name}`,
  });

  await depositedBill.save();

  const existingBill = await Bill.findOne({ apartment: apartment._id, month, year, period, type: "rent" });

  if (existingBill) {
    return { success: false, message: "Bill already generated" };
  }

  const monthlyBill = new Bill({
    client: apartment.client,
    property: apartment.property,
    apartment: apartment._id,
    tenant: apartment.tenant,
    amount: apartment.rent,
    month,
    year,
    period,
    type: "rent",
    description: `Monthly rent for ${isFirstHalf ? "first" : "second"} half of ${moment().format("MMMM, YYYY")}`,
  });

  await monthlyBill.save();

  return { success: true, message: "Bill generated successfully" };
};

exports.generateBill = async ({ apartmentId }) => {
  const apartment = await Apartment.findOne({ apartmentId });

  if (!apartment.tenant) {
    return { success: false, message: "Apartment is not occupied" };
  }

  const leaseStartDate = apartment.leaseStartDate;
  const isFirstHalf = new Date(leaseStartDate).getDate() <= 15;
  const period = isFirstHalf ? "first-half" : "second-half";
  const month = moment(leaseStartDate).format("MMMM");
  const year = moment(leaseStartDate).format("YYYY");

  const existingBill = await Bill.findOne({ apartment: apartment._id, month, year, period, type: "rent" });

  if (existingBill) {
    return { success: false, message: "Bill already generated" };
  }

  const bill = new Bill({
    client: apartment.client,
    property: apartment.property,
    apartment: apartment._id,
    tenant: apartment.tenant,
    amount: apartment.rent,
    month,
    year,
    period,
    description: `Monthly rent for ${isFirstHalf ? "first" : "second"} half of ${moment().format("MMMM, YYYY")}`,
  });

  await bill.save();

  return { success: true, message: "Bill generated successfully" };
};

const Coupon = require("../coupons/coupon.model");
const Customer = require("../customers/customer.model");
const Order = require("../orders/order.model");
const Product = require("../products/product.model");
const ApiError = require("../../utils/ApiError");
const ORDER_STATUS = require("../../constants/orderStatus");

const LOW_STOCK_THRESHOLD = 5;
const DEFAULT_BEST_SELLING_LIMIT = 5;
const MAX_BEST_SELLING_LIMIT = 100;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DASHBOARD_TIMEZONE = process.env.TZ || "Africa/Cairo";
const EXCLUDED_ORDER_STATUSES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.PAYMENT_REJECTED, ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PAYMENT_SUBMITTED];

const getRevenueTotal = async (match = {}) => {
  const [result] = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: { $subtract: ["$total", { $ifNull: ["$shippingFee", 0] }] } },
      },
    },
  ]);

  return result?.total || 0;
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getRevenuePeriodConfig = (period) => {
  const now = new Date();
  const normalizedPeriod = String(period || "year").toLowerCase();

  if (normalizedPeriod === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    return {
      start,
      end,
      bucket: { $month: { date: "$createdAt", timezone: DASHBOARD_TIMEZONE } },
      labels: MONTH_NAMES.map((name, index) => ({ key: index + 1, name })),
    };
  }

  if (normalizedPeriod === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return {
      start,
      end,
      bucket: { $dayOfMonth: { date: "$createdAt", timezone: DASHBOARD_TIMEZONE } },
      labels: Array.from({ length: daysInMonth }, (_, index) => ({ key: index + 1, name: String(index + 1) })),
    };
  }

  if (normalizedPeriod === "week") {
    const start = getStartOfDay(now);
    start.setDate(start.getDate() - 6);
    const end = getStartOfDay(now);
    end.setDate(end.getDate() + 1);
    const labels = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { key: formatDateKey(date), name: WEEKDAY_NAMES[date.getDay()] };
    });

    return {
      start,
      end,
      bucket: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: DASHBOARD_TIMEZONE } },
      labels,
    };
  }

  throw new ApiError(400, "Period must be one of: year, month, week");
};

const getRevenueByPeriod = async (period = "year") => {
  const { start, end, bucket, labels } = getRevenuePeriodConfig(period);
  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: bucket,
        revenue: { $sum: { $subtract: ["$total", { $ifNull: ["$shippingFee", 0] }] } },
      },
    },
  ]);
  const revenueByBucket = new Map(rows.map((row) => [row._id, row.revenue]));

  return labels.map((label) => ({
    name: label.name,
    revenue: revenueByBucket.get(label.key) || 0,
  }));
};

const normalizeBestSellingLimit = (limit) => {
  if (limit === undefined) return DEFAULT_BEST_SELLING_LIMIT;

  const parsedLimit = Number(limit);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > MAX_BEST_SELLING_LIMIT) {
    throw new ApiError(400, `Limit must be an integer from 1 to ${MAX_BEST_SELLING_LIMIT}`);
  }

  return parsedLimit;
};

const getBestSellingProducts = async (limit) => {
  const normalizedLimit = normalizeBestSellingLimit(limit);
  const products = await Order.aggregate([
    { $match: { orderStatus: { $nin: EXCLUDED_ORDER_STATUSES } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        sold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { sold: -1, revenue: -1, name: 1 } },
    { $limit: normalizedLimit },
    { $project: { _id: 0, name: 1, sold: 1, revenue: 1 } },
  ]);

  return products;
};

const getOverview = async () => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const activeCouponFilter = {
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }] },
      {
        $or: [
          { usageLimit: { $exists: false } },
          { usageLimit: null },
          { usageLimit: 0 },
          { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
        ],
      },
    ],
  };

  const [
    totalRevenue,
    monthlyRevenue,
    todaysOrders,
    pendingOrders,
    totalCustomers,
    productsInStock,
    lowStockAlerts,
    activeCoupons,
  ] = await Promise.all([
    getRevenueTotal({ orderStatus: { $nin: EXCLUDED_ORDER_STATUSES } }),
    getRevenueTotal({ createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }, orderStatus: { $nin: EXCLUDED_ORDER_STATUSES } }),
    Order.countDocuments({ createdAt: { $gte: startOfToday, $lt: startOfTomorrow } }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING_PAYMENT }),
    Customer.countDocuments(),
    Product.countDocuments({ isActive: true, stock: { $gt: 0 } }),
    Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
    Coupon.countDocuments(activeCouponFilter),
  ]);

  return {
    totalRevenue,
    todaysOrders,
    pendingOrders,
    totalCustomers,
    productsInStock,
    lowStockAlerts,
    activeCoupons,
    monthlyRevenue,
  };
};

module.exports = { getOverview, getRevenueByPeriod, getBestSellingProducts };

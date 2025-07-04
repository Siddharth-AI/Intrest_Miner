const { selectRecord, checkRecordExists } = require("../utils/sqlFunctions")
const { customResponse } = require("../utils/customResponse")

// Get billing history
// const getBillingHistory = async (req, res) => {
//   try {
//     const user_uuid = req.user.uuid
//     const { limit = 10, offset = 0, start_date, end_date } = req.query

//     let query = `
//       SELECT 
//         bh.*,
//         sp.name as plan_name,
//         sp.description as plan_description,
//         p.payment_method,
//         p.transaction_id,
//         p.gateway_payment_id,
//         u.name as user_name,
//         u.email as user_email
//       FROM billing_history bh
//       JOIN subscription_plans sp ON bh.plan_id = sp.id
//       LEFT JOIN payments p ON bh.payment_uuid = p.uuid
//       JOIN users u ON bh.user_uuid = u.uuid
//       WHERE bh.uuid = ? AND bh.user_uuid = ?
//     `

//     const params = [user_uuid]

//     if (start_date) {
//       query += " AND bh.billing_date >= ?"
//       params.push(new Date(start_date))
//     }

//     if (end_date) {
//       query += " AND bh.billing_date <= ?"
//       params.push(new Date(end_date))
//     }

//     query += " ORDER BY bh.billing_date DESC LIMIT ? OFFSET ?"
//     params.push(Number.parseInt(limit), Number.parseInt(offset))

//     const billingHistory = await selectRecord(query, params)

//     // Get total count for pagination
//     // const countQuery = `
//     //   SELECT COUNT(*) as total 
//     //   FROM billing_history 
//     //   WHERE user_uuid = ?
//     //   ${start_date ? "AND billing_date >= ?" : ""}
//     //   ${end_date ? "AND billing_date <= ?" : ""}
//     // `
//     const countQuery = `
//       SELECT COUNT(*) as total 
//       FROM billing_history 
//       WHERE user_uuid = ?
//       ${start_date ? "AND billing_period_start >= ?" : ""}
//       ${end_date ? "AND billing_period_start <= ?" : ""}
//     `

//     const countParams = [user_uuid]
//     if (start_date) countParams.push(new Date(start_date))
//     if (end_date) countParams.push(new Date(end_date))

//     const countResult = await selectRecord(countQuery, countParams)
//     const totalCount = countResult[0].total

//     return res.status(200).json({
//       status: 200,
//       success: true,
//       data: billingHistory,
//       pagination: {
//         limit: Number.parseInt(limit),
//         offset: Number.parseInt(offset),
//         total: totalCount,
//       },
//     })
//   } catch (error) {
//     console.error("Get billing history error:", error)
//     return customResponse("Failed to fetch billing history", 500, false)(req, res)
//   }
// }
const getBillingHistory = async (req, res) => {
  try {
    const user_uuid = req.user.uuid;
    const { limit = 10, offset = 0, start_date, end_date } = req.query;

    let query = `
      SELECT 
        bh.*,
        sp.name as plan_name,
        sp.description as plan_description,
        p.payment_method,
        p.transaction_id,
        p.gateway_payment_id,
        u.name as user_name,
        u.email as user_email
      FROM billing_history bh
      JOIN subscription_plans sp ON bh.plan_id = sp.id
      LEFT JOIN payments p ON bh.payment_uuid = p.uuid
      JOIN users u ON bh.user_uuid = u.uuid
      WHERE bh.user_uuid = ?
    `;

    const params = [user_uuid];

    if (start_date) {
      query += " AND bh.billing_date >= ?";
      params.push(start_date); // Or format as needed
    }

    if (end_date) {
      query += " AND bh.billing_date <= ?";
      params.push(end_date); // Or format as needed
    }

    query += " ORDER BY bh.billing_date DESC LIMIT ? OFFSET ?";
    params.push(Number.parseInt(limit), Number.parseInt(offset));

    const billingHistory = await selectRecord(query, params);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM billing_history 
      WHERE user_uuid = ?
      ${start_date ? "AND billing_date >= ?" : ""}
      ${end_date ? "AND billing_date <= ?" : ""}
    `;
    const countParams = [user_uuid];
    if (start_date) countParams.push(start_date);
    if (end_date) countParams.push(end_date);

    const countResult = await selectRecord(countQuery, countParams);
    const totalCount = countResult[0].total;

    return res.status(200).json({
      status: 200,
      success: true,
      data: billingHistory,
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("Get billing history error:", error);
    return customResponse("Failed to fetch billing history", 500, false)(req, res);
  }
};



// Get invoice details
const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params
    const user_uuid = req.user.uuid

    const query = `
      SELECT 
  COUNT(*) as total_transactions,
  SUM(amount) as total_spent,
  AVG(amount) as average_transaction,
  billing_type,
  COUNT(*) as type_count
FROM billing_history 
WHERE user_uuid = ? AND status = 'completed' AND billing_period_start >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY billing_type
    `

    const invoices = await selectRecord(query, [invoiceId, user_uuid])

    if (invoices.length === 0) {
      return customResponse("Invoice not found", 404, false)(req, res)
    }

    const invoice = invoices[0]

    return res.status(200).json({
      status: 200,
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error("Get invoice error:", error)
    return customResponse("Failed to fetch invoice details", 500, false)(req, res)
  }
}

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const user_uuid = req.user.uuid
    const { limit = 10, offset = 0, status } = req.query

    let query = `
      SELECT 
        p.uuid,
        p.amount,
        p.currency,
        p.payment_method,
        p.payment_gateway,
        p.transaction_id,
        p.status,
        p.payment_date,
        p.created_at,
        sp.name as plan_name,
        us.uuid as subscription_id
      FROM payments p
      JOIN subscription_plans sp ON p.plan_id = sp.id
      LEFT JOIN user_subscriptions us ON p.subscription_uuid = us.uuid
      WHERE p.user_uuid = ?
    `

    const params = [user_uuid]

    if (status) {
      query += " AND p.status = ?"
      params.push(status)
    }

    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const payments = await selectRecord(query, params)

    return res.status(200).json({
      status: 200,
      success: true,
      data: payments,
    })
  } catch (error) {
    console.error("Get payment history error:", error)
    return customResponse("Failed to fetch payment history", 500, false)(req, res)
  }
}

// Get spending summary
const getSpendingSummary = async (req, res) => {
  try {
    const user_uuid = req.user.uuid
    const { period = "month" } = req.query // month, quarter, year

    let dateFilter = ""
    switch (period) {
      case "month":
        dateFilter = "AND bh.billing_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)"
        break
      case "quarter":
        dateFilter = "AND bh.billing_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)"
        break
      case "year":
        dateFilter = "AND bh.billing_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)"
        break
    }

    const summaryQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_spent,
        AVG(amount) as average_transaction,
        billing_type,
        COUNT(*) as type_count
      FROM billing_history 
      WHERE user_uuid = ? AND status = 'completed' ${dateFilter}
      GROUP BY billing_type
    `

    const summary = await selectRecord(summaryQuery, [user_uuid])

    const totalQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_spent,
        AVG(amount) as average_transaction
      FROM billing_history 
      WHERE user_uuid = ? AND status = 'completed' ${dateFilter}
    `

    const totals = await selectRecord(totalQuery, [user_uuid])

    return res.status(200).json({
      status: 200,
      success: true,
      data: {
        period,
        totals: totals[0] || { total_transactions: 0, total_spent: 0, average_transaction: 0 },
        breakdown: summary,
      },
    })
  } catch (error) {
    console.error("Get spending summary error:", error)
    return customResponse("Failed to fetch spending summary", 500, false)(req, res)
  }
}

module.exports = {
  getBillingHistory,
  getInvoice,
  getPaymentHistory,
  getSpendingSummary,
}

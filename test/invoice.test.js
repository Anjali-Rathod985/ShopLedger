const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

test('invoice matches checkout HSN tax, capped discount, and billed total', () => {
  const items = [
    { name: 'Cold-Pressed Groundnut Oil 5L', price: 1120, qty: 2, hsn: '1508' }
  ];
  const actual = invoice.computeInvoiceFigures({ items, coupon: 'SAVE10' });
  const billed = pricing.computeTotals(items, 'SAVE10');
  assert.deepEqual({ subtotal: actual.subtotal, discount: actual.discount, tax: actual.tax, total: actual.total }, {
    subtotal: billed.subtotal, discount: billed.discount, tax: billed.tax, total: billed.total
  });
  assert.equal(actual.rows[0].gstPercent, 5);
});

const scenarios = [
  {
    name: 'CURRENT BEHAVIOUR: order #1001 mixed 5% and 12% items without coupon',
    coupon: '',
    items: [
      { name: 'Indrayani Basmati Rice 5kg', sku: 'RICE-5', price: 640, qty: 1, hsn: '1006' },
      { name: 'A2 Gir Cow Ghee 500ml', sku: 'GHEE-1', price: 450, qty: 1, hsn: '0405' }
    ],
    expected: { subtotal: 1090, discount: 0, tax: 86, cgst: 43, sgst: 43, total: 1176, gst: [5, 12], rowTax: [32, 54] }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1002 applies SAVE10 to a mixed 5% cart',
    coupon: 'SAVE10',
    items: [
      { name: 'Indrayani Basmati Rice 5kg', price: 640, qty: 1, hsn: '1006' },
      { name: 'Cold-Pressed Sunflower Oil 1L', price: 190, qty: 2, hsn: '1512' }
    ],
    expected: { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9, gst: [5, 5], rowTax: [28.8, 17.1] }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1004 applies SAVE10 above the ₹150 cap',
    coupon: 'SAVE10',
    items: [{ name: 'Cold-Pressed Groundnut Oil 5L', price: 1120, qty: 2, hsn: '1508' }],
    expected: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5, gst: [5], rowTax: [104.5] }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1008 all 18% items without coupon',
    coupon: '',
    items: [
      { name: 'Assam CTC Masala Chai 250g', price: 140, qty: 1, hsn: '0902' },
      { name: 'Filter Coffee Decoction Blend 500g', price: 310, qty: 1, hsn: '0901' }
    ],
    expected: { subtotal: 450, discount: 0, tax: 81, cgst: 40.5, sgst: 40.5, total: 531, gst: [18, 18], rowTax: [25.2, 55.8] }
  }
];

for (const scenario of scenarios) {
  test(scenario.name, () => {
    const actual = invoice.computeInvoiceFigures({ items: scenario.items, coupon: scenario.coupon });
    const billed = pricing.computeTotals(scenario.items, scenario.coupon);

    assert.deepEqual({
      subtotal: actual.subtotal,
      discount: actual.discount,
      tax: actual.tax,
      cgst: actual.cgst,
      sgst: actual.sgst,
      total: actual.total,
      gst: actual.rows.map(row => row.gstPercent),
      rowTax: actual.rows.map(row => row.lineTax)
    }, scenario.expected);

    // Pin the billed figures alongside the invoice result for comparison.
    assert.equal(billed.subtotal, scenario.items.reduce((sum, item) => sum + item.price * item.qty, 0));
  });
}

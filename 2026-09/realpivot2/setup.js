const { setLogging, createDataSet, createCubeManager, createControl } = window.RealPivot2

const ORDER_FIELDS = [
    { name: 'OrderID', type: 'text' },
    { name: 'Date', type: 'date' },
    { name: 'CustomerID', type: 'text' },
    { name: 'Product', type: 'text' },
    { name: 'Quantity', type: 'number' },
    { name: 'UnitPrice', type: 'number' },
    { name: 'ShippingAddress', type: 'text' },
    { name: 'PaymentMethod', type: 'text' },
    { name: 'OrderStatus', type: 'text' },
    { name: 'TrackingNumber', type: 'text' },
    { name: 'ItemsInCart', type: 'number' },
    { name: 'CouponCode', type: 'text' },
    { name: 'ReferralSource', type: 'text' },
    { name: 'TotalPrice', type: 'number' },
]

export async function bootOrders(schema) {
    setLogging(false)

    const control = createControl(document, 'control')
    const ds = await createDataSet(
        [
            {
                name: 'ecommerceOrders',
                sourceUrl: './asset/ecommerce-orders.csv',
                sourceType: 'csv',
                csvOptions: { quoted: true },
                table: { fields: ORDER_FIELDS },
            },
        ],
        { indicator: 'progress', control },
    )
    const cm = createCubeManager(ds, [
        {
            name: 'orders',
            table: 'ecommerceOrders',
            schema,
            columnar: true,
        },
    ])

    return { control, cm }
}

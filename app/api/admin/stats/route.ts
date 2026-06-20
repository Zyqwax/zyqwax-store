import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    await connectDB();

    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      recentOrders,
      ordersByStatus,
      monthlySales,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
    ]);

    // Toplam gelir (teslim edilmiş + kargoda)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      recentOrders,
      ordersByStatus,
      monthlySales: monthlySales.reverse(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

    await connectDB();
    const order = await Order.findById(params.id).populate('user', 'name email');
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });

    // Yetki kontrolü: admin veya siparişin sahibi
    if (session.role !== 'admin' && order.user._id.toString() !== session.userId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    await connectDB();
    const data = await request.json();
    const order = await Order.findByIdAndUpdate(params.id, data, { new: true }).populate('user', 'name email');
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

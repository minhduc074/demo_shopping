import { prisma } from "../lib/prisma";

export const CartService = {
  async getOrCreateCart(userId: string) {
    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });
    return cart;
  },

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId, status: "ACTIVE" },
    });
    if (!product) {
      const err = new Error("Sản phẩm không tồn tại") as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    if (product.inventoryCount < quantity) {
      const err = new Error(`Chỉ còn ${product.inventoryCount} sản phẩm trong kho`) as Error & { statusCode: number };
      err.statusCode = 400;
      throw err;
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.inventoryCount < newQty) {
        const err = new Error(`Chỉ còn ${product.inventoryCount} sản phẩm trong kho`) as Error & { statusCode: number };
        err.statusCode = 400;
        throw err;
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return this.getOrCreateCart(userId);
  },

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      const err = new Error("Sản phẩm không có trong giỏ hàng") as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product && product.inventoryCount < quantity) {
        const err = new Error(`Chỉ còn ${product.inventoryCount} sản phẩm trong kho`) as Error & { statusCode: number };
        err.statusCode = 400;
        throw err;
      }
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getOrCreateCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      const err = new Error("Sản phẩm không có trong giỏ hàng") as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreateCart(userId);
  },

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  },
};

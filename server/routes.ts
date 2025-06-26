import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { createOrderRequestSchema } from "@shared/schema";

const createOrderRequestSchema = z.object({
  customerName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(1, "Số điện thoại là bắt buộc"),
  customerAddress: z.string().optional(),
  items: z.array(z.object({
    productName: z.string().min(1, "Tên sản phẩm là bắt buộc"),
    quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
    price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  })).min(1, "Phải có ít nhất một sản phẩm"),
});

const updateOrderSchema = z.object({
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  status: z.enum(["pending", "processing", "completed", "cancelled"]).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      const { search, status } = req.query;
      
      let orders;
      if (search) {
        orders = await storage.searchOrders(search as string);
      } else if (status && status !== 'all') {
        orders = await storage.filterOrdersByStatus(status as string);
      } else {
        orders = await storage.getAllOrders();
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Lỗi khi tải danh sách đơn hàng" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
      }

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Lỗi khi tải thông tin đơn hàng" });
    }
  });

  // Create new order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = createOrderRequestSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ",
          errors: error.errors 
        });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Lỗi khi tạo đơn hàng" });
    }
  });

  // Update order
  app.put("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
      }

      const validatedData = updateOrderSchema.parse(req.body);
      const order = await storage.updateOrder(orderId, validatedData);
      
      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ",
          errors: error.errors 
        });
      }
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng" });
    }
  });

  // Delete order
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
      }

      const success = await storage.deleteOrder(orderId);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      res.json({ message: "Đã xóa đơn hàng thành công" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Lỗi khi xóa đơn hàng" });
    }
  });

  // Get order statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Lỗi khi tải thống kê" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

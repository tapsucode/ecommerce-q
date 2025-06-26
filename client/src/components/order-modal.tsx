import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { OrderWithItems } from "@shared/schema";

const formSchema = z.object({
  customerName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  customerEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  customerPhone: z.string().min(1, "Số điện thoại là bắt buộc"),
  customerAddress: z.string().optional(),
  status: z.enum(["pending", "processing", "completed", "cancelled"]).optional(),
  items: z.array(z.object({
    productName: z.string().min(1, "Tên sản phẩm là bắt buộc"),
    quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
    price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  })).min(1, "Phải có ít nhất một sản phẩm"),
});

type FormData = z.infer<typeof formSchema>;

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderWithItems | null;
}

export default function OrderModal({ isOpen, onClose, order }: OrderModalProps) {
  const { toast } = useToast();
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      status: "pending",
      items: [{ productName: "", quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  // Calculate total whenever items change
  useEffect(() => {
    const total = watchedItems.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    );
    setCalculatedTotal(total);
  }, [watchedItems]);

  // Reset form when modal opens/closes or order changes
  useEffect(() => {
    if (isOpen) {
      if (order) {
        // Edit mode
        form.reset({
          customerName: order.customerName,
          customerEmail: order.customerEmail || "",
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress || "",
          status: order.status as "pending" | "processing" | "completed" | "cancelled",
          items: order.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            price: parseFloat(item.price),
          })),
        });
      } else {
        // Create mode
        form.reset({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          customerAddress: "",
          status: "pending",
          items: [{ productName: "", quantity: 1, price: 0 }],
        });
      }
    }
  }, [isOpen, order, form]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã tạo đơn hàng thành công",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PUT", `/api/orders/${order!.id}`, {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        status: data.status,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật đơn hàng thành công",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (order) {
      updateOrderMutation.mutate(data);
    } else {
      createOrderMutation.mutate(data);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const addProduct = () => {
    append({ productName: "", quantity: 1, price: 0 });
  };

  const removeProduct = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên khách hàng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số điện thoại" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Nhập email khách hàng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ giao hàng</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập địa chỉ giao hàng"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status field for edit mode */}
            {order && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Product Information - Only show in create mode */}
            {!order && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Thông tin sản phẩm</h4>
                  <Button type="button" variant="outline" onClick={addProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <FormField
                        control={form.control}
                        name={`items.${index}.productName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên sản phẩm *</FormLabel>
                            <FormControl>
                              <Input placeholder="Tên sản phẩm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số lượng *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giá (₫) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => removeProduct(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary - Only show in create mode */}
            {!order && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculatedTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
              >
                {order ? "Cập nhật đơn hàng" : "Tạo đơn hàng"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

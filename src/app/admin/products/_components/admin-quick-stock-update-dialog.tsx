"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateStock } from "@/hooks/admin/products";
import { Product } from "@/types/custom.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const quickStockUpdateSchema = z.object({
  quantity: z.number().int().min(0, "Số lượng không thể âm"),
  operation: z.enum(["set", "add", "subtract"]),
  reason: z
    .string()
    .min(3, "Lý do phải có ít nhất 3 ký tự")
    .max(500, "Lý do tối đa 500 ký tự")
    .optional(),
});

type QuickStockUpdateFormData = z.infer<typeof quickStockUpdateSchema>;

interface AdminQuickStockUpdateDialogProps {
  children: React.ReactNode;
  product: Product & {
    categories?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
}

export function AdminQuickStockUpdateDialog({
  children,
  product,
}: AdminQuickStockUpdateDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<QuickStockUpdateFormData>({
    resolver: zodResolver(quickStockUpdateSchema),
    defaultValues: {
      quantity: 0,
      operation: "set",
      reason: "",
    },
  });

  const updateStock = useUpdateStock({
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: QuickStockUpdateFormData) => {
    updateStock.mutate({
      productId: product.id,
      quantity: data.quantity,
      operation: data.operation,
      reason: data.reason,
    });
  };

  const calculateNewStock = () => {
    const operation = form.watch("operation");
    const quantity = form.watch("quantity") || 0;
    const currentStock = product.stock_quantity;

    switch (operation) {
      case "set":
        return quantity;
      case "add":
        return currentStock + quantity;
      case "subtract":
        return Math.max(0, currentStock - quantity);
      default:
        return currentStock;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật tồn kho</DialogTitle>
          <DialogDescription>
            Cập nhật số lượng tồn kho cho sản phẩm &ldquo;{product.name}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <div className="text-sm text-gray-600">Tồn kho hiện tại:</div>
          <div className="text-xl font-semibold">{product.stock_quantity}</div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thao tác</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thao tác" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="set">Đặt thành</SelectItem>
                      <SelectItem value="add">Cộng thêm</SelectItem>
                      <SelectItem value="subtract">Trừ đi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">Tồn kho sau cập nhật:</div>
              <div className="text-xl font-semibold text-blue-800">
                {calculateNewStock()}
              </div>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập lý do cập nhật tồn kho"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateStock.isPending}>
                {updateStock.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cập nhật
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

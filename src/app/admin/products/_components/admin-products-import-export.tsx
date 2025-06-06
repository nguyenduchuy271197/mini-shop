"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileText, CheckCircle, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const importSchema = z.object({
  file: z.any().refine((file) => file?.length > 0, "Vui lòng chọn file"),
  updateExisting: z.boolean(),
  skipErrors: z.boolean(),
});

type ImportFormData = z.infer<typeof importSchema>;

interface ImportResult {
  total: number;
  success: number;
  errors: number;
  warnings: string[];
  errorDetails: Array<{
    row: number;
    error: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
  }>;
}

export function AdminProductsImportExport() {
  const [importOpen, setImportOpen] = useState(false);

  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const importForm = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      updateExisting: false,
      skipErrors: true,
    },
  });

  const handleImport = async (data: ImportFormData) => {
    setImporting(true);
    setImportProgress(0);

    try {
      // Simulate import process
      const file = data.file[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("updateExisting", data.updateExisting.toString());
      formData.append("skipErrors", data.skipErrors.toString());

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Mock result
      const result: ImportResult = {
        total: 150,
        success: 145,
        errors: 5,
        warnings: [
          "Một số sản phẩm không có hình ảnh",
          "Một số danh mục không tồn tại và đã được tạo mới",
        ],
        errorDetails: [
          { row: 15, error: "SKU đã tồn tại", data: { sku: "PROD-001" } },
          { row: 23, error: "Giá không hợp lệ", data: { price: "invalid" } },
          {
            row: 45,
            error: "Danh mục không tồn tại",
            data: { category: "Unknown" },
          },
          {
            row: 67,
            error: "Tên sản phẩm quá dài",
            data: { name: "Very long product name..." },
          },
          { row: 89, error: "Số lượng tồn kho âm", data: { stock: -5 } },
        ],
      };

      setImportResult(result);
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    setExporting(true);

    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create download link
      const blob = new Blob(["Sample export data"], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,slug,sku,description,price,compare_price,cost_price,stock_quantity,low_stock_threshold,category_name,brand,weight,is_active,is_featured,tags,meta_title,meta_description
"Sản phẩm mẫu","san-pham-mau","SAMPLE-001","Mô tả sản phẩm mẫu",100000,120000,80000,50,10,"Danh mục mẫu","Thương hiệu mẫu",0.5,true,false,"tag1,tag2","Meta title mẫu","Meta description mẫu"`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex gap-2">
      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import sản phẩm</DialogTitle>
            <DialogDescription>
              Tải lên file CSV hoặc Excel để import sản phẩm hàng loạt
            </DialogDescription>
          </DialogHeader>

          {!importResult ? (
            <Form {...importForm}>
              <form
                onSubmit={importForm.handleSubmit(handleImport)}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Chưa có file mẫu?</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Tải file mẫu
                    </Button>
                  </div>

                  <FormField
                    control={importForm.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chọn file</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={importForm.control}
                      name="updateExisting"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">
                            Cập nhật sản phẩm đã tồn tại
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={importForm.control}
                      name="skipErrors"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">
                            Bỏ qua các dòng lỗi
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {importing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Đang import...</span>
                        <span>{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setImportOpen(false)}
                    disabled={importing}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={importing}>
                    {importing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Import
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Import hoàn thành!</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {importResult.total}
                  </p>
                  <p className="text-sm text-gray-600">Tổng số dòng</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {importResult.success}
                  </p>
                  <p className="text-sm text-gray-600">Thành công</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {importResult.errors}
                  </p>
                  <p className="text-sm text-gray-600">Lỗi</p>
                </div>
              </div>

              {importResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Cảnh báo:
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.errorDetails.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    Chi tiết lỗi:
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {importResult.errorDetails.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-2">
                        <span className="font-medium">Dòng {error.row}:</span>{" "}
                        {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportResult(null);
                    setImportOpen(false);
                    importForm.reset();
                  }}
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    setImportResult(null);
                    importForm.reset();
                  }}
                >
                  Import tiếp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("xlsx")}>
            <FileText className="mr-2 h-4 w-4" />
            Export Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

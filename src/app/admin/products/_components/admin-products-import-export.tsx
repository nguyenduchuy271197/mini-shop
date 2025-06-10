"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useExportProducts, useImportProducts } from "@/hooks/admin/products";
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
  validateOnly: z.boolean(),
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
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Hooks
  const exportMutation = useExportProducts({
    onSuccess: (result) => {
      console.log("Export successful:", result);
    },
  });

  const importMutation = useImportProducts({
    onSuccess: (result) => {
      setImportResult({
        total: result.imported + result.updated + result.skipped,
        success: result.imported + result.updated,
        errors: result.errors.length,
        warnings:
          result.errors.length > 0
            ? ["Một số sản phẩm có lỗi trong quá trình import"]
            : [],
        errorDetails: result.errors.map((error, index) => ({
          row: index + 1,
          error,
          data: {},
        })),
      });
    },
  });

  const importForm = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      updateExisting: false,
      validateOnly: false,
    },
  });

  const handleImport = async (data: ImportFormData) => {
    setImportProgress(0);
    const file = data.file[0];

    try {
      // Read file content as text
      const csvData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Không thể đọc file"));
        reader.readAsText(file);
      });

      importMutation.mutate({
        csvData,
        overwrite: data.updateExisting,
        validateOnly: false,
      });
    } catch (error) {
      console.error("File reading error:", error);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    exportMutation.mutate({
      filters: {}, // Export all products by default
      format,
      includeInactive: false,
    });
  };

  const downloadTemplate = () => {
    const csvContent = `name,slug,sku,description,short_description,price,compare_price,cost_price,stock_quantity,low_stock_threshold,category_id,brand,weight,images,tags,is_active,is_featured
"Sản phẩm mẫu","san-pham-mau","SAMPLE-001","Mô tả chi tiết sản phẩm mẫu","Mô tả ngắn",100000,120000,80000,50,10,1,"Thương hiệu mẫu",0.5,"https://example.com/image1.jpg|https://example.com/image2.jpg","tag1,tag2",true,false
"Áo thun nam","ao-thun-nam","SHIRT-001","Áo thun nam 100% cotton","Áo thun cotton thoáng mát",299000,350000,200000,100,20,2,"Fashion Brand",0.3,"https://example.com/shirt.jpg","áo thun,nam,cotton",true,true`;

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
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
                      name="validateOnly"
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
                            Chỉ xác thực dữ liệu (không import)
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {importMutation.isPending && (
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
                    disabled={importMutation.isPending}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={importMutation.isPending}>
                    {importMutation.isPending && (
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
          <Button
            variant="outline"
            size="sm"
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
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
          <DropdownMenuItem onClick={() => handleExport("json")}>
            <FileText className="mr-2 h-4 w-4" />
            Export JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CalendarIcon,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  useReconcilePayments,
  ReconcilePaymentsResponse,
} from "@/hooks/admin/payments";
import {
  getReconciliationSeverityColor,
  getReconciliationSeverityText,
  getReconciliationTypeText,
} from "../_lib/utils";

interface AdminPaymentsReconciliationProps {
  onReconciliationComplete?: (result: ReconcilePaymentsResponse) => void;
}

export function AdminPaymentsReconciliation({
  onReconciliationComplete,
}: AdminPaymentsReconciliationProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [includePartial, setIncludePartial] = useState(false);
  const [autoFix, setAutoFix] = useState(true);
  const [lastResult, setLastResult] =
    useState<ReconcilePaymentsResponse | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    summary: true,
    issues: false,
    fixed: false,
  });

  const reconcilePayments = useReconcilePayments({
    onSuccess: (result) => {
      setLastResult(result);
      onReconciliationComplete?.(result);
    },
  });

  const handleReconcile = () => {
    if (!selectedDate) return;

    reconcilePayments.mutate({
      date: format(selectedDate, "yyyy-MM-dd"),
      includePartial,
      autoFix,
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getSeverityIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Reconciliation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Đối soát thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ngày đối soát</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePartial"
                  checked={includePartial}
                  onCheckedChange={(checked) => setIncludePartial(!!checked)}
                />
                <Label htmlFor="includePartial" className="text-sm">
                  Bao gồm giao dịch một phần
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoFix"
                  checked={autoFix}
                  onCheckedChange={(checked) => setAutoFix(!!checked)}
                />
                <Label htmlFor="autoFix" className="text-sm">
                  Tự động sửa lỗi (nếu có thể)
                </Label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleReconcile}
            disabled={!selectedDate || reconcilePayments.isPending}
            className="w-full"
          >
            {reconcilePayments.isPending
              ? "Đang đối soát..."
              : "Bắt đầu đối soát"}
          </Button>
        </CardContent>
      </Card>

      {/* Reconciliation Results */}
      {lastResult && (
        <div className="space-y-4">
          {/* Summary */}
          <Collapsible
            open={expandedSections.summary}
            onOpenChange={() => toggleSection("summary")}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Tổng quan đối soát -{" "}
                      {format(
                        new Date(lastResult.reconciliation.date),
                        "dd/MM/yyyy"
                      )}
                    </span>
                    {expandedSections.summary ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {lastResult.reconciliation.summary.total_payments_checked.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Thanh toán kiểm tra
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {lastResult.reconciliation.summary.total_orders_checked.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Đơn hàng kiểm tra
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {lastResult.reconciliation.summary.total_issues_found.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vấn đề phát hiện
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {lastResult.reconciliation.summary.auto_fixed_count.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Đã tự động sửa
                      </p>
                    </div>
                  </div>

                  {lastResult.reconciliation.summary
                    .total_amount_discrepancy !== 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Chênh lệch tổng số tiền:{" "}
                        {lastResult.reconciliation.summary.total_amount_discrepancy.toLocaleString()}
                        đ
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Vấn đề theo loại</h4>
                      <div className="space-y-2">
                        {Object.entries(
                          lastResult.reconciliation.summary.issues_by_type
                        ).map(([type, count]) => (
                          <div key={type} className="flex justify-between">
                            <span className="text-sm">
                              {getReconciliationTypeText(type)}
                            </span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Vấn đề theo mức độ</h4>
                      <div className="space-y-2">
                        {Object.entries(
                          lastResult.reconciliation.summary.issues_by_severity
                        ).map(([severity, count]) => (
                          <div key={severity} className="flex justify-between">
                            <span className="text-sm">
                              {getReconciliationSeverityText(
                                severity as "low" | "medium" | "high"
                              )}
                            </span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Issues */}
          {lastResult.reconciliation.issues.length > 0 && (
            <Collapsible
              open={expandedSections.issues}
              onOpenChange={() => toggleSection("issues")}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Vấn đề cần xử lý (
                        {lastResult.reconciliation.issues.length})
                      </span>
                      {expandedSections.issues ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-3">
                      {lastResult.reconciliation.issues.map((issue, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${getReconciliationSeverityColor(
                            issue.severity
                          )}`}
                        >
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {getReconciliationTypeText(issue.type)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {getReconciliationSeverityText(
                                    issue.severity
                                  )}
                                </Badge>
                                {issue.auto_fixable && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Có thể tự động sửa
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">
                                {issue.description}
                              </p>
                              {issue.payment_id && (
                                <p className="text-xs text-muted-foreground">
                                  Payment ID: {issue.payment_id}
                                </p>
                              )}
                              {issue.order_id && (
                                <p className="text-xs text-muted-foreground">
                                  Order ID: {issue.order_id} (
                                  {issue.order_number})
                                </p>
                              )}
                              {issue.expected_value !== undefined &&
                                issue.actual_value !== undefined && (
                                  <div className="text-xs text-muted-foreground">
                                    <span>
                                      Mong đợi: {issue.expected_value}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>Thực tế: {issue.actual_value}</span>
                                  </div>
                                )}
                              {issue.suggestion && (
                                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                  <strong>Gợi ý:</strong> {issue.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Fixed Issues */}
          {lastResult.reconciliation.fixed_issues.length > 0 && (
            <Collapsible
              open={expandedSections.fixed}
              onOpenChange={() => toggleSection("fixed")}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Vấn đề đã sửa (
                        {lastResult.reconciliation.fixed_issues.length})
                      </span>
                      {expandedSections.fixed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-3">
                      {lastResult.reconciliation.fixed_issues.map(
                        (issue, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg border border-green-200 bg-green-50"
                          >
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getReconciliationTypeText(issue.type)}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Đã sửa tự động
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium">
                                  {issue.description}
                                </p>
                                {issue.payment_id && (
                                  <p className="text-xs text-muted-foreground">
                                    Payment ID: {issue.payment_id}
                                  </p>
                                )}
                                {issue.order_id && (
                                  <p className="text-xs text-muted-foreground">
                                    Order ID: {issue.order_id} (
                                    {issue.order_number})
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
}

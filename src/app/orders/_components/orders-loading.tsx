import { Card, CardContent } from "@/components/ui/card";

export default function OrdersLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

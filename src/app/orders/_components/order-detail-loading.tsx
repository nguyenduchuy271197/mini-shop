import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OrderDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Order Status Card */}
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items Card */}
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

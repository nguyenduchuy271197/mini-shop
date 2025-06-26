"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

const faqCategories = [
  {
    id: "ordering",
    name: "Đặt hàng",
    color: "bg-blue-100 text-blue-800",
    questions: [
      {
        id: 1,
        question: "Làm thế nào để đặt hàng trên website?",
        answer:
          "Để đặt hàng, bạn chỉ cần: 1) Tìm sản phẩm muốn mua, 2) Thêm vào giỏ hàng, 3) Tiến hành thanh toán, 4) Điền thông tin giao hàng và hoàn tất đơn hàng.",
      },
      {
        id: 2,
        question: "Tôi có thể hủy đơn hàng sau khi đặt không?",
        answer:
          "Bạn có thể hủy đơn hàng trong vòng 2 giờ sau khi đặt hàng thành công. Sau thời gian này, vui lòng liên hệ hotline để được hỗ trợ.",
      },
      {
        id: 3,
        question: "Tại sao đơn hàng của tôi bị hủy?",
        answer:
          "Đơn hàng có thể bị hủy do: sản phẩm hết hàng, thông tin thanh toán không chính xác, hoặc không liên lạc được với khách hàng trong 24h.",
      },
    ],
  },
  {
    id: "payment",
    name: "Thanh toán",
    color: "bg-green-100 text-green-800",
    questions: [
      {
        id: 4,
        question: "Các hình thức thanh toán nào được hỗ trợ?",
        answer:
          "Chúng tôi hỗ trợ: Thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay), và thẻ tín dụng/ghi nợ.",
      },
      {
        id: 5,
        question: "Khi nào tiền sẽ được trừ từ tài khoản?",
        answer:
          "Với thanh toán online, tiền sẽ được trừ ngay sau khi xác nhận đơn hàng. Với COD, bạn thanh toán khi nhận hàng.",
      },
      {
        id: 6,
        question: "Tôi có được hoàn tiền nếu hủy đơn hàng?",
        answer:
          "Nếu bạn đã thanh toán online và hủy đơn hàng thành công, tiền sẽ được hoàn lại trong 3-7 ngày làm việc.",
      },
    ],
  },
  {
    id: "shipping",
    name: "Giao hàng",
    color: "bg-orange-100 text-orange-800",
    questions: [
      {
        id: 7,
        question: "Thời gian giao hàng là bao lâu?",
        answer:
          "Thời gian giao hàng: 1-2 ngày (nội thành TP.HCM), 2-3 ngày (các tỉnh thành khác), 3-5 ngày (vùng xa).",
      },
      {
        id: 8,
        question: "Phí giao hàng được tính như thế nào?",
        answer:
          "Phí giao hàng phụ thuộc vào địa điểm và trọng lượng. Miễn phí giao hàng cho đơn hàng từ 500.000đ trong nội thành.",
      },
      {
        id: 9,
        question: "Tôi có thể thay đổi địa chỉ giao hàng không?",
        answer:
          "Bạn có thể thay đổi địa chỉ giao hàng trước khi đơn hàng được giao cho đơn vị vận chuyển (thường trong 4-6 giờ sau khi đặt).",
      },
    ],
  },
  {
    id: "returns",
    name: "Đổi trả",
    color: "bg-purple-100 text-purple-800",
    questions: [
      {
        id: 10,
        question: "Chính sách đổi trả như thế nào?",
        answer:
          "Bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng, với điều kiện sản phẩm còn nguyên vẹn, chưa sử dụng.",
      },
      {
        id: 11,
        question: "Những sản phẩm nào không được đổi trả?",
        answer:
          "Không hỗ trợ đổi trả: sản phẩm giảm giá trên 50%, đồ lót, mỹ phẩm đã mở seal, thực phẩm, và sản phẩm theo yêu cầu.",
      },
      {
        id: 12,
        question: "Làm thế nào để yêu cầu đổi trả?",
        answer:
          "Liên hệ hotline hoặc gửi yêu cầu qua trang 'Đơn hàng của tôi'. Chúng tôi sẽ hướng dẫn chi tiết quy trình đổi trả.",
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description:
    "Tìm câu trả lời cho các câu hỏi thường gặp về mua sắm, thanh toán, giao hàng và chính sách đổi trả tại Minishop.",
  keywords: "FAQ, câu hỏi thường gặp, hỗ trợ, thanh toán, giao hàng, đổi trả",
  openGraph: {
    title: "Câu hỏi thường gặp | Minishop",
    description: "Tìm câu trả lời cho các câu hỏi thường gặp tại Minishop",
    url: "/faq",
    images: [
      {
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "FAQ Minishop",
      },
    ],
  },
};

export default function FAQPage() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggleExpanded = (questionId: number) => {
    setExpandedItems((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredQuestions = faqCategories.flatMap((category) =>
    category.questions
      .filter(() => {
        const matchesCategory =
          selectedCategory === "all" || category.id === selectedCategory;
        return matchesCategory;
      })
      .map((q) => ({
        ...q,
        category: category.name,
        categoryColor: category.color,
      }))
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h1>
        <p className="text-lg text-muted-foreground">
          Tìm câu trả lời cho các thắc mắc phổ biến về dịch vụ của chúng tôi
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            size="sm"
          >
            Tất cả
          </Button>
          {faqCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Không có câu hỏi nào trong danh mục này.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((item) => (
            <Card key={item.id}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpanded(item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Badge className={item.categoryColor}>
                      {item.category}
                    </Badge>
                    <CardTitle className="text-base font-medium text-left">
                      {item.question}
                    </CardTitle>
                  </div>
                  {expandedItems.includes(item.id) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              {expandedItems.includes(item.id) && (
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Contact CTA */}
      <Card className="mt-12">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">
            Không tìm thấy câu trả lời?
          </h3>
          <p className="text-muted-foreground mb-4">
            Liên hệ với đội ngũ hỗ trợ của chúng tôi để được giải đáp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>Liên hệ hỗ trợ</Button>
            <Button variant="outline">Gọi hotline: 1900 1234</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface OrderNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function OrderNotes({ notes, onNotesChange }: OrderNotesProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="order-notes" className="text-sm font-medium">
        Ghi chú cho đơn hàng
      </Label>
      <Textarea
        id="order-notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Viết ghi chú về đơn hàng của bạn, ví dụ như yêu cầu đặc biệt về giao hàng..."
        rows={4}
        className="resize-none"
        maxLength={500}
      />
      <div className="text-xs text-gray-500 text-right">
        {notes.length}/500 ký tự
      </div>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const categoryOptions = [
  { value: "TOPS", label: "トップス" },
  { value: "BOTTOMS", label: "ボトムス" },
  { value: "SHOES", label: "シューズ" },
  { value: "ACCESSORIES", label: "アクセサリー" },
  { value: "OUTERWEAR", label: "アウター" },
];

export const colorOptions = [
  "ブラック",
  "ホワイト",
  "グレー",
  "ネイビー",
  "ブラウン",
  "ベージュ",
  "レッド",
  "ブルー",
  "グリーン",
  "イエロー",
  "パープル",
  "ピンク",
  "オレンジ",
  "その他",
];

interface FormData {
  imageUrl: string;
  category: string;
  color: string;
  brand: string;
  description: string;
  purchaseDate: string;
}

interface FormFieldsProps {
  formData: FormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function FormFields({
  formData,
  onChange,
  onSelectChange,
}: FormFieldsProps) {
  return (
    <>
      {/* カテゴリ */}
      <div className="space-y-2">
        <Label htmlFor="category">
          カテゴリ <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => onSelectChange("category", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 色 */}
      <div className="space-y-2">
        <Label htmlFor="color">
          色 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.color}
          onValueChange={(value) => onSelectChange("color", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="色を選択" />
          </SelectTrigger>
          <SelectContent>
            {colorOptions.map((color) => (
              <SelectItem key={color} value={color}>
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ブランド */}
      <div className="space-y-2">
        <Label htmlFor="brand">ブランド</Label>
        <Input
          id="brand"
          name="brand"
          type="text"
          value={formData.brand}
          onChange={onChange}
          placeholder="UNIQLO、ZARA、ユニクロ など"
        />
      </div>

      {/* 購入日 */}
      <div className="space-y-2">
        <Label htmlFor="purchaseDate">購入日</Label>
        <Input
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          value={formData.purchaseDate}
          onChange={onChange}
        />
      </div>

      {/* メモ */}
      <div className="space-y-2">
        <Label htmlFor="description">メモ</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={3}
          placeholder="この服の特徴や着用シーンなど（例：フォーマル用、カジュアル用、夏限定など）"
        />
      </div>
    </>
  );
}

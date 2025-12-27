import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BankAccountDialog({ open, onOpenChange }: BankAccountDialogProps) {
  const [bankName, setBankName] = useState("みずほ銀行");
  const [branchName, setBranchName] = useState("渋谷支店");
  const [accountType, setAccountType] = useState("ordinary");
  const [accountNumber, setAccountNumber] = useState("1234567");
  const [accountHolder, setAccountHolder] = useState("カブシキガイシャ サンプル");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    // バリデーション
    if (!bankName || !branchName || !accountNumber || !accountHolder) {
      toast.error("すべての項目を入力してください");
      return;
    }

    // 保存処理（モック）
    toast.success("口座情報を更新しました");
    onOpenChange(false);
  };

  const handleDelete = () => {
    // 削除処理（モック）
    toast.success("口座情報を削除しました");
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent" />
            口座情報の変更
          </DialogTitle>
          <DialogDescription>
            報酬を受け取る銀行口座を登録してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 銀行名 */}
          <div className="space-y-2">
            <Label htmlFor="bankName">銀行名</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="みずほ銀行"
            />
          </div>

          {/* 支店名 */}
          <div className="space-y-2">
            <Label htmlFor="branchName">支店名</Label>
            <Input
              id="branchName"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="渋谷支店"
            />
          </div>

          {/* 口座種別 */}
          <div className="space-y-2">
            <Label htmlFor="accountType">口座種別</Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger id="accountType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordinary">普通</SelectItem>
                <SelectItem value="current">当座</SelectItem>
                <SelectItem value="savings">貯蓄</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 口座番号 */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">口座番号</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="1234567"
              maxLength={7}
            />
          </div>

          {/* 口座名義 */}
          <div className="space-y-2">
            <Label htmlFor="accountHolder">口座名義（カタカナ）</Label>
            <Input
              id="accountHolder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="カブシキガイシャ サンプル"
            />
          </div>

          {/* 注意事項 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="mb-1">口座情報の確認</p>
                <p className="text-xs text-blue-700">
                  登録された口座情報は、本人確認のため数日以内に少額入金で確認させていただきます。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSave}
            >
              保存する
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            口座情報を削除
          </Button>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>口座情報を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。口座情報が削除され、報酬を受け取る銀行口座が無くなります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}


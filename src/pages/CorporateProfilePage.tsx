import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Users,
  Plus,
  Settings,
  Shield,
  Wallet,
  Clock,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Calendar,
  CreditCard,
  Lock,
  Bell,
  History,
  ChevronLeft,
  CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// モックデータ
const companyInfo = {
  name: "株式会社サンプル",
  industry: "オフィス・施設管理",
  address: "〒150-0001 東京都渋谷区神宮前1-2-3",
  phone: "03-1234-5678",
  email: "info@sample-corp.jp",
  registrationNumber: "T1234567890123"
};

const teamMembers = [
  {
    id: 1,
    name: "山田 太郎",
    email: "yamada@sample-corp.jp",
    role: "施設管理部長",
    permission: "管理者",
    lastLogin: "2025/10/24 14:30",
    status: "active"
  },
  {
    id: 2,
    name: "佐藤 花子",
    email: "sato@sample-corp.jp",
    role: "アート担当",
    permission: "編集者",
    lastLogin: "2025/10/24 09:15",
    status: "active"
  },
  {
    id: 3,
    name: "鈴木 一郎",
    email: "suzuki@sample-corp.jp",
    role: "総務担当",
    permission: "閲覧者",
    lastLogin: "2025/10/23 16:45",
    status: "active"
  }
];

const auditLogs = [
  {
    id: 1,
    user: "山田 太郎",
    action: "スペース「1階エントランス」を編集",
    timestamp: "2025/10/24 14:30"
  },
  {
    id: 2,
    user: "佐藤 花子",
    action: "作品「青の記憶」を追加",
    timestamp: "2025/10/24 09:15"
  },
  {
    id: 3,
    user: "山田 太郎",
    action: "担当者「鈴木 一郎」を招待",
    timestamp: "2025/10/23 16:45"
  },
  {
    id: 4,
    user: "佐藤 花子",
    action: "スペース「会議室A」を作成",
    timestamp: "2025/10/23 11:20"
  }
];

export function CorporateProfilePage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [salesNotificationContacts, setSalesNotificationContacts] = useState<string[]>(["1"]); // デフォルトで山田太郎
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  // 初回ロード時に設定を復元
  useEffect(() => {
    const savedSettings = localStorage.getItem("mgj_corporate_notification_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setEmailNotifications(settings.emailNotifications ?? true);
      setSalesNotificationContacts(settings.salesNotificationContacts ?? ["1"]);
    }
  }, []);

  // tab=payment の場合は支払いセクションにスクロール
  useEffect(() => {
    if (tabParam === "payment" && paymentSectionRef.current) {
      setTimeout(() => {
        paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [tabParam]);

  const toggleContact = (memberId: string) => {
    setSalesNotificationContacts(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  // 通知設定を保存する
  const saveNotificationSettings = () => {
    console.log("保存ボタンがクリックされました"); // デバッグ用
    const settings = {
      notificationsEnabled,
      emailNotifications,
      salesNotificationContacts,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem("mgj_corporate_notification_settings", JSON.stringify(settings));
    console.log("保存された設定:", settings); // デバッグ用
    toast.success("通知設定を保存しました");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ページヘッダー */}
      <div className="bg-white border-b pt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/corporate-dashboard">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                ダッシュボードに戻る
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-primary">企業プロフィール管理</h1>
              <p className="text-sm text-gray-600">会社情報・担当者・セキュリティ設定</p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム：情報カード */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. 会社情報カード */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>会社情報</CardTitle>
                      <CardDescription>基本情報と連絡先</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingCompany(!isEditingCompany)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditingCompany ? "キャンセル" : "編集"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingCompany ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>会社名</Label>
                        <Input defaultValue={companyInfo.name} />
                      </div>
                      <div className="space-y-2">
                        <Label>業種</Label>
                        <Input defaultValue={companyInfo.industry} />
                      </div>
                      <div className="space-y-2">
                        <Label>所在地</Label>
                        <Input defaultValue={companyInfo.address} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>電話番号</Label>
                          <Input defaultValue={companyInfo.phone} />
                        </div>
                        <div className="space-y-2">
                          <Label>メールアドレス</Label>
                          <Input defaultValue={companyInfo.email} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>法人番号</Label>
                        <Input defaultValue={companyInfo.registrationNumber} />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button className="bg-primary hover:bg-primary/90">
                          変更を保存
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingCompany(false)}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">会社名</p>
                          <p className="text-sm">{companyInfo.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">業種</p>
                          <p className="text-sm">{companyInfo.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">所在地</p>
                          <p className="text-sm">{companyInfo.address}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">電話番号</p>
                            <p className="text-sm">{companyInfo.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">メール</p>
                            <p className="text-sm">{companyInfo.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">法人番号</p>
                          <p className="text-sm">{companyInfo.registrationNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 2. 報酬設定カード */}
            <motion.div
              ref={paymentSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-accent" />
                        報酬設定
                      </CardTitle>
                      <CardDescription>振込先口座の管理</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingPayment(!isEditingPayment)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditingPayment ? "キャンセル" : "編集"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingPayment ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>銀行名</Label>
                        <Input defaultValue="サンプル銀行" placeholder="例：みずほ銀行" />
                      </div>
                      <div className="space-y-2">
                        <Label>支店名</Label>
                        <Input defaultValue="渋谷支店" placeholder="例：渋谷支店" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>口座種別</Label>
                          <Select defaultValue="ordinary">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ordinary">普通</SelectItem>
                              <SelectItem value="current">当座</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>口座番号</Label>
                          <Input defaultValue="1234567" placeholder="7桁の数字" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>口座名義（カナ）</Label>
                        <Input defaultValue="カ）サンプル" placeholder="例：カ）サンプル" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button className="bg-primary hover:bg-primary/90">
                          変更を保存
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingPayment(false)}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600">振込先口座</p>
                        <Badge variant="secondary">登録済み</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">銀行名：</span>サンプル銀行</p>
                        <p><span className="text-gray-500">支店名：</span>渋谷支店</p>
                        <p><span className="text-gray-500">口座番号：</span>普通 1234567</p>
                        <p><span className="text-gray-500">口座名義：</span>カ）サンプル</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 3. セキュリティ設定 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    セキュリティ設定
                  </CardTitle>
                  <CardDescription>パスワード・通知設定</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm">パスワード</p>
                        <p className="text-xs text-gray-600">最終更新: 2025/09/15</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      変更
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm">プッシュ通知</p>
                          <p className="text-xs text-gray-600">販売・閲覧の通知を受け取る</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm">メール通知</p>
                          <p className="text-xs text-gray-600">週次レポートを受け取る</p>
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 4. 監査ログ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-accent" />
                    監査ログ
                  </CardTitle>
                  <CardDescription>操作履歴・アクティビティ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-grow">
                          <p className="text-sm text-gray-700">
                            <span className="text-primary">{log.user}</span> が {log.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4" size="sm">
                    すべて表示
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 右カラム：担当者管理 */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>担当者管理</CardTitle>
                      <CardDescription>{teamMembers.length}名のメンバー</CardDescription>
                    </div>
                    <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-1" />
                          招待
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>新しい担当者を招待</DialogTitle>
                          <DialogDescription>
                            メールアドレスを入力して招待状を送信します
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>メールアドレス</Label>
                            <Input type="email" placeholder="example@sample-corp.jp" />
                          </div>
                          <div className="space-y-2">
                            <Label>役職</Label>
                            <Input placeholder="例：施設管理担当" />
                          </div>
                          <div className="space-y-2">
                            <Label>権限</Label>
                            <Select defaultValue="viewer">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">管理者</SelectItem>
                                <SelectItem value="editor">編集者</SelectItem>
                                <SelectItem value="viewer">閲覧者</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddingMember(false)}
                          >
                            キャンセル
                          </Button>
                          <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => setIsAddingMember(false)}
                          >
                            招待を送信
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="text-sm">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                            <Badge
                              variant={
                                member.permission === "管理者"
                                  ? "default"
                                  : member.permission === "編集者"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {member.permission}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-2">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            最終ログイン: {member.lastLogin}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t">
                        <Select defaultValue={member.permission.toLowerCase()}>
                          <SelectTrigger className="h-8 text-xs flex-grow">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="管理者">管理者</SelectItem>
                            <SelectItem value="編集者">編集者</SelectItem>
                            <SelectItem value="閲覧者">閲覧者</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>担当者を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                {member.name}さんをチームから削除します。この操作は取り消せません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                削除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* 販売通知設定 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-accent" />
                    販売通知設定
                  </CardTitle>
                  <CardDescription>
                    作品が売れた際の連絡先担当者（複数選択可）
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-900 leading-relaxed">
                      作品が購入された際、選択された担当者全員にメールで通知が届きます。お持ち帰り希望の場合は、展示場所での対応をお願いします。
                    </p>
                  </div>

                  {salesNotificationContacts.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <p className="text-xs text-primary">
                        {salesNotificationContacts.length}名の担当者が通知を受け取ります
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {teamMembers.map((member) => {
                      const isSelected = salesNotificationContacts.includes(member.id.toString());
                      return (
                        <label
                          key={member.id}
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleContact(member.id.toString())}
                            className="w-5 h-5 text-primary focus:ring-primary mt-0.5 rounded"
                          />
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <p className="text-sm">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {companyInfo.phone}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={saveNotificationSettings}>
                    <Bell className="w-4 h-4 mr-2" />
                    通知設定を保存
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* 権限の説明 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm">権限について</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-primary">管理者</p>
                      <p>全ての機能にアクセス可能</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Edit className="w-4 h-4 text-accent mt-0.5" />
                    <div>
                      <p className="text-accent">編集者</p>
                      <p>スペース・作品の編集が可能</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-700">閲覧者</p>
                      <p>データの閲覧のみ可能</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

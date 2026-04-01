import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Settings,
  Shield,
  Wallet,
  ChevronLeft,
  Bell,
  Lock,
  History,
  Loader2,
  Users,
  UserPlus,
  Copy,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCorporateOrgRole } from "@/hooks/useCorporateOrgRole";
import { userService, type UserProfile } from "@/services/user.service";
import {
  corporateInvitationsService,
  type CorporateInvitation,
  type CorporateInviteRole,
} from "@/services/corporateInvitations.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { CorporateOrgRole } from "@/lib/corporatePermissions";

function corporateRole(p: UserProfile | null): "corporate" | null {
  if (!p) return null;
  const t = p.user_type ?? p.role;
  return t === "corporate" ? "corporate" : null;
}

function roleLabelJa(role: string): string {
  switch (role) {
    case "admin":
      return "管理者";
    case "editor":
      return "編集者";
    case "viewer":
      return "閲覧者";
    default:
      return role;
  }
}

function statusLabelJa(status: string): string {
  switch (status) {
    case "pending":
      return "保留中";
    case "accepted":
      return "承認済み";
    case "expired":
      return "期限切れ";
    case "revoked":
      return "取り消し";
    default:
      return status;
  }
}

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "outline";
    case "accepted":
      return "default";
    case "expired":
      return "secondary";
    case "revoked":
      return "destructive";
    default:
      return "outline";
  }
}

function formatInviteDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function CorporateProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userType, isInitialized, refreshCorporateRole } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [invitations, setInvitations] = useState<CorporateInvitation[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CorporateInviteRole>("viewer");
  const [inviteJobTitle, setInviteJobTitle] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  const { canAdmin } = useCorporateOrgRole(
    (profile?.corporate_role as CorporateOrgRole | undefined) ?? null,
  );

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || userType !== "corporate") {
      navigate("/login/corporate", {
        state: { from: `${location.pathname}${location.search}${location.hash}` },
        replace: true,
      });
    }
  }, [isInitialized, isAuthenticated, userType, navigate, location]);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || userType !== "corporate") return;
    setLoading(true);
    setLoadError(null);
    try {
      const p = await userService.getCurrentUser();
      if (corporateRole(p) !== "corporate") {
        setLoadError("法人アカウントでのみ表示できます");
        setProfile(null);
        return;
      }
      setProfile(p);
      setCompanyName(p.company_name ?? "");
      setContactName(p.contact_name ?? p.name ?? "");
      setPostalCode(p.postal_code ?? "");
      setAddress(p.address ?? "");
      setPhone(p.phone ?? p.phone_number ?? "");
      setEmail(p.email ?? "");
      await refreshCorporateRole();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "読み込みに失敗しました";
      setLoadError(msg);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userType, refreshCorporateRole]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || userType !== "corporate") return;
    void loadProfile();
  }, [isInitialized, isAuthenticated, userType, loadProfile]);

  const loadInvitations = useCallback(async () => {
    if (!isAuthenticated || userType !== "corporate") return;
    setInvitesLoading(true);
    try {
      const list = await corporateInvitationsService.list();
      setInvitations(list);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "招待一覧の取得に失敗しました";
      toast.error(msg);
      setInvitations([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [isAuthenticated, userType]);

  useEffect(() => {
    if (!profile || loadError) return;
    if (!canAdmin) {
      setInvitations([]);
      return;
    }
    void loadInvitations();
  }, [profile, loadError, loadInvitations, canAdmin]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("mgj_corporate_notification_settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setNotificationsEnabled(settings.notificationsEnabled ?? true);
        setEmailNotifications(settings.emailNotifications ?? true);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (!canAdmin) setInviteDialogOpen(false);
  }, [canAdmin]);

  useEffect(() => {
    if (tabParam === "payment" && paymentSectionRef.current) {
      setTimeout(() => {
        paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [tabParam]);

  const saveNotificationSettings = () => {
    const settings = {
      notificationsEnabled,
      emailNotifications,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("mgj_corporate_notification_settings", JSON.stringify(settings));
    toast.success("通知設定を保存しました");
  };

  const handleSaveCompany = async () => {
    if (!canAdmin) {
      toast.error("この操作には管理者以上の権限が必要です。");
      return;
    }
    if (!companyName.trim()) {
      toast.error("会社名を入力してください");
      return;
    }
    if (!contactName.trim()) {
      toast.error("担当者名を入力してください");
      return;
    }
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        phone: phone.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        address: address.trim() || undefined,
      });
      setProfile(updated);
      setCompanyName(updated.company_name ?? "");
      setContactName(updated.contact_name ?? updated.name ?? "");
      setPostalCode(updated.postal_code ?? "");
      setAddress(updated.address ?? "");
      setPhone(updated.phone ?? updated.phone_number ?? "");
      setEmail(updated.email ?? "");
      setIsEditingCompany(false);
      toast.success("会社情報を保存しました");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenInvite = () => {
    setInviteEmail("");
    setInviteRole("viewer");
    setInviteJobTitle("");
    setInviteDialogOpen(true);
  };

  const handleSubmitInvite = async () => {
    if (!canAdmin) return;
    const em = inviteEmail.trim();
    if (!em) {
      toast.error("メールアドレスを入力してください");
      return;
    }
    setInviteSubmitting(true);
    try {
      const created = await corporateInvitationsService.create({
        email: em,
        role: inviteRole,
        job_title: inviteJobTitle.trim() || undefined,
      });
      toast.success("招待を作成しました");
      if (created.email_sent === false) {
        toast.info(
          "招待メールは送信されませんでした。.env の RESEND_API_KEY と EMAIL_FROM（Resend で検証済み）を確認するか、SMTP を使う場合は SMTP_HOST を設定してください。リンクの手動共有も可能です。",
        );
      }
      setInviteDialogOpen(false);
      await loadInvitations();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "招待の作成に失敗しました");
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!canAdmin) return;
    try {
      await corporateInvitationsService.revoke(id);
      toast.success("招待を取り消しました");
      await loadInvitations();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "取り消しに失敗しました");
    }
  };

  const copyInviteUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("リンクをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 pt-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-gray-600">初期化中…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || userType !== "corporate") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <div className="flex min-h-0 flex-1 flex-col pt-16 sm:pt-20">
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="mb-4 flex items-center gap-4">
              <Link to="/corporate-dashboard">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  ダッシュボードに戻る
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-primary">企業プロフィール管理</h1>
                <p className="text-sm text-gray-600">会社情報・セキュリティ（API連携）</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto flex-1 px-4 py-8 sm:px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-gray-600">プロフィールを読み込み中…</p>
            </div>
          ) : loadError ? (
            <Card className="max-w-lg border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">読み込みエラー</CardTitle>
                <CardDescription>{loadError}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => void loadProfile()}>
                  再試行
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <CardTitle>会社情報</CardTitle>
                          <CardDescription>データベースの法人プロフィール（corporates）</CardDescription>
                        </div>
                        {canAdmin ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (isEditingCompany && profile) {
                                setCompanyName(profile.company_name ?? "");
                                setContactName(profile.contact_name ?? profile.name ?? "");
                                setPostalCode(profile.postal_code ?? "");
                                setAddress(profile.address ?? "");
                                setPhone(profile.phone ?? profile.phone_number ?? "");
                              }
                              setIsEditingCompany(!isEditingCompany);
                            }}
                          >
                            {isEditingCompany ? "キャンセル" : "編集"}
                          </Button>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditingCompany ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="company_name">会社名</Label>
                            <Input
                              id="company_name"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              autoComplete="organization"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contact_name">担当者名</Label>
                            <Input
                              id="contact_name"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              autoComplete="name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input id="email" value={email} disabled className="bg-muted/50" />
                            <p className="text-xs text-gray-500">変更はサポートへお問い合わせください</p>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="phone">電話番号</Label>
                              <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoComplete="tel"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="postal_code">郵便番号</Label>
                              <Input
                                id="postal_code"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="例：1500001"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">所在地</Label>
                            <Input
                              id="address"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              autoComplete="street-address"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                              className="bg-primary hover:bg-primary/90"
                              disabled={saving}
                              onClick={() => void handleSaveCompany()}
                            >
                              {saving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  保存中…
                                </>
                              ) : (
                                "変更を保存"
                              )}
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditingCompany(false)} disabled={saving}>
                              閉じる
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Building2 className="mt-0.5 h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">会社名</p>
                              <p className="text-sm">{companyName || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Settings className="mt-0.5 h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">担当者名</p>
                              <p className="text-sm">{contactName || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Mail className="mt-0.5 h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">メール</p>
                              <p className="text-sm">{email || "—"}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-3">
                              <Phone className="mt-0.5 h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">電話番号</p>
                                <p className="text-sm">{phone || "—"}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">郵便番号</p>
                                <p className="text-sm">{postalCode || "—"}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">所在地</p>
                              <p className="text-sm whitespace-pre-wrap">{address || "—"}</p>
                            </div>
                          </div>
                          {profile?.profile_completion != null && (
                            <p className="text-xs text-gray-500">
                              プロフィール完成度: {profile.profile_completion}%
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  ref={paymentSectionRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-accent" />
                        報酬・お支払い
                      </CardTitle>
                      <CardDescription>振込口座・カードは入出金管理タブで操作します</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        報酬受取口座や法人向けお支払い方法の登録・変更は、ダッシュボードの「入出金管理」から行えます。
                      </p>
                      <Button variant="outline" asChild className="w-full sm:w-auto">
                        <Link to="/corporate-dashboard#payment">入出金管理を開く</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-accent" />
                        セキュリティ
                      </CardTitle>
                      <CardDescription>パスワードの再設定</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm">パスワードをお忘れの場合</p>
                            <p className="text-xs text-gray-600">登録メール宛に再設定用のリンクを送信します</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/forgot-password">パスワード再設定</Link>
                        </Button>
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm">プッシュ通知（UI設定）</p>
                              <p className="text-xs text-gray-600">ブラウザ内の表示用（サーバー未連携）</p>
                            </div>
                          </div>
                          <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm">メール通知（UI設定）</p>
                              <p className="text-xs text-gray-600">週次レポート等（ローカル保存）</p>
                            </div>
                          </div>
                          <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90" onClick={saveNotificationSettings}>
                          <Bell className="mr-2 h-4 w-4" />
                          通知UI設定を保存
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-accent" />
                        監査ログ
                      </CardTitle>
                      <CardDescription>操作履歴の一覧表示は今後対応予定です</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        監査ログの保存・閲覧APIは未接続です。必要に応じて管理画面またはバックエンドで提供予定です。
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-accent" />
                            担当者・チーム
                          </CardTitle>
                          <CardDescription>メンバーをメールで招待し、権限を付与します</CardDescription>
                        </div>
                        {canAdmin ? (
                          <div className="flex shrink-0 gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={invitesLoading}
                              onClick={() => void loadInvitations()}
                              aria-label="招待一覧を更新"
                            >
                              <RefreshCw className={`mr-1 h-4 w-4 ${invitesLoading ? "animate-spin" : ""}`} />
                              更新
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={handleOpenInvite}
                            >
                              <UserPlus className="mr-1 h-4 w-4" />
                              招待する
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!canAdmin ? (
                        <p className="text-sm text-gray-600">
                          チームの招待・一覧の管理は<strong className="text-foreground">管理者</strong>
                          （アカウント代表または招待された管理者）のみが行えます。
                        </p>
                      ) : invitesLoading && invitations.length === 0 ? (
                        <div className="flex items-center gap-2 py-6 text-sm text-gray-600">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          招待一覧を読み込み中…
                        </div>
                      ) : invitations.length === 0 ? (
                        <p className="text-sm text-gray-600">
                          まだ招待がありません。「招待する」からメールアドレスと権限を指定してください。
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {invitations.map((inv) => (
                            <li
                              key={inv.id}
                              className="rounded-lg border bg-white p-3 text-sm shadow-sm"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0 flex-1 space-y-1">
                                  <p className="truncate font-medium text-foreground">{inv.email}</p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                    <span>{roleLabelJa(inv.role)}</span>
                                    {inv.job_title ? (
                                      <span className="text-gray-500">· {inv.job_title}</span>
                                    ) : null}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    期限: {formatInviteDate(inv.expires_at)}
                                  </p>
                                </div>
                                <Badge variant={statusBadgeVariant(inv.status)}>
                                  {statusLabelJa(inv.status)}
                                </Badge>
                              </div>
                              {inv.status === "pending" && inv.invite_url ? (
                                <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void copyInviteUrl(inv.invite_url!)}
                                  >
                                    <Copy className="mr-1 h-4 w-4" />
                                    リンクをコピー
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => void handleRevokeInvite(inv.id)}
                                  >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    取り消し
                                  </Button>
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <Card className="border-gray-200 bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-sm">権限について（参考）</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-gray-600">
                    <p>
                      <strong className="font-medium text-foreground">管理者</strong>
                      ：設定・招待の管理。
                      <strong className="font-medium text-foreground"> 編集者</strong>
                      ：展示・作品の編集。
                      <strong className="font-medium text-foreground"> 閲覧者</strong>
                      ：閲覧のみ。
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={inviteDialogOpen && canAdmin}
        onOpenChange={(open) => {
          if (!canAdmin) return;
          setInviteDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>メンバーを招待</DialogTitle>
            <DialogDescription>
              招待先のメールと権限を指定します。相手には招待リンクを共有してください（メール送信は別途）。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite_email">メールアドレス</Label>
              <Input
                id="invite_email"
                type="email"
                autoComplete="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite_role">権限</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as CorporateInviteRole)}
              >
                <SelectTrigger id="invite_role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="editor">編集者</SelectItem>
                  <SelectItem value="viewer">閲覧者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite_job_title">役職（任意）</Label>
              <Input
                id="invite_job_title"
                value={inviteJobTitle}
                onChange={(e) => setInviteJobTitle(e.target.value)}
                placeholder="例：展示担当"
                maxLength={200}
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              disabled={inviteSubmitting}
              onClick={() => void handleSubmitInvite()}
            >
              {inviteSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中…
                </>
              ) : (
                "招待を作成"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-auto shrink-0">
        <Footer />
      </div>
    </div>
  );
}

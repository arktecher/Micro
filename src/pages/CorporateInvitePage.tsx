import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { corporateInvitationsService } from "@/services/corporateInvitations.service";
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
export function CorporateInvitePage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token")?.trim() ?? "";
    const [loadingPreview, setLoadingPreview] = useState(true);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("");
    const [jobTitle, setJobTitle] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        if (!token) {
            setPreviewError("招待リンクが無効です。メールに記載されたURLから開いてください。");
            setLoadingPreview(false);
            return;
        }
        let cancelled = false;
        void (async () => {
            setLoadingPreview(true);
            setPreviewError(null);
            try {
                const p = await corporateInvitationsService.previewPublic(token);
                if (cancelled)
                    return;
                if (!p.valid) {
                    setPreviewError(p.error || "招待を表示できません。");
                    return;
                }
                setCompanyName(p.company_name || "");
                setInviteEmail(p.email || "");
                setInviteRole(p.role || "viewer");
                setJobTitle(p.job_title ?? null);
            }
            catch (e: unknown) {
                if (!cancelled) {
                    setPreviewError(e instanceof Error ? e.message : "招待の確認に失敗しました");
                }
            }
            finally {
                if (!cancelled)
                    setLoadingPreview(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);
    const handleAccept = async () => {
        if (!token)
            return;
        const n = name.trim();
        if (!n) {
            toast.error("お名前を入力してください");
            return;
        }
        if (password.length < 8) {
            toast.error("パスワードは8文字以上にしてください");
            return;
        }
        if (password !== password2) {
            toast.error("パスワードが一致しません");
            return;
        }
        setSubmitting(true);
        try {
            const res = await corporateInvitationsService.acceptPublic({
                token,
                name: n,
                password,
            });
            if (res.access_token) {
                localStorage.setItem("mgj_access_token", res.access_token);
            }
            login("corporate", {
                id: res.user.id,
                name: res.user.name,
                email: res.user.email,
            });
            toast.success("アカウントを作成しました");
            navigate("/corporate-dashboard", { replace: true });
        }
        catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "登録に失敗しました");
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 pt-24 sm:px-6">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary"/>
            </div>
            <CardTitle className="text-primary">法人チーム招待</CardTitle>
            <CardDescription>
              招待メールのリンクから、新しいアカウントを作成してチームに参加します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPreview ? (<div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin"/>
                招待を確認しています…
              </div>) : previewError ? (<div className="space-y-4">
                <p className="text-sm text-destructive">{previewError}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" asChild>
                    <Link to="/login/corporate">法人ログイン</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/">トップへ</Link>
                  </Button>
                </div>
              </div>) : (<>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <p className="font-medium text-foreground">{companyName || "法人"}</p>
                  <p className="text-muted-foreground">招待先: {inviteEmail}</p>
                  <p className="text-muted-foreground">権限: {roleLabelJa(inviteRole)}</p>
                  {jobTitle ? (<p className="text-muted-foreground">役職（参考）: {jobTitle}</p>) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv_name">お名前（表示名）</Label>
                  <Input id="inv_name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 太郎"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv_pw">パスワード（8文字以上）</Label>
                  <Input id="inv_pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv_pw2">パスワード（確認）</Label>
                  <Input id="inv_pw2" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)}/>
                </div>
                <p className="text-xs text-muted-foreground">
                  既にアーティストまたはご購入者として登録済みのメールでは、法人招待を受け取れません。
                </p>
                <Button type="button" className="w-full bg-primary hover:bg-primary/90" disabled={submitting} onClick={() => void handleAccept()}>
                  {submitting ? (<>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      登録中…
                    </>) : ("アカウントを作成して参加する")}
                </Button>
                <Button variant="link" className="w-full px-0 text-sm" asChild>
                  <Link to="/login/corporate">すでにアカウントをお持ちの方はログイン</Link>
                </Button>
              </>)}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>);
}

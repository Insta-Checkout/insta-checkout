"use client";

import { useEffect, useState } from "react";
import { auth, uploadProductImage } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useTranslations } from "@/lib/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Package, Plus, Pencil, Trash2, Link2, Copy, MessageCircle, ImagePlus } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  price: number;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  status: string;
};

function getProductDisplayName(p: Product, locale: string): string {
  if (locale === "ar") return p.nameAr || p.name;
  return p.nameEn || p.name;
}

function formatEgp(n: number): string {
  return (
    new Intl.NumberFormat("ar-EG", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n) + " ج.م"
  );
}

export function ProductsPageContent() {
  const { t, locale } = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formNameTranslation, setFormNameTranslation] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const CATEGORIES = ["حلويات", "ملابس", "إلكترونيات", "خدمات", "أخرى"];
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    checkoutUrl: string;
    productName: string;
    expiresAt: string;
  } | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const getToken = () =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/products`,
        {},
        getToken
      );
      if (!res.ok) {
        if (res.status === 401) return;
        if (res.status === 404) {
          setProducts([]);
          setLoading(false);
          return;
        }
        throw new Error(`Failed: ${res.status}`);
      }
      const data = await res.json();
      setProducts(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormName("");
    setFormNameTranslation("");
    setFormPrice("");
    setFormDescription("");
    setFormCategory("");
    setFormImageUrl(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormNameTranslation(locale === "ar" ? (p.nameEn || "") : (p.nameAr || ""));
    setFormPrice(String(p.price));
    setFormDescription(p.description || "");
    setFormCategory(p.category || "");
    setFormImageUrl(p.imageUrl);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file, auth.currentUser.uid, editingId);
      setFormImageUrl(url);
      toast.success("تم رفع الصورة");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    const price = parseFloat(formPrice);
    const translation = formNameTranslation.trim() || null;
    if (!name || name.length < 2) {
      toast.error(locale === "ar" ? "الاسم مطلوب (حرفين على الأقل)" : "Name is required (at least 2 characters)");
      return;
    }
    if (isNaN(price) || price <= 0) {
      toast.error(locale === "ar" ? "السعر يجب أن يكون رقماً موجباً" : "Price must be a positive number");
      return;
    }
    const payload = {
      name,
      price,
      description: formDescription.trim() || null,
      imageUrl: formImageUrl || null,
      category: formCategory.trim() || null,
      ...(locale === "ar" ? { nameEn: translation } : { nameAr: translation }),
    };
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me/products/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
          getToken
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err.message || err.details?.[0] || (locale === "ar" ? "فشل التحديث" : "Update failed");
          throw new Error(msg);
        }
        toast.success(locale === "ar" ? "تم تحديث المنتج" : "Product updated");
      } else {
        const res = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me/products`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
          getToken
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err.message || err.details?.[0] || (locale === "ar" ? "فشل الإنشاء" : "Create failed");
          throw new Error(msg);
        }
        toast.success(locale === "ar" ? "تم إضافة المنتج" : "Product added");
      }
      setModalOpen(false);
      loadProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateLink = async (p: Product) => {
    if (p.status !== "active") return;
    setGeneratingId(p.id);
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/products/${p.id}/payment-links`,
        { method: "POST" },
        getToken
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل إنشاء اللينك");
      }
      const data = await res.json();
      setGeneratedLink({
        checkoutUrl: data.checkoutUrl,
        productName: getProductDisplayName(p, locale),
        expiresAt: data.expiresAt,
      });
      setLinkModalOpen(true);
      loadProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setGeneratingId(null);
    }
  };

  const copyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.checkoutUrl);
    toast.success("تم نسخ اللينك");
  };

  const shareWhatsApp = () => {
    if (!generatedLink) return;
    const text = encodeURIComponent(
      `ده لينك الدفع الخاص بمنتج ${generatedLink.productName}: ${generatedLink.checkoutUrl}`
    );
    window.open(
      `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "201000000000"}?text=${text}`,
      "_blank"
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد أرشفة هذا المنتج؟")) return;
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/products/${id}`,
        { method: "DELETE" },
        getToken
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل الحذف");
      }
      toast.success("تم أرشفة المنتج");
      loadProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">المنتجات</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-slate-500 font-cairo">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => loadProducts()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 font-cairo">المنتجات</h1>
        <Button onClick={openCreate} className="gap-2 font-cairo">
          <Plus className="h-4 w-4" />
          {t("dashboard.products.addProduct")}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center sm:flex-row sm:text-right">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
              <Package className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-cairo">
                {locale === "ar" ? "ابدأ بإضافة منتجك الأول" : "Add your first product"}
              </h2>
              <p className="max-w-md text-slate-600 font-cairo">
                {locale === "ar"
                  ? "أضف منتجاتك مع السعر والوصف، ثم أنشئ لينكات دفع لشاركها مع عملائك على واتساب أو أي منصة."
                  : "Add your products with price and description, then create payment links to share with customers on WhatsApp or any platform."}
              </p>
              <Button onClick={openCreate} className="mt-2 gap-2 font-cairo">
                <Plus className="h-4 w-4" />
                {t("dashboard.products.addProduct")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="font-cairo overflow-hidden">
              {p.imageUrl && (
                <div className="aspect-video w-full bg-slate-100">
                  <img
                    src={p.imageUrl}
                    alt={getProductDisplayName(p, locale)}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-lg">{getProductDisplayName(p, locale)}</CardTitle>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    p.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {p.status === "active" ? "نشط" : "مؤرشف"}
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xl font-bold text-primary font-mono">
                    {formatEgp(p.price)}
                  </p>
                  {p.category && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {p.category}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                    {p.description}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 font-cairo"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="h-3 w-3" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 font-cairo text-slate-500"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    أرشفة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 font-cairo"
                    disabled={p.status !== "active" || generatingId === p.id}
                    onClick={() => handleGenerateLink(p)}
                  >
                    {generatingId === p.id ? (
                      "جاري..."
                    ) : (
                      <>
                        <Link2 className="h-3 w-3" />
                        لينك دفع
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="font-cairo sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("dashboard.products.editProduct") : t("dashboard.products.addProduct")}
            </DialogTitle>
            <DialogDescription>
              {editingId ? (locale === "ar" ? "تعديل تفاصيل المنتج" : "Edit product details") : (locale === "ar" ? "أضف منتج جديد للكتالوج" : "Add a new product to your catalog")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="image">{locale === "ar" ? "صورة المنتج (اختياري)" : "Product image (optional)"}</Label>
              <div className="mt-1 flex items-center gap-3">
                {formImageUrl ? (
                  <div className="relative">
                    <img
                      src={formImageUrl}
                      alt="معاينة"
                      className="h-20 w-20 rounded-lg object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormImageUrl(null)}
                      className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-xs w-5 h-5"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <span className="text-xs text-slate-500">جاري الرفع...</span>
                    ) : (
                      <ImagePlus className="h-8 w-8 text-slate-400" />
                    )}
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="name">{t("dashboard.products.name")}</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("dashboard.products.namePlaceholder")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="nameTranslation">
                {locale === "ar" ? t("dashboard.products.nameTranslationEn") : t("dashboard.products.nameTranslationAr")}
              </Label>
              <Input
                id="nameTranslation"
                value={formNameTranslation}
                onChange={(e) => setFormNameTranslation(e.target.value)}
                placeholder={locale === "ar" ? t("dashboard.products.nameTranslationEnPlaceholder") : t("dashboard.products.nameTranslationArPlaceholder")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price">{locale === "ar" ? "السعر (ج.م)" : "Price (EGP)"}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="0"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="category">{locale === "ar" ? "الفئة (اختياري)" : "Category (optional)"}</Label>
              <select
                id="category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-cairo"
              >
                <option value="">اختر الفئة</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="desc">{locale === "ar" ? "الوصف (اختياري)" : "Description (optional)"}</Label>
              <Input
                id="desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={locale === "ar" ? "وصف قصير" : "Short description"}
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (locale === "ar" ? "جاري الحفظ..." : "Saving...") : editingId ? (locale === "ar" ? "تحديث" : "Update") : (locale === "ar" ? "إضافة" : "Add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="font-cairo sm:max-w-md">
          <DialogHeader>
            <DialogTitle>لينك الدفع جاهز</DialogTitle>
            <DialogDescription>
              {locale === "ar" ? "انسخ اللينك أو شاركه على واتساب" : "Copy the link or share it on WhatsApp"}
            </DialogDescription>
          </DialogHeader>
          {generatedLink && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-500">اللينك</Label>
                <Input
                  readOnly
                  value={generatedLink.checkoutUrl}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={copyLink} className="gap-2 font-cairo">
                  <Copy className="h-4 w-4" />
                  نسخ
                </Button>
                <Button
                  variant="outline"
                  onClick={shareWhatsApp}
                  className="gap-2 font-cairo bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  مشاركة واتساب
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

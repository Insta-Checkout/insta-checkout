"use client";

import { useEffect, useRef, useState } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Link2,
  Copy,
  MessageCircle,
  ImagePlus,
  X,
  Search,
  ChevronDown,
  Languages,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

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

function formatEgp(n: number, egpShort: string, locale: string): string {
  return (
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n) +
    " " +
    egpShort
  );
}

// Expanded category list with Arabic + English labels
const ALL_CATEGORIES = [
  { value: "food", label: "طعام وشراب", labelEn: "Food & Beverage" },
  { value: "clothing", label: "ملابس وأزياء", labelEn: "Clothing & Fashion" },
  { value: "electronics", label: "إلكترونيات", labelEn: "Electronics" },
  { value: "services", label: "خدمات", labelEn: "Services" },
  { value: "beauty", label: "جمال وعناية", labelEn: "Beauty & Care" },
  { value: "home", label: "منزل وديكور", labelEn: "Home & Decor" },
  { value: "sports", label: "رياضة ولياقة", labelEn: "Sports & Fitness" },
  { value: "books", label: "كتب وتعليم", labelEn: "Books & Education" },
  { value: "toys", label: "ألعاب وأطفال", labelEn: "Toys & Kids" },
  { value: "jewelry", label: "مجوهرات وإكسسوارات", labelEn: "Jewelry & Accessories" },
  { value: "health", label: "صحة وطب", labelEn: "Health & Medical" },
  { value: "automotive", label: "سيارات وقطع غيار", labelEn: "Automotive" },
  { value: "art", label: "فن وحرف يدوية", labelEn: "Art & Crafts" },
  { value: "digital", label: "منتجات رقمية", labelEn: "Digital Products" },
  { value: "other", label: "أخرى", labelEn: "Other" },
];

// Searchable category combobox
function CategoryCombobox({
  value,
  onChange,
  locale,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  locale: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = ALL_CATEGORIES.find((c) => c.value === value);
  const displayLabel = selected
    ? locale === "ar"
      ? selected.label
      : selected.labelEn
    : "";

  const filtered = ALL_CATEGORIES.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return c.label.includes(q) || c.labelEn.toLowerCase().includes(q) || c.value.includes(q);
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-lg border border-[#E4D8F0] bg-white px-3 py-2 text-sm font-cairo text-[#1E0A3C] hover:border-[#7C3AED] transition-colors cursor-pointer min-h-[40px]"
      >
        <span className={cn(!displayLabel && "text-[#6B5B7B]")}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#6B5B7B] transition-transform shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#E4D8F0] bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[#E4D8F0]">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#F3EEFA]">
              <Search className="h-3.5 w-3.5 text-[#6B5B7B] shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === "ar" ? "ابحث عن تصنيف..." : "Search category..."}
                className="flex-1 bg-transparent text-sm font-cairo text-[#1E0A3C] placeholder:text-[#6B5B7B] outline-none"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-[#6B5B7B] font-cairo text-center">
                {locale === "ar" ? "لا توجد نتائج" : "No results"}
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    onChange(c.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "w-full text-start px-3 py-2 text-sm font-cairo hover:bg-[#F3EEFA] transition-colors cursor-pointer",
                    value === c.value
                      ? "bg-[#EDE9FE] text-[#7C3AED] font-semibold"
                      : "text-[#1E0A3C]"
                  )}
                >
                  {locale === "ar" ? c.label : c.labelEn}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Image upload with progress bar + inline error
function ImageUploadField({
  imageUrl,
  onUpload,
  onRemove,
  uploading,
  uploadProgress,
  uploadError,
  locale,
  labels,
}: {
  imageUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  locale: string;
  labels: { uploading: string; preview: string; remove: string };
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = ""; // reset so same file can be retried after error
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {imageUrl ? (
          <div className="relative shrink-0">
            <img
              src={imageUrl}
              alt={labels.preview}
              className="h-20 w-20 rounded-xl object-cover border border-[#E4D8F0]"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 text-white w-5 h-5 flex items-center justify-center hover:bg-red-600 cursor-pointer"
              aria-label={labels.remove}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => !uploading && inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors",
              uploading
                ? "border-[#7C3AED]/40 bg-[#EDE9FE]/50 cursor-not-allowed"
                : "border-[#E4D8F0] hover:border-[#7C3AED]/60 hover:bg-[#F3EEFA]"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="h-6 w-6 text-[#7C3AED] animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6 text-[#6B5B7B]" />
            )}
          </button>
        )}

        <div className="flex-1 space-y-1.5 pt-1">
          {uploading && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-[#7C3AED] animate-spin shrink-0" />
                <span className="text-xs text-[#7C3AED] font-cairo">{labels.uploading}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#EDE9FE] overflow-hidden">
                <div
                  className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          {!uploading && !imageUrl && (
            <p className="text-xs text-[#6B5B7B] font-cairo leading-relaxed">
              {locale === "ar"
                ? "PNG، JPG أو WebP\nالحد الأقصى للحجم: 5 ميغابايت"
                : "PNG, JPG or WebP · Max 5 MB"}
            </p>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-red-600 font-cairo">{uploadError}</p>
        </div>
      )}
    </div>
  );
}

export function ProductsPageContent() {
  const { t, locale } = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Optional Arabic/English variant
  const [showArabicVariant, setShowArabicVariant] = useState(false);
  const [formNameAr, setFormNameAr] = useState("");
  const [formNameEn, setFormNameEn] = useState("");

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Link generation
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    checkoutUrl: string;
    productName: string;
    expiresAt: string;
  } | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const egpShort = t("common.egpShort");

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
      setError(e instanceof Error ? e.message : t("dashboard.products.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormPrice("");
    setFormDescription("");
    setFormCategory("");
    setFormImageUrl(null);
    setFormNameAr("");
    setFormNameEn("");
    setShowArabicVariant(false);
    setUploadError(null);
    setUploadProgress(0);
  };

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormPrice(String(p.price));
    setFormDescription(p.description || "");
    setFormCategory(p.category || "");
    setFormImageUrl(p.imageUrl);
    const hasVariant = !!(p.nameAr || p.nameEn);
    setShowArabicVariant(hasVariant);
    setFormNameAr(p.nameAr || "");
    setFormNameEn(p.nameEn || "");
    setUploadError(null);
    setUploadProgress(0);
    setModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!auth.currentUser) return;

    if (!file.type.startsWith("image/")) {
      setUploadError(
        locale === "ar"
          ? "الرجاء اختيار ملف صورة صالح (PNG، JPG، WebP)"
          : "Please choose a valid image file (PNG, JPG, WebP)"
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const sizeMb = (file.size / 1024 / 1024).toFixed(1);
      setUploadError(
        locale === "ar"
          ? `حجم الصورة كبير جداً (${sizeMb} ميغابايت). الحد الأقصى هو 5 ميغابايت.`
          : `Image is too large (${sizeMb} MB). Maximum size is 5 MB.`
      );
      return;
    }

    setUploadError(null);
    setUploadingImage(true);
    setUploadProgress(10);

    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 12, 85));
    }, 300);

    try {
      const url = await uploadProductImage(file, auth.currentUser.uid, editingId);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 600);
      setFormImageUrl(url);
      toast.success(t("dashboard.products.uploadSuccess"));
    } catch (err) {
      clearInterval(progressInterval);
      setUploadError(
        err instanceof Error
          ? err.message
          : locale === "ar"
          ? "فشل رفع الصورة. يرجى المحاولة مرة أخرى."
          : "Upload failed. Please try again."
      );
      setUploadProgress(0);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    const price = parseFloat(formPrice);
    if (!name || name.length < 2) {
      toast.error(t("dashboard.products.nameRequired"));
      return;
    }
    if (isNaN(price) || price <= 0) {
      toast.error(t("dashboard.products.priceRequired"));
      return;
    }

    const payload: Record<string, unknown> = {
      name,
      price,
      description: formDescription.trim() || null,
      imageUrl: formImageUrl || null,
      category: formCategory || null,
    };

    if (showArabicVariant) {
      if (formNameAr.trim()) payload.nameAr = formNameAr.trim();
      if (formNameEn.trim()) payload.nameEn = formNameEn.trim();
    }

    setSaving(true);
    try {
      const url = editingId
        ? `${getBackendUrl()}/sellers/me/products/${editingId}`
        : `${getBackendUrl()}/sellers/me/products`;
      const res = await fetchWithAuth(
        url,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        getToken
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          err.message ||
          err.details?.[0] ||
          (editingId ? t("dashboard.products.updateFailed") : t("dashboard.products.createFailed"));
        throw new Error(msg);
      }
      toast.success(editingId ? t("dashboard.products.updateSuccess") : t("dashboard.products.addSuccess"));
      setModalOpen(false);
      loadProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.products.error"));
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
        throw new Error(err.message || t("dashboard.products.createLinkFailed"));
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
      toast.error(e instanceof Error ? e.message : t("dashboard.products.error"));
    } finally {
      setGeneratingId(null);
    }
  };

  const copyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.checkoutUrl);
    toast.success(t("dashboard.products.linkCopied"));
  };

  const shareWhatsApp = () => {
    if (!generatedLink) return;
    const text = encodeURIComponent(
      t("dashboard.products.whatsappShareTemplate", {
        product: generatedLink.productName,
        url: generatedLink.checkoutUrl,
      })
    );
    window.open(
      `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "201000000000"}?text=${text}`,
      "_blank"
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("dashboard.products.archiveConfirm"))) return;
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/products/${id}`,
        { method: "DELETE" },
        getToken
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || t("dashboard.products.deleteFailed"));
      }
      toast.success(t("dashboard.products.archiveSuccess"));
      loadProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.products.error"));
    }
  };

  const getCategoryLabel = (value: string | null) => {
    if (!value) return null;
    const cat = ALL_CATEGORIES.find((c) => c.value === value);
    if (!cat) return value;
    return locale === "ar" ? cat.label : cat.labelEn;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1E0A3C] font-cairo">{t("dashboard.products.title")}</h1>
        <Card className="border-[#E4D8F0] shadow-sm">
          <CardContent className="py-8 text-center">
            <p className="text-[#6B5B7B] font-cairo">{error}</p>
            <Button
              variant="outline"
              className="mt-4 border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA] cursor-pointer"
              onClick={() => loadProducts()}
            >
              {t("dashboard.products.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1E0A3C] font-cairo">{t("dashboard.products.title")}</h1>
        <Button
          onClick={openCreate}
          className="gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.products.addProduct")}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="overflow-hidden border-[#E4D8F0] bg-gradient-to-br from-[#F3EEFA] via-white to-[#EDE9FE]/30">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center sm:flex-row sm:items-start sm:justify-center sm:text-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE]">
              <Package className="h-10 w-10 text-[#7C3AED]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#1E0A3C] font-cairo">
                {t("dashboard.products.startWithFirst")}
              </h2>
              <p className="max-w-md text-[#6B5B7B] font-cairo">
                {t("dashboard.products.startSubtitle")}
              </p>
              <Button
                onClick={openCreate}
                className="mt-2 gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {t("dashboard.products.addProduct")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card
              key={p.id}
              className="font-cairo overflow-hidden border-[#E4D8F0] shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {p.imageUrl && (
                <div className="aspect-video w-full bg-[#F3EEFA]">
                  <img
                    src={p.imageUrl}
                    alt={getProductDisplayName(p, locale)}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-base text-[#1E0A3C]">
                  {getProductDisplayName(p, locale)}
                </CardTitle>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs shrink-0",
                    p.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {p.status === "active"
                    ? t("dashboard.products.active")
                    : t("dashboard.products.archived")}
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xl font-bold text-[#7C3AED] font-mono">
                    {formatEgp(p.price, egpShort, locale)}
                  </p>
                  {p.category && (
                    <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-xs text-[#7C3AED]">
                      {getCategoryLabel(p.category)}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="mt-2 text-sm text-[#6B5B7B] line-clamp-2">
                    {p.description}
                  </p>
                )}
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 font-cairo border-[#E4D8F0] text-[#6B5B7B] hover:text-[#1E0A3C] hover:bg-[#F3EEFA] cursor-pointer"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="h-3 w-3" />
                    {t("dashboard.products.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 font-cairo border-[#E4D8F0] text-[#6B5B7B] hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    {t("dashboard.products.archive")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 font-cairo border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#EDE9FE] cursor-pointer disabled:opacity-40"
                    disabled={p.status !== "active" || generatingId === p.id}
                    onClick={() => handleGenerateLink(p)}
                  >
                    {generatingId === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Link2 className="h-3 w-3" />
                    )}
                    {t("dashboard.products.paymentLink")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="font-cairo sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1E0A3C]">
              {editingId
                ? t("dashboard.products.editProduct")
                : t("dashboard.products.addProduct")}
            </DialogTitle>
            <DialogDescription className="text-[#6B5B7B]">
              {editingId
                ? t("dashboard.products.editTitle")
                : t("dashboard.products.addTitle")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image upload */}
            <div>
              <Label className="text-[#1E0A3C] mb-2 block">{t("dashboard.products.imageLabel")}</Label>
              <ImageUploadField
                imageUrl={formImageUrl}
                onUpload={handleImageUpload}
                onRemove={() => {
                  setFormImageUrl(null);
                  setUploadError(null);
                }}
                uploading={uploadingImage}
                uploadProgress={uploadProgress}
                uploadError={uploadError}
                locale={locale}
                labels={{
                  uploading: t("dashboard.products.uploading"),
                  preview: t("dashboard.products.preview"),
                  remove: locale === "ar" ? "إزالة الصورة" : "Remove image",
                }}
              />
            </div>

            {/* Product name */}
            <div>
              <Label htmlFor="prod-name" className="text-[#1E0A3C] mb-1 block">
                {t("dashboard.products.name")}
              </Label>
              <Input
                id="prod-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("dashboard.products.namePlaceholder")}
                className="border-[#E4D8F0] focus-visible:ring-[#7C3AED]"
              />
            </div>

            {/* Optional Arabic/English variant */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowArabicVariant((v) => !v)}
                className="flex items-center gap-2 text-sm text-[#7C3AED] hover:text-[#6D28D9] font-cairo cursor-pointer transition-colors"
              >
                <Languages className="h-4 w-4" />
                {showArabicVariant
                  ? locale === "ar"
                    ? "إخفاء الترجمة"
                    : "Hide translation"
                  : locale === "ar"
                  ? "إضافة اسم بالإنجليزية (اختياري)"
                  : "Add Arabic name (optional)"}
              </button>

              {showArabicVariant && (
                <div className="rounded-xl border border-[#E4D8F0] bg-[#F3EEFA]/50 p-4 space-y-3">
                  <p className="text-xs text-[#6B5B7B] font-cairo">
                    {locale === "ar"
                      ? "أضف ترجمة للاسم لتحسين التجربة للمشترين الناطقين بلغات مختلفة"
                      : "Add a translated name to improve the experience for buyers in different languages"}
                  </p>
                  <div>
                    <Label htmlFor="prod-name-ar" className="text-[#1E0A3C] mb-1 block text-xs">
                      {locale === "ar" ? "الاسم بالعربية" : "Arabic name (اسم عربي)"}
                    </Label>
                    <Input
                      id="prod-name-ar"
                      value={formNameAr}
                      onChange={(e) => setFormNameAr(e.target.value)}
                      placeholder={locale === "ar" ? "مثال: تيشيرت قطني" : "e.g. تيشيرت قطني"}
                      dir="rtl"
                      className="border-[#E4D8F0] focus-visible:ring-[#7C3AED] font-cairo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-name-en" className="text-[#1E0A3C] mb-1 block text-xs">
                      {locale === "ar" ? "الاسم بالإنجليزية" : "English name"}
                    </Label>
                    <Input
                      id="prod-name-en"
                      value={formNameEn}
                      onChange={(e) => setFormNameEn(e.target.value)}
                      placeholder="e.g. Cotton T-Shirt"
                      dir="ltr"
                      className="border-[#E4D8F0] focus-visible:ring-[#7C3AED]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="prod-price" className="text-[#1E0A3C] mb-1 block">
                {t("dashboard.products.priceLabel")}
              </Label>
              <Input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="0"
                className="border-[#E4D8F0] focus-visible:ring-[#7C3AED] font-mono"
              />
            </div>

            {/* Category — searchable combobox */}
            <div>
              <Label className="text-[#1E0A3C] mb-1 block">
                {t("dashboard.products.categoryLabel")}
              </Label>
              <CategoryCombobox
                value={formCategory}
                onChange={setFormCategory}
                locale={locale}
                placeholder={t("dashboard.products.chooseCategory")}
              />
            </div>

            {/* Description — textarea with markdown hint */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="prod-desc" className="text-[#1E0A3C]">
                  {t("dashboard.products.descLabel")}
                </Label>
                <span className="text-xs text-[#6B5B7B] font-cairo">
                  {locale === "ar" ? "يدعم Markdown" : "Markdown supported"}
                </span>
              </div>
              <textarea
                id="prod-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={t("dashboard.products.descPlaceholder")}
                rows={4}
                className="w-full rounded-lg border border-[#E4D8F0] bg-white px-3 py-2 text-sm font-cairo text-[#1E0A3C] placeholder:text-[#6B5B7B] resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 transition-colors"
              />
              <p className="mt-1 text-xs text-[#6B5B7B] font-cairo">
                {locale === "ar"
                  ? "يمكنك استخدام **نص غامق**، *مائل*، وقوائم نقطية بـ -"
                  : "Use **bold**, *italic*, and bullet lists with -"}
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-[#E4D8F0] text-[#6B5B7B] hover:bg-[#F3EEFA] cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={saving || uploadingImage}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving
                  ? t("dashboard.products.saving")
                  : editingId
                  ? t("dashboard.products.update")
                  : t("dashboard.products.add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generated Link Modal */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="font-cairo sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1E0A3C]">{t("dashboard.products.linkReady")}</DialogTitle>
            <DialogDescription className="text-[#6B5B7B]">
              {t("dashboard.products.linkReadySubtitle")}
            </DialogDescription>
          </DialogHeader>
          {generatedLink && (
            <div className="space-y-4">
              <div>
                <Label className="text-[#6B5B7B] mb-1 block">{t("dashboard.products.linkLabel")}</Label>
                <Input
                  readOnly
                  value={generatedLink.checkoutUrl}
                  className="font-mono text-sm border-[#E4D8F0] bg-[#F3EEFA]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={copyLink}
                  className="gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  {t("common.copy")}
                </Button>
                <Button
                  variant="outline"
                  onClick={shareWhatsApp}
                  className="gap-2 font-cairo bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("dashboard.products.shareWhatsApp")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

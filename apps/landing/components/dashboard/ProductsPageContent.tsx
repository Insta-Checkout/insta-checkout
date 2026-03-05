"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Package, Plus, Pencil, Trash2, Link2 } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  status: string;
};

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);

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
    setFormPrice("");
    setFormDescription("");
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormPrice(String(p.price));
    setFormDescription(p.description || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    const price = parseFloat(formPrice);
    if (!name || name.length < 2) {
      toast.error("الاسم مطلوب (حرفين على الأقل)");
      return;
    }
    if (isNaN(price) || price <= 0) {
      toast.error("السعر يجب أن يكون رقماً موجباً");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me/products/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              price,
              description: formDescription.trim() || null,
            }),
          },
          getToken
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.details?.[0] || "فشل التحديث");
        }
        toast.success("تم تحديث المنتج");
      } else {
        const res = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me/products`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              price,
              description: formDescription.trim() || null,
            }),
          },
          getToken
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.details?.[0] || "فشل الإنشاء");
        }
        toast.success("تم إضافة المنتج");
      }
      setModalOpen(false);
      loadProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
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
          إضافة منتج
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 font-cairo text-slate-500">ابدأ بإضافة أول منتج</p>
            <Button onClick={openCreate} className="mt-4 font-cairo">
              إضافة منتج
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="font-cairo">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-lg">{p.name}</CardTitle>
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
                <p className="text-xl font-bold text-primary font-mono">
                  {formatEgp(p.price)}
                </p>
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
                    disabled
                    title="قريباً"
                  >
                    <Link2 className="h-3 w-3" />
                    لينك دفع
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
              {editingId ? "تعديل المنتج" : "إضافة منتج"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="اسم المنتج"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price">السعر (ج.م)</Label>
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
              <Label htmlFor="desc">الوصف (اختياري)</Label>
              <Input
                id="desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="وصف قصير"
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "جاري الحفظ..." : editingId ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

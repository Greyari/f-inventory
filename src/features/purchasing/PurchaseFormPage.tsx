import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { StatusBadge } from "@/components/common/StatusBadge";
import { fetchJobCodeOptions, fetchItemOptions } from "@/lib/selectOptions";
import {
  usePurchaseDetail,
  useCreatePurchase,
  useUpdatePurchase,
  useUpdatePurchaseStatus,
} from "./purchasing.hooks";
import { useAuthStore, useHasPermission } from "@/store/authStore";
import type { Department, PurchaseStatus } from "@/types/inventory.types";

const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = [
  { value: "NEW_SHIP", label: "New Ship" },
  { value: "REPAIR", label: "Repair" },
  { value: "ENGINEERING", label: "Engineering" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "LOGISTICS", label: "Logistics" },
];

const itemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  qty: z.coerce.number().min(0.01, "Qty harus > 0"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  purpose: z.string().optional(),
  unitPrice: z.coerce.number().optional(),
  remarks: z.string().optional(),
});

const schema = z.object({
  department: z.enum(["NEW_SHIP", "REPAIR", "ENGINEERING", "SHIPPING", "LOGISTICS"]),
  projectName: z.string().min(1, "Nama project wajib diisi"),
  projectRefId: z.string().min(1, "Project Ref wajib dipilih"),
  costCentreId: z.string().min(1, "Cost Centre wajib dipilih"),
  costCodeId: z.string().min(1, "Cost Code wajib dipilih"),
  dateRaised: z.string().min(1, "Tanggal wajib diisi"),
  dateRequired: z.string().optional(),
  raisedByName: z.string().min(1, "Nama pemohon wajib diisi"),
  items: z.array(itemSchema).min(1, "Minimal 1 item"),
});

type FormValues = z.infer<typeof schema>;

const EDITABLE_STATUSES: PurchaseStatus[] = ["DRAFT", "SUBMITTED"];

export default function PurchaseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const canApprove = useHasPermission("purchases.approve");
  const canCheck = useHasPermission("purchases.check");
  const currentUser = useAuthStore((s) => s.user);

  const { data: purchase, isLoading } = usePurchaseDetail(id);
  const createMutation = useCreatePurchase();
  const updateMutation = useUpdatePurchase();
  const statusMutation = useUpdatePurchaseStatus();

  const [actionDialog, setActionDialog] = useState<"check" | "approve" | "reject" | null>(null);
  const [actionName, setActionName] = useState(currentUser?.name ?? "");
  const [rejectReason, setRejectReason] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      department: "ENGINEERING",
      projectName: "",
      projectRefId: "",
      costCentreId: "",
      costCodeId: "",
      dateRaised: new Date().toISOString().slice(0, 10),
      dateRequired: "",
      raisedByName: currentUser?.name ?? "",
      items: [{ description: "", qty: 1, unit: "pcs", purpose: "", unitPrice: undefined, remarks: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (purchase) {
      reset({
        department: purchase.department,
        projectName: purchase.projectName,
        projectRefId: purchase.projectRefId,
        costCentreId: purchase.costCentreId,
        costCodeId: purchase.costCodeId,
        dateRaised: purchase.dateRaised,
        dateRequired: purchase.dateRequired ?? "",
        raisedByName: purchase.raisedByName,
        items: purchase.items.map((it) => ({
          itemId: it.itemId,
          description: it.description,
          qty: it.qty,
          unit: it.unit,
          purpose: it.purpose ?? "",
          unitPrice: it.unitPrice ?? undefined,
          remarks: it.remarks ?? "",
        })),
      });
    }
  }, [purchase, reset]);

  const isReadonlyItems = isEdit && purchase && !EDITABLE_STATUSES.includes(purchase.status);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, payload: values });
    } else {
      await createMutation.mutateAsync({ ...values, dateRequired: values.dateRequired || undefined });
      navigate("/purchasing");
      return;
    }
  };

  const confirmAction = async () => {
    if (!id) return;
    if (actionDialog === "check") {
      await statusMutation.mutateAsync({ id, status: "CHECKED", name: actionName });
    } else if (actionDialog === "approve") {
      await statusMutation.mutateAsync({ id, status: "APPROVED", name: actionName });
    } else if (actionDialog === "reject") {
      await statusMutation.mutateAsync({ id, status: "REJECTED", rejectReason });
    }
    setActionDialog(null);
    setRejectReason("");
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoading) {
    return <p className="text-muted-foreground">Memuat data PR...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate("/purchasing")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar PR
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {isEdit ? `PR ${purchase?.prNumber ?? ""}` : "Buat PR Baru"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Materials Purchase / Service Requisition Form
          </p>
        </div>
        {isEdit && purchase && <StatusBadge status={purchase.status} />}
      </div>

      {isEdit && purchase && (
        <div className="mb-6 flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-4">
          {purchase.status === "SUBMITTED" && canCheck && (
            <Button size="sm" onClick={() => setActionDialog("check")}>
              Tandai Sudah Dicek
            </Button>
          )}
          {purchase.status === "CHECKED" && canApprove && (
            <>
              <Button size="sm" onClick={() => setActionDialog("approve")}>
                Setujui PR
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setActionDialog("reject")}>
                Tolak PR
              </Button>
            </>
          )}
          {purchase.checkedByName && (
            <span className="self-center text-xs text-muted-foreground">
              Dicek oleh: <span className="font-medium">{purchase.checkedByName}</span>
            </span>
          )}
          {purchase.approvedByName && (
            <span className="self-center text-xs text-muted-foreground">
              Disetujui oleh: <span className="font-medium">{purchase.approvedByName}</span>
            </span>
          )}
          {purchase.rejectReason && (
            <span className="self-center text-xs text-destructive">
              Alasan ditolak: {purchase.rejectReason}
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border bg-background p-5">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Informasi Umum</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Department</Label>
              <Select {...register("department")} disabled={isReadonlyItems}>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Project</Label>
              <Input {...register("projectName")} disabled={isReadonlyItems} placeholder="mis. Batching Plant 5" />
              {errors.projectName && (
                <p className="mt-1 text-xs text-destructive">{errors.projectName.message}</p>
              )}
            </div>

            <div>
              <Label>Project Ref</Label>
              <Controller
                control={control}
                name="projectRefId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    fetchOptions={fetchJobCodeOptions}
                    selectedLabel={purchase?.projectRef?.code}
                    disabled={isReadonlyItems}
                    error={!!errors.projectRefId}
                    placeholder="Pilih kode..."
                  />
                )}
              />
              {errors.projectRefId && (
                <p className="mt-1 text-xs text-destructive">{errors.projectRefId.message}</p>
              )}
            </div>

            <div>
              <Label>Cost Centre</Label>
              <Controller
                control={control}
                name="costCentreId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    fetchOptions={fetchJobCodeOptions}
                    selectedLabel={purchase?.costCentre?.code}
                    disabled={isReadonlyItems}
                    error={!!errors.costCentreId}
                    placeholder="Pilih kode..."
                  />
                )}
              />
              {errors.costCentreId && (
                <p className="mt-1 text-xs text-destructive">{errors.costCentreId.message}</p>
              )}
            </div>

            <div>
              <Label>Cost Code</Label>
              <Controller
                control={control}
                name="costCodeId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    fetchOptions={fetchJobCodeOptions}
                    selectedLabel={purchase?.costCode?.code}
                    disabled={isReadonlyItems}
                    error={!!errors.costCodeId}
                    placeholder="Pilih kode..."
                  />
                )}
              />
              {errors.costCodeId && (
                <p className="mt-1 text-xs text-destructive">{errors.costCodeId.message}</p>
              )}
            </div>

            <div>
              <Label>Raised By</Label>
              <Input {...register("raisedByName")} disabled={isReadonlyItems} placeholder="Nama pemohon" />
              {errors.raisedByName && (
                <p className="mt-1 text-xs text-destructive">{errors.raisedByName.message}</p>
              )}
            </div>

            <div>
              <Label>Date Raised</Label>
              <Input type="date" {...register("dateRaised")} disabled={isReadonlyItems} />
            </div>
            <div>
              <Label>Date Required</Label>
              <Input type="date" {...register("dateRequired")} disabled={isReadonlyItems} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Item</h3>
            {!isReadonlyItems && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({ description: "", qty: 1, unit: "pcs", purpose: "", unitPrice: undefined, remarks: "" })
                }
              >
                <Plus className="h-4 w-4" /> Tambah Item
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-md border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Item #{index + 1}</span>
                  {!isReadonlyItems && fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <Label>Item Master (opsional)</Label>
                    <Controller
                      control={control}
                      name={`items.${index}.itemId`}
                      render={({ field: f }) => (
                        <SearchableSelect
                          value={f.value}
                          onChange={f.onChange}
                          fetchOptions={fetchItemOptions}
                          disabled={isReadonlyItems}
                          placeholder="Link ke item master..."
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Qty</Label>
                    <Input type="number" step="any" {...register(`items.${index}.qty`)} disabled={isReadonlyItems} />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input {...register(`items.${index}.unit`)} disabled={isReadonlyItems} placeholder="m, pcs, kg" />
                  </div>

                  <div className="col-span-4">
                    <Label>Description</Label>
                    <Input
                      {...register(`items.${index}.description`)}
                      disabled={isReadonlyItems}
                      placeholder="mis. XLPE Cable 1C x 500mm, 40m x 3L Black"
                    />
                    {errors.items?.[index]?.description && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.items[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label>Purpose</Label>
                    <Textarea
                      {...register(`items.${index}.purpose`)}
                      disabled={isReadonlyItems}
                      placeholder="Kegunaan barang ini"
                      className="min-h-[42px]"
                    />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="any"
                      {...register(`items.${index}.unitPrice`)}
                      disabled={isReadonlyItems}
                    />
                  </div>
                  <div>
                    <Label>Remarks</Label>
                    <Input {...register(`items.${index}.remarks`)} disabled={isReadonlyItems} />
                  </div>

                  {isEdit && purchase?.items[index]?.stockBalance !== undefined && (
                    <div className="col-span-4 text-xs text-muted-foreground">
                      Stock Balance saat ini:{" "}
                      <span className="font-medium text-foreground">
                        {purchase.items[index].stockBalance} {purchase.items[index].unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.items?.message && (
            <p className="mt-2 text-xs text-destructive">{errors.items.message}</p>
          )}
        </div>

        {!isReadonlyItems && (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/purchasing")}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat PR"}
            </Button>
          </div>
        )}
      </form>

      <Dialog open={!!actionDialog} onOpenChange={(o) => !o && setActionDialog(null)}>
        <DialogContent
          title={
            actionDialog === "check"
              ? "Tandai Sudah Dicek"
              : actionDialog === "approve"
                ? "Setujui PR"
                : "Tolak PR"
          }
        >
          <div className="space-y-4">
            {actionDialog === "reject" ? (
              <div>
                <Label>Alasan Penolakan</Label>
                <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
            ) : (
              <div>
                <Label>Nama {actionDialog === "check" ? "Checker" : "Approver"}</Label>
                <Input value={actionName} onChange={(e) => setActionName(e.target.value)} />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActionDialog(null)}>
                Batal
              </Button>
              <Button
                variant={actionDialog === "reject" ? "destructive" : "default"}
                onClick={confirmAction}
                disabled={statusMutation.isPending}
              >
                Konfirmasi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

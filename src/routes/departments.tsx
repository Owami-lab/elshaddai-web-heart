// // import { createFileRoute } from "@tanstack/react-router";
// // import { useQuery } from "@tanstack/react-query";
// // import { api, Department } from "@/lib/api";

// // export const Route = createFileRoute("/departments")({
// //   head: () => ({
// //     meta: [
// //       { title: "Departments — Elshaddai Ministries" },
// //       { name: "description", content: "Discover the ministries and departments serving our church." },
// //     ],
// //   }),
// //   component: Departments,
// // });

// // function Departments() {
// //   const { data, isLoading, error } = useQuery({
// //     queryKey: ["departments"],
// //     queryFn: () => api<Department[]>("/api/departments"),
// //   });

// //   return (
// //     <div className="mx-auto max-w-7xl px-6 py-20">
// //       <span className="text-xs uppercase tracking-[0.25em] text-gold">Get Involved</span>
// //       <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Departments</h1>
// //       <p className="mt-4 max-w-2xl text-muted-foreground">
// //         Every member is a minister. Find a place to serve, grow, and belong.
// //       </p>

// //       {isLoading && <p className="mt-12 text-muted-foreground">Loading…</p>}
// //       {error && (
// //         <p className="mt-12 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive">
// //           Could not load departments.
// //         </p>
// //       )}

// //       <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
// //         {data?.map((d) => (
// //           <article
// //             key={d.id}
// //             className="rounded-xl border border-border bg-card p-8 transition hover:-translate-y-1"
// //             style={{ boxShadow: "var(--shadow-elegant)" }}
// //           >
// //             <div
// //               className="mb-4 h-1 w-12 rounded-full"
// //               style={{ background: "var(--gradient-gold)" }}
// //             />
// //             <h3 className="font-display text-2xl text-primary">{d.name}</h3>
// //             <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
// //           </article>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }
// import { createFileRoute } from "@tanstack/react-router";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api, Department } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import { useState } from "react";

// export const Route = createFileRoute("/departments")({
//   head: () => ({
//     meta: [
//       { title: "Departments — Elshaddai Ministries" },
//       { name: "description", content: "Discover the ministries and departments serving our church." },
//     ],
//   }),
//   component: Departments,
// });

// function Departments() {
//   const { data, isLoading, error } = useQuery({
//     queryKey: ["departments"],
//     queryFn: () => api<Department[]>("/api/departments", { auth: true }),
//   });
//   const { user } = useAuth();
//   const qc = useQueryClient();
//   const [showComposer, setShowComposer] = useState(false);
//   const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
//   const [formMessage, setFormMessage] = useState("");
//   const [formError, setFormError] = useState("");

//   const create = useMutation({
//     mutationFn: async (payload: Partial<Department>) =>
//       api("/api/departments/admin/create", { method: "POST", body: JSON.stringify(payload), auth: true }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["departments"] });
//       setShowComposer(false);
//       setEditingDepartment(null);
//       setFormMessage("Department saved");
//       setTimeout(() => setFormMessage(""), 3000);
//     },
//     onError: (err: any) => {
//       setFormError(String(err?.message ?? err ?? "Save failed"));
//       setTimeout(() => setFormError(""), 5000);
//     },
//   });

//   const update = useMutation({
//     mutationFn: async (payload: Department) =>
//       api(`/api/departments/admin/update/${payload.id}`, { method: "PUT", body: JSON.stringify(payload), auth: true }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["departments"] });
//       setShowComposer(false);
//       setEditingDepartment(null);
//       setFormMessage("Department updated");
//       setTimeout(() => setFormMessage(""), 3000);
//     },
//     onError: (err: any) => {
//       setFormError(String(err?.message ?? err ?? "Update failed"));
//       setTimeout(() => setFormError(""), 5000);
//     },
//   });

//   const remove = useMutation({
//     mutationFn: async (id: number) =>
//       api(`/api/departments/admin/delete/${id}`, { method: "DELETE", auth: true }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["departments"] });
//       setFormMessage("Department deleted");
//       setTimeout(() => setFormMessage(""), 3000);
//     },
//     onError: (err: any) => {
//       setFormError(String(err?.message ?? err ?? "Delete failed"));
//       setTimeout(() => setFormError(""), 5000);
//     },
//   });

//   const openCreate = () => {
//     setEditingDepartment(null);
//     setShowComposer(true);
//     setFormError("");
//     setFormMessage("");
//   };

//   const openEdit = (department: Department) => {
//     setEditingDepartment(department);
//     setShowComposer(true);
//     setFormError("");
//     setFormMessage("");
//   };

//   const closeComposer = () => {
//     setShowComposer(false);
//     setEditingDepartment(null);
//   };

//   return (
//     <div className="mx-auto max-w-7xl px-6 py-20">
//       <span className="text-xs uppercase tracking-[0.25em] text-gold">Get Involved</span>
//       <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Departments</h1>
//       <p className="mt-4 max-w-2xl text-muted-foreground">
//         Every member is a minister. Find a place to serve, grow, and belong.
//       </p>

//       {user?.role === "ADMIN" && (
//         <div className="mt-6">
//           <button
//             onClick={openCreate}
//             className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
//           >
//             + Add Department
//           </button>

//           {showComposer && (
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 const fd = new FormData(e.currentTarget as HTMLFormElement);
//                 const payload = {
//                   id: editingDepartment?.id,
//                   name: (fd.get("name") as string) || "",
//                   description: (fd.get("description") as string) || "",
//                 } as Department;

//                 if (editingDepartment?.id) {
//                   update.mutate(payload);
//                 } else {
//                   create.mutate(payload);
//                 }
//               }}
//               className="mt-4 space-y-3 rounded border bg-card p-4"
//             >
//               {formMessage && <div className="text-sm text-green-600">{formMessage}</div>}
//               {formError && <div className="text-sm text-destructive">{formError}</div>}
//               <div>
//                 <label className="block text-sm">Name</label>
//                 <input
//                   name="name"
//                   required
//                   defaultValue={editingDepartment?.name ?? ""}
//                   className="w-full rounded border px-2 py-1"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm">Description</label>
//                 <textarea
//                   name="description"
//                   defaultValue={editingDepartment?.description ?? ""}
//                   className="w-full rounded border px-2 py-1"
//                 />
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 <button type="submit" className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">
//                   {editingDepartment ? "Update" : "Save"}
//                 </button>
//                 <button type="button" className="rounded border px-4 py-2 text-sm" onClick={closeComposer}>
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       )}

//       {isLoading && <p className="mt-12 text-muted-foreground">Loading…</p>}
//       {error && (
//         <p className="mt-12 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive">
//           Could not load departments.
//         </p>
//       )}

//       <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {data?.map((d) => (
//           <article
//             key={d.id}
//             className="overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1"
//             style={{ boxShadow: "var(--shadow-elegant)" }}
//           >
//             <div className="p-8">
//               <div className="mb-4 h-1 w-12 rounded-full" style={{ background: "var(--gradient-gold)" }} />
//               <h3 className="font-display text-2xl text-primary">{d.name}</h3>
//               <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
//             </div>

//             {user?.role === "ADMIN" && (
//               <div className="flex gap-2 border-t border-border bg-background/60 px-6 py-4">
//                 <button
//                   type="button"
//                   onClick={() => openEdit(d)}
//                   className="rounded border px-3 py-2 text-sm"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     if (window.confirm(`Delete “${d.name}”?`)) remove.mutate(d.id);
//                   }}
//                   className="rounded border px-3 py-2 text-sm text-destructive"
//                 >
//                   Delete
//                 </button>
//               </div>
//             )}
//           </article>
//         ))}
//       </div>

//       {data && data.length === 0 && (
//         <p className="mt-12 text-muted-foreground">No departments published yet. Check back soon.</p>
//       )}
//     </div>
//   );
// }

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Department } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Elshaddai Ministries" },
      {
        name: "description",
        content: "Discover the ministries and departments serving our church.",
      },
    ],
  }),
  component: Departments,
});

const fallbackDepartments: Department[] = [
  {
    id: -1,
    name: "Worship & Music",
    description:
      "A ministry dedicated to leading the congregation in heartfelt worship and musical excellence.",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: -2,
    name: "Youth & Teens",
    description:
      "A vibrant space for young people to grow in faith, discover purpose, and build lasting friendships.",
    imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: -3,
    name: "Outreach & Evangelism",
    description:
      "Committed to serving the community, reaching the lost, and sharing the gospel with compassion.",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  },
];

function Departments() {
  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const departments = await api<Department[]>("/api/departments", { auth: true });
        return departments.length > 0 ? departments : fallbackDepartments;
      } catch (error) {
        console.warn("Departments API unavailable, showing local fallback content.", error);
        return fallbackDepartments;
      }
    },
  });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showComposer, setShowComposer] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [confirmDeleteDepartment, setConfirmDeleteDepartment] = useState<Department | null>(null);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const departments = (data ?? fallbackDepartments) as Department[];
  const usingFallbackDepartments = departments.some((department) => department.id < 0);

  const create = useMutation({
    mutationFn: async (payload: Partial<Department>) =>
      api<Department>("/api/departments/admin/create", {
        method: "POST",
        body: JSON.stringify({
          name: payload.name ?? "",
          description: payload.description ?? "",
        }),
        auth: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setShowComposer(false);
      setEditingDepartment(null);
      setFormMessage("Department saved");
      setTimeout(() => setFormMessage(""), 3000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message || "Save failed");
      setTimeout(() => setFormError(""), 5000);
    },
  });

  const update = useMutation({
    mutationFn: async (payload: Department) =>
      api<Department>(`/api/departments/admin/update/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: payload.name ?? "",
          description: payload.description ?? "",
        }),
        auth: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setShowComposer(false);
      setEditingDepartment(null);
      setFormMessage("Department updated");
      setTimeout(() => setFormMessage(""), 3000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message || "Update failed");
      setTimeout(() => setFormError(""), 5000);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) =>
      api(`/api/departments/admin/delete/${id}`, { method: "DELETE", auth: true }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setFormMessage("Deleted successfully");
      setTimeout(() => setFormMessage(""), 3000);
      setSelectedDepartment((current) => (current?.id === id ? null : current));
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message || "Delete failed");
      setTimeout(() => setFormError(""), 5000);
    },
  });

  const openCreate = () => {
    setEditingDepartment(null);
    setSelectedDepartment(null);
    setShowComposer(true);
    setFormError("");
    setFormMessage("");
  };

  const openEdit = (department: Department) => {
    setEditingDepartment(department);
    setSelectedDepartment(null);
    setShowComposer(true);
    setFormError("");
    setFormMessage("");
  };

  const closeComposer = () => {
    setShowComposer(false);
    setEditingDepartment(null);
  };

  const openDetails = (department: Department) => {
    setSelectedDepartment(department);
  };

  const openConfirmDelete = (department: Department) => {
    setConfirmDeleteDepartment(department);
  };

  const handleDelete = () => {
    if (!confirmDeleteDepartment) return;
    remove.mutate(confirmDeleteDepartment.id);
    setConfirmDeleteDepartment(null);
  };

  const closeDetails = () => setSelectedDepartment(null);
  const closeConfirmDelete = () => setConfirmDeleteDepartment(null);

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      {formMessage && (
        <div className="fixed right-4 top-4 z-50 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-black/10">
          {formMessage}
        </div>
      )}
      {formError && (
        <div className="fixed right-4 top-4 z-50 rounded-2xl bg-destructive px-4 py-3 text-sm font-medium text-white shadow-xl shadow-black/10">
          {formError}
        </div>
      )}
      <span className="text-xs uppercase tracking-[0.25em] text-gold">Get Involved</span>
      <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Departments</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Every member is a minister. Find a place to serve, grow, and belong.
      </p>

      {user?.role === "ADMIN" && (
        <div className="mt-6">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            + Add Department
          </button>

        </div>
      )}

      {isLoading && <p className="mt-12 text-muted-foreground">Loading…</p>}
  

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <article
            key={d.id}
            role="button"
            tabIndex={0}
            onClick={() => openDetails(d)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openDetails(d);
              }
            }}
            className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="aspect-[16/9] bg-primary/10">
              {d.imageUrl ? (
                <img
                  src={d.imageUrl}
                  alt={d.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div
                    className="h-1 w-12 rounded-full"
                    style={{ background: "var(--gradient-gold)" }}
                  />
                </div>
              )}
            </div>

            <div className="p-8">
              <div
                className="mb-4 h-1 w-12 rounded-full"
                style={{ background: "var(--gradient-gold)" }}
              />
              <h3 className="font-display text-2xl text-primary">{d.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
            </div>

            {user?.role === "ADMIN" && (
              <div className="flex gap-2 border-t border-border bg-background/60 px-6 py-4">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(d);
                  }}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={(event) => {
                    event.stopPropagation();
                    openConfirmDelete(d);
                  }}
                  className="rounded border px-3 py-2 text-sm text-destructive disabled:opacity-50"
                >
                  {remove.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {departments.length === 0 && (
        <p className="mt-12 text-muted-foreground">
          No departments published yet. Check back soon.
        </p>
      )}

      {showComposer && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editingDepartment ? "Edit department" : "Add department"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {editingDepartment
                    ? "Update the department details below."
                    : "Create a new department entry for the ministry library."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const payload = {
                  id: editingDepartment?.id,
                  name: (fd.get("name") as string) || "",
                  description: (fd.get("description") as string) || "",
                  imageUrl: (fd.get("imageUrl") as string) || "",
                } as Department;

                if (editingDepartment?.id) {
                  update.mutate(payload);
                } else {
                  create.mutate(payload);
                }
              }}
              className="mt-6 space-y-4"
            >
              {formMessage && <div className="text-sm text-green-600">{formMessage}</div>}
              {formError && <div className="text-sm text-destructive">{formError}</div>}

              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  name="name"
                  required
                  defaultValue={editingDepartment?.name ?? ""}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Image URL</label>
                <input
                  name="imageUrl"
                  placeholder="https://example.com/photo.jpg"
                  defaultValue={editingDepartment?.imageUrl ?? ""}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingDepartment?.description ?? ""}
                  className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {editingDepartment ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDepartment && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{selectedDepartment.name}</h2>
                <p className="mt-2 text-sm text-slate-600">Department details</p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            {selectedDepartment.imageUrl ? (
              <div className="mt-6 overflow-hidden rounded-3xl bg-slate-100">
                <img
                  src={selectedDepartment.imageUrl}
                  alt={selectedDepartment.name}
                  className="h-72 w-full object-cover"
                />
              </div>
            ) : null}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="mt-2 text-sm text-slate-700">
                  {selectedDepartment.description || "No description provided."}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Department ID</h3>
                <p className="mt-2 text-sm text-slate-700">{selectedDepartment.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Confirm delete</h2>
            <p className="mt-4 text-sm text-slate-600">
              Are you sure you want to delete the department “{confirmDeleteDepartment.name}”?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmDelete}
                className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
